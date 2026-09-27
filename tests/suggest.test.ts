import { describe, expect, it } from "vitest";
import {
  BATCH_SIZE, I_DONT_KNOW, answerSchema, buildSystemPrompt, checkAnswer, decide, fromSaved, memoryCache,
  pickExamples, sourceLabel, suggest, suggestWithBackup, valuesForAI, type AskAI, type SavedSuggestions,
} from "../src/mapper";
import { makeLimiter } from "../src/mapper/suggest/limit";
import { loadApprovedList, loadTouchpoints } from "../scripts/loadData";
import { loadGroupings } from "../scripts/aiSetup";

const list = loadApprovedList();
const groupings = loadGroupings();
const answer = (value: string, over: Record<string, unknown> = {}) => ({
  value, grouping: "Referral", platform: null, confidence: "high", reason: "Partner links are referrals.", ...over,
});

// A stand-in AI that records what it was sent.
function fakeAI(reply: (v: string) => unknown = (v) => answer(v)) {
  const sent: string[][] = [];
  const askAI: AskAI = async (values) => {
    sent.push(values);
    return values.map(reply);
  };
  return { askAI, sent };
}

describe("what goes to the AI", () => {
  it("only the 4 unfamiliar values from our file, once each", () => {
    const raws = loadTouchpoints().map((t) => t.source);
    expect(valuesForAI(raws, list).sort()).toEqual(["li", "newchannel_q3", "promo_x", "social"]);
  });

  it("never blank, broken or already-approved values, whatever is sent", async () => {
    const { askAI, sent } = fakeAI();
    await suggest(["", "null", "n/a", "???", "{{utm_source}}", "google/cpc", "Google / Organic", "li", "LI "], {
      list, groupings, askAI, cache: memoryCache(),
    });
    expect(sent).toEqual([["li"]]);
  });

  it("sends small batches", async () => {
    const { askAI, sent } = fakeAI();
    const many = Array.from({ length: 25 }, (_, i) => `value_${i}`);
    await suggest(many, { list, groupings, askAI, cache: memoryCache() });
    expect(sent.map((b) => b.length)).toEqual([BATCH_SIZE, BATCH_SIZE, 5]);
  });
});

describe("cache", () => {
  it("never pays for the same value twice", async () => {
    const { askAI, sent } = fakeAI();
    const cache = memoryCache();
    const first = await suggest(["promo_x", "li"], { list, groupings, askAI, cache });
    const second = await suggest(["promo_x", "li"], { list, groupings, askAI, cache });
    expect(sent).toHaveLength(1);
    expect(first.map((s) => s.source)).toEqual(["ai", "ai"]);
    expect(second.map((s) => s.source)).toEqual(["cache", "cache"]);
    expect(second.map((s) => s.status)).toEqual(first.map((s) => s.status));
  });
});

describe("answer check", () => {
  it("accepts a well-formed answer", () => {
    expect(checkAnswer(answer("x"), groupings).ok).toBe(true);
    expect(checkAnswer(answer("x", { grouping: "Paid Social", platform: "Meta" }), groupings).ok).toBe(true);
    expect(checkAnswer(answer("x", { grouping: I_DONT_KNOW, confidence: "low" }), groupings).ok).toBe(true);
  });

  it.each([
    ["a made-up grouping", { grouping: "Partner" }, /isn't one of our groupings/],
    ["'Other'", { grouping: "Other" }, /isn't one of our groupings/],
    ["no confidence", { confidence: undefined }, /confidence/],
    ["an unknown confidence", { confidence: "very high" }, /confidence/],
    ["a platform from another grouping", { grouping: "Email", platform: "Meta" }, /platform/],
    ["no reason", { reason: "  " }, /no reason/],
    ["a long reason", { reason: "word ".repeat(21) }, /longer than 20 words/],
  ])("rejects %s", (_label, over, problem) => {
    const check = checkAnswer(answer("x", over), groupings);
    expect(check).toMatchObject({ ok: false, problem: expect.stringMatching(problem) });
    expect(decide(check)).toBe("Needs a person");
  });

  it("treats a missing answer as needing a person", async () => {
    const { askAI } = fakeAI(() => undefined);
    const [s] = await suggest(["promo_x"], { list, groupings, askAI, cache: memoryCache() });
    expect(s).toMatchObject({ status: "Needs a person", problem: "No answer from the AI." });
  });

  it("never attaches an answer to the wrong value", async () => {
    const askAI: AskAI = async () => [answer("something_else")];
    const [s] = await suggest(["promo_x"], { list, groupings, askAI, cache: memoryCache() });
    expect(s.status).toBe("Needs a person");
  });
});

describe("deciding what the answer means", () => {
  it.each([
    ["high", "Referral", "Suggested: waiting for approval"],
    ["medium", "Referral", "Needs a person"],
    ["low", "Referral", "Needs a person"],
    ["high", I_DONT_KNOW, "Needs a person"],
  ])("%s confidence, %s → %s", (confidence, grouping, status) => {
    expect(decide(checkAnswer(answer("x", { confidence, grouping }), groupings))).toBe(status);
  });
});

describe("backup", () => {
  const saved: SavedSuggestions = {
    model: "m", prompt_version: "1", created_on: "2026-09-27",
    answers: { partner_acme: answer("partner_acme"), li: answer("li", { grouping: "Other" }) },
  };

  it("uses saved results when the AI connection fails, and labels them", async () => {
    const failing = async () => { throw new Error("offline"); };
    const out = await suggestWithBackup(["partner_acme", "li", "promo_x"], failing, saved, groupings);
    expect(out.map((s) => [s.value, s.status, sourceLabel(s)])).toEqual([
      ["partner_acme", "Suggested: waiting for approval", "Saved result"],
      ["li", "Needs a person", "Saved result"], // saved answers are re-checked
      ["promo_x", "Needs a person", "Saved result"], // nothing saved
    ]);
  });

  it("re-checks saved answers on load", () => {
    expect(fromSaved(["li"], saved, groupings)[0].problem).toMatch(/isn't one of our groupings/);
  });
});

describe("instructions sent to the AI", () => {
  it("lists only our groupings and a few approved examples", () => {
    const examples = pickExamples(list);
    expect(examples.map((e) => e.channel)).toEqual(groupings.map((g) => g.channel));
    const prompt = buildSystemPrompt(groupings, examples);
    for (const g of groupings) expect(prompt).toContain(g.channel);
    expect(prompt).not.toMatch(/\bOther\b/);
  });

  it("never shows excluded values as examples", () => {
    const examples = pickExamples(list, ["google/cpc", "email"]);
    expect(examples.map((e) => e.value)).not.toContain("google/cpc");
    expect(examples.find((e) => e.channel === "Email")?.value).toBe("eml");
  });

  it("answer format only allows our groupings or I don't know", () => {
    const schema = answerSchema(groupings);
    expect(schema.safeParse({ answers: [answer("x")] }).success).toBe(true);
    expect(schema.safeParse({ answers: [answer("x", { grouping: "Other" })] }).success).toBe(false);
  });
});

describe("request limit", () => {
  it("stops a visitor after the daily limit, without affecting others", async () => {
    const m = new Map<string, string>();
    const store = { get: async (k: string) => m.get(k) ?? null, put: async (k: string, v: string) => void m.set(k, v) };
    const a = makeLimiter(store, "visitor-a", "2026-09-27");
    const b = makeLimiter(store, "visitor-b", "2026-09-27");
    for (let i = 0; i < 20; i++) await a.record();
    expect(await a.allowed()).toBe(false);
    expect(await b.allowed()).toBe(true);
    expect(await makeLimiter(store, "visitor-a", "2026-09-28").allowed()).toBe(true);
  });
});

describe("team rules", () => {
  it("are included in the instructions when given", () => {
    const rules = ["Values naming a partner (for example partner_acme) count as Referral."];
    const prompt = buildSystemPrompt(groupings, pickExamples(list), rules);
    expect(prompt).toContain("Team rules");
    expect(prompt).toContain(rules[0]);
    expect(buildSystemPrompt(groupings, pickExamples(list))).not.toContain("Team rules");
  });
});

import { describe, expect, it } from "vitest";
import {
  buildRows, checkDecision, exportDecisions, fromSaved, outdatedDecisions, reviewQueue, summarizeRows,
  valuesForAI, type Decision, type SavedSuggestions,
} from "../src/mapper";
import { loadApprovedList, loadTouchpoints } from "../scripts/loadData";
import { loadGroupings } from "../scripts/aiSetup";
import saved from "../data/saved_suggestions.json";

const list = loadApprovedList();
const groupings = loadGroupings();
const sources = loadTouchpoints().map((t) => t.source);
const values = valuesForAI(sources, list);
const suggestions = new Map(fromSaved(values, saved as SavedSuggestions, groupings).map((s) => [s.value, s]));
const at = "2026-09-27T10:00:00.000Z";
const approve = (value: string, channel: string, platform: string | null = null): Decision =>
  ({ value, action: "approve", channel, platform, decidedAt: at });
const notChannel = (value: string): Decision => ({ value, action: "not-a-channel", decidedAt: at });

describe("results with no decisions", () => {
  const rows = buildRows(sources, list, suggestions, []);
  const s = summarizeRows(rows);

  it("has one row per original value, with counts", () => {
    expect(rows).toHaveLength(31);
    expect(rows.find((r) => r.raw === "google / organic")).toMatchObject({ cleaned: "google/organic", count: 165, status: "Mapped" });
  });

  it("matches the Stage 1 totals", () => {
    expect(s.total).toBe(2000);
    expect(s.byStatus.Mapped).toBe(1829);
    expect(s.unresolvedOrWaiting.count).toBe(171);
  });

  it("puts the 4 unfamiliar values in the review queue, most touchpoints first", () => {
    expect(reviewQueue(rows).map((q) => [q.value, q.count])).toEqual([
      ["li", 31], ["promo_x", 25], ["social", 24], ["newchannel_q3", 23],
    ]);
  });
});

describe("approving", () => {
  it("updates the results right away and moves touchpoints out of the unresolved bucket", () => {
    const rows = buildRows(sources, list, suggestions, [approve("social", "Organic Social", "LinkedIn")]);
    expect(rows.find((r) => r.raw === "social")).toMatchObject({ status: "Mapped", channel: "Organic Social", mappedBy: "review queue" });
    const s = summarizeRows(rows);
    expect(s.unresolvedOrWaiting.count).toBe(171 - 24);
    expect(Object.fromEntries(s.byChannel)["Organic Social"]).toBe(45 + 24);
    expect(reviewQueue(rows).map((q) => q.value)).not.toContain("social");
  });

  it("undo is just removing the decision: results go back exactly", () => {
    const before = summarizeRows(buildRows(sources, list, suggestions, []));
    const after = summarizeRows(buildRows(sources, list, suggestions, []));
    expect(after).toEqual(before);
  });

  it("'Not a channel' keeps the value in the unresolved bucket, never in a channel", () => {
    const rows = buildRows(sources, list, suggestions, [notChannel("promo_x")]);
    const s = summarizeRows(rows);
    expect(rows.find((r) => r.raw === "promo_x")?.status).toBe("Unresolved: not a channel");
    expect(s.unresolvedOrWaiting.count).toBe(171);
    expect(s.byChannel.reduce((n, [, c]) => n + c, 0)).toBe(1829);
  });
});

describe("AI suggestions are never counted before a person approves", () => {
  it("keeps a high-confidence suggestion in the unresolved / waiting bucket", () => {
    const fake = new Map(suggestions);
    fake.set("li", { value: "li", status: "Suggested: waiting for approval", source: "ai", problem: null,
      answer: { grouping: "Paid Social", platform: "LinkedIn", confidence: "high", reason: "x" } });
    const rows = buildRows(sources, list, fake, []);
    const s = summarizeRows(rows);
    expect(rows.find((r) => r.raw === "li")?.channel).toBeNull();
    expect(s.byStatus["Suggested: waiting for approval"]).toBe(31);
    expect(s.unresolvedOrWaiting.count).toBe(171);
    expect(Object.fromEntries(s.byChannel)["Paid Social"]).toBe(513);
  });
});

describe("safety check", () => {
  it("blocks approving a value that's already approved under a different grouping", () => {
    const check = checkDecision(approve("google/cpc", "Email"), list, [], groupings);
    expect(check).toEqual({ ok: false, message: expect.stringMatching(/already on the approved list as Paid Search/) });
  });

  it("blocks a second, different decision until the first is undone", () => {
    const check = checkDecision(approve("li", "Organic Social", "LinkedIn"), list, [approve("li", "Paid Social", "LinkedIn")], groupings);
    expect(check).toEqual({ ok: false, message: expect.stringMatching(/already marked "li" as Paid Social\. Undo/) });
  });

  it("blocks groupings and platforms that aren't on our lists", () => {
    expect(checkDecision(approve("li", "Other"), list, [], groupings).ok).toBe(false);
    expect(checkDecision(approve("li", "Email", "Meta"), list, [], groupings).ok).toBe(false);
  });

  it("allows a valid first decision", () => {
    expect(checkDecision(approve("li", "Paid Social", "LinkedIn"), list, [], groupings)).toEqual({ ok: true });
    expect(checkDecision(notChannel("promo_x"), list, [], groupings)).toEqual({ ok: true });
  });

  it("flags saved browser decisions that the approved list has since settled", () => {
    expect(outdatedDecisions([approve("partner_acme", "Referral"), approve("li", "Paid Social")], list).map((d) => d.value))
      .toEqual(["partner_acme"]);
  });

  it("ignores outdated decisions when building results", () => {
    const rows = buildRows(sources, list, suggestions, [approve("partner_acme", "Email")]);
    expect(rows.find((r) => r.raw === "partner_acme")).toMatchObject({ channel: "Referral", mappedBy: "approved list" });
  });
});

describe("export", () => {
  it("produces approvals in the approved-list format, for the team to check and add", () => {
    const decisions = [approve("li", "Paid Social", "LinkedIn"), notChannel("promo_x")];
    const file = exportDecisions(decisions, buildRows(sources, list, suggestions, decisions), "2026-09-27");
    expect(file.approvals).toEqual([expect.objectContaining({
      key: "li", example_raw_value: "li", channel: "Paid Social", platform: "LinkedIn",
      status: "proposed - from review queue", approved_by: null, approved_on: null, touchpoints: 31,
    })]);
    expect(file.not_a_channel).toEqual([{ value: "promo_x", touchpoints: 25, decided_on: "2026-09-27" }]);
  });
});

import { describe, expect, it } from "vitest";
import { buildApprovedList, cleanValue, detectProblem, mapValue, summarize } from "../src/mapper";
import type { Alias } from "../src/mapper";
import { loadApprovedList, loadTouchpoints, parseCsv } from "../scripts/loadData";

const list = loadApprovedList();

describe("clean up", () => {
  it("handles the real messy spellings in our file", () => {
    expect(cleanValue("google / organic")).toBe("google/organic");
    expect(cleanValue("LinkedIn Paid")).toBe("linkedin paid");
    expect(cleanValue("  Facebook/Paid ")).toBe("facebook/paid");
    expect(cleanValue("linkedin   paid")).toBe("linkedin paid");
  });

  it("does not merge separators (team decision 2026-09-27)", () => {
    expect(cleanValue("linkedin paid")).not.toBe(cleanValue("linkedin/paid"));
    expect(cleanValue("google_cpc")).not.toBe(cleanValue("google/cpc"));
    expect(cleanValue("fb-ads")).toBe("fb-ads");
  });
});

describe("blank and broken values", () => {
  it.each(["", "   ", "null", "NULL", "n/a", "N/A", "none", "undefined"])(
    "%j is blank",
    (raw) => expect(detectProblem(raw, cleanValue(raw))).toBe("blank"),
  );

  it.each(["???", "//", "{{utm_source}}", "${source}", "%source%", "bad\u0000value", "caf�", "x".repeat(101)])(
    "%j is malformed",
    (raw) => expect(detectProblem(raw, cleanValue(raw))).toBe("malformed"),
  );

  it.each(["li", "social", "promo_x", "newchannel_q3", "partner_acme", "g/cpc"])(
    "%j is a real value, not a problem",
    (raw) => expect(detectProblem(raw, cleanValue(raw))).toBeNull(),
  );
});

describe("look up", () => {
  it("maps approved values, including messy spellings", () => {
    expect(mapValue("google / organic", list)).toMatchObject({ status: "Mapped", channel: "Organic Search", platform: "Google" });
    expect(mapValue("LinkedIn Paid", list)).toMatchObject({ status: "Mapped", channel: "Paid Social", platform: "LinkedIn" });
    expect(mapValue("email-nurture", list)).toMatchObject({ status: "Mapped", channel: "Email" });
    expect(mapValue("g/cpc", list)).toMatchObject({ status: "Mapped", channel: "Paid Search", platform: null });
  });

  it("keeps the original value alongside the cleaned one", () => {
    expect(mapValue("google / organic", list)).toMatchObject({ raw: "google / organic", cleaned: "google/organic" });
  });

  it("maps partner_acme to Referral (team decision 2026-09-27)", () => {
    expect(mapValue("partner_acme", list)).toMatchObject({ status: "Mapped", channel: "Referral" });
  });

  it.each(["li", "promo_x", "social", "newchannel_q3"])(
    "%j is not on the list, so it needs a person",
    (raw) => expect(mapValue(raw, list)).toMatchObject({ status: "Needs a person", channel: null, eligibleForAI: true }),
  );

  it("never lets blank or broken values go to the AI", () => {
    for (const raw of ["", "null", "n/a", "???", "{{utm_source}}"]) {
      expect(mapValue(raw, list).eligibleForAI).toBe(false);
    }
  });
});

describe("approved list checks", () => {
  const groupings = [{ channel: "Email", platforms: [] }];
  const entry = (over: Partial<Alias>): Alias => ({
    key: "email", example_raw_value: "email", channel: "Email", platform: null,
    status: "approved", basis: "", approved_by: "Tracy N", approved_on: "2026-09-27", ...over,
  });

  it("ignores entries that aren't approved", () => {
    expect(buildApprovedList([entry({ status: "draft - needs team confirmation" })], groupings).size).toBe(0);
  });
  it("rejects a channel that isn't in groupings.json", () => {
    expect(() => buildApprovedList([entry({ channel: "Other" })], groupings)).toThrow(/not in groupings/);
  });
  it("rejects the same value approved under two channels", () => {
    const g = [...groupings, { channel: "Direct", platforms: [] }];
    expect(() => buildApprovedList([entry({}), entry({ channel: "Direct" })], g)).toThrow(/approved twice/);
  });
  it("rejects a key that isn't cleaned", () => {
    expect(() => buildApprovedList([entry({ key: "Email " })], groupings)).toThrow(/not a cleaned value/);
  });
});

describe("CSV reader", () => {
  it("handles quotes and commas inside a field", () => {
    expect(parseCsv('a,b\n"x, y","say ""hi"""\n')).toEqual([{ a: "x, y", b: 'say "hi"' }]);
  });
});

describe("full touchpoint file", () => {
  const results = loadTouchpoints().map((t) => mapValue(t.source, list));
  const s = summarize(results);

  it("matches the Stage 0 counts, plus partner_acme approved as Referral", () => {
    expect(s.total).toBe(2000);
    expect(s.byStatus).toEqual({
      Mapped: 1829,
      "Unresolved: blank": 68,
      "Unresolved: malformed": 0,
      "Needs a person": 103,
    });
    expect(s.unresolvedOrWaiting.count).toBe(171);
  });

  it("matches the channel totals in both reports, with partner_acme moved from Other to Referral", () => {
    expect(s.byChannel).toEqual({
      "Paid Social": 513, "Paid Search": 402, Email: 213, "Organic Search": 165,
      Webinar: 159, Direct: 150, Referral: 182, "Organic Social": 45,
    });
  });
});

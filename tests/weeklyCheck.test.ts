import { describe, expect, it } from "vitest";
import { buildReport, checkValues, reportedBefore } from "../scripts/weeklyCheckReport";
import { loadApprovedList, loadTouchpoints } from "../scripts/loadData";

const list = loadApprovedList();
const check = checkValues(loadTouchpoints().map((t) => t.source), list);

describe("weekly check", () => {
  it("finds the unrecognized values in our file, with counts", () => {
    expect(check.values).toEqual([
      { value: "li", count: 31 }, { value: "promo_x", count: 25 }, { value: "social", count: 24 }, { value: "newchannel_q3", count: 23 },
    ]);
    expect(check).toMatchObject({ total: 2000, blank: 68, malformed: 0 });
  });

  it("opens an issue the first time, and records what it reported", () => {
    const r = buildReport(check, new Set(), "2026-10-05");
    expect(r.open).toBe(true);
    expect(r.title).toBe("Weekly check 2026-10-05: 4 new unrecognized source values");
    expect(r.body).toContain("| `li` | 31 | 1.6% |");
    expect(reportedBefore([r.body])).toEqual(new Set(["li", "promo_x", "social", "newchannel_q3"]));
  });

  it("doesn't open an issue when nothing is new", () => {
    const first = buildReport(check, new Set(), "2026-10-05");
    const second = buildReport(check, reportedBefore([first.body]), "2026-10-12");
    expect(second.open).toBe(false);
  });

  it("reports only values that are new since earlier issues", () => {
    const withNew = checkValues([...loadTouchpoints().map((t) => t.source), "tiktok/paid", "TikTok/Paid"], list);
    const r = buildReport(withNew, new Set(["li", "promo_x", "social", "newchannel_q3"]), "2026-10-12");
    expect(r.open).toBe(true);
    expect(r.fresh).toEqual([{ value: "tiktok/paid", count: 2 }]);
    expect(r.title).toBe("Weekly check 2026-10-12: 1 new unrecognized source value");
    expect(r.body).toContain("Still waiting from earlier weeks");
  });

  it("a test issue always opens but records nothing, so real checks still report", () => {
    const t = buildReport(check, new Set(), "2026-09-27", true);
    expect(t.open).toBe(true);
    expect(t.title).toMatch(/^\[Test\] /);
    expect(reportedBefore([t.body]).size).toBe(0);
  });

  it("ignores a marker someone has edited by hand", () => {
    expect(reportedBefore(["<!-- weekly-check-values: [oops -->"]).size).toBe(0);
  });
});

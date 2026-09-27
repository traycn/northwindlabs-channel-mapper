// The weekly check's logic: find unrecognized source values and write the
// GitHub issue text. Kept separate from the command so it can be tested.
import { mapValue, type ApprovedList } from "../src/mapper";

export interface ValueCount {
  value: string; // cleaned value
  count: number;
}

// Hidden line at the end of each issue, recording which values it reported,
// so the next week's check only reports values that are new.
const MARKER = /<!-- weekly-check-values: (\[.*?\]) -->/g;

export function reportedBefore(issueBodies: string[]): Set<string> {
  const seen = new Set<string>();
  for (const body of issueBodies) {
    for (const m of body.matchAll(MARKER)) {
      try {
        for (const v of JSON.parse(m[1])) if (typeof v === "string") seen.add(v);
      } catch {
        // A hand-edited marker we can't read: ignore it.
      }
    }
  }
  return seen;
}

export function checkValues(sources: string[], list: ApprovedList) {
  const unrecognized = new Map<string, number>();
  let blank = 0;
  let malformed = 0;
  for (const s of sources) {
    const r = mapValue(s, list);
    if (r.eligibleForAI) unrecognized.set(r.cleaned, (unrecognized.get(r.cleaned) ?? 0) + 1);
    else if (r.status === "Unresolved: blank") blank++;
    else if (r.status === "Unresolved: malformed") malformed++;
  }
  const values = [...unrecognized].map(([value, count]) => ({ value, count })).sort((a, b) => b.count - a.count);
  return { total: sources.length, values, blank, malformed };
}

const pct = (n: number, total: number) => `${(Math.round((1000 * n) / total) / 10).toFixed(1)}%`;
const table = (rows: ValueCount[], total: number) =>
  ["| Value | Touchpoints | Share |", "|---|---:|---:|", ...rows.map((r) => `| \`${r.value}\` | ${r.count} | ${pct(r.count, total)} |`)].join("\n");

export function buildReport(
  check: ReturnType<typeof checkValues>,
  previous: Set<string>,
  today: string,
  test = false,
) {
  const fresh = check.values.filter((v) => !previous.has(v.value));
  const waiting = check.values.filter((v) => previous.has(v.value));
  // A test issue lists everything but records nothing, so real checks still report these values.
  const shown = test ? check.values : fresh;
  const open = test || fresh.length > 0;
  const n = shown.length;
  const title = `${test ? "[Test] " : ""}Weekly check ${today}: ${n} ${test ? "" : "new "}unrecognized source value${n === 1 ? "" : "s"}`;

  const body = [
    test
      ? "**This is a test issue** from a manual run of the weekly check. It can be closed."
      : `The weekly check found ${n} source value${n === 1 ? "" : "s"} that ${n === 1 ? "isn't" : "aren't"} on the approved list and haven't been reported before.`,
    "",
    table(shown, check.total),
    "",
    "**What to do:** open the review queue on the site, decide on each value, export your decisions, and add them to `data/mapping.json`.",
    "",
    "<details><summary>Everything else this week</summary>",
    "",
    `- Touchpoints checked: ${check.total}`,
    !test && waiting.length ? `- Still waiting from earlier weeks: ${waiting.map((w) => `\`${w.value}\` (${w.count})`).join(", ")}` : null,
    `- Blank or placeholder: ${check.blank} (${pct(check.blank, check.total)}). Never sent to the AI.`,
    `- Broken: ${check.malformed} (${pct(check.malformed, check.total)}). Never sent to the AI.`,
    "",
    "</details>",
    test ? null : `\n<!-- weekly-check-values: ${JSON.stringify(fresh.map((f) => f.value))} -->`,
  ]
    .filter((line) => line !== null)
    .join("\n");

  return { open, title, body, fresh };
}

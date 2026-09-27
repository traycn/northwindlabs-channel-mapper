// Runs data/test_set.json through the real AI and reports how often it agrees
// with the team's known answers. Test values are never shown as examples.
// Usage: ANTHROPIC_API_KEY=... npm run test-ai
import { readFileSync, writeFileSync } from "node:fs";
import { I_DONT_KNOW, MODEL, cleanValue, memoryCache, pickExamples, suggest, type Suggestion } from "../src/mapper";
import { makeAskClaude } from "../src/mapper/suggest/claude";
import { counting, dataDir, loadGroupings, loadRules, makeClient } from "./aiSetup";
import { loadApprovedList } from "./loadData";

interface Case { value: string; expected: string; platform: string | null; kind: string }
const { cases } = JSON.parse(readFileSync(dataDir + "test_set.json", "utf8")) as { cases: Case[] };

const groupings = loadGroupings();
const fullList = loadApprovedList();
// Compare by cleaned value, since that is what the AI sees and answers for.
const testValues = cases.map((c) => cleanValue(c.value));

// Remove test values from the approved list for this run, so they reach the
// AI instead of being settled by lookup, and can't be used as examples.
const list = new Map([...fullList].filter(([v]) => !testValues.includes(v)));
const examples = pickExamples(list, testValues);

const { askAI, sent } = counting(makeAskClaude(makeClient(), groupings, examples, loadRules()));
const cache = memoryCache();
const results = await suggest(testValues, { list, groupings, askAI, cache });
const byValue = new Map<string, Suggestion>(results.map((r) => [r.value, r]));

const rows = cases.map((c) => {
  const s = byValue.get(cleanValue(c.value));
  const got = s?.answer?.grouping ?? `(failed check: ${s?.problem})`;
  return {
    ...c,
    got,
    gotPlatform: s?.answer?.platform ?? null,
    confidence: s?.answer?.confidence ?? "-",
    status: s?.status ?? "missing",
    reason: s?.answer?.reason ?? s?.problem ?? "",
    agrees: got === c.expected,
    // The risky case: a confident answer that's wrong would reach the review
    // queue as a suggestion instead of an open question.
    confidentlyWrong: s?.status === "Suggested: waiting for approval" && got !== c.expected,
  };
});

const known = rows.filter((r) => r.expected !== I_DONT_KNOW);
const negatives = rows.filter((r) => r.expected === I_DONT_KNOW);
const pct = (n: number, d: number) => `${n} of ${d} (${Math.round((100 * n) / d)}%)`;

console.log(`\nModel: ${MODEL}   Examples shown: ${examples.map((e) => e.value).join(", ")}\n`);
for (const r of rows) {
  const mark = r.agrees ? "ok " : r.confidentlyWrong ? "XX " : "-- ";
  console.log(`${mark}${r.value.padEnd(20)} expected ${r.expected.padEnd(15)} got ${r.got.padEnd(15)} ${r.confidence.padEnd(7)} ${r.reason}`);
}
console.log(`\nAgrees with us on known values:           ${pct(known.filter((r) => r.agrees).length, known.length)}`);
console.log(`  ...and confident enough to suggest:      ${pct(known.filter((r) => r.agrees && r.status === "Suggested: waiting for approval").length, known.length)}`);
console.log(`Correctly says "I don't know":             ${pct(negatives.filter((r) => r.agrees).length, negatives.length)}`);
console.log(`Should-not-match values sent to a person:  ${pct(negatives.filter((r) => r.status === "Needs a person").length, negatives.length)}`);
console.log(`Confidently wrong (the risky kind):        ${pct(rows.filter((r) => r.confidentlyWrong).length, rows.length)}`);
console.log(`Platform matches (known values it agreed on): ${pct(known.filter((r) => r.agrees && r.gotPlatform === r.platform).length, known.filter((r) => r.agrees).length)}`);

// Second run: every answer should come from the cache, with no AI requests.
const before = sent.length;
await suggest(testValues, { list, groupings, askAI, cache });
console.log(`\nAI requests: first run ${before}, second run ${sent.length - before} (should be 0: cache reused)`);

writeFileSync(dataDir + "test_results.json", JSON.stringify({ model: MODEL, run_on: new Date().toISOString(), ai_requests: { first_run: before, second_run: sent.length - before }, examples, rows }, null, 2) + "\n");
console.log("Full results saved to data/test_results.json");

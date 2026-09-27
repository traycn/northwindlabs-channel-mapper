// Runs the fixed-rule mapper over touchpoints.csv and prints counts by status.
// Usage: npm run counts
import { mapValue, summarize, type MapResult } from "../src/mapper";
import { loadApprovedList, loadTouchpoints } from "./loadData";

const list = loadApprovedList();
const results = loadTouchpoints().map((t) => mapValue(t.source, list));
const s = summarize(results);
// Round halves up (25.65 -> 25.7), matching the reports.
const pct = (n: number) => (Math.round((1000 * n) / s.total) / 10).toFixed(1).padStart(5) + "%";
const row = (label: string, n: number) => console.log(`  ${label.padEnd(24)}${String(n).padStart(6)} ${pct(n)}`);

console.log(`\nTouchpoints: ${s.total}\n\nBy status`);
for (const [status, n] of Object.entries(s.byStatus)) row(status, n);

console.log("\nBy channel");
for (const [channel, n] of Object.entries(s.byChannel).sort((a, b) => b[1] - a[1])) row(channel, n);
row("Unresolved / waiting", s.unresolvedOrWaiting.count);

console.log("\nValues not mapped");
const unmapped = new Map<string, { r: MapResult; n: number }>();
for (const r of results) {
  if (r.status === "Mapped") continue;
  const e = unmapped.get(r.raw) ?? { r, n: 0 };
  e.n++;
  unmapped.set(r.raw, e);
}
for (const { r, n } of [...unmapped.values()].sort((a, b) => b.n - a.n)) {
  console.log(`  ${JSON.stringify(r.raw).padEnd(18)}${String(n).padStart(4)}  ${r.status}${r.eligibleForAI ? "  (can go to AI in Stage 2)" : ""}`);
}

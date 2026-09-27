// Asks the AI about every unfamiliar value in touchpoints.csv once, and saves
// the answers to data/saved_suggestions.json as the backup.
// Usage: ANTHROPIC_API_KEY=... npm run make-backup
import { writeFileSync } from "node:fs";
import { MODEL, PROMPT_VERSION, memoryCache, pickExamples, suggest, valuesForAI, type SavedSuggestions } from "../src/mapper";
import { makeAskClaude } from "../src/mapper/suggest/claude";
import { counting, dataDir, loadGroupings, loadRules, makeClient } from "./aiSetup";
import { loadApprovedList, loadTouchpoints } from "./loadData";

const groupings = loadGroupings();
const list = loadApprovedList();
const raws = loadTouchpoints().map((t) => t.source);

const answers: Record<string, unknown> = {};
const cache = memoryCache();
const recordingCache = { get: cache.get, put: async (k: string, v: unknown) => { answers[(v as { value: string }).value] = v; await cache.put(k, v); } };

const { askAI, sent } = counting(makeAskClaude(makeClient(), groupings, pickExamples(list), loadRules()));
const results = await suggest(raws, { list, groupings, askAI, cache: recordingCache });

const saved: SavedSuggestions = { model: MODEL, prompt_version: PROMPT_VERSION, created_on: new Date().toISOString().slice(0, 10), answers };
writeFileSync(dataDir + "saved_suggestions.json", JSON.stringify(saved, null, 2) + "\n");

console.log(`Values sent to the AI: ${sent.flat().join(", ")}`);
console.log(`(${valuesForAI(raws, list).length} unique unfamiliar values, ${sent.length} request(s))\n`);
for (const r of results) {
  console.log(`${r.value.padEnd(16)} ${r.status.padEnd(32)} ${r.answer ? `${r.answer.grouping} (${r.answer.confidence}): ${r.answer.reason}` : r.problem}`);
}
console.log("\nSaved to data/saved_suggestions.json");

// Gets AI suggestions for unfamiliar values, applying the fixed rules first.
// The AI call and the cache are passed in, so this runs the same in the
// server function, in scripts, and in tests (with a stand-in AI).
import type { ApprovedList, Grouping } from "../approvedList";
import { mapValue } from "../mapValue";
import { BATCH_SIZE, MODEL, PROMPT_VERSION } from "./config";
import { checkAnswer, decide, type CheckedAnswer, type SuggestStatus } from "./checkAnswer";

// Sends a batch of cleaned values, returns the AI's raw answers (unchecked).
export type AskAI = (values: string[]) => Promise<unknown[]>;

export interface Cache {
  get(key: string): Promise<unknown | undefined>;
  put(key: string, rawAnswer: unknown): Promise<void>;
}

export type Source = "ai" | "cache" | "saved";

export interface Suggestion {
  value: string; // cleaned value
  status: SuggestStatus;
  answer: CheckedAnswer | null;
  problem: string | null; // why the answer failed the check, if it did
  source: Source;
}

export const cacheKey = (value: string) => `${MODEL}:${PROMPT_VERSION}:${value}`;

// Turns one raw answer into a checked suggestion.
export function toSuggestion(value: string, raw: unknown, groupings: Grouping[], source: Source): Suggestion {
  const check = checkAnswer(raw, groupings);
  return {
    value,
    status: decide(check),
    answer: check.ok ? check.answer : null,
    problem: check.ok ? null : check.problem,
    source,
  };
}

// Only clean, unfamiliar values go to the AI: blank or broken values and
// values already on the approved list are dropped here, whatever the caller sent.
export function valuesForAI(raws: string[], list: ApprovedList): string[] {
  const unique = new Set<string>();
  for (const raw of raws) {
    const r = mapValue(raw, list);
    if (r.eligibleForAI) unique.add(r.cleaned);
  }
  return [...unique];
}

export async function suggest(
  raws: string[],
  deps: { list: ApprovedList; groupings: Grouping[]; askAI: AskAI; cache: Cache },
): Promise<Suggestion[]> {
  const { list, groupings, askAI, cache } = deps;
  const results: Suggestion[] = [];
  const toAsk: string[] = [];

  for (const value of valuesForAI(raws, list)) {
    const cached = await cache.get(cacheKey(value));
    if (cached !== undefined) results.push(toSuggestion(value, cached, groupings, "cache"));
    else toAsk.push(value);
  }

  for (let i = 0; i < toAsk.length; i += BATCH_SIZE) {
    const batch = toAsk.slice(i, i + BATCH_SIZE);
    const answers = await askAI(batch);
    for (const value of batch) {
      // Match answers by value, so a missing or reordered answer can't be
      // attached to the wrong value.
      const raw = answers.find((a) => (a as { value?: unknown })?.value === value);
      if (raw !== undefined) await cache.put(cacheKey(value), raw);
      results.push(toSuggestion(value, raw, groupings, "ai"));
    }
  }
  return results;
}

// In-memory cache, for scripts and tests.
export function memoryCache(): Cache & { size: () => number } {
  const m = new Map<string, unknown>();
  return {
    get: async (k) => m.get(k),
    put: async (k, v) => void m.set(k, v),
    size: () => m.size,
  };
}

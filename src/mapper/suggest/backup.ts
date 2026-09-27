// The backup: if the AI connection fails, use saved suggestions instead and
// label them "Saved result". Used by the website (in the browser).
import type { Grouping } from "../approvedList";
import { toSuggestion, type Suggestion } from "./suggest";

// Shape of data/saved_suggestions.json. Answers are stored raw and
// re-checked on load, so a hand-edited file can't skip the answer check.
export interface SavedSuggestions {
  model: string;
  prompt_version: string;
  created_on: string;
  answers: Record<string, unknown>; // cleaned value → raw AI answer
}

export function fromSaved(values: string[], saved: SavedSuggestions, groupings: Grouping[]): Suggestion[] {
  return values.map((v) => toSuggestion(v, saved.answers[v], groupings, "saved"));
}

export async function suggestWithBackup(
  values: string[],
  fetchSuggestions: (values: string[]) => Promise<Suggestion[]>,
  saved: SavedSuggestions,
  groupings: Grouping[],
): Promise<Suggestion[]> {
  try {
    return await fetchSuggestions(values);
  } catch {
    return fromSaved(values, saved, groupings);
  }
}

export const sourceLabel = (s: Suggestion) => (s.source === "saved" ? "Saved result" : "AI suggestion");

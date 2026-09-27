// Asks /api/suggest for AI suggestions. If that fails (no connection, request
// limit reached, or running locally without the server function), it uses the
// saved backup and those rows are labeled "Saved result".
import { useEffect, useState } from "react";
import { suggestWithBackup, type Suggestion } from "../mapper";
import { groupings, savedSuggestions, unfamiliarValues } from "../data/browserData";

async function fetchSuggestions(values: string[]): Promise<Suggestion[]> {
  const res = await fetch("/api/suggest", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ values }),
  });
  if (!res.ok) throw new Error(`AI connection returned ${res.status}`);
  const body = (await res.json()) as { suggestions?: Suggestion[] };
  if (!Array.isArray(body.suggestions)) throw new Error("Unexpected answer from the AI connection");
  return body.suggestions;
}

export function useSuggestions() {
  const [suggestions, setSuggestions] = useState<Map<string, Suggestion> | null>(null);

  useEffect(() => {
    let cancelled = false;
    suggestWithBackup(unfamiliarValues, fetchSuggestions, savedSuggestions, groupings).then((list) => {
      if (!cancelled) setSuggestions(new Map(list.map((s) => [s.value, s])));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const usingBackup = suggestions ? [...suggestions.values()].some((s) => s.source === "saved") : false;
  return { suggestions, usingBackup };
}

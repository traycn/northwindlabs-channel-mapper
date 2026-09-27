// Each visitor's review decisions, saved only in their own browser, so trying
// the review queue never changes anything for anyone else.
import { useCallback, useEffect, useState } from "react";
import type { Decision } from "../mapper";

const STORAGE_KEY = "channel-mapper.review.v1";

function load(): Decision[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return []; // storage blocked or unreadable: start fresh
  }
}

export function useDecisions() {
  const [decisions, setDecisions] = useState<Decision[]>(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(decisions));
    } catch {
      // Private window or storage blocked: decisions last until the page closes.
    }
  }, [decisions]);

  return {
    decisions,
    add: useCallback((d: Decision) => setDecisions((ds) => [...ds, d]), []),
    undo: useCallback((value: string) => setDecisions((ds) => ds.filter((d) => d.value !== value)), []),
    undoLast: useCallback(() => setDecisions((ds) => ds.slice(0, -1)), []),
    reset: useCallback(() => setDecisions([]), []),
  };
}

// Fixed rules: check the AI's answer, then decide what it means.
import type { Grouping } from "../approvedList";
import { I_DONT_KNOW, MAX_REASON_WORDS } from "./config";

export type Confidence = "high" | "medium" | "low";

export interface CheckedAnswer {
  grouping: string; // a channel, or "I don't know"
  platform: string | null;
  confidence: Confidence;
  reason: string;
}

export type Check = { ok: true; answer: CheckedAnswer } | { ok: false; problem: string };

const CONFIDENCES = new Set(["high", "medium", "low"]);

// Anything that isn't a well-formed answer fails the check, with a plain reason.
export function checkAnswer(raw: unknown, groupings: Grouping[]): Check {
  if (typeof raw !== "object" || raw === null) return { ok: false, problem: "No answer from the AI." };
  const a = raw as Record<string, unknown>;

  const channel = groupings.find((g) => g.channel === a.grouping);
  if (a.grouping !== I_DONT_KNOW && !channel) {
    return { ok: false, problem: `The AI answered "${String(a.grouping)}", which isn't one of our groupings.` };
  }
  if (typeof a.confidence !== "string" || !CONFIDENCES.has(a.confidence)) {
    return { ok: false, problem: "The AI's answer had no valid confidence level." };
  }
  const platform = a.platform ?? null;
  if (platform !== null && !(channel && channel.platforms.includes(platform as string))) {
    return { ok: false, problem: `The AI named platform "${String(platform)}", which isn't listed for that grouping.` };
  }
  const reason = typeof a.reason === "string" ? a.reason.trim() : "";
  if (!reason) return { ok: false, problem: "The AI's answer had no reason." };
  if (reason.split(/\s+/).length > MAX_REASON_WORDS) {
    return { ok: false, problem: `The AI's reason was longer than ${MAX_REASON_WORDS} words.` };
  }

  return {
    ok: true,
    answer: { grouping: a.grouping as string, platform: platform as string | null, confidence: a.confidence as Confidence, reason },
  };
}

export type SuggestStatus = "Suggested: waiting for approval" | "Needs a person";

// Only a high-confidence answer naming a grouping becomes a suggestion.
// Medium, low, "I don't know" and failed checks all go to a person.
export function decide(check: Check): SuggestStatus {
  return check.ok && check.answer.confidence === "high" && check.answer.grouping !== I_DONT_KNOW
    ? "Suggested: waiting for approval"
    : "Needs a person";
}

// Runs the fixed-rule steps on one raw value, and counts results.
import type { ApprovedList } from "./approvedList";
import { cleanValue } from "./clean";
import { detectProblem } from "./detect";

// "Needs a person" at this stage means "clean, but not on the approved list".
// In Stage 2 these are the only values that may go to the AI.
export type Status =
  | "Mapped"
  | "Unresolved: blank"
  | "Unresolved: malformed"
  | "Needs a person";

export interface MapResult {
  raw: string;
  cleaned: string;
  status: Status;
  channel: string | null;
  platform: string | null;
  eligibleForAI: boolean;
}

export function mapValue(raw: string, list: ApprovedList): MapResult {
  const cleaned = cleanValue(raw);
  const base = { raw, cleaned, channel: null, platform: null, eligibleForAI: false };

  const problem = detectProblem(raw, cleaned);
  if (problem === "blank") return { ...base, status: "Unresolved: blank" };
  if (problem === "malformed") return { ...base, status: "Unresolved: malformed" };

  const hit = list.get(cleaned);
  if (hit) return { ...base, status: "Mapped", channel: hit.channel, platform: hit.platform };

  return { ...base, status: "Needs a person", eligibleForAI: true };
}

export interface Summary {
  total: number;
  byStatus: Record<Status, number>;
  byChannel: Record<string, number>;
  // Everything not Mapped. Never folded into a channel.
  unresolvedOrWaiting: { count: number; share: number };
}

export function summarize(results: MapResult[]): Summary {
  const byStatus: Record<Status, number> = {
    Mapped: 0,
    "Unresolved: blank": 0,
    "Unresolved: malformed": 0,
    "Needs a person": 0,
  };
  const byChannel: Record<string, number> = {};

  for (const r of results) {
    byStatus[r.status]++;
    if (r.status === "Mapped" && r.channel) {
      byChannel[r.channel] = (byChannel[r.channel] ?? 0) + 1;
    }
  }
  const total = results.length;
  const count = total - byStatus.Mapped;
  return {
    total,
    byStatus,
    byChannel,
    unresolvedOrWaiting: { count, share: total ? count / total : 0 },
  };
}

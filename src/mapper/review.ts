// The review queue: people's decisions, the safety check, and the results
// they produce. No screens here, so it can be tested on its own.
import type { ApprovedList, Grouping } from "./approvedList";
import { mapValue, type Status } from "./mapValue";
import type { Suggestion } from "./suggest/suggest";

export type Decision =
  | {
      value: string; // cleaned value
      action: "approve" | "choose";
      channel: string;
      platform: string | null;
      decidedAt: string; // ISO date-time
    }
  | { value: string; action: "not-a-channel"; decidedAt: string };

export type RowStatus = Status | "Suggested: waiting for approval" | "Unresolved: not a channel";

export const ROW_STATUSES: RowStatus[] = [
  "Mapped",
  "Suggested: waiting for approval",
  "Needs a person",
  "Unresolved: not a channel",
  "Unresolved: blank",
  "Unresolved: malformed",
];

// One row per distinct original value, with how many touchpoints use it.
export interface ValueRow {
  raw: string;
  cleaned: string;
  count: number;
  status: RowStatus;
  channel: string | null;
  platform: string | null;
  mappedBy: "approved list" | "review queue" | null;
  suggestion: Suggestion | null;
  decision: Decision | null;
}

export function buildRows(
  sources: string[],
  list: ApprovedList,
  suggestions: Map<string, Suggestion>,
  decisions: Decision[],
): ValueRow[] {
  const counts = new Map<string, number>();
  for (const s of sources) counts.set(s, (counts.get(s) ?? 0) + 1);
  const byValue = new Map(decisions.map((d) => [d.value, d]));

  const rows: ValueRow[] = [];
  for (const [raw, count] of counts) {
    const r = mapValue(raw, list);
    const suggestion = r.eligibleForAI ? suggestions.get(r.cleaned) ?? null : null;
    const decision = r.eligibleForAI ? byValue.get(r.cleaned) ?? null : null;
    const row: ValueRow = {
      raw, cleaned: r.cleaned, count, status: r.status, channel: r.channel, platform: r.platform,
      mappedBy: r.status === "Mapped" ? "approved list" : null, suggestion, decision,
    };
    if (decision?.action === "not-a-channel") {
      row.status = "Unresolved: not a channel";
    } else if (decision) {
      Object.assign(row, { status: "Mapped", channel: decision.channel, platform: decision.platform, mappedBy: "review queue" });
    } else if (suggestion) {
      row.status = suggestion.status;
    }
    rows.push(row);
  }
  return rows.sort((a, b) => b.count - a.count || a.raw.localeCompare(b.raw));
}

export interface RowSummary {
  total: number;
  byChannel: [string, number][]; // largest first
  byStatus: Record<RowStatus, number>;
  // Everything not Mapped, suggestions included. Never folded into a channel.
  unresolvedOrWaiting: { count: number; share: number };
}

export function summarizeRows(rows: ValueRow[]): RowSummary {
  const byStatus = Object.fromEntries(ROW_STATUSES.map((s) => [s, 0])) as Record<RowStatus, number>;
  const channels = new Map<string, number>();
  let total = 0;
  for (const r of rows) {
    total += r.count;
    byStatus[r.status] += r.count;
    if (r.status === "Mapped" && r.channel) channels.set(r.channel, (channels.get(r.channel) ?? 0) + r.count);
  }
  const count = total - byStatus.Mapped;
  return {
    total,
    byChannel: [...channels].sort((a, b) => b[1] - a[1]),
    byStatus,
    unresolvedOrWaiting: { count, share: total ? count / total : 0 },
  };
}

// Values waiting for a person, one item per cleaned value, most touchpoints first.
export interface QueueItem {
  value: string;
  raws: string[];
  count: number;
  suggestion: Suggestion | null;
}

export function reviewQueue(rows: ValueRow[]): QueueItem[] {
  const items = new Map<string, QueueItem>();
  for (const r of rows) {
    if (r.status !== "Suggested: waiting for approval" && r.status !== "Needs a person") continue;
    const item = items.get(r.cleaned) ?? { value: r.cleaned, raws: [], count: 0, suggestion: r.suggestion };
    item.raws.push(r.raw);
    item.count += r.count;
    items.set(r.cleaned, item);
  }
  return [...items.values()].sort((a, b) => b.count - a.count);
}

// Safety check before recording a decision. Returns a plain explanation when blocked.
export function checkDecision(
  d: Decision,
  list: ApprovedList,
  decisions: Decision[],
  groupings: Grouping[],
): { ok: true } | { ok: false; message: string } {
  const onList = list.get(d.value);
  if (onList) {
    const what = d.action === "not-a-channel" ? "not a channel" : d.channel;
    return onList.channel === (d.action === "not-a-channel" ? null : d.channel)
      ? { ok: false, message: `"${d.value}" is already on the approved list as ${onList.channel}. Nothing to change.` }
      : {
          ok: false,
          message: `"${d.value}" is already on the approved list as ${onList.channel}, so it can't be marked as ${what} here. If the approved list is wrong, raise it with the team.`,
        };
  }
  const earlier = decisions.find((e) => e.value === d.value);
  if (earlier) {
    const was = earlier.action === "not-a-channel" ? "not a channel" : earlier.channel;
    return { ok: false, message: `You already marked "${d.value}" as ${was}. Undo that decision first if you want to change it.` };
  }
  if (d.action !== "not-a-channel") {
    const g = groupings.find((x) => x.channel === d.channel);
    if (!g) return { ok: false, message: `"${d.channel}" isn't one of our groupings.` };
    if (d.platform !== null && !g.platforms.includes(d.platform)) {
      return { ok: false, message: `"${d.platform}" isn't a platform under ${d.channel}.` };
    }
  }
  return { ok: true };
}

// Stored decisions that no longer fit, because the approved list has since
// settled that value. These are ignored, and the screen says so.
export function outdatedDecisions(decisions: Decision[], list: ApprovedList): Decision[] {
  return decisions.filter((d) => list.has(d.value));
}

// The file visitors download for the team to add to mapping.json.
export function exportDecisions(decisions: Decision[], rows: ValueRow[], today: string) {
  const rowFor = (v: string) => rows.find((r) => r.cleaned === v);
  const countFor = (v: string) => rows.filter((r) => r.cleaned === v).reduce((n, r) => n + r.count, 0);
  const aiText = (v: string) => {
    const a = rowFor(v)?.suggestion?.answer;
    return a ? `AI suggested ${a.grouping} (${a.confidence}): ${a.reason}` : "no AI suggestion";
  };
  return {
    exported_on: today,
    note: "Decisions from the review queue. A team member checks these, fills in approved_by and approved_on, and adds the approvals to data/mapping.json.",
    approvals: decisions.flatMap((d) =>
      d.action === "not-a-channel"
        ? []
        : [{
            key: d.value,
            example_raw_value: rowFor(d.value)?.raw ?? d.value,
            channel: d.channel,
            platform: d.platform,
            status: "proposed - from review queue",
            basis: `${d.action === "approve" ? "AI suggestion approved" : "grouping chosen"} in review queue; ${aiText(d.value)}`,
            approved_by: null,
            approved_on: null,
            decided_on: d.decidedAt.slice(0, 10),
            touchpoints: countFor(d.value),
          }],
    ),
    not_a_channel: decisions
      .filter((d) => d.action === "not-a-channel")
      .map((d) => ({ value: d.value, touchpoints: countFor(d.value), decided_on: d.decidedAt.slice(0, 10) })),
  };
}

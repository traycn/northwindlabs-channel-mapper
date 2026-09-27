// Status label: always a symbol and text, never color alone.
import type { RowStatus } from "../mapper";

const LOOK: Record<RowStatus, { kind: string; sym: string }> = {
  Mapped: { kind: "mapped", sym: "✓" },
  "Suggested: waiting for approval": { kind: "suggested", sym: "?" },
  "Needs a person": { kind: "unresolved", sym: "!" },
  "Unresolved: not a channel": { kind: "unresolved", sym: "!" },
  "Unresolved: blank": { kind: "unresolved", sym: "!" },
  "Unresolved: malformed": { kind: "unresolved", sym: "!" },
};

export function StatusBadge({ status }: { status: RowStatus }) {
  const { kind, sym } = LOOK[status];
  return (
    <span className={`status ${kind}`}>
      <span className="sym" aria-hidden="true">{sym}</span>
      {status}
    </span>
  );
}

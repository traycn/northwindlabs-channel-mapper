// The headline: one bar for all touchpoints, with the Unresolved / waiting
// bucket shown separately and never folded into a channel.
import type { RowSummary } from "../mapper";
import { fmt, pct } from "./format";

export function Summary({ summary, approvedHere }: { summary: RowSummary; approvedHere: number }) {
  const { total, byStatus, unresolvedOrWaiting: waiting } = summary;
  const fromList = byStatus.Mapped - approvedHere;
  const width = (n: number) => `${(100 * n) / total}%`;
  const parts = [
    ["Needs a person", byStatus["Needs a person"]],
    ["Suggested: waiting for approval", byStatus["Suggested: waiting for approval"]],
    ["Blank", byStatus["Unresolved: blank"]],
    ["Malformed", byStatus["Unresolved: malformed"]],
    ["Not a channel", byStatus["Unresolved: not a channel"]],
  ] as const;

  return (
    <section className="summary" aria-label="Summary">
      <div>
        <div className="total"><strong>{fmt(total)}</strong>touchpoints</div>
        <div
          className="bar"
          role="img"
          aria-label={`${fmt(byStatus.Mapped)} mapped (${pct(byStatus.Mapped, total)}), ${fmt(waiting.count)} unresolved or waiting (${pct(waiting.count, total)})`}
        >
          <span className="seg-mapped" style={{ width: width(fromList) }} />
          {approvedHere > 0 && <span className="seg-review" style={{ width: width(approvedHere) }} />}
          <span className="seg-waiting" style={{ width: width(waiting.count) }} />
        </div>
        <div className="bar-legend">
          <span><i style={{ background: "var(--mapped)" }} />Mapped by approved list {fmt(fromList)}</span>
          {approvedHere > 0 && (
            <span><i style={{ background: "var(--mapped)", opacity: 0.6 }} />Approved in this browser {fmt(approvedHere)}</span>
          )}
          <span><i className="seg-waiting" />Unresolved / waiting {fmt(waiting.count)}</span>
        </div>
      </div>

      <div className="bucket">
        <div className="label">Unresolved / waiting</div>
        <div className="big">
          {fmt(waiting.count)}<small>{pct(waiting.count, total)} of touchpoints</small>
        </div>
        <ul>
          {parts.filter(([, n]) => n > 0).map(([label, n]) => (
            <li key={label}>{label}: {fmt(n)}</li>
          ))}
        </ul>
        <p>Never counted in any channel until a person approves.</p>
      </div>
    </section>
  );
}

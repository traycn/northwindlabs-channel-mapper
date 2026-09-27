// Touchpoints by grouping, with the Unresolved / waiting bucket as its own last row.
import type { RowSummary } from "../mapper";
import { fmt, pct } from "./format";

export function GroupingTotals({ summary }: { summary: RowSummary }) {
  const { total, byChannel, unresolvedOrWaiting: waiting } = summary;
  const max = Math.max(waiting.count, ...byChannel.map(([, n]) => n));
  const meter = (n: number) => <span style={{ width: `${(100 * n) / max}%` }} />;

  return (
    <section aria-labelledby="totals-h">
      <h2 id="totals-h">Touchpoints by grouping</h2>
      <table className="totals">
        <thead>
          <tr><th>Grouping</th><th className="num">Touchpoints</th><th className="num">Share</th><th aria-hidden="true" /></tr>
        </thead>
        <tbody>
          {byChannel.map(([channel, n]) => (
            <tr key={channel}>
              <td>{channel}</td>
              <td className="num">{fmt(n)}</td>
              <td className="num">{pct(n, total)}</td>
              <td className="meter" aria-hidden="true">{meter(n)}</td>
            </tr>
          ))}
          <tr className="waiting">
            <td>Unresolved / waiting</td>
            <td className="num">{fmt(waiting.count)}</td>
            <td className="num">{pct(waiting.count, total)}</td>
            <td className="meter" aria-hidden="true">{meter(waiting.count)}</td>
          </tr>
        </tbody>
      </table>
    </section>
  );
}

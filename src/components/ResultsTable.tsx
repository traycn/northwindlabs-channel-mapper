// Every original value with its result, filterable by status.
import { useState } from "react";
import { I_DONT_KNOW, ROW_STATUSES, sourceLabel, type RowStatus, type ValueRow } from "../mapper";
import { StatusBadge } from "./StatusBadge";
import { fmt, grouping } from "./format";

// Why a status might have no rows, so an empty filter is never a mystery.
const EMPTY_NOTE: Partial<Record<RowStatus, string>> = {
  "Unresolved: malformed": "No broken values in this file: every unusable value is blank or a placeholder.",
  "Suggested: waiting for approval": "The AI wasn't confident about any value in this file, so nothing is waiting for approval.",
  "Unresolved: not a channel": "Nothing has been marked as not a channel yet.",
};

function reasonFor(r: ValueRow) {
  if (r.mappedBy === "approved list") return <span className="muted">On the approved list</span>;
  if (r.mappedBy === "review queue") return <span className="muted">Approved in this browser</span>;
  if (r.status === "Unresolved: not a channel") return <span className="muted">Marked as not a channel in this browser</span>;
  if (r.status === "Unresolved: blank") return <span className="muted">Empty or placeholder. Never sent to the AI.</span>;
  if (r.status === "Unresolved: malformed") return <span className="muted">Broken value. Never sent to the AI.</span>;
  const s = r.suggestion;
  if (!s) return <span className="muted">—</span>;
  const a = s.answer;
  return (
    <span className="reason">
      <span className="muted">{sourceLabel(s)}: </span>
      {a ? `${a.grouping === I_DONT_KNOW ? "I don't know" : grouping(a.grouping, a.platform)} (${a.confidence}) — ${a.reason}` : s.problem}
    </span>
  );
}

export function ResultsTable({ rows }: { rows: ValueRow[] }) {
  const [filter, setFilter] = useState<RowStatus | "All">("All");
  const shown = filter === "All" ? rows : rows.filter((r) => r.status === filter);
  const count = (s: RowStatus) => rows.filter((r) => r.status === s).reduce((n, r) => n + r.count, 0);
  const total = rows.reduce((n, r) => n + r.count, 0);

  return (
    <section aria-labelledby="results-h">
      <h2 id="results-h">All results</h2>
      <div className="filters" role="group" aria-label="Filter by status">
        <button aria-pressed={filter === "All"} onClick={() => setFilter("All")}>All ({fmt(total)})</button>
        {ROW_STATUSES.map((s) => (
          <button key={s} aria-pressed={filter === s} onClick={() => setFilter(s)}>
            {s} ({fmt(count(s))})
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="muted">{(filter !== "All" && EMPTY_NOTE[filter]) || "No values with this status."}</p>
      ) : (
        <table className="results">
          <thead>
            <tr>
              <th>Original value</th><th>Cleaned value</th><th>Status</th><th>Grouping</th><th>Reason</th><th className="num">Touchpoints</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => (
              <tr key={r.raw} className={r.status === "Mapped" ? "" : "is-waiting"}>
                <td data-label="Original" className="mono">{r.raw === "" ? <span className="muted">(empty)</span> : r.raw}</td>
                <td data-label="Cleaned" className="mono">{r.cleaned === "" ? <span className="muted">(empty)</span> : r.cleaned}</td>
                <td data-label="Status"><StatusBadge status={r.status} /></td>
                <td data-label="Grouping">{grouping(r.channel, r.platform)}</td>
                <td data-label="Reason">{reasonFor(r)}</td>
                <td data-label="Touchpoints" className="num">{fmt(r.count)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

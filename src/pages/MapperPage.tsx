// Section 3: the mapper. Runs the fixed rules on the touchpoint file, adds AI
// suggestions (or the saved backup), and applies this visitor's decisions.
import { useMemo } from "react";
import { buildRows, checkDecision, exportDecisions, outdatedDecisions, reviewQueue, summarizeRows, type Decision } from "../mapper";
import { approvedList, groupings, sources } from "../data/browserData";
import { useDecisions } from "../state/useDecisions";
import { useSuggestions } from "../state/useSuggestions";
import { Summary } from "../components/Summary";
import { GroupingTotals } from "../components/GroupingTotals";
import { ReviewQueue } from "../components/ReviewQueue";
import { ResultsTable } from "../components/ResultsTable";

function download(filename: string, data: unknown) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2) + "\n"], { type: "application/json" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: filename });
  a.click();
  URL.revokeObjectURL(url);
}

export function MapperPage() {
  const { suggestions, usingBackup } = useSuggestions();
  const { decisions, add, undo, undoLast, reset } = useDecisions();

  const outdated = useMemo(() => outdatedDecisions(decisions, approvedList), [decisions]);
  const active = useMemo(() => decisions.filter((d) => !approvedList.has(d.value)), [decisions]);
  const rows = useMemo(() => (suggestions ? buildRows(sources, approvedList, suggestions, active) : []), [suggestions, active]);
  const summary = useMemo(() => summarizeRows(rows), [rows]);
  const approvedHere = rows.filter((r) => r.mappedBy === "review queue").reduce((n, r) => n + r.count, 0);

  if (!suggestions) return <p className="muted">Running the mapper…</p>;

  const onDecide = (d: Decision) => {
    const check = checkDecision(d, approvedList, active, groupings);
    if (!check.ok) return check.message;
    add(d);
    return null;
  };
  const onReset = () => {
    if (window.confirm("Remove all your decisions in this browser? This can't be undone.")) reset();
  };
  const onExport = () => {
    const today = new Date().toISOString().slice(0, 10);
    download(`review-decisions-${today}.json`, exportDecisions(active, rows, today));
  };

  return (
    <>
      <p className="lead">
        This runs the mapper on every touchpoint from 6 April to 5 July 2026. Start with the <strong>Unresolved / waiting</strong> box:
        it holds everything not yet placed in a channel, shown on its own instead of hidden in “Other”. Then work through the
        review queue. Each decision updates the totals straight away.
      </p>

      {usingBackup && (
        <p className="notice warn" role="status">
          The AI connection isn't available, so AI answers come from saved results. Those rows are labeled <strong>Saved result</strong>.
        </p>
      )}
      {outdated.length > 0 && (
        <p className="notice" role="status">
          {outdated.length === 1 ? "Your saved decision for " : "Your saved decisions for "}
          {outdated.map((d) => d.value).join(", ")} {outdated.length === 1 ? "is" : "are"} now settled by the approved list, so{" "}
          {outdated.length === 1 ? "it's" : "they're"} ignored.{" "}
          <button className="link" onClick={() => outdated.forEach((d) => undo(d.value))}>Clear {outdated.length === 1 ? "it" : "them"}</button>
        </p>
      )}

      <Summary summary={summary} approvedHere={approvedHere} />

      <div className="columns">
        <GroupingTotals summary={summary} />
        <ReviewQueue
          items={reviewQueue(rows)}
          decisions={active}
          groupings={groupings}
          onDecide={onDecide}
          onUndo={undo}
          onUndoLast={undoLast}
          onReset={onReset}
          onExport={onExport}
        />
      </div>

      <ResultsTable rows={rows} />
    </>
  );
}

// The review queue: one card per value waiting for a person, with three
// choices, plus the visitor's own decisions with undo, reset and export.
import { useState } from "react";
import { I_DONT_KNOW, sourceLabel, type Decision, type Grouping, type QueueItem } from "../mapper";
import { fmt, grouping } from "./format";

interface Props {
  items: QueueItem[];
  decisions: Decision[];
  groupings: Grouping[];
  onDecide: (d: Decision) => string | null; // returns a message if blocked
  onUndo: (value: string) => void;
  onUndoLast: () => void;
  onReset: () => void;
  onExport: () => void;
}

// "Paid Social · LinkedIn", "Paid Social (platform unknown)", "Email", ...
function options(groupings: Grouping[]) {
  return groupings.flatMap((g) =>
    g.platforms.length
      ? [...g.platforms.map((p) => ({ channel: g.channel, platform: p as string | null })), { channel: g.channel, platform: null }]
      : [{ channel: g.channel, platform: null }],
  );
}

function Card({ item, groupings, onDecide }: { item: QueueItem; groupings: Grouping[]; onDecide: Props["onDecide"] }) {
  const [choosing, setChoosing] = useState(false);
  const [choice, setChoice] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const answer = item.suggestion?.answer;
  const canApprove = !!answer && answer.grouping !== I_DONT_KNOW;
  const now = () => new Date().toISOString();
  const opts = options(groupings);

  const decide = (d: Decision) => setMessage(onDecide(d));

  return (
    <article className="card" aria-labelledby={`q-${item.value}`}>
      <div className="card-head">
        <span id={`q-${item.value}`} className="mono">{item.value}</span>
        <span className="muted">{fmt(item.count)} touchpoints</span>
      </div>
      {item.raws.some((r) => r !== item.value) && (
        <div className="muted" style={{ fontSize: "0.85rem" }}>
          Written as: {item.raws.map((r) => <span key={r} className="mono">"{r}" </span>)}
        </div>
      )}

      <p className="ai">
        {item.suggestion ? (
          <>
            <span className="source">{sourceLabel(item.suggestion)}</span>
            {answer ? (
              <>
                <strong>{answer.grouping === I_DONT_KNOW ? "I don't know" : grouping(answer.grouping, answer.platform)}</strong>
                {" "}({answer.confidence} confidence) — {answer.reason}
              </>
            ) : (
              <>No usable answer: {item.suggestion.problem}</>
            )}
          </>
        ) : (
          <span className="muted">No AI suggestion for this value.</span>
        )}
      </p>

      <div className="actions">
        <button
          className="primary"
          disabled={!canApprove}
          title={canApprove ? undefined : "There's no suggested grouping to approve. Choose one instead."}
          onClick={() => answer && decide({ value: item.value, action: "approve", channel: answer.grouping, platform: answer.platform, decidedAt: now() })}
        >
          Approve{canApprove ? `: ${grouping(answer!.grouping, answer!.platform)}` : ""}
        </button>
        <button onClick={() => setChoosing((c) => !c)} aria-expanded={choosing}>Choose a different grouping</button>
        <button onClick={() => decide({ value: item.value, action: "not-a-channel", decidedAt: now() })}>Not a channel</button>
      </div>

      {choosing && (
        <div className="choose">
          <label className="visually-hidden" htmlFor={`c-${item.value}`}>Grouping for {item.value}</label>
          <select id={`c-${item.value}`} value={choice} onChange={(e) => setChoice(e.target.value)}>
            <option value="">Choose a grouping…</option>
            {opts.map((o, i) => (
              <option key={i} value={i}>
                {o.platform ? `${o.channel} · ${o.platform}` : groupings.find((g) => g.channel === o.channel)!.platforms.length ? `${o.channel} (platform unknown)` : o.channel}
              </option>
            ))}
          </select>
          <button
            className="primary"
            disabled={choice === ""}
            onClick={() => {
              const o = opts[Number(choice)];
              decide({ value: item.value, action: "choose", channel: o.channel, platform: o.platform, decidedAt: now() });
            }}
          >
            Approve this grouping
          </button>
        </div>
      )}
      {message && <p className="message" role="alert">{message}</p>}
    </article>
  );
}

export function ReviewQueue(p: Props) {
  const describe = (d: Decision) =>
    d.action === "not-a-channel" ? "Not a channel" : `${d.action === "approve" ? "Approved" : "Chosen"}: ${grouping(d.channel, d.platform)}`;

  return (
    <section aria-labelledby="queue-h">
      <h2 id="queue-h">Review queue ({p.items.length})</h2>
      <p className="guidance">
        Approve a grouping only when the value clearly names the channel, and the platform if it has one. If it could be paid
        or organic, or you can't tell, leave it and ask Tracy N, who approves changes to the approved list. Use{" "}
        <strong>Not a channel</strong> for test values and anything that isn't a marketing source.
      </p>

      {p.items.length === 0 ? (
        <p className="muted">Nothing waiting. Every value has a decision.</p>
      ) : (
        <div className="queue">
          {p.items.map((item) => <Card key={item.value} item={item} groupings={p.groupings} onDecide={p.onDecide} />)}
        </div>
      )}

      <div className="decided">
        <h2>Your decisions ({p.decisions.length})</h2>
        <p className="muted" style={{ fontSize: "0.9rem", margin: 0 }}>
          Saved only in this browser. They don't change the approved list or anyone else's view until the team adds them.
        </p>
        {p.decisions.length > 0 && (
          <ul>
            {p.decisions.map((d) => (
              <li key={d.value}>
                <span><span className="mono">{d.value}</span> — {describe(d)}</span>
                <button className="link" onClick={() => p.onUndo(d.value)}>Undo</button>
              </li>
            ))}
          </ul>
        )}
        <div className="toolbar">
          <button onClick={p.onUndoLast} disabled={!p.decisions.length}>Undo last</button>
          <button onClick={p.onReset} disabled={!p.decisions.length}>Reset all</button>
          <button onClick={p.onExport} disabled={!p.decisions.length}>Export decisions for the team</button>
        </div>
      </div>
    </section>
  );
}

// Section 4: which steps follow fixed rules and which use AI. The diagram
// follows the "Fixed rules vs. AI" table in CLAUDE.md.

type Who = "Fixed rules" | "AI" | "A person";

const STEPS: { step: string; who: Who; outcome: string }[] = [
  { step: "Clean up the value", who: "Fixed rules", outcome: "Spaces trimmed, lowercase, tidy separators. The original is kept." },
  { step: "Spot blank or broken values", who: "Fixed rules", outcome: "→ Unresolved: blank / Unresolved: malformed. Never sent to the AI." },
  { step: "Look it up in the approved list", who: "Fixed rules", outcome: "→ Mapped, with its grouping." },
  { step: "Suggest a grouping for an unfamiliar value", who: "AI", outcome: "Picks one of our groupings, or answers “I don't know”." },
  { step: "Check the AI's answer", who: "Fixed rules", outcome: "Not one of our groupings, or no confidence → Needs a person." },
  { step: "Decide what the answer means", who: "Fixed rules", outcome: "High confidence → Suggested: waiting for approval. Anything else → Needs a person." },
  { step: "Add to the approved list", who: "A person", outcome: "Only someone approving in the review queue." },
];

const NEVER = [
  "change the approved list by itself",
  "create a new channel grouping",
  "see blank or broken values",
  "have its suggestions counted in report totals before a person approves them",
];

const KIND: Record<Who, string> = { "Fixed rules": "rules", AI: "ai", "A person": "person" };

export function HowItWorksPage() {
  return (
    <>
      <p className="lead">
        Almost everything follows fixed rules. AI is used for one step only, and a person always has the final say.
      </p>

      <section className="prose-block" aria-labelledby="why-h">
        <h2 id="why-h">Why fixed rules, and why AI for one step</h2>
        <p>
          A report has to give the same answer every time. Fixed rules do that: the same value always gets the same result,
          and every result can be traced back to an entry in the approved list. This quarter, cleaning and lookup alone place
          91.5% of touchpoints.
        </p>
        <p>
          The one step that needs judgment is a value the list has never seen. Reading <code>facebook_ads</code> as Paid Social
          on Meta is what AI does well. But it can also be confidently wrong, so it works inside fixed rules: it only sees clean,
          unfamiliar values; it can only pick one of our groupings or say “I don't know”; only high-confidence answers are shown
          as suggestions; and nothing counts until a person approves it.
        </p>
      </section>

      <section aria-labelledby="flow-h">
        <h2 id="flow-h">What happens to each source value</h2>
        <div className="flow-key" aria-hidden="true">
          <span className="who rules">Fixed rules</span>
          <span className="who ai">AI</span>
          <span className="who person">A person</span>
        </div>
        <ol className="flow">
          {STEPS.map((s, i) => (
            <li key={s.step} className={KIND[s.who]}>
              <span className="step-n" aria-hidden="true">{i + 1}</span>
              <div>
                <div className="step-head">
                  <strong>{s.step}</strong>
                  <span className={`who ${KIND[s.who]}`}>{s.who}</span>
                </div>
                <div className="step-out">{s.outcome}</div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="never" aria-labelledby="never-h">
        <h2 id="never-h">The AI can never</h2>
        <ul>{NEVER.map((n) => <li key={n}>{n}</li>)}</ul>
      </section>

      <section className="prose-block" aria-labelledby="bucket-h">
        <h2 id="bucket-h">The Unresolved / waiting bucket</h2>
        <p>
          “Other” mixed three different things: empty cells, junk, and real sources nobody had sorted yet. The report now keeps
          them in a separate <strong>Unresolved / waiting</strong> bucket, shown with its share of all touchpoints, so everyone
          can see how much of the report is still uncertain.
        </p>
        <p>
          A value is never quietly added to the closest-looking channel. Channel totals only include values someone has
          approved, and AI suggestions stay in the bucket until a person approves them.
        </p>
      </section>
    </>
  );
}

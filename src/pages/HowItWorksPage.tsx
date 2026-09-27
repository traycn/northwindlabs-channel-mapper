// Section 4: which steps follow fixed rules and which use AI. The diagram
// follows the "Fixed rules vs. AI" table in CLAUDE.md.
import { TeamWrites } from "../components/TeamWrites";

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
      {/* <!-- TEAM WRITES: why some steps use fixed rules and one uses AI, in plain words --> */}
      <TeamWrites>why some steps follow fixed rules and one uses AI, in plain words.</TeamWrites>

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

      <section aria-labelledby="bucket-h">
        <h2 id="bucket-h">The Unresolved / waiting bucket</h2>
        {/* <!-- TEAM WRITES: why the report keeps a separate Unresolved / waiting bucket instead of "Other" --> */}
        <TeamWrites>why the report keeps a separate Unresolved / waiting bucket instead of “Other”.</TeamWrites>
      </section>
    </>
  );
}

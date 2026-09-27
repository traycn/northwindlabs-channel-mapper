// Section 2: the two options, compared on the same questions, ending with one choice.

const OPTIONS = [
  {
    name: "Agree on shared definitions",
    summary: "Marketing, sales and leadership agree on what the headline counts, which date a lead is counted on, the channel list, and who owns changes such as the MQL threshold.",
  },
  {
    name: "Automate manual steps",
    summary: "Replace hand-sorting of source values with a mapper: fixed rules and an approved list, AI suggestions for unfamiliar values, and a person approving every new entry.",
  },
];

const ANSWERS: [question: string, definitions: string, automate: string][] = [
  [
    "What it unblocks",
    "One headline everyone trusts, and weekly numbers that match across reports.",
    "Every touchpoint sorted the same way every week, the “Other” bucket opened up, and one approved list that both reports can use.",
  ],
  [
    "How fast it helps",
    "Only once all three groups agree. We can't commit to a date on our own.",
    "Now. The mapper runs on this quarter's data, and fixed rules alone place 91.5% of touchpoints.",
  ],
  [
    "Who has to agree",
    "Marketing, sales and leadership, plus a named owner for future changes.",
    "Marketing, which owns the approved list. Sales can use the same list without changing how it works.",
  ],
  [
    "The risks",
    "Talks stall, while the manual work and the hidden “Other” bucket carry on.",
    "We automate a process that still has two definitions. The AI can suggest a wrong grouping, so nothing counts until a person approves it.",
  ],
  [
    "What it depends on",
    "Time from all three groups, and someone to decide when they disagree.",
    "The weekly data export the analyst already does, a low-cost AI connection with a spending limit, and a short weekly review.",
  ],
];

export function OptionsPage() {
  return (
    <>
      <p className="lead">We compared two ways to fix this. Both are needed eventually. The question was which to do first.</p>

      <div className="option-cards">
        {OPTIONS.map((o, i) => (
          <div key={o.name} className="option-card">
            <span className="option-label">Option {String.fromCharCode(65 + i)}</span>
            <h2>{o.name}</h2>
            <p>{o.summary}</p>
          </div>
        ))}
      </div>

      <section aria-labelledby="compare-h">
        <h2 id="compare-h">Side by side</h2>
        <table className="compare">
          <thead>
            <tr>
              <th scope="col"><span className="visually-hidden">Question</span></th>
              {OPTIONS.map((o, i) => <th scope="col" key={o.name}>{String.fromCharCode(65 + i)}. {o.name}</th>)}
            </tr>
          </thead>
          <tbody>
            {ANSWERS.map(([q, a, b]) => (
              <tr key={q}>
                <th scope="row">{q}</th>
                <td data-label={`A. ${OPTIONS[0].name}`}>{a}</td>
                <td data-label={`B. ${OPTIONS[1].name}`}>{b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="choice" aria-labelledby="choice-h">
        <span className="option-label">Our choice</span>
        <h2 id="choice-h">B. Automate manual steps, starting with channel grouping</h2>
        <p>
          It helps this quarter without waiting for anyone. It removes the hand-sorting, and it brings every unplaced
          touchpoint into view instead of hiding it in “Other”. It also gives the definitions conversation a documented
          starting point: one approved list that records both the channel marketing reports and the platform sales splits by.
        </p>
        <p>
          Agreeing on shared definitions is the next step, not a rejected one. It starts with which headline the weekly view
          leads with, and who owns the MQL threshold. See <a href="#definitions">E2. Definition recommendations</a>.
        </p>
      </section>
    </>
  );
}

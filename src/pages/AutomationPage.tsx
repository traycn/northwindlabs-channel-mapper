// Section 7: ways to automate the weekly touchpoint import (added 2026-09-27
// at the team's request). Suggestions only: none of these is built yet.

interface Option {
  name: string;
  setup: "Very low" | "Low" | "Medium" | "High";
  automated: string;
  who: string[];
  pros: string[];
  cons: string[];
}

const OPTIONS: Option[] = [
  {
    name: "Guided upload",
    setup: "Very low",
    automated:
      "The analyst still exports the data, but uploads the file straight to the repository through GitHub's website. Everything after that runs by itself: the import checks, the weekly check and the site rebuild.",
    who: [
      "Marketing analyst: a short weekly upload of the exported file",
      "Repository owner: gives the analyst access to upload",
    ],
    pros: [
      "Can start this week, with no new systems and no stored passwords",
      "A person looks at every file before it goes in",
      "One simple weekly step instead of editing files, and the import checks catch a wrong or outdated file",
    ],
    cons: [
      "The 2-hour export stays manual",
      "Relies on someone remembering every week",
      "The analyst needs access to a repository that holds personal data",
    ],
  },
  {
    name: "Scheduled export to a shared folder",
    setup: "Low",
    automated:
      "The source system's own scheduled export saves the file to a shared cloud folder each week. A weekly GitHub job picks it up, checks it, and updates the touchpoint file, and the weekly check and site rebuild follow.",
    who: [
      "Marketing analyst: sets up the scheduled export once",
      "IT: gives the job read-only access to that one folder",
      "Repository owner: stores that access as a GitHub secret",
    ],
    pros: [
      "Uses the scheduled export that many marketing platforms and CRMs already offer",
      "No code written against the source system",
      "The file format stays the one the analyst exports today",
    ],
    cons: [
      "Breaks if someone renames or reorders the export's columns",
      "A shared folder holding personal data needs tight access controls",
      "If the export quietly stops, the check runs on old data (the import checks flag this)",
    ],
  },
  {
    name: "From the data warehouse",
    setup: "Medium",
    automated:
      "If touchpoints already reach a company data warehouse, a scheduled query there produces the weekly table. A GitHub job downloads it, checks it and saves it.",
    who: [
      "Data / analytics team: owns the warehouse and the query",
      "IT: sets up a read-only service account",
      "Repository owner: stores that account as a GitHub secret",
    ],
    pros: [
      "The data may already be cleaned and joined",
      "One source shared with other reporting",
      "The warehouse keeps the full history",
    ],
    cons: [
      "Only possible if touchpoints already land in a warehouse",
      "Depends on another team's schedule and priorities",
      "Warehouse query costs",
    ],
  },
  {
    name: "Direct pull from the source system",
    setup: "High",
    automated:
      "A weekly GitHub job asks the source system for the week's touchpoints directly, builds the file, checks it and saves it. Nobody exports anything.",
    who: [
      "Marketing ops / CRM admin: sets up read-only access to the data",
      "IT / security: approves the stored credential",
      "A developer: writes and maintains the pull",
      "Repository owner: stores the credential as a GitHub secret",
    ],
    pros: [
      "Fully hands-off, and always the latest data",
      "Can pull only the columns needed, so less personal data is copied",
      "Removes the 2-hour export entirely",
    ],
    cons: [
      "The most work to build and to keep working",
      "Changes or limits on the source system's side can break it",
      "Needs a stored credential that can read marketing data",
    ],
  },
];

const COMPARE: [string, string[]][] = [
  ["Setup effort", OPTIONS.map((o) => o.setup)],
  ["Manual work each week", ["Export + upload", "None, once set up", "None", "None"]],
  ["New stored credential", ["No", "Yes: one folder", "Yes: warehouse", "Yes: source system"]],
  ["Needs", ["GitHub access", "A scheduled export", "An existing warehouse", "Source system access"]],
];

const CHECKS = [
  "The file has the expected columns: touchpoint, person, date, campaign and source.",
  "It isn't empty, and the number of rows is in line with recent weeks.",
  "The dates are newer than last week's file, so old data is never re-imported unnoticed.",
  "If any check fails, the previous file stays in place and a GitHub issue says what went wrong.",
];

export function AutomationPage() {
  return (
    <>
      <p className="lead">
        Today the analyst spends about 2 hours a week exporting the data, and someone then has to replace the touchpoint
        file by hand before the Monday check. These are four ways to automate that, from quickest to start to most
        hands-off. None of them is built yet.
      </p>

      <section aria-labelledby="flow-today-h">
        <h2 id="flow-today-h">What changes</h2>
        <div className="before-after">
          <div>
            <span className="option-label">Today</span>
            <ol className="mini-flow">
              <li className="manual">Export from the source system <em>manual, ~2h</em></li>
              <li className="manual">Replace <code>data/touchpoints.csv</code> <em>manual</em></li>
              <li className="auto">Weekly check and site rebuild <em>automatic</em></li>
            </ol>
          </div>
          <div>
            <span className="option-label">Fully automated</span>
            <ol className="mini-flow">
              <li className="auto">Get the week's data <em>automatic</em></li>
              <li className="auto">Import checks, then update the file <em>automatic</em></li>
              <li className="auto">Weekly check and site rebuild <em>automatic</em></li>
            </ol>
          </div>
        </div>
      </section>

      <section aria-labelledby="options-h">
        <h2 id="options-h">The options</h2>
        <div className="auto-options">
          {OPTIONS.map((o, i) => (
            <article key={o.name} className="auto-option" aria-labelledby={`opt-${i}`}>
              <div className="auto-head">
                <span className="option-label">Option {i + 1}</span>
                <span className="effort">Setup effort: <strong>{o.setup}</strong></span>
              </div>
              <h3 id={`opt-${i}`}>{o.name}</h3>
              <p><strong>What's automated.</strong> {o.automated}</p>
              <p className="sub"><strong>Who's involved</strong></p>
              <ul className="who-list">{o.who.map((w) => <li key={w}>{w}</li>)}</ul>
              <div className="proscons">
                <div>
                  <p className="sub pro">Pros</p>
                  <ul>{o.pros.map((p) => <li key={p}>{p}</li>)}</ul>
                </div>
                <div>
                  <p className="sub con">Cons</p>
                  <ul>{o.cons.map((c) => <li key={c}>{c}</li>)}</ul>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="cmp-h">
        <h2 id="cmp-h">At a glance</h2>
        <table className="compare four">
          <thead>
            <tr>
              <th scope="col"><span className="visually-hidden">Question</span></th>
              {OPTIONS.map((o, i) => <th scope="col" key={o.name}>{i + 1}. {o.name}</th>)}
            </tr>
          </thead>
          <tbody>
            {COMPARE.map(([q, cells]) => (
              <tr key={q}>
                <th scope="row">{q}</th>
                {cells.map((c, i) => <td key={i} data-label={`${i + 1}. ${OPTIONS[i].name}`}>{c}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="prose-block" aria-labelledby="checks-h">
        <h2 id="checks-h">Whichever option: check every import</h2>
        <p>
          Automating the import means nobody looks at the file before it's used, so fixed rules should check it first, the
          same way the mapper checks source values:
        </p>
        <ul className="people">{CHECKS.map((c) => <li key={c}>{c}</li>)}</ul>
        <p>
          The full touchpoint file, with people and dates, stays in the private repository. The public site only ever shows
          totals.
        </p>
      </section>

      <section className="choice" aria-labelledby="suggest-h">
        <span className="option-label">Our suggestion</span>
        <h2 id="suggest-h">Start with option 1 now, then move to option 2</h2>
        <p>
          The guided upload can start this week with no new systems, and the import checks catch a wrong or outdated file.
          Once the source system's scheduled export is set up, option 2 removes the weekly manual work, with far less to build and maintain than a
          direct pull. Option 3 makes sense only if touchpoints already flow into a company warehouse, and option 4 only if
          the export can't be scheduled or the data needs to be fresher than weekly.
        </p>
        <p className="muted">
          First question to answer: can the source system schedule a weekly export to a shared folder? That decides whether
          option 2 is available.
        </p>
      </section>
    </>
  );
}

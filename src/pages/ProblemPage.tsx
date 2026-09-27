// Section 1: the problem. Every number comes from the Stage 0 data check
// (data/DATA_NOTES.md) and the process note (data/how-it-works-today.md).

const KEY_NUMBERS = [
  { figure: "14 vs 17", label: "Week 10 headline: marketing's MQLs vs sales' accepted leads, from the same data" },
  { figure: "10.2%", label: "Touchpoints hidden in “Other” in both reports, with no way to see what's inside" },
  { figure: "5.5 hours", label: "Manual work each week to produce the numbers, split across the analyst, demand gen and the SDR team" },
  { figure: "62 → 44", label: "MQL score threshold after a week 7 change described only as “routine”" },
];

const DIFFERENCES = [
  { what: "What the headline counts", marketing: "MQLs qualified that week (week 10: 14)", sales: "Leads accepted by sales that week (week 10: 17)", type: "Definition" },
  { what: "Why weekly numbers never match", marketing: "Counted on the qualify date", sales: "Counted on the accept date, 2 to 7 days later", type: "Definition" },
  { what: "Paid Social", marketing: "One line (513)", sales: "LinkedIn (269) and Meta (244)", type: "Definition (level of detail)" },
  { what: "“Other”", marketing: "204 touchpoints (10.2%)", sales: "The same 204", type: "Data: blanks and unrecognized values hidden in one bucket" },
];

export function ProblemPage() {
  return (
    <>
      <p className="lead">Marketing and sales report on the same touchpoints every week, and they never get the same answer.</p>

      <ul className="keystats" aria-label="Key numbers">
        {KEY_NUMBERS.map((k) => (
          <li key={k.figure}><strong>{k.figure}</strong><span>{k.label}</span></li>
        ))}
      </ul>

      <section className="prose-block" aria-labelledby="today-h">
        <h2 id="today-h">What goes wrong today</h2>
        <p>
          Each week an analyst exports the campaign and touchpoint data, then sorts the source field into channels by hand.
          This quarter it was written 31 different ways, from <code>facebook/paid</code> to <code>fb-ads</code> to <code>meta_paid</code>.
          Odd values are judged case by case, and nothing records why a value went where it did. Marketing builds its weekly
          report from that spreadsheet, and sales keeps its own separate tally. Nothing runs end to end.
        </p>
        <p>
          The two reports then answer different questions. Marketing counts people on the day they qualify, and sales counts
          them on the day they're accepted, 2 to 7 days later. The weekly headlines never match. Both reports also fold
          empty cells, placeholders and unrecognized values into “Other”: 204 touchpoints, 10.2% of the quarter, in a bucket
          nobody can look inside.
        </p>
        <p>
          Definitions also change without anyone saying so. A week 7 scoring update, logged as “routine”, lowered the score
          needed to become an MQL from 62 to 44. In weeks 7 to 13, 44 of 160 MQLs (27.5%) wouldn't have qualified under the
          old rule, and week 13's 31 MQLs would have been 20. Part of the rise in MQLs in the second half of the quarter comes
          from this change, not from more demand.
        </p>
      </section>

      <section className="prose-block" aria-labelledby="who-h">
        <h2 id="who-h">Who it affects</h2>
        <ul className="people">
          <li><strong>The marketing analyst</strong> spends about 3.5 hours a week exporting data and hand-sorting source values, with no record of past decisions to lean on.</li>
          <li><strong>Demand generation</strong> spends about an hour building the weekly report on channel groupings it can't check.</li>
          <li><strong>The sales / SDR team</strong> spends about an hour keeping its own accepted-lead count, which never lines up with marketing's.</li>
          <li><strong>Leadership</strong> sees two different headlines for the same week, and can't tell which is right or how much of a trend is real.</li>
        </ul>
      </section>

      <section aria-labelledby="diff-h">
        <h2 id="diff-h">Why the two reports disagree</h2>
        <p className="muted source-note">From the weekly marketing report and the sales report for week 10, checked against the raw touchpoint data.</p>
        <table className="facts">
          <thead>
            <tr><th>Difference</th><th>Marketing report</th><th>Sales report</th><th>Type</th></tr>
          </thead>
          <tbody>
            {DIFFERENCES.map((d) => (
              <tr key={d.what}>
                <td data-label="Difference">{d.what}</td>
                <td data-label="Marketing">{d.marketing}</td>
                <td data-label="Sales">{d.sales}</td>
                <td data-label="Type">{d.type}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="after-table">
          Apart from the “Other” bucket and how Paid Social is split, the channel totals in both reports are identical. So
          most of the disagreement is about definitions, which the teams have to agree on. “Other” is a data problem we can
          fix now. <a href="#options">The next section</a> compares the two ways forward.
        </p>
      </section>
    </>
  );
}

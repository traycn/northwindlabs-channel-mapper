// Section 1: the problem. The team writes the story; the page shows the
// report differences found in the Stage 0 data check as supporting facts.
import { TeamWrites } from "../components/TeamWrites";

const DIFFERENCES = [
  { what: "What the headline counts", marketing: "MQLs qualified that week (week 10: 14)", sales: "Leads accepted by sales that week (week 10: 17)", type: "Definition" },
  { what: "Why weekly numbers never match", marketing: "Counted on the qualify date", sales: "Counted on the accept date, 2 to 7 days later", type: "Definition" },
  { what: "Paid Social", marketing: "One line (513)", sales: "LinkedIn (269) and Meta (244)", type: "Definition (level of detail)" },
  { what: "\"Other\"", marketing: "204 touchpoints (10.2%)", sales: "The same 204", type: "Data: blanks and unrecognized values hidden in one bucket" },
];

export function ProblemPage() {
  return (
    <>
      {/* <!-- TEAM WRITES: what goes wrong today, in two or three short paragraphs --> */}
      <TeamWrites>what goes wrong today, in two or three short paragraphs.</TeamWrites>

      <section aria-labelledby="who-h">
        <h2 id="who-h">Who it affects</h2>
        {/* <!-- TEAM WRITES: who is affected (marketing, sales, leadership) and how --> */}
        <TeamWrites>who is affected (for example marketing, sales and leadership) and how.</TeamWrites>
      </section>

      <section aria-labelledby="diff-h">
        <h2 id="diff-h">From the data: why the two reports disagree</h2>
        <p className="muted source-note">
          Found in the Stage 0 check of the weekly marketing report and the sales report for the same period (see data/DATA_NOTES.md).
        </p>
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
      </section>
    </>
  );
}

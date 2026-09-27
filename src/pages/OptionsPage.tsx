// Section 2: the two options, compared on the same questions, ending with one choice.
import { TeamWrites } from "../components/TeamWrites";

const QUESTIONS = [
  "What it unblocks",
  "How fast it helps",
  "Who has to agree",
  "The risks",
  "What it depends on",
];

const OPTIONS = ["Agree on shared definitions", "Automate manual steps"];

export function OptionsPage() {
  return (
    <>
      {/* <!-- TEAM WRITES: one or two sentences introducing the two options --> */}
      <TeamWrites>one or two sentences introducing the two options.</TeamWrites>

      <section aria-labelledby="compare-h">
        <h2 id="compare-h">Side by side</h2>
        <table className="compare">
          <thead>
            <tr>
              <th scope="col"><span className="visually-hidden">Question</span></th>
              {OPTIONS.map((o) => <th scope="col" key={o}>{o}</th>)}
            </tr>
          </thead>
          <tbody>
            {QUESTIONS.map((q) => (
              <tr key={q}>
                <th scope="row">{q}</th>
                {OPTIONS.map((o) => (
                  <td key={o} data-label={o}>
                    {/* <!-- TEAM WRITES: answer for this question and option --> */}
                    <TeamWrites>{q.toLowerCase()} for “{o.toLowerCase()}”.</TeamWrites>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="choice" aria-labelledby="choice-h">
        <h2 id="choice-h">Our choice</h2>
        {/* <!-- TEAM WRITES: the one option chosen, and why, in a short paragraph. Must name one option. --> */}
        <TeamWrites>the one option we chose, and why. This must name a single option.</TeamWrites>
      </section>
    </>
  );
}

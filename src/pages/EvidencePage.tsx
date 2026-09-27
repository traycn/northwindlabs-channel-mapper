// Section 6: how we know it works. Results come straight from the data files:
// the fixed-rule counts are recalculated here, and the AI test results come
// from data/test_results.json, scored against the current data/test_set.json.
import { I_DONT_KNOW, buildRows, cleanValue, summarizeRows } from "../mapper";
import { approvedList, sources } from "../data/browserData";
import { TeamWrites } from "../components/TeamWrites";
import { fmt, pct } from "../components/format";
import testSet from "../../data/test_set.json";
import testResults from "../../data/test_results.json";

interface Case { value: string; expected: string; platform: string | null; kind: string }
interface Row { value: string; got: string; gotPlatform: string | null; confidence: string; status: string; reason: string }

function scoreTest() {
  const cases = new Map((testSet.cases as Case[]).map((c) => [cleanValue(c.value), c]));
  const rows = (testResults.rows as Row[]).flatMap((r) => {
    const c = cases.get(cleanValue(r.value));
    if (!c) return [];
    const agrees = r.got === c.expected;
    const suggested = r.status === "Suggested: waiting for approval";
    return [{ ...r, expected: c.expected, platform: c.platform, agrees, suggested, confidentlyWrong: suggested && !agrees }];
  });
  const known = rows.filter((r) => r.expected !== I_DONT_KNOW);
  const negatives = rows.filter((r) => r.expected === I_DONT_KNOW);
  return {
    rows,
    measures: [
      ["Agrees with us on known values", known.filter((r) => r.agrees).length, known.length],
      ["…and confident enough to become a suggestion", known.filter((r) => r.agrees && r.suggested).length, known.length],
      ["Correctly says “I don't know”", negatives.filter((r) => r.agrees).length, negatives.length],
      ["Values that shouldn't match, sent to a person", negatives.filter((r) => r.status === "Needs a person").length, negatives.length],
      ["Confidently wrong (would become a wrong suggestion)", rows.filter((r) => r.confidentlyWrong).length, rows.length],
    ] as [string, number, number][],
  };
}

export function EvidencePage() {
  const s = summarizeRows(buildRows(sources, approvedList, new Map(), []));
  const test = scoreTest();
  const misses = test.rows.filter((r) => !r.agrees);
  const runDate = testResults.run_on.slice(0, 10);

  return (
    <>
      <section aria-labelledby="measure-h">
        <h2 id="measure-h">What we measure</h2>
        {/* <!-- TEAM WRITES: what we measure and why those measures matter --> */}
        <TeamWrites>what we measure, and why those measures matter.</TeamWrites>
      </section>

      <section aria-labelledby="rules-h">
        <h2 id="rules-h">Fixed rules on the full touchpoint file</h2>
        <p className="muted source-note">Recalculated from data/touchpoints.csv and the approved list every time this page loads. No AI involved.</p>
        <table className="facts narrow">
          <tbody>
            <tr><th scope="row">Touchpoints</th><td className="num">{fmt(s.total)}</td><td /></tr>
            <tr><th scope="row">Mapped</th><td className="num">{fmt(s.byStatus.Mapped)}</td><td className="num">{pct(s.byStatus.Mapped, s.total)}</td></tr>
            <tr><th scope="row">Unresolved: blank</th><td className="num">{fmt(s.byStatus["Unresolved: blank"])}</td><td className="num">{pct(s.byStatus["Unresolved: blank"], s.total)}</td></tr>
            <tr><th scope="row">Unresolved: malformed</th><td className="num">{fmt(s.byStatus["Unresolved: malformed"])}</td><td className="num">{pct(s.byStatus["Unresolved: malformed"], s.total)}</td></tr>
            <tr><th scope="row">Needs a person</th><td className="num">{fmt(s.byStatus["Needs a person"])}</td><td className="num">{pct(s.byStatus["Needs a person"], s.total)}</td></tr>
          </tbody>
        </table>
      </section>

      <section aria-labelledby="ai-h">
        <h2 id="ai-h">AI test results</h2>
        <p className="muted source-note">
          {test.rows.length} known values run through the AI on {runDate} ({testResults.model}). None was shown to the AI as an example.
          The test set is still a draft: the team hasn't confirmed every expected answer.
        </p>
        <table className="facts narrow">
          <tbody>
            {test.measures.map(([label, n, d]) => (
              <tr key={label}><th scope="row">{label}</th><td className="num">{n} of {d}</td><td className="num">{pct(n, d)}</td></tr>
            ))}
          </tbody>
        </table>

        <h3>Where the AI disagreed with us ({misses.length})</h3>
        <table className="facts">
          <thead><tr><th>Value</th><th>We expect</th><th>AI said</th><th>What happens</th></tr></thead>
          <tbody>
            {misses.map((r) => (
              <tr key={r.value}>
                <td data-label="Value" className="mono">{r.value}</td>
                <td data-label="We expect">{r.expected}</td>
                <td data-label="AI said">{r.got} ({r.confidence}): {r.reason}</td>
                <td data-label="What happens">{r.confidentlyWrong ? "Wrong suggestion, a person must reject it" : "Goes to a person"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* <!-- TEAM WRITES: what the test results mean, in a sentence or two --> */}
        <TeamWrites>what these results mean, in a sentence or two.</TeamWrites>
      </section>

      <section aria-labelledby="next-h">
        <h2 id="next-h">What comes next</h2>
        {/* <!-- TEAM WRITES: what comes next (the "what's next" list) --> */}
        <TeamWrites>what comes next. Ideas already raised include a script that adds exported review decisions to the approved list.</TeamWrites>
      </section>
    </>
  );
}

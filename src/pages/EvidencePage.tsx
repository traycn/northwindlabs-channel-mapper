// Section 6: how we know it works. Results come straight from the data files:
// the fixed-rule counts are recalculated here, and the AI test results come
// from data/test_results.json, scored against the current data/test_set.json.
import { I_DONT_KNOW, buildRows, cleanValue, summarizeRows } from "../mapper";
import { approvedList, sources } from "../data/browserData";
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
        <ul className="people">
          <li><strong>Share placed by fixed rules.</strong> How much is settled with no AI and no person. It shows how complete the approved list is.</li>
          <li><strong>Unresolved / waiting share.</strong> How much of the report is still uncertain. We want it visible, and shrinking week by week.</li>
          <li><strong>Confidently wrong AI answers.</strong> The risky kind, because they appear as ready-to-approve suggestions. The goal is zero.</li>
          <li><strong>AI agreement and correct “I don't know” answers.</strong> Whether the AI saves reviewers time without guessing.</li>
          <li><strong>Manual time each week.</strong> Hand-sorting took about 1.5 hours a week. Now only new values need a person.</li>
        </ul>
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
        <div className="prose-block">
          <h3>What this means</h3>
          <p>
            Fixed rules place 91.5% of touchpoints before the AI is involved, and everything else is visible instead of
            hidden. In the test, the AI made no confidently wrong suggestions: every disagreement went to a person. It didn't
            settle any of this quarter's four real unfamiliar values on its own. It was unsure about each one, which is the right
            answer for values like <code>li</code> and <code>social</code>. It becomes more useful as new spellings of known
            channels appear.
          </p>
        </div>
      </section>

      <section aria-labelledby="next-h">
        <h2 id="next-h">What comes next</h2>
        <ol className="steps">
          <li><strong>Agree on shared definitions</strong> with sales and leadership: which headline the weekly view leads with (qualified, accepted, or both), who owns the MQL threshold, and where changes to it are recorded. See <a href="#definitions">E2. Definition recommendations</a>.</li>
          <li><strong>Find out what <code>promo_x</code> and <code>newchannel_q3</code> are</strong>, and where <code>li</code> and <code>social</code> come from, so they can be approved or fixed at the source.</li>
          <li><strong>Confirm the AI test set's expected answers</strong>, so it moves from draft to approved.</li>
          <li><strong>Decide whether TikTok and X become Paid Social platforms.</strong> Until then, their values go to a person.</li>
          <li><strong>Add exported decisions to the approved list with a small script</strong>, instead of copying them by hand.</li>
          <li><strong>Refresh the touchpoint data automatically</strong>, so the weekly check always runs on the latest export. See <a href="#automation">E1. Automating the import</a> for the options.</li>
          <li><strong>Move to a newer AI model when needed.</strong> Claude Haiku 4.5 won't be retired before 15 October 2026, with at least 60 days' notice.</li>
        </ol>
      </section>
    </>
  );
}

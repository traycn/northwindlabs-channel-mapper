// Section E2: suggestions to guide the team's decisions on shared definitions
// (added 2026-09-27 at the team's request). Every figure comes from the data
// in /data; the decisions themselves belong to marketing, sales and leadership.

interface Definition {
  id: string;
  title: string;
  question: string;
  data: React.ReactNode[];
  options: string[];
  headline: string;
  recommendation: React.ReactNode;
  who: string;
  status: "Open" | "Partly decided";
}

const DEFINITIONS: Definition[] = [
  {
    id: "headline",
    title: "What the weekly headline counts",
    question: "Should the shared weekly view lead with qualified leads (MQLs), leads accepted by sales, or both?",
    data: [
      <>Week 10: marketing reported <strong>14</strong> MQLs, sales reported <strong>17</strong> accepted leads, from the same data.</>,
      <>Of the <strong>253</strong> MQLs qualified in weeks 1 to 13, <strong>190 (75%)</strong> were accepted, some after the period ended. 63 were never accepted.</>,
      <>The acceptance rate was similar before and after the week 7 threshold change: 74% in weeks 1 to 6, 76% in weeks 7 to 13.</>,
    ],
    options: [
      "Qualified only: an early signal, but it includes leads sales won't accept.",
      "Accepted only: closer to pipeline, but it lags and depends on how fast sales works.",
      "Both, side by side, with the acceptance rate between them.",
    ],
    headline: "Both, side by side, with the acceptance rate.",
    recommendation: (
      <>
        <strong>Both, side by side, with the acceptance rate.</strong> Neither team loses its number, and the gap between
        them becomes a measured conversion rate instead of a disagreement.
      </>
    ),
    who: "Marketing and sales, with leadership as the tie-breaker.",
    status: "Open",
  },
  {
    id: "date",
    title: "Which date a lead counts on",
    question: "When a lead is qualified in one week and accepted in the next, which week does it count in?",
    data: [
      <>Sales accepts leads <strong>2 to 7 days</strong> after they qualify, <strong>4.4 days</strong> on average. So many of a week's accepted leads qualified the week before.</>,
      <>Of week 13's 31 MQLs, <strong>8</strong> had been accepted by the end of the period on 5 July. <strong>21</strong> were accepted by 14 July.</>,
      <>Counted by accept date, weeks 1 to 13 had <strong>177</strong> acceptances. Followed from the week they qualified, the same period's MQLs led to <strong>190</strong>. Same leads, different date rule, different number.</>,
    ],
    options: [
      "Keep each count on its own date (as today).",
      "Count by group: for the MQLs qualified in a week, show how many were later accepted.",
    ],
    headline: "Keep each count on its own date, and add the group view.",
    recommendation: (
      <>
        <strong>Keep each count on its own date, and add the group view.</strong> Show “of the MQLs qualified in week N, X%
        have been accepted so far”, and mark the most recent week as still filling in. A lead can take up to 7 days to be
        accepted, so a week's figure is only complete a week later.
      </>
    ),
    who: "Marketing and sales.",
    status: "Open",
  },
  {
    id: "threshold",
    title: "The MQL threshold, and who owns changes",
    question: "What engagement score makes someone an MQL, who can change it, and how is a change announced?",
    data: [
      <>From 19 May (week 7), the score needed dropped from <strong>62 to 44</strong>. The change was described only as a “routine” update.</>,
      <>In weeks 7 to 13, <strong>44 of 160</strong> MQLs (27.5%) scored under the old threshold. Week 13 had 31 MQLs; under the old rule it would have had 20.</>,
      <>MQLs scoring under 62 were accepted <strong>70%</strong> of the time (31 of 44), compared with <strong>78%</strong> (90 of 116) for those scoring 62 or more. The difference rests on a small group.</>,
    ],
    options: ["Keep 44.", "Go back to 62.", "Set a new value after reviewing more acceptance data."],
    headline: "Name one owner, and record and flag every change before it takes effect.",
    recommendation: (
      <>
        <strong>The value is the teams' call; how it changes shouldn't be.</strong> Name one owner. Record every change in the
        decision log (date, old value, new value and why) before it takes effect. Mark the change on trend charts, and for a
        transition period, report MQLs under both the old and new rule. Revisit the value once acceptance data covers more
        than the 44 lower-score MQLs seen so far.
      </>
    ),
    who: "Marketing and sales. Leadership names the owner.",
    status: "Open",
  },
  {
    id: "channels",
    title: "Channel groupings and level of detail",
    question: "Which channel list do both reports use, and how much detail does each show?",
    data: [
      <>The channel totals are already the same in both reports. Only the detail differs: Paid Social is one line for marketing (513) and two for sales, LinkedIn (269) and Meta (244).</>,
      <>The approved list already records both a channel and a platform for each value, so both views can come from it.</>,
    ],
    options: [
      "Each team keeps its own grouping.",
      "One approved list for both teams: marketing shows channels, sales shows the platform split.",
    ],
    headline: "One approved list for both teams, each showing the detail it needs.",
    recommendation: (
      <>
        <strong>One approved list for both teams.</strong> Still to decide: whether TikTok and X become Paid Social platforms,
        and where AI tools such as <code>chatgpt.com</code> belong. The team has decided these aren't Referral, but not yet
        what they are. Already decided: partners count as Referral.
      </>
    ),
    who: "Marketing, which owns the approved list, with sales agreeing to use it.",
    status: "Partly decided",
  },
  {
    id: "unresolved",
    title: "Values that can't be placed",
    question: "What happens to touchpoints whose source is blank, broken or not yet approved?",
    data: [
      <>Both reports put them in “Other”: <strong>204</strong> touchpoints (10.2%), including blanks and values nobody had sorted.</>,
      <>With the approved list, <strong>171</strong> (8.6%) remain: 68 blank and 103 from four unfamiliar values.</>,
    ],
    options: ["Keep folding them into “Other”.", "Show them as a separate Unresolved / waiting bucket, with its share of all touchpoints."],
    headline: "A separate Unresolved / waiting bucket in both reports.",
    recommendation: (
      <>
        <strong>A separate Unresolved / waiting bucket in both reports</strong>, never added to the closest-looking channel.
        Agree how large a share is acceptable, and look at it weekly.
      </>
    ),
    who: "Marketing and sales.",
    status: "Open",
  },
  {
    id: "period",
    title: "Report periods and labels",
    question: "What exactly does a reporting week and quarter cover?",
    data: [
      <>Reporting weeks start on Monday, from 6 April. The touchpoint data runs to 5 July, and the people data runs a little later (accepted leads up to 14 July).</>,
      <>Both reports and all campaigns say “Q3”, but the dates run from April to early July, which is calendar Q2.</>,
    ],
    options: ["Calendar quarters.", "Fiscal quarters, if the company uses them."],
    headline: "State the week start and period on every report, and confirm what “Q3” means.",
    recommendation: (
      <>
        <strong>State the week start and the period on every report</strong>, and confirm whether “Q3” is a fiscal quarter.
        Count only activity inside the period. The team already decided this for this quarter: up to 5 July.
      </>
    ),
    who: "Marketing and sales, confirmed with finance if fiscal quarters apply.",
    status: "Partly decided",
  },
];

const STEPS = [
  "Hold one meeting with marketing, sales and a leadership decision-maker, using this page as the agenda.",
  "For each definition: choose an option, name who owns it, and set a date to review it.",
  "Record each decision in the decision log, with the date and the reasons.",
  "Update both reports and this site to match. Where a change affects trends, show old and new side by side for a while.",
];

export function DefinitionsPage() {
  return (
    <>
      <p className="lead">
        The mapper fixes the data problem. Most of the disagreement between the reports is about definitions, and only the
        teams can settle those. This page sets out each decision, what our data shows, the options, and what we'd recommend,
        as a starting point for that conversation.
      </p>

      <section aria-labelledby="summary-h">
        <h2 id="summary-h">Decisions to make</h2>
        <table className="facts">
          <thead>
            <tr><th>Definition</th><th>Our recommendation</th><th>Who decides</th><th>Status</th></tr>
          </thead>
          <tbody>
            {DEFINITIONS.map((d) => (
              <tr key={d.id}>
                <td data-label="Definition"><a href={`#definitions`} onClick={(e) => { e.preventDefault(); document.getElementById(`def-${d.id}`)?.scrollIntoView({ behavior: "smooth" }); }}>{d.title}</a></td>
                <td data-label="Recommendation">{d.headline}</td>
                <td data-label="Who decides">{d.who}</td>
                <td data-label="Status"><span className={`def-status ${d.status === "Open" ? "open" : "partly"}`}>{d.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {DEFINITIONS.map((d, i) => (
        <section key={d.id} id={`def-${d.id}`} className="definition" aria-labelledby={`def-${d.id}-h`}>
          <span className="option-label">Definition {i + 1}</span>
          <h2 id={`def-${d.id}-h`}>{d.title}</h2>
          <p className="def-question">{d.question}</p>
          <div className="def-grid">
            <div>
              <p className="sub">What our data shows</p>
              <ul>{d.data.map((x, j) => <li key={j}>{x}</li>)}</ul>
            </div>
            <div>
              <p className="sub">Options</p>
              <ul>{d.options.map((o) => <li key={o}>{o}</li>)}</ul>
            </div>
          </div>
          <div className="def-rec">
            <p className="sub">Our recommendation</p>
            <p>{d.recommendation}</p>
            <p className="muted">Who needs to agree: {d.who}</p>
          </div>
        </section>
      ))}

      <section className="choice" aria-labelledby="how-h">
        <span className="option-label">How to decide</span>
        <h2 id="how-h">From recommendations to agreed definitions</h2>
        <ol className="steps">{STEPS.map((s) => <li key={s}>{s}</li>)}</ol>
        <p className="muted">
          These are recommendations based on this quarter's data. The decisions belong to marketing, sales and leadership.
        </p>
      </section>
    </>
  );
}

// Section 7: lessons learned. One short page.

const LESSONS: [string, React.ReactNode][] = [
  [
    "Fixed rules did most of the work.",
    "Cleaning and a lookup against a 24-entry approved list place 91.5% of touchpoints. AI is only needed for what's left.",
  ],
  [
    "“Other” was hiding the real question.",
    "Splitting it into blank, unrecognized and waiting made the uncertainty measurable, and showed most of it came from a handful of values.",
  ],
  [
    "The disagreement was mostly about definitions, not data.",
    "Both reports had the same channel totals. The headline gap came from counting on different dates, and a quiet threshold change moved the MQL trend. A tool can't settle that; the teams have to agree.",
  ],
  [
    "Rewording AI instructions is whack-a-mole.",
    "Each change fixed its target but shifted unrelated answers. Safety came from the fixed rules around the AI: only high confidence becomes a suggestion, and a person approves everything.",
  ],
  [
    "Easy tests flatter.",
    "Our first test set scored 100%. Harder, realistic cases exposed two confidently wrong answers, which we then fixed.",
  ],
  [
    "Check the numbers, including our own.",
    "The first data notes counted a week outside the report period, and the first site build sent the whole touchpoint file to every browser. Both were caught by checking, before anything went live.",
  ],
];

export function LessonsPage() {
  return (
    <>
      <ol className="lessons">
        {LESSONS.map(([head, body]) => (
          <li key={head}><strong>{head}</strong> {body}</li>
        ))}
      </ol>
      <p className="muted">
        Every time the team changed or rejected something the AI suggested, it went in the <a href="#decisions">decision log</a>.
      </p>
    </>
  );
}

// Section 5: a walkthrough of the review queue, and what happens after a mistake.

const STEPS = [
  <>Open <a href="#mapper">The mapper</a> and look at the <strong>Unresolved / waiting</strong> box, to see how much is still unplaced.</>,
  <>In the review queue, read each value, how many touchpoints use it, and the AI's answer and reason. Values with the most touchpoints come first.</>,
  <>If the AI's suggestion is right, click <strong>Approve</strong>. If it's wrong, or the AI said “I don't know”, click <strong>Choose a different grouping</strong>, pick the grouping (and platform), then click <strong>Approve this grouping</strong>.</>,
  <>If the value isn't a marketing source at all, such as a test value, click <strong>Not a channel</strong>. It stays in the Unresolved / waiting bucket.</>,
  <>Check the totals: each approval moves its touchpoints out of the bucket and into the chosen channel straight away.</>,
  <>Click <strong>Export decisions for the team</strong> and send the file to Tracy N.</>,
];

const MISTAKES = [
  <><strong>Clicked the wrong button?</strong> Click <strong>Undo</strong> next to that decision, or <strong>Undo last</strong>. <strong>Reset all</strong> clears every decision in your browser.</>,
  <><strong>Trying things out is safe.</strong> Decisions are saved only in your own browser, so they never change anyone else's view or the report.</>,
  <><strong>Contradictions are blocked.</strong> A value already on the approved list can't be approved under a different grouping, and a value you've already decided needs undoing before it can be changed.</>,
  <><strong>A person checks everything before it counts.</strong> Nothing reaches the approved list until Tracy N has checked the exported file.</>,
  <><strong>Wrong entries can be traced and reversed.</strong> If one gets through, it's corrected in the approved list, and the full history of every change is kept.</>,
];

export function HowToUsePage() {
  return (
    <>
      <p className="lead">
        Use the review queue once a week, after the weekly check. Every Monday, a GitHub issue lists any new source values
        that aren't on the approved list. The marketing analyst works through them in the review queue, usually in a few minutes. This quarter
        there were four.
      </p>

      <section aria-labelledby="steps-h">
        <h2 id="steps-h">Step by step</h2>
        <ol className="steps">{STEPS.map((s, i) => <li key={i}>{s}</li>)}</ol>
      </section>

      <section className="prose-block" aria-labelledby="mistakes-h">
        <h2 id="mistakes-h">When someone makes a mistake</h2>
        <ul className="people">{MISTAKES.map((m, i) => <li key={i}>{m}</li>)}</ul>
      </section>

      <section className="prose-block" aria-labelledby="export-h">
        <h2 id="export-h">Getting decisions into the approved list</h2>
        <p>
          Tracy N reviews exported decision files each week. For each entry, Tracy records who approved it and when, then adds
          it to the approved list (<code>data/mapping.json</code>). The site and the next weekly check use the updated list
          from then on.
        </p>
      </section>
    </>
  );
}

// Section 5: a walkthrough of the review queue, and what happens after a mistake.
import { TeamWrites } from "../components/TeamWrites";

export function HowToUsePage() {
  return (
    <>
      {/* <!-- TEAM WRITES: who uses the review queue, and how often --> */}
      <TeamWrites>who uses the review queue, and how often.</TeamWrites>

      <section aria-labelledby="steps-h">
        <h2 id="steps-h">Step by step</h2>
        {/* <!-- TEAM WRITES: numbered steps through the review queue. Buttons on screen: "Approve",
             "Choose a different grouping", "Not a channel", "Undo", "Undo last", "Reset all",
             "Export decisions for the team". --> */}
        <TeamWrites>
          numbered steps through the review queue. The buttons on screen are Approve, Choose a different grouping, Not a channel,
          Undo, Undo last, Reset all and Export decisions for the team.
        </TeamWrites>
        <p><a href="#mapper">Open the review queue →</a></p>
      </section>

      <section aria-labelledby="mistakes-h">
        <h2 id="mistakes-h">When someone makes a mistake</h2>
        {/* <!-- TEAM WRITES: what happens after a mistake. Facts to draw on: decisions stay in the person's
             own browser; Undo, Undo last and Reset all; approving a value already approved under a
             different grouping is blocked; a second decision on the same value is blocked until the
             first is undone; exported decisions are checked by the team before they're added to the
             approved list; git keeps the history of every change to the approved list. --> */}
        <TeamWrites>
          what happens after a mistake. Facts to draw on: decisions stay in the person's own browser; there's Undo, Undo last and Reset all;
          conflicting approvals are blocked; exported decisions are checked by the team before they're added; and the approved list keeps its
          full change history.
        </TeamWrites>
      </section>

      <section aria-labelledby="export-h">
        <h2 id="export-h">Getting decisions into the approved list</h2>
        {/* <!-- TEAM WRITES: who adds exported decisions to the approved list, and how often --> */}
        <TeamWrites>who adds exported decisions to the approved list, and how often.</TeamWrites>
      </section>
    </>
  );
}

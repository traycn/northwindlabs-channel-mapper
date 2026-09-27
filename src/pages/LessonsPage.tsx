// Section 7: lessons learned. One short page, written by the team.
import { TeamWrites } from "../components/TeamWrites";

export function LessonsPage() {
  return (
    <>
      {/* <!-- TEAM WRITES: lessons learned, one short page --> */}
      <TeamWrites>lessons learned, in one short page.</TeamWrites>
      <p className="muted">
        The <a href="#decisions">decision log</a> records every time the team changed or rejected something the AI suggested, which may help.
      </p>
    </>
  );
}

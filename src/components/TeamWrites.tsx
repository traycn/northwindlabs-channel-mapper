// A visible empty spot for the team's own writing. Each use sits next to a
// "TEAM WRITES" comment in the code, so the spots are easy to find.
export function TeamWrites({ children }: { children: React.ReactNode }) {
  return <div className="team-writes">Team writes: {children}</div>;
}

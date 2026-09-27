// The site sections, in order (from CLAUDE.md). Each has its own address,
// such as #mapper, so a section can be linked to or shared directly.
export const SECTIONS = [
  { id: "problem", title: "The problem" },
  { id: "options", title: "Options we considered" },
  { id: "mapper", title: "The mapper" },
  { id: "how-it-works", title: "How it works" },
  { id: "how-to-use", title: "How to use it" },
  { id: "evidence", title: "How we know it works" },
  { id: "lessons", title: "Lessons learned" },
  { id: "decisions", title: "Decision log" },
] as const;

export type SectionId = (typeof SECTIONS)[number]["id"];

// The site sections, in order (from CLAUDE.md). Each has its own address,
// such as #mapper, so a section can be linked to or shared directly.
// Sections 1 to 8 present the project; E1 and E2 are suggested enhancements.
export const SECTIONS = [
  { id: "problem", label: "1", title: "The problem" },
  { id: "options", label: "2", title: "Options we considered" },
  { id: "mapper", label: "3", title: "The mapper" },
  { id: "how-it-works", label: "4", title: "How it works" },
  { id: "how-to-use", label: "5", title: "How to use it" },
  { id: "evidence", label: "6", title: "How we know it works" },
  { id: "lessons", label: "7", title: "Lessons learned" },
  { id: "decisions", label: "8", title: "Decision log" },
  { id: "automation", label: "E1", title: "Automating the import" },
  { id: "definitions", label: "E2", title: "Definition recommendations" },
] as const;

export type SectionId = (typeof SECTIONS)[number]["id"];

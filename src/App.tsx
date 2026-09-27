import { useEffect, useState } from "react";
import { SECTIONS, type SectionId } from "./sections";
import { ProblemPage } from "./pages/ProblemPage";
import { OptionsPage } from "./pages/OptionsPage";
import { MapperPage } from "./pages/MapperPage";
import { HowItWorksPage } from "./pages/HowItWorksPage";
import { HowToUsePage } from "./pages/HowToUsePage";
import { EvidencePage } from "./pages/EvidencePage";
import { AutomationPage } from "./pages/AutomationPage";
import { LessonsPage } from "./pages/LessonsPage";
import { DecisionLogPage } from "./pages/DecisionLogPage";
import { DefinitionsPage } from "./pages/DefinitionsPage";

const PAGES: Record<SectionId, () => React.ReactElement> = {
  problem: ProblemPage,
  options: OptionsPage,
  mapper: MapperPage,
  "how-it-works": HowItWorksPage,
  "how-to-use": HowToUsePage,
  evidence: EvidencePage,
  lessons: LessonsPage,
  decisions: DecisionLogPage,
  automation: AutomationPage,
  definitions: DefinitionsPage,
};

const fromHash = (): SectionId => {
  const id = location.hash.slice(1);
  return SECTIONS.some((s) => s.id === id) ? (id as SectionId) : "problem";
};

export function App() {
  const [current, setCurrent] = useState<SectionId>(fromHash);

  useEffect(() => {
    const onHash = () => {
      setCurrent(fromHash());
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const index = SECTIONS.findIndex((s) => s.id === current);
  const section = SECTIONS[index];
  const prev = SECTIONS[index - 1];
  const next = SECTIONS[index + 1];
  const Page = PAGES[current];

  useEffect(() => {
    document.title = `${section.title} · Channel mapper`;
  }, [section]);

  return (
    <>
      <header className="site-header">
        <a className="site-name" href="#problem">Channel mapper</a>
        <nav aria-label="Sections">
          <ol>
            {SECTIONS.map((s) => (
              <li key={s.id} className={s.label.startsWith("E") ? "enhancement" : undefined}>
                <a href={`#${s.id}`} aria-current={s.id === current ? "page" : undefined}>
                  <span className="n">{s.label}</span>{s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </header>
      <main>
        <h1 className="page-title"><span className="n">{section.label}</span>{section.title}</h1>
        <Page />
        <nav className="pager" aria-label="Previous and next section">
          {prev ? <a href={`#${prev.id}`}>← {prev.title}</a> : <span />}
          {next ? <a href={`#${next.id}`}>{next.title} →</a> : <span />}
        </nav>
      </main>
    </>
  );
}

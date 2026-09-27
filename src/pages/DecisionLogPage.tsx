// Section 8: the decision log, shown straight from DECISION_LOG.md, so the
// page is always the same as the file the team keeps.
import { marked } from "marked";
import log from "../../DECISION_LOG.md?raw";

// The file's own top heading duplicates the page title, so it's dropped.
const html = marked.parse(log.replace(/^# .*\n/, ""), { async: false });

export function DecisionLogPage() {
  return (
    <>
      <p className="muted source-note">Shown from DECISION_LOG.md in the project.</p>
      <article className="prose" dangerouslySetInnerHTML={{ __html: html }} />
    </>
  );
}

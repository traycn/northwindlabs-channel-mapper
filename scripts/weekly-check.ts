// The weekly check, run by .github/workflows/weekly-check.yml.
// Usage: tsx scripts/weekly-check.ts <previous-issues.json> [--test]
// Writes weekly-check-report.md and tells the workflow whether to open an issue.
import { appendFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { loadApprovedList, loadTouchpoints } from "./loadData";
import { buildReport, checkValues, reportedBefore } from "./weeklyCheckReport";

const [previousFile] = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const test = process.argv.includes("--test");

const bodies: string[] =
  previousFile && existsSync(previousFile)
    ? (JSON.parse(readFileSync(previousFile, "utf8")) as { body: string }[]).map((i) => i.body ?? "")
    : [];

const today = new Date().toISOString().slice(0, 10);
const check = checkValues(loadTouchpoints().map((t) => t.source), loadApprovedList());
const report = buildReport(check, reportedBefore(bodies), today, test);

writeFileSync("weekly-check-report.md", report.body + "\n");
console.log(report.title);
console.log(report.open ? "An issue will be opened." : "Nothing new: no issue needed.");

// Hand the result to the next workflow step.
if (process.env.GITHUB_OUTPUT) {
  appendFileSync(process.env.GITHUB_OUTPUT, `open_issue=${report.open}\ntitle=${report.title}\n`);
}

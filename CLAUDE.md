# CLAUDE.md: Channel mapper project guide

This guide tells Claude Code how to build and run the channel mapper. It sits at the top level of the project folder, and Claude Code reads it at the start of every session. It is written so that anyone on the marketing team can follow it, whether or not they write code.

## How to work with the team

The team includes people who code and people who don't. Claude Code should:

- make one small change at a time and explain it in two or three plain sentences,
- avoid jargon, or explain it the first time it comes up (see the glossary at the end),
- stop at every **CHECK-IN** below and wait for the team's approval before moving on.

The team writes the explanations, reasoning and recommendations shown in the app. Claude Code builds the pages that hold that content and marks the empty spots with `<!-- TEAM WRITES: ... -->`. It never fills them in itself.

**Update (2026-09-27):** at the team's request, Claude Code drafted this content using only facts from the project's own data, checks and decision log. The team owns it and reviews any changes. New empty spots still use the `TEAM WRITES` marker, and Claude Code only fills them when the team asks.

## What we're building

A website with two jobs:

1. **Run the channel mapper.** Our touchpoint data has "source" values typed in many different ways ("facebook/paid", "fb-ads", "meta_paid" and so on). The mapper sorts each one into the channel grouping our report uses, such as Paid Social or Email. When it can't sort a value confidently, it says so and asks a person to decide.
2. **Explain it.** The site also walks through why we built it, how it works, and how the team uses and maintains it.

### Site sections, in order

1. **The problem.** What goes wrong today and who it affects.
2. **Options we considered.** Two approaches (agreeing on shared definitions, and automating manual steps) compared side by side, ending with the one we chose and why.
3. **The mapper.** Load the touchpoint file, run the mapper, and see every result, plus the review queue.
4. **How it works.** Which steps follow fixed rules and which use AI, and why.
5. **How to use it.** A step-by-step walkthrough of the review queue, and what happens when someone makes a mistake.
6. **How we know it works.** What we measure, the test results, and what comes next.
7. **Lessons learned.** One short page.
8. **Decision log.** Every time the team changed or rejected something AI suggested, shown from `DECISION_LOG.md`.

Suggested enhancements, after the main sections (added 2026-09-27 at the team's request):

- **E1. Automating the import.** Ways to automate the weekly touchpoint import: what each would automate, who would be involved, and the pros and cons.
- **E2. Definition recommendations.** Suggestions to guide the team's decisions on shared definitions (headline, counting date, MQL threshold, channels, unresolved values, report periods).

## Fixed rules vs. AI

This is the most important part of the design. Some steps must always give the same answer, so they follow fixed rules written in code. AI is used only where judgment is actually needed, and a person always has the final say.

| Step | Handled by | What happens |
|---|---|---|
| Clean up the value | Fixed rules | Remove extra spaces, make everything lowercase, and tidy up separators. The original value is kept too. |
| Spot blank or broken values | Fixed rules | Empty cells, placeholders and junk are labeled **Unresolved: blank** or **Unresolved: malformed**. These are never sent to the AI. |
| Look it up | Fixed rules | If the cleaned value is already in our approved list, it's labeled **Mapped** with its grouping. |
| Suggest a grouping for an unfamiliar value | AI | Only clean values that aren't on the list go to the AI. It may pick from our existing groupings or answer "I don't know." |
| Check the AI's answer | Fixed rules | The answer must be one of our groupings (or "I don't know") and include a confidence level. Otherwise it's labeled **Needs a person**. |
| Decide what the AI's answer means | Fixed rules | A confident suggestion becomes **Suggested: waiting for approval**. An unsure answer or "I don't know" becomes **Needs a person**. |
| Add to the approved list | A person | Only someone approving in the review queue can add a new value. |

The AI can never:

- change the approved list by itself,
- create a new channel grouping,
- see blank or broken values,
- have its suggestions counted in report totals before a person approves them.

The report always shows a separate **Unresolved / waiting** bucket with its share of all touchpoints. Those rows are never quietly added to the closest-looking channel.

## How it's set up

- **The website** is built with React (a common toolkit for web pages) and hosted on **Cloudflare Pages**, which is free.
- **The code** lives in a **private** GitHub repository so our data stays private. Nothing is made public without the team's approval.
- **The AI connection** goes through one small server function on Cloudflare at `/api/suggest`. The AI account key is stored only in Cloudflare's secure settings, never in the code or the browser.
- **The AI model** is the lowest-cost current Claude Haiku model, set to give consistent answers. Confirm the current model name at https://docs.claude.com/en/api/overview before connecting.
- **The approved list** is `data/mapping.json`. It records every value, its grouping, who approved it and when. Git keeps the full history of changes.
- **The review queue** saves each visitor's approvals in their own browser, so trying it out never changes anything for anyone else. Visitors can undo, reset, or export their approvals as a file for the team to add to the approved list.
- **The weekly check** is an automatic GitHub job that runs every week. If new unrecognized values show up, it opens a GitHub issue listing them and how often they appear, so someone is told without having to go looking.

### Keeping costs low and the site reliable

Complete these before sharing the link with anyone:

- Set a monthly spending limit in the Anthropic account settings. A team member does this, not Claude Code.
- Limit how many AI requests one visitor can make.
- Remember past AI answers (a cache) so the same value is never paid for twice.
- Send only unique unfamiliar values, in small batches.
- Save a backup file of AI suggestions, `data/saved_suggestions.json`. If the AI connection fails, the site uses the backup and labels those rows **Saved result**, so it still works with a poor internet connection.

## Project folder

```
/src
  /mapper          the sorting logic (no screens), fully tested
  /pages           one file per site section
  /components      reusable screen pieces
/functions/api/suggest.ts   the AI connection
/scripts                    team commands (counts, AI test, backup, weekly check), no screens
/data
  touchpoints.csv            the touchpoint data
  weekly-report.html         the weekly marketing report
  sales-report.html          the sales report for the same period
  persons.csv                people, engagement scores, qualified and accepted dates
  campaigns.csv              campaigns with channel and spend
  mapping.json               the approved list: value → grouping
  groupings.json             our list of channel groupings
  saved_suggestions.json     backup AI answers
  test_set.json              known answers used to test the AI
  test_results.json          the latest AI test run
  DATA_NOTES.md              what the data shows, decisions and open questions
  source_values_profile.csv  every source value, its count and status
  how-it-works-today.md      the manual process before the mapper
/tests
/.github/workflows/weekly-check.yml
DECISION_LOG.md
CLAUDE.md
wrangler.toml               Cloudflare Pages settings (no keys)
```

The sorting logic in `/src/mapper` is kept separate from the screens, so it can be tested on its own and reused elsewhere later.

## Build plan

Stages 1 and 2 are essential. Everything after that is a bonus. Anything not finished goes on a "what's next" list instead of stretching the timeline.

### Stage 0: Understand the data

A first pass is already done. Start from `data/DATA_NOTES.md`, `groupings.json`, `mapping.json` and `source_values_profile.csv`, check them against the files, and pick up the open questions at the end of the notes.

- Read every file in `/data`. List every distinct source value and how often it appears, most common first.
- Pull out the channel groupings the report uses and draft `groupings.json`.
- Draft `mapping.json` using only matches the data clearly supports, and flag any that are guesses.
- Compare the marketing and sales reports and list every difference. Label each one as either a **definition difference** (the teams need to agree, e.g. what counts as a qualified lead) or a **data issue** (values that are wrong, missing or broken).
- **CHECK-IN:** The team reviews and corrects all of this. Every correction goes in `DECISION_LOG.md`.

### Stage 1: The fixed-rules mapper (no AI yet)
- Build the clean-up, blank/broken detection and lookup steps.
- Write tests using real messy values from our file.
- Produce a simple count of results by status.
- **CHECK-IN:** Share the counts, especially how many values are still unresolved before AI is involved.

### Stage 2: AI suggestions
- Build the AI connection following the table above. The AI gets our grouping list, a few approved examples, and a required answer format: grouping, confidence (high, medium or low), and a reason in under 20 words.
- Add the answer check, the cache, the request limit and the backup.
- **Test it:** Run known values from `test_set.json` through the AI, leaving them out of its examples. Report how often it agrees with us, and how often it correctly says "I don't know" for values that shouldn't match anything.
- **CHECK-IN:** The team reviews a sample of suggestions, especially the wrong ones.

### Stage 3: Results and review queue screens
- **Results table:** original value, cleaned value, status, grouping, AI reason and count, filterable by status.
- **Summary:** touchpoints by grouping, plus the Unresolved / waiting bucket and its percentage.
- **Review queue:** each item shows the value, how often it appears, the AI's suggestion and reason, and three buttons: **Approve**, **Choose a different grouping**, and **Not a channel**. Approving updates the results right away and can be undone.
- **Safety check:** if a value is already approved under a different grouping, approving it again is blocked with a plain explanation.

### Stage 4: Content pages
- Build the remaining site sections with placeholders for the team's writing.
- "Options we considered" compares both options using the same questions (what it unblocks, how fast it helps, who has to agree, the risks, what it depends on) and ends with one choice.
- "How it works" includes a simple diagram of the fixed rules vs. AI table.

### Stage 5: Weekly check and going live
- Set up the weekly check.
- Publish to Cloudflare Pages with the AI key stored securely, then run the launch checklist.

## Look and feel

The site should feel like a calm, trustworthy internal tool, not a sales pitch. Before styling anything, Claude Code proposes a short plan (4 to 6 colors, one or two fonts, a rough layout sketch) for the team to approve. Avoid generic templated looks. Status colors always come with a text label, never color alone. The standout element should be the results table and its Unresolved / waiting bucket.

## Ground rules

- One small change at a time. Run the tests and explain what changed in plain words.
- When the team rejects or changes something Claude Code suggested, add an entry to `DECISION_LOG.md` with the date, what was suggested, what the team decided and why.
- Never save keys or passwords in the code. Never make the project public without asking.
- Don't add features that aren't in this guide. Suggest them and add them to the "what's next" list instead.

## Launch checklist

Status as of the 2026-09-27 launch:

- [x] The full touchpoint file runs from start to finish and the totals match the Stage 1 counts.
- [x] Every status appears in the results, or there's a note explaining why one doesn't.
- [x] Blank and broken values never reach the AI. Checked on the live site: of 12 values sent, only the 4 unfamiliar ones reached the AI. The Cloudflare logs haven't been reviewed yet.
- [x] With the AI connection turned off, the site uses the backup and labels those rows.
- [x] Approve, undo and reset all work, and one visitor's changes never affect another's. Reset confirmed by the team.
- [ ] Spending limit set, request limit tested, and the second run reuses saved answers. The spending limit is set and reuse is checked live; the request limit is covered by tests only.
- [x] The weekly check has opened a test issue.
- [x] "Options we considered" ends with one clear choice.
- [x] `DECISION_LOG.md` has real entries.
- [x] The site looks right on a laptop, during screen sharing, and on a phone. Confirmed on a real phone by the team.

## Glossary

- **Channel grouping:** the category a touchpoint is counted under in the report, such as Paid Social or Email.
- **Source value:** the raw text in the data that says where a touchpoint came from.
- **Approved list (mapping):** the team-approved table matching source values to groupings.
- **Review queue:** the screen where people approve or correct values the mapper couldn't settle.
- **Cache:** saved answers reused instead of asking the AI again.
- **Request limit:** a cap on how many AI requests one visitor can make.
- **Repository (repo):** the project folder on GitHub, including its full change history.
- **Server function:** a small piece of code running on Cloudflare that talks to the AI so the key stays hidden.

# Decision log

Every time the team changes, rejects or confirms something Claude Code suggested, it goes here: the date, what was suggested, what the team decided and why.

## 2026-09-27: Stage 0 check-in (decided by Tracy N)

### `email-nurture` mapping
- **Suggested (first draft):** Email, marked as a guess.
- **Decided:** Email, confirmed. No longer marked as a guess.
- **Why:** All 22 of its touchpoints belong to Email campaigns, so the data supports it.

### `g/cpc` mapping
- **Suggested (first draft):** Paid Search, with the platform assumed to be Google.
- **Decided:** Paid Search, with the platform left blank.
- **Why:** The campaigns don't record Google or Microsoft, and `g/cpc` shows up with the same campaigns as both `google/cpc` and `bing/cpc`. Someone will check the ad account. This doesn't change either report, because neither one splits Paid Search by platform.

### The rest of the approved list
- **Suggested:** 21 other draft entries in `mapping.json`.
- **Decided:** All approved as drafted.
- **Why:** Each one matches how both current reports count it, and every touchpoint with a campaign agrees with that campaign's channel.

### The five unsettled values
- **Suggested:** Keep `partner_acme`, `li`, `social`, `promo_x` and `newchannel_q3` unresolved, rather than settling them now.
- **Decided:** Keep them unresolved. They go to the review queue.
- **Why:** None has a campaign attached, and the names alone don't say which channel they belong to. Making Partner its own channel would also change both reports.

### Clean-up rule
- **Suggested:** Keep it narrow: remove extra spaces and make everything lowercase, without treating `_`, `-`, spaces and `/` as the same.
- **Decided:** Agreed.
- **Why:** Treating them as the same could quietly merge values that aren't really the same. New spellings go through the review queue instead.

### Report period
- **Suggested:** Count only up to 5 July 2026, to match the touchpoint data.
- **Decided:** Agreed.
- **Why:** The people file runs to 14 July. Including the later dates would make the week 7 figures cover a partial extra week.

### Corrections to `DATA_NOTES.md`
- **Suggested (first draft):** "45 of 166 MQLs since week 7" and "the extra MQLs don't look lower quality."
- **Decided:** Change to 44 of 160 (weeks 7 to 13 only). Soften the quality claim, since low-score MQLs were accepted 71% of the time vs 79%.
- **Why:** The first figures included week 14, which is after the report period. The more direct comparison, by score, shows a small gap.

### Report file names
- **Suggested:** Update `CLAUDE.md` to use the current file names, rather than renaming the files.
- **Decided:** Agreed. `CLAUDE.md` now lists `weekly-report.html` and `sales-report.html`.
- **Why:** This leaves the team's files as they are.

## 2026-09-27: Stage 2 check-in (decided by Tracy N)

### `partner_acme`
- **Suggested:** Leave unresolved for the review queue. The AI leaned Referral with medium confidence.
- **Decided:** Approved as Referral and added to `mapping.json`. Partner traffic counts as Referral, not as its own channel.
- **Why:** It keeps the channel list unchanged, so both reports stay comparable. Effect: Referral rises from 149 to 182 touchpoints, and Unresolved / waiting falls from 204 (10.2%) to 171 (8.6%).

### Only high confidence becomes a suggestion
- **Suggested:** Only a high-confidence answer naming a grouping becomes "Suggested: waiting for approval". Medium, low and "I don't know" go to a person.
- **Decided:** Keep it.
- **Why:** In the test, the only known value it kept out was `eml`, which the AI got right but only with medium confidence. Sending it to a person was the safe outcome.

### Harder test cases
- **Suggested:** Add harder cases, because the first test set was mostly clear-cut and scored 100%.
- **Decided:** Add them, covering common spellings. Claude Code added 20: platform-only values (`linkedin`, `fb`, `google`), unclear paid values (`cpc`, `ppc`), platforms not on our list (`tiktok/paid`, `twitter_ads`, `bing/organic`), email tools, `partner_xyz`, and leftovers like `utm_source`.

### Test set status
- **Suggested:** Move `test_set.json` from draft to approved.
- **Decided:** No. It stays a draft.
- **Why:** The team hasn't confirmed the expected answers, including the 20 new ones.

## 2026-09-27: Stage 2 harder-test review (decided by Tracy N)

The harder test cases found two confidently wrong answers (`cpc` and `ppc` → Paid Search, high confidence) and an inconsistent answer for `li` between runs. Claude Code proposed five changes, A to E.

### A. `cpc` and `ppc` on their own → "I don't know" (approved)
- **Suggested:** Tell the AI that cpc, ppc or "ads" alone don't say whether a value is search or social.
- **Decided:** Approved. Added as a team rule in `groupings.json` (`rules_for_ai`).
- **Why:** In our own data, `fb/cpc` is Paid Social, so `cpc` alone doesn't settle it.

### B. One value per AI request (rejected)
- **Suggested:** Send each value in its own request, so answers don't shift depending on the other values in the batch.
- **Decided:** Skipped. Batches of up to 10 stay.
- **Effect:** The same value may get a different answer depending on what it's batched with. For example, `li` was "I don't know" in the test and "Organic Social, medium" in the backup. Both go to a person, since neither is high confidence.

### C. Allow a grouping with no platform for platforms not on our list (rejected)
- **Suggested:** Tell the AI it may answer, for example, Paid Social with no platform for `tiktok/paid`.
- **Decided:** Skipped.
- **Effect:** Values naming a platform we don't list (TikTok, Twitter/X) get "I don't know" and go to a person.

### D. Team rules in the AI's instructions (approved)
- **Suggested:** Give the AI team rules it can't work out alone, starting with "partner values count as Referral."
- **Decided:** Approved. Rules live in `groupings.json` under `rules_for_ai`, so the team can edit them without changing code. Instructions are now version 2, so answers saved under version 1 are not reused.

### E. Keep the strict platform check (approved)
- **Suggested:** Keep sending an answer to a person when its platform doesn't belong to its grouping (for example, Organic Search / Microsoft for `bing/organic`), rather than quietly removing the platform.
- **Decided:** Approved. No change.

### `chatgpt.com` and other AI tools
- **Suggested (draft test set):** Referral.
- **Decided:** Not Referral. The test now expects "I don't know" for `chatgpt.com`.
- **Why:** Team decision. The AI already answered "I don't know" for it.

### `tiktok/paid` and `twitter_ads`
- **Suggested:** Either keep expecting Paid Social, or change the test to expect "I don't know" to match the effect of skipping C.
- **Decided:** They are Paid Social. The test keeps expecting Paid Social.
- **Follow-up:** Claude Code offered to add TikTok and X as Paid Social platforms, or to add a team rule for them. The team chose to leave it as is. The AI keeps answering "I don't know" for these values, so a person decides each time. These two test cases will keep showing as disagreements; that's expected and safe.

### Tightening the two team rules (instructions version 3)
- **Suggested:** The version 2 rules were applied too broadly. `adwords` and `gads` became "I don't know" (they were correct before), and `podcast_sponsor` and `trade_show_booth` became "Referral, medium". Claude Code proposed tighter wording, or accepting the results as they were.
- **Decided:** Tighten both rules:
  - "Values containing the word 'partner' count as Referral. Sponsorships and events are not partners."
  - "When the entire value is just cpc, ppc or ads, answer 'I don't know'. Values that name a platform, such as adwords, gads or google_cpc, follow that platform."
- **Why:** Keep the fixes for `cpc`, `ppc` and `partner_xyz` without losing correct answers or giving reviewers misleading suggestions.

### `linkedin/social`
- **Suggested (draft test set):** "I don't know", because paid or organic seemed unclear.
- **Decided:** Organic Social / LinkedIn. The test now expects this.
- **Why:** By common tracking convention, "social" after the platform means organic; paid traffic is tagged cpc or paid_social. This is different from `social` on its own, which stays unresolved.

### Stage 2 closed with instructions version 3
- **Decided:** Stop adjusting the AI's instructions. Keep version 3, with the two tightened team rules. The backup (`saved_suggestions.json`) was re-created with version 3.
- **Why:** Each rewording fixed its targets but shifted a few unrelated answers. The main protection is the fixed rules (only high confidence becomes a suggestion, and a person approves everything), not the wording of the instructions.
- **Known, accepted weak spots:** all of these go to a person.
  - `podcast_sponsor` may be suggested as Referral with medium confidence.
  - `tiktok/paid`, `twitter_ads` and `bing/organic` get "I don't know".
  - `adwords` gets "I don't know" when it isn't on the approved list, which only happens in the test.

## 2026-09-27: Stage 3 to 5 follow-ups (decided by Tracy N)

### Status name for values marked "Not a channel"
- **Suggested:** A new status, "Unresolved: not a channel". These values stay in the Unresolved / waiting bucket and are never counted in a channel.
- **Decided:** Approved as named.

### `scripts/` folder
- **Suggested:** Keep team commands (counts, AI test, backup, weekly check) in a `scripts/` folder, separate from the mapper, and add it to the folder list in `CLAUDE.md`.
- **Decided:** Approved. `CLAUDE.md` now lists `/scripts`.

### Who can open the site
- **Suggested:** Team only, with Cloudflare Access in front of the site, rather than anyone with the link.
- **Decided:** Team only.
- **Why:** The site shows the approved list and AI answers, and a public link would let strangers use up the AI request limit.

### Who writes the site's explanations
- **Rule in `CLAUDE.md`:** the team writes the explanations, reasoning and recommendations shown on the site, and Claude Code never fills them in.
- **Decided:** Claude Code drafts all of them, as one production-ready presentation, using only facts from the project's own data, checks and this log. `CLAUDE.md` now records this.
- **Why:** Team request, to have a complete presentation before going live.
- **Choices in the draft the team should confirm:**
  - "Our choice" on the Options page is **B. Automate manual steps**, with shared definitions as the next step.
  - Tracy N is named as the person to ask when unsure, and as the person who adds exported decisions to the approved list each week.
  - The marketing analyst is named as the person who works through the review queue each week.

### Who can open the site (changed)
- **Earlier decision:** Team only, with Cloudflare Access.
- **Decided now:** The site is public. The repository stays private.
- **Why:** Team decision. The site only shows totals, the approved list, AI answers and the written pages; person-level data (people, dates, campaigns) is never included in the site. The AI is still protected by the request limits (20 requests per visitor and 300 in total per day) and the Anthropic monthly spending limit.

## 2026-09-27: Live at https://northwindlabs-channel-mapper.pages.dev

- Weekly check: the manual test run opened a test issue listing the 4 unrecognized values.
- Live AI check: of 12 values sent, only the 4 unfamiliar ones reached the AI. Blanks, junk and approved values were dropped. The same request again was answered entirely from remembered answers.

## 2026-09-27: Content confirmed and a new section (decided by Tracy N)

### The three content choices
- **Suggested (in the drafted content):** "Our choice" is B, Automate manual steps; Tracy N is the contact when unsure and adds exported decisions to the approved list; the marketing analyst works through the review queue weekly.
- **Decided:** All three confirmed.

### New section: Automating the import
- **Suggested:** Not in `CLAUDE.md`'s section list. Requested by the team.
- **Decided:** Add a section that compares ways to automate the weekly touchpoint import: what each would automate, who would be involved, and the pros and cons. It sits after "How we know it works". `CLAUDE.md` now lists it.
- **Why:** Someone currently has to export the data and replace `data/touchpoints.csv` by hand each week, or the weekly check keeps seeing old data.

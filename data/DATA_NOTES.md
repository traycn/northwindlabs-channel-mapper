# What the data shows (Stage 0)

These notes are for the whole team. They cover what's in the files, how the two reports differ, and what's still open.

## The files

| File | What's in it |
|---|---|
| `touchpoints.csv` | 2,000 touchpoints from 6 April to 5 July 2026: who, when, which campaign (if any), and the raw source value |
| `persons.csv` | 520 people with an engagement score, the date they qualified (MQL) and the date sales accepted them |
| `campaigns.csv` | 30 campaigns, each with a channel, spend and attributed leads |
| `weekly-report.html` | Marketing's weekly report |
| `sales-report.html` | Sales' report for the same period |

## Source values

There are 31 different ways the source is written in the touchpoint data. Using fixed rules only (cleaning plus lookup), the mapper places **89.8%** of touchpoints. The rest are:

- **Blank or placeholder:** 3.4% of touchpoints (`""`, `null`, `n/a`)
- **Needs a person:** 6.8% of touchpoints (5 values, listed below)

Both reports currently fold both of these groups into **"Other," which is 10.2%** of all touchpoints.

| Value | Touchpoints | Why it can't be settled automatically |
|---|---|---|
| `partner_acme` | 33 | Looks like a partner. Is that Referral, or its own channel? |
| `li` | 31 | LinkedIn, but paid or organic? No campaign is attached. |
| `promo_x` | 25 | Nothing in the name or a campaign says what it is. |
| `social` | 24 | Paid or organic, and on which platform? |
| `newchannel_q3` | 23 | A genuinely new value. |

A useful check: every touchpoint that has a campaign attached agrees with that campaign's channel, with no conflicts. None of the five values above has a campaign attached, which is part of why they're hard to place.

The full list is in `source_values_profile.csv`. The approved list is `mapping.json`. All 23 entries were approved by Tracy N on 27 September 2026. Two entries were corrected at review:

- `email-nurture` is Email. This is not a guess: all 22 of its touchpoints belong to Email campaigns.
- `g/cpc` is Paid Search, but its platform is left blank. The campaigns don't record Google or Microsoft, so someone needs to check the ad account.

At the Stage 2 check-in, `partner_acme` was approved as Referral (Tracy N, 27 September 2026). The other four values stay unresolved and go to the review queue. With fixed rules only, 91.5% of touchpoints are now placed, and **Unresolved / waiting is 171 touchpoints (8.6%)**.

## Why the two reports disagree

The two reports use the same data. Every difference comes from a choice about definitions, not from broken data.

| Difference | Marketing report | Sales report | Type |
|---|---|---|---|
| What the headline counts | MQLs: people **qualified** that week (week 10: **14**) | People **accepted** by sales that week (week 10: **17**) | Definition |
| Why weekly numbers never match | Counted on the qualify date | Counted on the accept date, which is 2 to 7 days later (4 on average) | Definition |
| Paid Social | One line (513) | Split into LinkedIn (269) and Meta (244) | Definition (level of detail) |
| "Other" | 204 touchpoints | The same 204 | Data: blanks and unrecognized values hidden in one bucket |

The channel totals are otherwise identical, so the grouping disagreement is only about level of detail. `groupings.json` handles this by storing both a channel and a platform. Marketing's view rolls the platforms up, sales' view splits them out, and both come from one approved list.

## The week 7 change

The process note describes a "routine" recalibration of engagement scoring in week 7. The data suggests it lowered the score needed to become an MQL from **62 to 44** (inferred from who did and didn't qualify).

- In weeks 7 to 13, **44 of 160 MQLs (27.5%)** would not have qualified under the old rule.
- Week 13 shows 31 MQLs. Under the old rule it would be 20.
- Part of the MQL rise in the second half of the quarter comes from this definition change, not from more demand.
- Sales accepted about the same share of MQLs before and after the change (74% in weeks 1 to 6, 76% in weeks 7 to 13). But within weeks 7 to 13, MQLs scoring under 62 were accepted less often (70%, 31 of 44) than those scoring 62 or more (78%, 90 of 116). The group is small, so it's too early to say whether the extra MQLs are lower quality.
- The change only affected new people. 46 people created before week 7 scored between 44 and 61 and were never re-qualified.

## Other observations

- 63 people qualified but were never accepted by sales.
- There are no broken dates, and no touchpoints point to people who don't exist.
- The people file runs past the touchpoint data: 6 people qualified and 19 were accepted after 5 July (up to 14 July). Reports count only up to 5 July (see decisions below).
- 1,057 of the 1,287 touchpoints with a campaign fall outside that campaign's run dates, by up to 11 weeks. Channels still agree, but campaign links look loose, so campaign dates shouldn't be relied on. This is a data issue.
- 6 people have no touchpoints and a blank first-touch source (5 of them are MQLs). The profile counts them under the blank value.
- 14 people have more than one touchpoint on their first day. Only dates are recorded, so their first touch is ambiguous.
- No value is malformed. Every unusable value is blank or a placeholder, so **Unresolved: malformed** won't appear in results for this file.
- Both reports and all campaigns say "Q3", but the dates run April to early July (calendar Q2).

## Decisions (27 September 2026)

- The 23 approved-list entries are confirmed, with the two corrections above.
- `li`, `social`, `promo_x` and `newchannel_q3` stay unresolved and go to the review queue. `partner_acme` is Referral (decided at the Stage 2 check-in: partner traffic is not its own channel).
- Clean-up stays narrow: remove extra spaces (including around `/`) and make everything lowercase. `_`, `-`, spaces and `/` are not treated as the same, so values that look alike but may differ are never merged automatically.
- Reports count only touchpoints, MQLs and accepted leads up to 5 July 2026.

See `DECISION_LOG.md` for the details.

## Open questions for the team

1. Does anyone know what `promo_x` and `newchannel_q3` are? (For now, they go to the review queue.)
2. Which platform is `g/cpc`? Check the ad account.
3. Who owns the MQL threshold, and where should changes like the week 7 one be written down?
4. Is "Q3" a fiscal quarter?
5. Which headline should the shared weekly view lead with: qualified, accepted, or both side by side?

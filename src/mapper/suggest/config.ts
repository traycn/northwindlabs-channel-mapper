// Settings for the AI step, kept in one place so they're easy to change.

// Lowest-cost current Haiku model. Confirmed active on 2026-09-27 at
// https://platform.claude.com/docs/en/about-claude/models/overview
// (retirement not sooner than 2026-10-15, with at least 60 days' notice).
export const MODEL = "claude-haiku-4-5-20251001";

// Bump this whenever the instructions or examples change, so old cached
// answers aren't reused for a different question.
export const PROMPT_VERSION = "3"; // 2: team rules added; 3: rules tightened (2026-09-27)

// Unique values sent to the AI in one request.
export const BATCH_SIZE = 10;

// The answer's reason may be at most this many words.
export const MAX_REASON_WORDS = 20;

// Request limits for the server function (per visitor per day, and in total).
export const REQUESTS_PER_VISITOR_PER_DAY = 20;
export const REQUESTS_PER_DAY_TOTAL = 300;

export const I_DONT_KNOW = "I don't know";

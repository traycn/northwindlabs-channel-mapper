// Step 2: spot blank or broken values. These are never sent to the AI.

// Text that stands in for "nothing here". Compared against the cleaned value.
const PLACEHOLDERS = new Set([
  "",
  "null",
  "nil",
  "none",
  "n/a",
  "na",
  "undefined",
  "nan",
  "-",
  "--",
]);

const MAX_LENGTH = 100;

export type Problem = "blank" | "malformed" | null;

export function detectProblem(raw: string, cleaned: string): Problem {
  if (PLACEHOLDERS.has(cleaned)) return "blank";

  // Control characters or the "unreadable character" symbol (bad encoding).
  if (/[\u0000-\u001f\u007f�]/.test(raw)) return "malformed";
  // No letters or digits at all, e.g. "???" or "//".
  if (!/[\p{L}\p{N}]/u.test(cleaned)) return "malformed";
  // An unfilled template tag, e.g. "{{source}}", "${utm_source}", "%source%".
  if (/\{\{.*\}\}|\$\{.*\}|%[a-z_]+%/.test(cleaned)) return "malformed";
  // Far longer than any real source value.
  if (cleaned.length > MAX_LENGTH) return "malformed";

  return null;
}

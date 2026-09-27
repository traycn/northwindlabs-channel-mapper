// Step 1: clean up a raw source value.
// Narrow on purpose (DECISION_LOG 2026-09-27): trim, lowercase, collapse
// repeated spaces, and remove spaces around "/". We do NOT treat "_", "-",
// " " and "/" as the same, so look-alike values are never merged silently.
export function cleanValue(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/ ?\/ ?/g, "/");
}

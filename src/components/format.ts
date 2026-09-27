// Number formatting shared by the screens. Percentages round halves up
// (25.65 → 25.7), matching the reports.
export const fmt = (n: number) => n.toLocaleString("en-US");
export const pct = (part: number, total: number) =>
  total ? `${(Math.round((1000 * part) / total) / 10).toFixed(1)}%` : "0.0%";
export const grouping = (channel: string | null, platform: string | null) =>
  channel ? (platform ? `${channel} · ${platform}` : channel) : "—";

/// <reference types="vite/client" />

// Built from data/touchpoints.csv at build time: source value → touchpoints.
declare module "virtual:source-counts" {
  const counts: Record<string, number>;
  export default counts;
}

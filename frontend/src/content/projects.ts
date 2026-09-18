export interface Project {
  slug: string;
  title: string;
  summary: string;
  href: string;
  topics?: string[];
}

export const projects: Project[] = [
  {
    slug: "synthetic-website-analytics-platform",
    title: "Synthetic Website Analytics Platform",
    summary:
      "A simulated website analytics system covering event generation, dbt modeling, analysis, and reporting.",
    href: "https://github.com/SpencerRWood/synthetic-website-analytics-platform",
    topics: ["data-generation", "data-modeling", "analytics", "communication"],
  },
  {
    slug: "wood-charts",
    title: "wood-charts",
    summary: "A small charting library for consistent analytical graphics.",
    href: "https://github.com/SpencerRWood/wood-charts",
    topics: ["analytics", "communication"],
  },
  {
    slug: "wood-reports",
    title: "wood-reports",
    summary:
      "A reporting system for turning analysis into reusable presentation and document outputs.",
    href: "https://github.com/SpencerRWood/wood-reports",
    topics: ["analytics", "communication"],
  },
];

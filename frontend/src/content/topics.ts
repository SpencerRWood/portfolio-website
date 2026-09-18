export interface Topic {
  slug: string;
  title: string;
  summary: string;
}

export const topics: Topic[] = [
  {
    slug: "data-generation",
    title: "Data Generation",
    summary:
      "How applications, products, and simulations create useful analytical data.",
  },
  {
    slug: "data-collection",
    title: "Data Collection",
    summary: "How data gets captured, moved, stored, and made reliable.",
  },
  {
    slug: "data-modeling",
    title: "Data Modeling",
    summary: "How raw data becomes usable tables, metrics, and business concepts.",
  },
  {
    slug: "analytics",
    title: "Analytics",
    summary: "How to turn data into findings people can actually use.",
  },
  {
    slug: "machine-learning",
    title: "Machine Learning",
    summary: "Where predictive models fit, and where they do not.",
  },
  {
    slug: "communication",
    title: "Communication",
    summary:
      "Charts, reports, and other ways to make analytical work easier to understand.",
  },
];

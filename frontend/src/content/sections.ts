export interface PortfolioSection {
  slug: string;
  title: string;
  objective: string;
  conceptualModel: string;
  principles: string[];
  workflow: string;
  implementationExample: string;
  tradeoffs: string;
  references: { label: string; href: string }[];
}

const sharedReferences = [
  { label: "Reference implementations", href: "https://github.com/SpencerRWood" },
];

export const portfolioSections: PortfolioSection[] = [
  {
    slug: "data-generation",
    title: "Data Generation",
    objective: "Understand how product and operational systems create meaningful data.",
    conceptualModel:
      "Events and records are product contracts, not incidental exhaust.",
    principles: ["Name events intentionally", "Capture context at the source"],
    workflow: "Identify decisions, define event contracts, and validate emitted data.",
    implementationExample: "First-party interaction instrumentation.",
    tradeoffs: "More context improves analysis but must respect privacy and cost.",
    references: sharedReferences,
  },
  {
    slug: "data-collection",
    title: "Data Collection",
    objective: "Move reliable source data into durable analytical storage.",
    conceptualModel: "Collection decouples applications from downstream consumers.",
    principles: ["Preserve raw inputs", "Design for replay"],
    workflow: "Capture, route, land, and observe source events.",
    implementationExample: "RudderStack delivery into PostgreSQL.",
    tradeoffs: "Flexible ingestion needs explicit schemas and ownership.",
    references: sharedReferences,
  },
  {
    slug: "data-modeling",
    title: "Data Modeling",
    objective: "Transform raw data into dependable, explainable models.",
    conceptualModel: "Models make business concepts reusable and testable.",
    principles: ["Model at the grain of decisions", "Test important assumptions"],
    workflow: "Profile, model, test, document, and publish.",
    implementationExample: "dbt transformations with explicit lineage.",
    tradeoffs: "Governance improves trust but adds authoring discipline.",
    references: sharedReferences,
  },
  {
    slug: "analytics",
    title: "Analytics",
    objective: "Turn modeled data into decisions and learning loops.",
    conceptualModel: "Metrics are shared language for decisions.",
    principles: ["State definitions", "Show uncertainty"],
    workflow: "Frame a question, measure, interpret, and communicate a decision.",
    implementationExample: "Decision-ready analytical reporting.",
    tradeoffs: "Fast answers require careful limits on interpretation.",
    references: sharedReferences,
  },
  {
    slug: "machine-learning",
    title: "Machine Learning",
    objective: "Apply models where prediction or automation improves an outcome.",
    conceptualModel: "Models are operational products with feedback loops.",
    principles: ["Start with a baseline", "Monitor drift and impact"],
    workflow: "Define outcome, train, evaluate, deploy, and monitor.",
    implementationExample: "Reproducible feature and evaluation workflows.",
    tradeoffs: "Model complexity must earn its operational cost.",
    references: sharedReferences,
  },
  {
    slug: "presentation",
    title: "Presentation",
    objective: "Make findings legible and useful to their audience.",
    conceptualModel: "A presentation is an interface for a decision.",
    principles: ["Lead with the finding", "Keep evidence inspectable"],
    workflow: "Select evidence, design the narrative, and invite action.",
    implementationExample: "Reusable charts and report-generation systems.",
    tradeoffs: "Concise communication can hide nuance without supporting detail.",
    references: sharedReferences,
  },
];

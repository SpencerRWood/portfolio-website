import type { PortfolioSection as PortfolioSectionContent } from "../content/sections";

interface PortfolioSectionProps {
  section: PortfolioSectionContent;
}

export function PortfolioSection({ section }: PortfolioSectionProps) {
  return (
    <article id={section.slug}>
      <h2>{section.title}</h2>
      <p>{section.objective}</p>
      <h3>Conceptual model</h3>
      <p>{section.conceptualModel}</p>
      <h3>Design principles</h3>
      <ul>
        {section.principles.map((principle) => (
          <li key={principle}>{principle}</li>
        ))}
      </ul>
      <h3>Workflow</h3>
      <p>{section.workflow}</p>
      <h3>Implementation example</h3>
      <p>{section.implementationExample}</p>
      <h3>Tradeoffs and findings</h3>
      <p>{section.tradeoffs}</p>
      <h3>Reference implementations</h3>
      <ul>
        {section.references.map((reference) => (
          <li key={reference.href}>
            <a href={reference.href}>{reference.label}</a>
          </li>
        ))}
      </ul>
    </article>
  );
}

import type { PortfolioSection as PortfolioSectionContent } from "../content/sections";

interface PortfolioSectionProps {
  section: PortfolioSectionContent;
  onEngage: (sectionSlug: string) => void;
  onOutboundReference: (sectionSlug: string, referenceLabel: string) => void;
}

export function PortfolioSection({
  section,
  onEngage,
  onOutboundReference,
}: PortfolioSectionProps) {
  return (
    <article
      id={section.slug}
      onMouseEnter={() => onEngage(section.slug)}
      onFocus={() => onEngage(section.slug)}
    >
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
            <a
              href={reference.href}
              onClick={() => onOutboundReference(section.slug, reference.label)}
            >
              {reference.label}
            </a>
          </li>
        ))}
      </ul>
    </article>
  );
}

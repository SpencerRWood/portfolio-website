import type { PortfolioSection as PortfolioSectionContent } from "../content/sections";

interface PortfolioSectionProps {
  index: number;
  section: PortfolioSectionContent;
  onEngage: (sectionSlug: string) => void;
  onOutboundReference: (sectionSlug: string, referenceLabel: string) => void;
}

export function PortfolioSection({
  index,
  section,
  onEngage,
  onOutboundReference,
}: PortfolioSectionProps) {
  return (
    <article
      id={section.slug}
      className="group scroll-mt-8 border-t border-black/15 py-10 md:grid md:grid-cols-[10rem_minmax(0,1fr)] md:gap-8 md:py-14"
      onMouseEnter={() => onEngage(section.slug)}
      onFocus={() => onEngage(section.slug)}
    >
      <div className="mb-5 font-mono text-xs tracking-[0.16em] text-black/55 md:mb-0">
        {String(index + 1).padStart(2, "0")} / LIFECYCLE
      </div>
      <div>
        <p className="mb-3 font-mono text-[0.68rem] tracking-[0.14em] text-black/55 uppercase">
          {section.slug.replaceAll("-", " ")}
        </p>
        <h2 className="font-display text-3xl leading-none font-semibold tracking-[-0.045em] md:text-5xl">
          {section.title}
        </h2>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-black/75">
          {section.objective}
        </p>
        <div className="mt-9 grid gap-7 border-l border-black/20 pl-5 md:grid-cols-2 md:gap-x-12 md:gap-y-9">
          <div>
            <h3 className="font-mono text-[0.68rem] tracking-[0.14em] text-black/55 uppercase">
              Conceptual model
            </h3>
            <p className="mt-3 leading-7">{section.conceptualModel}</p>
          </div>
          <div>
            <h3 className="font-mono text-[0.68rem] tracking-[0.14em] text-black/55 uppercase">
              Design principles
            </h3>
            <ul className="mt-3 space-y-2 leading-7">
              {section.principles.map((principle) => (
                <li key={principle} className="flex gap-3">
                  <span aria-hidden="true">—</span>
                  {principle}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-mono text-[0.68rem] tracking-[0.14em] text-black/55 uppercase">
              Workflow
            </h3>
            <p className="mt-3 leading-7">{section.workflow}</p>
          </div>
          <div>
            <h3 className="font-mono text-[0.68rem] tracking-[0.14em] text-black/55 uppercase">
              Implementation / tradeoffs
            </h3>
            <p className="mt-3 leading-7">{section.implementationExample}</p>
            <p className="mt-3 text-black/65">{section.tradeoffs}</p>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          {section.references.map((reference) => (
            <a
              key={reference.href}
              className="inline-flex items-center gap-2 border border-black/20 px-3 py-2 font-mono text-xs tracking-[0.08em] uppercase transition-colors hover:bg-black hover:text-white focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-black"
              href={reference.href}
              onClick={() => onOutboundReference(section.slug, reference.label)}
            >
              {reference.label} <span aria-hidden="true">↗</span>
            </a>
          ))}
        </div>
      </div>
    </article>
  );
}

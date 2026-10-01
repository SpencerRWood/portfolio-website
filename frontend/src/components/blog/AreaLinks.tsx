import { areaName } from "./blogMetadata";
import { trackClick, type PageSource } from "../../analytics/events";

interface AreaLinksProps {
  areas: { slug: string; title: string }[];
  slugs: string[];
  source?: PageSource;
}

export function AreaLinks({ areas, slugs, source }: AreaLinksProps) {
  return (
    <ul className="flex flex-wrap gap-x-3 gap-y-1" aria-label="Article Topics">
      {slugs.map((slug) => (
        <li key={slug}>
          <a
            className="font-mono text-[0.68rem] tracking-[0.1em] text-black/55 uppercase transition-colors hover:text-black focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-black"
            href={`/topics/${slug}`}
            onClick={() =>
              source &&
              trackClick({
                ...source,
                targetType: "internal_page",
                targetPageType: "area",
                targetSlug: slug,
                destination: `/topics/${slug}`,
              })
            }
          >
            {areaName(slug, areas)}
          </a>
        </li>
      ))}
    </ul>
  );
}

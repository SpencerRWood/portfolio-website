import type { ContentPage } from "../api/client";
import { trackClick, type PageSource } from "../analytics/events";

interface AreaListProps {
  areas: ContentPage[];
  source: PageSource;
}

export function AreaList({ areas, source }: AreaListProps) {
  return (
    <div className="space-y-10">
      {(["Analytics", "Engineering"] as const).map((group) => (
        <section key={group} aria-labelledby={`area-group-${group.toLowerCase()}`}>
          <h2
            id={`area-group-${group.toLowerCase()}`}
            className="mb-5 font-display text-2xl font-semibold tracking-[-0.035em]"
          >
            {group}
          </h2>
          <div className="border-t border-black/20">
            {areas
              .filter((area) => area.group === group)
              .sort(
                (left, right) =>
                  left.order - right.order ||
                  left.title.localeCompare(right.title, "en") ||
                  left.slug.localeCompare(right.slug, "en"),
              )
              .map((area, index) => (
                <article
                  key={area.slug}
                  id={area.slug}
                  className="grid scroll-mt-8 gap-4 border-b border-black/15 py-7 md:grid-cols-[5rem_minmax(0,1fr)_minmax(16rem,0.8fr)] md:gap-8 md:py-9"
                >
                  <p className="font-mono text-xs tracking-[0.14em] text-black/55">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="font-display text-2xl font-semibold tracking-[-0.035em] md:text-3xl">
                    <a
                      className="transition-colors hover:text-black/55 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-black"
                      href={`/topics/${area.slug}`}
                      onClick={() =>
                        trackClick({
                          ...source,
                          targetType: "internal_page",
                          targetPageType: "area",
                          targetSlug: area.slug,
                          destination: `/topics/${area.slug}`,
                        })
                      }
                    >
                      {area.title}
                    </a>
                  </h3>
                  <p className="max-w-xl leading-7 text-black/70">{area.summary}</p>
                </article>
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}

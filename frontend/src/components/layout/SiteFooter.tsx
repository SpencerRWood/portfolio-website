import { useEffect, useState } from "react";

import { trackClick, type PageSource } from "../../analytics/events";
import {
  getFooterNavigation,
  type ContentPage,
  type FooterNavigation,
} from "../../api/client";

export function SiteFooter({
  areas,
  source,
}: {
  areas: ContentPage[];
  source?: PageSource;
}) {
  const [navigation, setNavigation] = useState<FooterNavigation | null>(null);

  useEffect(() => {
    void getFooterNavigation().then(setNavigation);
  }, []);

  return (
    <footer>
      <div className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 lg:px-12">
        <nav
          className="mt-16 border-t border-black/20 py-12 md:mt-24 md:py-16"
          aria-label="Footer navigation"
        >
          <div className="mx-auto grid max-w-4xl grid-cols-2 justify-items-center gap-x-8 gap-y-10 text-center md:grid-cols-5 md:items-start">
            <div>
              <a
                className="font-mono text-xs tracking-[0.12em] uppercase transition-colors hover:text-black/55"
                href="/topics"
                onClick={() =>
                  source &&
                  trackClick({
                    ...source,
                    targetType: "internal_page",
                    targetPageType: "section_index",
                    targetSlug: "areas",
                    destination: "/topics",
                  })
                }
              >
                {navigation?.areas_title ?? "Topics"}
              </a>
              <ul className="mt-4 space-y-2 text-left">
                {areas.map((area) => (
                  <li key={area.slug}>
                    <a
                      className="text-sm leading-5 text-black/45 transition-colors hover:text-black focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-black"
                      href={`/topics/${area.slug}`}
                      onClick={() =>
                        source &&
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
                  </li>
                ))}
              </ul>
            </div>
            {(navigation?.items ?? []).map(({ title, destination }) => (
              <FooterLink
                key={destination}
                label={title}
                destination={destination}
                source={source}
              />
            ))}
          </div>
        </nav>
      </div>
    </footer>
  );
}

function FooterLink({
  label,
  destination,
  source,
}: {
  label: string;
  destination: string;
  source?: PageSource;
}) {
  return (
    <a
      className="font-mono text-xs tracking-[0.12em] uppercase transition-colors hover:text-black/55"
      href={destination}
      onClick={() =>
        source && trackClick({ ...source, targetType: "internal_page", destination })
      }
    >
      {label}
    </a>
  );
}

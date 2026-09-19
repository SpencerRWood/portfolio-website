import { trackClick, type PageSource } from "../../analytics/events";
import type { SiteNavigationItem } from "../../api/client";

export function SiteHeader({
  navigation,
  source,
}: {
  navigation: SiteNavigationItem[];
  source?: PageSource;
}) {
  return (
    <header>
      <div className="mx-auto max-w-7xl border-b border-black/20 px-5 py-6 sm:px-8 md:py-8 lg:px-12">
        <div className="flex items-center justify-between gap-5">
          <a
            className="font-mono text-xs font-medium tracking-[0.14em] uppercase transition-opacity hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
            href="/"
            onClick={() =>
              source &&
              trackClick({
                ...source,
                targetType: "internal_page",
                targetPageType: "home",
                targetSlug: "home",
                destination: "/",
              })
            }
          >
            Spencer Wood
          </a>
          <a
            className="font-mono text-[0.68rem] tracking-[0.12em] text-black/55 uppercase transition-colors hover:text-black focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-black"
            href="https://github.com/SpencerRWood"
            onClick={() =>
              source &&
              trackClick({
                ...source,
                targetType: "external_reference",
                referenceType: "github_profile",
                destination: "https://github.com/SpencerRWood",
              })
            }
          >
            GitHub ↗
          </a>
        </div>
        <nav className="mt-7 overflow-x-auto pb-1" aria-label="Primary navigation">
          <ul className="flex w-max items-center gap-x-6 font-mono text-xs tracking-[0.08em] uppercase md:gap-x-8">
            {navigation.map(({ title, destination }) => (
              <li key={destination}>
                <a
                  className="whitespace-nowrap text-black/65 transition-colors hover:text-black focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-black"
                  href={destination}
                  onClick={() =>
                    source &&
                    trackClick({ ...source, targetType: "internal_page", destination })
                  }
                >
                  {title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}

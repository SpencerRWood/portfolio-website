import { useEffect, useState } from "react";

import { trackNavigation } from "../analytics/events";
import {
  getFooterNavigation,
  type ContentPage,
  type FooterNavigation,
} from "../api/client";

export function SiteFooter({ topics }: { topics: ContentPage[] }) {
  const [navigation, setNavigation] = useState<FooterNavigation | null>(null);

  useEffect(() => {
    void getFooterNavigation().then(setNavigation);
  }, []);

  return (
    <footer className="mt-16 border-t border-black/20 py-12 md:mt-24 md:py-16">
      <nav aria-label="Footer navigation">
        <div className="mx-auto grid max-w-4xl grid-cols-2 justify-items-center gap-x-8 gap-y-10 text-center md:grid-cols-5 md:items-start">
          <div>
            <a
              className="font-mono text-xs tracking-[0.12em] uppercase transition-colors hover:text-black/55"
              href="/topics"
              onClick={() => trackNavigation("/topics")}
            >
              {navigation?.topics_title ?? "Topics"}
            </a>
            <ul className="mt-4 space-y-2 border-l border-black/15 pl-3 text-left">
              {topics.map((topic) => (
                <li key={topic.slug}>
                  <a
                    className="text-sm leading-5 text-black/45 transition-colors hover:text-black focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-black"
                    href={`/topics/${topic.slug}`}
                    onClick={() => trackNavigation(`/topics/${topic.slug}`)}
                  >
                    {topic.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          {(navigation?.items ?? []).map(({ title, destination }) => (
            <FooterLink key={destination} label={title} destination={destination} />
          ))}
        </div>
      </nav>
    </footer>
  );
}

function FooterLink({ label, destination }: { label: string; destination: string }) {
  return (
    <a
      className="font-mono text-xs tracking-[0.12em] uppercase transition-colors hover:text-black/55"
      href={destination}
      onClick={() => trackNavigation(destination)}
    >
      {label}
    </a>
  );
}

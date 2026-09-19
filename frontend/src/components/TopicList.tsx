import type { ContentPage } from "../api/client";
import { trackClick, type PageSource } from "../analytics/events";

interface TopicListProps {
  topics: ContentPage[];
  source: PageSource;
}

export function TopicList({ topics, source }: TopicListProps) {
  return (
    <div className="border-t border-black/20">
      {topics.map((topic, index) => (
        <article
          key={topic.slug}
          id={topic.slug}
          className="grid scroll-mt-8 gap-4 border-b border-black/15 py-7 md:grid-cols-[5rem_minmax(0,1fr)_minmax(16rem,0.8fr)] md:gap-8 md:py-9"
        >
          <p className="font-mono text-xs tracking-[0.14em] text-black/55">
            {String(index + 1).padStart(2, "0")}
          </p>
          <h3 className="font-display text-2xl font-semibold tracking-[-0.035em] md:text-3xl">
            <a
              className="transition-colors hover:text-black/55 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-black"
              href={`/topics/${topic.slug}`}
              onClick={() =>
                trackClick({
                  ...source,
                  targetType: "internal_page",
                  targetPageType: "topic",
                  targetSlug: topic.slug,
                  destination: `/topics/${topic.slug}`,
                })
              }
            >
              {topic.title}
            </a>
          </h3>
          <p className="max-w-xl leading-7 text-black/70">{topic.summary}</p>
        </article>
      ))}
    </div>
  );
}

import type { ContentPage } from "../../api/client";

import { formatPublishedDate } from "./blogMetadata";
import { AreaLinks } from "./AreaLinks";
import { trackClick } from "../../analytics/events";

export function BlogArticle({
  page,
  areas,
}: {
  page: ContentPage;
  areas: ContentPage[];
}) {
  return (
    <article className="blog-article py-12 md:py-20">
      <header className="blog-article-header">
        <a
          className="font-mono text-xs tracking-[0.12em] text-black/55 uppercase transition-colors hover:text-black focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-black"
          href="/blog"
          onClick={() =>
            trackClick({
              sourcePageType: "blog_article",
              sourcePageSlug: page.slug,
              targetType: "internal_page",
              targetPageType: "section_index",
              targetSlug: "blog",
              destination: "/blog",
            })
          }
        >
          ← Writing
        </a>
        <div className="mt-10 flex flex-wrap items-center gap-x-3 gap-y-2">
          <AreaLinks
            areas={areas}
            slugs={page.areas}
            source={{ sourcePageType: "blog_article", sourcePageSlug: page.slug }}
          />
          <span className="text-black/30" aria-hidden="true">
            ·
          </span>
          <time
            className="font-mono text-[0.68rem] tracking-[0.1em] text-black/55 uppercase"
            dateTime={page.published ?? undefined}
          >
            {formatPublishedDate(page.published)}
          </time>
        </div>
        <h1 className="font-display mt-7 max-w-4xl text-4xl leading-[1.01] font-semibold tracking-[-0.055em] md:text-6xl lg:text-7xl">
          {page.title}
        </h1>
        <p className="mt-7 max-w-2xl text-lg leading-8 text-black/75 md:text-xl">
          {page.summary}
        </p>
      </header>

      <div className="mt-12 border-t border-black/20 pt-10 md:mt-16 md:pt-12">
        <div
          className="article-prose"
          dangerouslySetInnerHTML={{ __html: page.body_html }}
        />
      </div>

      <footer className="mt-16 border-t border-black/20 pt-8 md:mt-20">
        <p className="font-mono text-[0.68rem] tracking-[0.14em] text-black/55 uppercase">
          Filed under
        </p>
        <div className="mt-3">
          <AreaLinks
            areas={areas}
            slugs={page.areas}
            source={{ sourcePageType: "blog_article", sourcePageSlug: page.slug }}
          />
        </div>
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-4">
          {page.repository ? (
            <a
              className="article-footer-link"
              href={page.repository}
              onClick={() =>
                trackClick({
                  sourcePageType: "blog_article",
                  sourcePageSlug: page.slug,
                  targetType: "external_reference",
                  referenceType: "repository",
                  destination: page.repository!,
                })
              }
            >
              GitHub / related project ↗
            </a>
          ) : null}
          <a
            className="article-footer-link"
            href="/blog"
            onClick={() =>
              trackClick({
                sourcePageType: "blog_article",
                sourcePageSlug: page.slug,
                targetType: "internal_page",
                targetPageType: "section_index",
                targetSlug: "blog",
                destination: "/blog",
              })
            }
          >
            ← Back to all writing
          </a>
        </div>
      </footer>
    </article>
  );
}

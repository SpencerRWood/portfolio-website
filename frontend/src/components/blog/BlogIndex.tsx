import type { ContentPage, SitePage } from "../../api/client";

import { formatPublishedDate, selectFeaturedPost, areaName } from "./blogMetadata";
import { trackClick } from "../../analytics/events";
import { AreaLinks } from "./AreaLinks";

interface BlogIndexProps {
  page: SitePage;
  posts: ContentPage[];
  areas: ContentPage[];
}

function PostDate({ value }: { value: string | null }) {
  return value ? (
    <time dateTime={value}>{formatPublishedDate(value)}</time>
  ) : (
    <>Recent post</>
  );
}

function FeaturedVisual({ post, areas }: { post: ContentPage; areas: ContentPage[] }) {
  const primaryArea = post.areas[0] ? areaName(post.areas[0], areas) : "Writing";

  return (
    <div className="flex min-h-64 flex-col justify-between border border-black/20 bg-black/[0.025] p-6 md:min-h-full md:p-8">
      <div className="flex items-start justify-between gap-4 border-b border-black/15 pb-4">
        <p className="font-mono text-[0.68rem] tracking-[0.16em] text-black/55 uppercase">
          {primaryArea}
        </p>
        <p className="font-mono text-xs tracking-[0.12em] text-black/45">01</p>
      </div>
      <div className="py-8">
        <p className="font-display text-2xl leading-tight font-semibold tracking-[-0.04em] text-black/80 md:text-3xl">
          {post.title}
        </p>
      </div>
      <p className="border-t border-black/15 pt-4 font-mono text-[0.68rem] tracking-[0.12em] text-black/55 uppercase">
        <PostDate value={post.published} />
      </p>
    </div>
  );
}

export function BlogIndex({ page, posts, areas }: BlogIndexProps) {
  const featured = selectFeaturedPost(posts);
  const representedAreas = areas.filter((area) =>
    posts.some((post) => post.areas.includes(area.slug)),
  );

  return (
    <section className="blog-index py-12 md:py-16">
      <header className="max-w-3xl">
        <p className="font-mono text-xs tracking-[0.16em] text-black/55 uppercase">
          {page.title}
        </p>
        <h1 className="font-display mt-4 text-4xl leading-[0.98] font-semibold tracking-[-0.05em] md:text-6xl">
          {page.summary}
        </h1>
        <div
          className="blog-introduction mt-5 max-w-2xl text-base text-black/70"
          dangerouslySetInnerHTML={{ __html: page.body_html }}
        />
      </header>

      {representedAreas.length ? (
        <nav
          className="mt-10 border-y border-black/15 py-5"
          aria-label="Writing Topics"
        >
          <p className="font-mono text-[0.68rem] tracking-[0.14em] text-black/55 uppercase">
            Writing about
          </p>
          <div className="mt-3">
            <AreaLinks
              areas={areas}
              slugs={representedAreas.map((area) => area.slug)}
              source={{ sourcePageType: "section_index", sourcePageSlug: page.slug }}
            />
          </div>
        </nav>
      ) : null}

      {featured ? (
        <section className="mt-12" aria-labelledby="featured-post-heading">
          <p className="font-mono text-xs tracking-[0.16em] text-black/55 uppercase">
            Featured note
          </p>
          <article className="mt-5 grid border-y border-black/20 py-6 md:grid-cols-[minmax(0,1.2fr)_minmax(15rem,0.8fr)] md:gap-12 md:py-8">
            <div className="py-2">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <AreaLinks
                  areas={areas}
                  slugs={featured.areas}
                  source={{
                    sourcePageType: "section_index",
                    sourcePageSlug: page.slug,
                  }}
                />
                <span className="text-black/30" aria-hidden="true">
                  ·
                </span>
                <p className="font-mono text-[0.68rem] tracking-[0.1em] text-black/55 uppercase">
                  <PostDate value={featured.published} />
                </p>
              </div>
              <h2
                id="featured-post-heading"
                className="font-display mt-7 max-w-3xl text-4xl leading-[0.98] font-semibold tracking-[-0.055em] md:text-6xl"
              >
                <a
                  className="transition-colors hover:text-black/55 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
                  href={`/blog/${featured.slug}`}
                  onClick={() =>
                    trackClick({
                      sourcePageType: "section_index",
                      sourcePageSlug: page.slug,
                      targetType: "internal_page",
                      targetPageType: "blog_article",
                      targetSlug: featured.slug,
                      destination: `/blog/${featured.slug}`,
                    })
                  }
                >
                  {featured.title}
                </a>
              </h2>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-black/75">
                {featured.summary}
              </p>
              <a
                className="mt-8 inline-flex font-mono text-xs tracking-[0.1em] underline decoration-black/35 underline-offset-4 uppercase transition-colors hover:text-black/55 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-black"
                href={`/blog/${featured.slug}`}
                onClick={() =>
                  trackClick({
                    sourcePageType: "section_index",
                    sourcePageSlug: page.slug,
                    targetType: "internal_page",
                    targetPageType: "blog_article",
                    targetSlug: featured.slug,
                    destination: `/blog/${featured.slug}`,
                  })
                }
              >
                Read article{" "}
                <span className="ml-2" aria-hidden="true">
                  →
                </span>
              </a>
            </div>
            <FeaturedVisual post={featured} areas={areas} />
          </article>
        </section>
      ) : null}

      <section className="mt-16 md:mt-20" aria-labelledby="all-writing-heading">
        <div className="flex items-baseline justify-between border-b-2 border-black pb-4">
          <h2
            id="all-writing-heading"
            className="font-display text-3xl font-semibold tracking-[-0.04em] md:text-4xl"
          >
            All writing
          </h2>
          <p className="font-mono text-xs tracking-[0.12em] text-black/55 uppercase">
            {posts.length} notes
          </p>
        </div>
        <div>
          {posts.map((post) => (
            <article
              key={post.slug}
              className="blog-index-entry group grid gap-4 border-b border-black/15 py-8 md:grid-cols-[11rem_minmax(0,1fr)] md:gap-10"
            >
              <div>
                <p className="font-mono text-[0.68rem] tracking-[0.1em] text-black/55 uppercase">
                  <PostDate value={post.published} />
                </p>
                <div className="mt-3">
                  <AreaLinks
                    areas={areas}
                    slugs={post.areas}
                    source={{
                      sourcePageType: "section_index",
                      sourcePageSlug: page.slug,
                    }}
                  />
                </div>
              </div>
              <div>
                <h3 className="font-display text-2xl leading-tight font-semibold tracking-[-0.035em] md:text-4xl">
                  <a
                    className="transition-colors group-hover:text-black/55 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
                    href={`/blog/${post.slug}`}
                    onClick={() =>
                      trackClick({
                        sourcePageType: "section_index",
                        sourcePageSlug: page.slug,
                        targetType: "internal_page",
                        targetPageType: "blog_article",
                        targetSlug: post.slug,
                        destination: `/blog/${post.slug}`,
                      })
                    }
                  >
                    {post.title}
                  </a>
                </h3>
                <p className="mt-4 max-w-2xl leading-7 text-black/70">{post.summary}</p>
                <a
                  className="mt-5 inline-flex font-mono text-xs tracking-[0.1em] text-black/60 uppercase transition-colors hover:text-black focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-black"
                  href={`/blog/${post.slug}`}
                  onClick={() =>
                    trackClick({
                      sourcePageType: "section_index",
                      sourcePageSlug: page.slug,
                      targetType: "internal_page",
                      targetPageType: "blog_article",
                      targetSlug: post.slug,
                      destination: `/blog/${post.slug}`,
                    })
                  }
                >
                  Read note{" "}
                  <span className="ml-2" aria-hidden="true">
                    →
                  </span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}

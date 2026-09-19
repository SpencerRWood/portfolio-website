import { useEffect, useRef, useState } from "react";

import { trackClick, trackPageView } from "../analytics/events";
import { getHomepageContent, type HomepageContent } from "../api/client";
import { ContactForm } from "../components/ContactForm";
import { formatPublishedDate, topicName } from "../components/blog/blogMetadata";
import { TopicList } from "../components/TopicList";
import { SiteLayout } from "../components/layout/SiteLayout";

function SectionHeading({
  eyebrow,
  title,
  copy,
}: {
  eyebrow: string;
  title: string;
  copy: string;
}) {
  return (
    <div className="mb-9 md:grid md:grid-cols-[10rem_minmax(0,1fr)] md:gap-8">
      <p className="font-mono text-xs tracking-[0.16em] text-black/55 uppercase">
        {eyebrow}
      </p>
      <div className="mt-4 max-w-2xl md:mt-0">
        <h2 className="font-display text-3xl font-semibold tracking-[-0.045em] md:text-5xl">
          {title}
        </h2>
        <p className="mt-4 text-lg leading-8 text-black/75">{copy}</p>
      </div>
    </div>
  );
}

export function HomePage() {
  const [content, setContent] = useState<HomepageContent | null>(null);
  const [contentError, setContentError] = useState(false);
  const trackedPage = useRef<string | null>(null);
  const homepage = content?.homepage;

  useEffect(() => {
    void getHomepageContent()
      .then((nextContent) => {
        setContent(nextContent);
        const pageKey = `home:${nextContent.homepage.title}`;
        if (trackedPage.current !== pageKey) {
          trackedPage.current = pageKey;
          trackPageView({
            pageType: "home",
            pageSlug: "home",
            pageTitle: nextContent.homepage.title,
          });
        }
      })
      .catch(() => setContentError(true));
  }, []);

  return (
    <SiteLayout
      navigation={content?.navigation ?? []}
      topics={content?.topics ?? []}
      source={{ sourcePageType: "home", sourcePageSlug: "home" }}
    >
      <section
        id="top"
        className="grid gap-8 py-16 md:grid-cols-[minmax(0,1fr)_13rem] md:gap-16 md:py-24"
        aria-labelledby="hero-heading"
      >
        <div>
          <p className="font-mono text-xs tracking-[0.16em] text-black/55 uppercase">
            {homepage?.hero_eyebrow}
          </p>
          <h1
            id="hero-heading"
            className="font-display mt-5 max-w-4xl text-5xl leading-[0.94] font-semibold tracking-[-0.055em] md:text-7xl lg:text-8xl"
          >
            {homepage?.title}
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-8 text-black/75 md:text-xl md:leading-9">
            {homepage?.summary}
          </p>
          <a
            className="mt-9 inline-flex items-center gap-3 bg-black px-5 py-3 font-mono text-xs tracking-[0.1em] text-white uppercase transition-colors hover:bg-black/75 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
            href={homepage?.primary_link_destination ?? "/topics"}
            onClick={() =>
              trackClick({
                sourcePageType: "home",
                sourcePageSlug: "home",
                targetType: "internal_page",
                destination: homepage?.primary_link_destination ?? "/topics",
              })
            }
          >
            {homepage?.primary_link_label} <span aria-hidden="true">→</span>
          </a>
        </div>
        <aside className="border-l border-black/20 pl-5 md:self-end">
          <p className="font-mono text-[0.68rem] tracking-[0.14em] text-black/55 uppercase">
            {homepage?.aside_title}
          </p>
          <p className="mt-3 leading-7 text-black/75">{homepage?.aside_summary}</p>
        </aside>
      </section>

      <section
        id="topics"
        className="border-t border-black/20 py-12 md:py-16"
        aria-labelledby="topics-heading"
      >
        <SectionHeading
          eyebrow={homepage?.topics_eyebrow ?? ""}
          title={homepage?.topics_title ?? ""}
          copy={homepage?.topics_summary ?? ""}
        />
        <TopicList
          topics={content?.topics ?? []}
          source={{ sourcePageType: "home", sourcePageSlug: "home" }}
        />
      </section>

      <section
        id="blog"
        className="border-t border-black/20 py-12 md:py-16"
        aria-labelledby="blog-heading"
      >
        <SectionHeading
          eyebrow={homepage?.blog_eyebrow ?? ""}
          title={homepage?.blog_title ?? ""}
          copy={homepage?.blog_summary ?? ""}
        />
        <div className="border-t border-black/20">
          {(content?.blog.slice(0, 3) ?? []).map((entry) => (
            <a
              key={entry.slug}
              className="group grid gap-2 border-b border-black/15 py-6 transition-colors focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-black md:grid-cols-[11rem_minmax(0,1fr)_auto] md:items-baseline md:gap-6"
              href={`/blog/${entry.slug}`}
              onClick={() =>
                trackClick({
                  sourcePageType: "home",
                  sourcePageSlug: "home",
                  targetType: "internal_page",
                  targetPageType: "blog_article",
                  targetSlug: entry.slug,
                  destination: `/blog/${entry.slug}`,
                })
              }
            >
              <p className="font-mono text-[0.68rem] tracking-[0.1em] text-black/55 uppercase">
                <time dateTime={entry.published ?? undefined}>
                  {formatPublishedDate(entry.published)}
                </time>
                {entry.topics[0]
                  ? ` · ${topicName(entry.topics[0], content?.topics ?? [])}`
                  : null}
              </p>
              <h3 className="font-display text-xl font-medium tracking-[-0.025em] transition-colors group-hover:text-black/55 md:text-2xl">
                {entry.title}
              </h3>
              <span className="font-mono text-sm text-black/45" aria-hidden="true">
                →
              </span>
            </a>
          ))}
        </div>
        <a
          className="mt-7 inline-flex items-center gap-2 font-mono text-xs tracking-[0.1em] underline decoration-black/35 underline-offset-4 uppercase transition-colors hover:text-black/55 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-black"
          href="/blog"
          onClick={() =>
            trackClick({
              sourcePageType: "home",
              sourcePageSlug: "home",
              targetType: "internal_page",
              targetPageType: "section_index",
              targetSlug: "blog",
              destination: "/blog",
            })
          }
        >
          View all writing <span aria-hidden="true">→</span>
        </a>
      </section>

      <section
        id="projects"
        className="border-t border-black/20 py-12 md:py-16"
        aria-labelledby="projects-heading"
      >
        <SectionHeading
          eyebrow={homepage?.projects_eyebrow ?? ""}
          title={homepage?.projects_title ?? ""}
          copy={homepage?.projects_summary ?? ""}
        />
        <div className="border-t border-black/20">
          {(content?.projects.filter((project) => project.featured) ?? []).map(
            (project) => (
              <article
                key={project.slug}
                className="grid gap-4 border-b border-black/15 py-7 md:grid-cols-[minmax(0,1fr)_minmax(16rem,0.8fr)] md:gap-8"
              >
                <h3 className="font-display text-2xl font-semibold tracking-[-0.035em] md:text-3xl">
                  <a
                    className="transition-colors hover:text-black/55 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-black"
                    href={`/projects/${project.slug}`}
                    onClick={() =>
                      trackClick({
                        sourcePageType: "home",
                        sourcePageSlug: "home",
                        targetType: "internal_page",
                        targetPageType: "project",
                        targetSlug: project.slug,
                        destination: `/projects/${project.slug}`,
                      })
                    }
                  >
                    {project.title}{" "}
                    <span className="font-mono text-sm" aria-hidden="true">
                      →
                    </span>
                  </a>
                </h3>
                <p className="max-w-xl leading-7 text-black/70">{project.summary}</p>
              </article>
            ),
          )}
        </div>
        <a
          className="mt-7 inline-flex items-center gap-2 font-mono text-xs tracking-[0.1em] underline decoration-black/35 underline-offset-4 uppercase transition-colors hover:text-black/55 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-black"
          href="/projects"
          onClick={() =>
            trackClick({
              sourcePageType: "home",
              sourcePageSlug: "home",
              targetType: "internal_page",
              targetPageType: "section_index",
              targetSlug: "projects",
              destination: "/projects",
            })
          }
        >
          View all projects <span aria-hidden="true">→</span>
        </a>
        {contentError ? (
          <p className="mt-6 text-sm text-black/65" role="status">
            Content could not be loaded. Please try again later.
          </p>
        ) : null}
      </section>

      <section
        id="about"
        className="border-t border-black/20 py-12 md:grid md:grid-cols-[10rem_minmax(0,1fr)] md:gap-8 md:py-16"
      >
        <p className="font-mono text-xs tracking-[0.16em] text-black/55 uppercase">
          {homepage?.about_eyebrow}
        </p>
        <div className="mt-5 max-w-2xl md:mt-0">
          <h2 className="font-display text-3xl font-semibold tracking-[-0.045em] md:text-5xl">
            {homepage?.about_title}
          </h2>
          <p className="mt-5 text-lg leading-8 text-black/75">
            {homepage?.about_summary}
          </p>
          <a
            className="mt-6 inline-flex items-center gap-2 font-mono text-xs tracking-[0.1em] underline decoration-black/35 underline-offset-4 uppercase transition-colors hover:text-black/55 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-black"
            href="/about"
            onClick={() =>
              trackClick({
                sourcePageType: "home",
                sourcePageSlug: "home",
                targetType: "internal_page",
                targetPageType: "static_page",
                targetSlug: "about",
                destination: "/about",
              })
            }
          >
            Get in touch <span aria-hidden="true">→</span>
          </a>
        </div>
      </section>

      <section
        id="contact"
        className="border-t border-black/20 py-12 md:grid md:grid-cols-[10rem_minmax(0,1fr)] md:gap-8 md:py-16"
        aria-labelledby="contact-heading"
      >
        <p className="font-mono text-xs tracking-[0.16em] text-black/55 uppercase">
          Contact
        </p>
        <div className="mt-5 max-w-xl md:mt-0">
          <h2
            id="contact-heading"
            className="font-display text-3xl font-semibold tracking-[-0.045em] md:text-5xl"
          >
            Start a conversation.
          </h2>
          <ContactForm source={{ sourcePageType: "home", sourcePageSlug: "home" }} />
        </div>
      </section>
    </SiteLayout>
  );
}

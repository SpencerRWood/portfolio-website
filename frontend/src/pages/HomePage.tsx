import { useEffect, useRef, useState } from "react";

import {
  trackNavigation,
  trackOutboundReference,
  trackPageView,
  trackTopicEngagement,
} from "../analytics/events";
import { getHomepageContent, type HomepageContent } from "../api/client";
import { ContactForm } from "../components/ContactForm";
import { formatPublishedDate, topicName } from "../components/blog/blogMetadata";
import { TopicList } from "../components/TopicList";
import { SiteFooter } from "../components/SiteFooter";

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
  const engagedTopics = useRef(new Set<string>());
  const homepage = content?.homepage;

  useEffect(() => {
    trackPageView();
    void getHomepageContent()
      .then(setContent)
      .catch(() => setContentError(true));
  }, []);

  function trackFirstTopicEngagement(topicSlug: string) {
    if (!engagedTopics.current.has(topicSlug)) {
      engagedTopics.current.add(topicSlug);
      trackTopicEngagement(topicSlug);
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 lg:px-12">
      <header className="border-b border-black/20 py-6 md:py-8">
        <div className="flex items-center justify-between gap-5">
          <a
            className="font-mono text-xs font-medium tracking-[0.14em] uppercase transition-opacity hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
            href="#top"
          >
            {homepage?.identity}
          </a>
          <a
            className="font-mono text-[0.68rem] tracking-[0.12em] text-black/55 uppercase transition-colors hover:text-black focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-black"
            href="https://github.com/SpencerRWood"
            onClick={() => trackOutboundReference("header", "GitHub")}
          >
            GitHub ↗
          </a>
        </div>
        <nav className="mt-7 overflow-x-auto pb-1" aria-label="Primary navigation">
          <ul className="flex w-max items-center gap-x-6 font-mono text-xs tracking-[0.08em] uppercase md:gap-x-8">
            {(content?.navigation ?? []).map(({ title, destination }) => (
              <li key={destination}>
                <a
                  className="whitespace-nowrap text-black/65 transition-colors hover:text-black focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-black"
                  href={destination}
                  onClick={() => trackNavigation(destination)}
                >
                  {title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

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
              trackNavigation(homepage?.primary_link_destination ?? "/topics")
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
          onEngage={trackFirstTopicEngagement}
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
          {(content?.blog.filter((entry) => entry.featured) ?? []).map((entry) => (
            <a
              key={entry.slug}
              className="group grid gap-2 border-b border-black/15 py-6 transition-colors focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-black md:grid-cols-[11rem_minmax(0,1fr)_auto] md:items-baseline md:gap-6"
              href={`/blog/${entry.slug}`}
              onClick={() => trackNavigation(`/blog/${entry.slug}`)}
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
          onClick={() => trackNavigation("/blog")}
        >
          View all blog posts <span aria-hidden="true">→</span>
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
                    onClick={() => trackNavigation(`/projects/${project.slug}`)}
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
          onClick={() => trackNavigation("/projects")}
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
            onClick={() => trackNavigation("/about")}
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
          <ContactForm />
        </div>
      </section>
      <SiteFooter topics={content?.topics ?? []} />
    </main>
  );
}

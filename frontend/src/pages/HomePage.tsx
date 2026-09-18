import { useEffect, useRef, useState } from "react";

import {
  trackContactConversion,
  trackNavigation,
  trackOutboundReference,
  trackPageView,
  trackTopicEngagement,
} from "../analytics/events";
import { getHomepageContent, submitContact, type HomepageContent } from "../api/client";
import { TopicList } from "../components/TopicList";

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
  const [contactStatus, setContactStatus] = useState<string | null>(null);
  const [content, setContent] = useState<HomepageContent | null>(null);
  const [contentError, setContentError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const engagedTopics = useRef(new Set<string>());

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

  async function submitContactForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setIsSubmitting(true);
    setContactStatus(null);
    try {
      await submitContact({
        name: String(form.get("name") ?? ""),
        email: String(form.get("email") ?? ""),
        message: String(form.get("message") ?? ""),
      });
      event.currentTarget.reset();
      setContactStatus("Thanks — your message has been sent.");
      trackContactConversion();
    } catch {
      setContactStatus("Your message could not be sent. Please try again later.");
    } finally {
      setIsSubmitting(false);
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
            Spencer Wood
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
            {[
              ["Topics", "topics"],
              ["Writing", "writing"],
              ["Projects", "projects"],
              ["About", "about"],
            ].map(([label, destination]) => (
              <li key={destination}>
                <a
                  className="whitespace-nowrap text-black/65 transition-colors hover:text-black focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-black"
                  href={`#${destination}`}
                  onClick={() => trackNavigation(destination)}
                >
                  {label}
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
            Notes and working examples
          </p>
          <h1
            id="hero-heading"
            className="font-display mt-5 max-w-4xl text-5xl leading-[0.94] font-semibold tracking-[-0.055em] md:text-7xl lg:text-8xl"
          >
            How analytical systems are built
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-8 text-black/75 md:text-xl md:leading-9">
            Notes, examples, and working projects on how data moves from collection and
            modeling through analysis, machine learning, and reporting.
          </p>
          <a
            className="mt-9 inline-flex items-center gap-3 bg-black px-5 py-3 font-mono text-xs tracking-[0.1em] text-white uppercase transition-colors hover:bg-black/75 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
            href="#topics"
            onClick={() => trackNavigation("topics")}
          >
            Explore topics <span aria-hidden="true">→</span>
          </a>
        </div>
        <aside className="border-l border-black/20 pl-5 md:self-end">
          <p className="font-mono text-[0.68rem] tracking-[0.14em] text-black/55 uppercase">
            Topics
          </p>
          <p className="mt-3 leading-7 text-black/75">
            Data systems, modeling, analysis, machine learning, and communication.
          </p>
        </aside>
      </section>

      <section
        id="topics"
        className="border-t border-black/20 py-12 md:py-16"
        aria-labelledby="topics-heading"
      >
        <SectionHeading
          eyebrow="01 / Topics"
          title="Topics"
          copy="A few areas I keep coming back to."
        />
        <TopicList
          topics={content?.topics ?? []}
          onEngage={trackFirstTopicEngagement}
        />
      </section>

      <section
        id="writing"
        className="border-t border-black/20 py-12 md:py-16"
        aria-labelledby="writing-heading"
      >
        <SectionHeading
          eyebrow="02 / Writing"
          title="Selected writing"
          copy="A few deeper pieces on specific problems."
        />
        <div className="border-t border-black/20">
          {(content?.writing.filter((entry) => entry.featured) ?? []).map((entry) => (
            <a
              key={entry.slug}
              className="flex items-center justify-between gap-6 border-b border-black/15 py-5 font-display text-xl font-medium tracking-[-0.025em] transition-colors hover:text-black/55 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-black md:text-2xl"
              href="#writing"
              onClick={() => trackNavigation("writing")}
            >
              {entry.title}{" "}
              <span className="font-mono text-sm text-black/45" aria-hidden="true">
                →
              </span>
            </a>
          ))}
        </div>
        <a
          className="mt-7 inline-flex items-center gap-2 font-mono text-xs tracking-[0.1em] underline decoration-black/35 underline-offset-4 uppercase transition-colors hover:text-black/55 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-black"
          href="#writing"
          onClick={() => trackNavigation("writing")}
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
          eyebrow="03 / Projects"
          title="Projects"
          copy="Working examples tied to the topics above."
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
                    href={project.repository ?? "#projects"}
                    onClick={() => trackOutboundReference("projects", project.title)}
                  >
                    {project.title}{" "}
                    <span className="font-mono text-sm" aria-hidden="true">
                      ↗
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
          href="https://github.com/SpencerRWood"
          onClick={() => trackOutboundReference("projects", "View all projects")}
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
          04 / About
        </p>
        <div className="mt-5 max-w-2xl md:mt-0">
          <h2 className="font-display text-3xl font-semibold tracking-[-0.045em] md:text-5xl">
            About
          </h2>
          <p className="mt-5 text-lg leading-8 text-black/75">
            I’m Spencer Wood. I work on analytics, data systems, and applied machine
            learning. This site is where I write down the parts I think are useful and
            keep working examples alongside them.
          </p>
          <a
            className="mt-6 inline-flex items-center gap-2 font-mono text-xs tracking-[0.1em] underline decoration-black/35 underline-offset-4 uppercase transition-colors hover:text-black/55 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-black"
            href="#contact"
            onClick={() => trackNavigation("contact")}
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
          <form className="mt-8 space-y-5" onSubmit={submitContactForm}>
            <p>
              <label
                className="font-mono text-[0.68rem] tracking-[0.12em] text-black/60 uppercase"
                htmlFor="contact-name"
              >
                Name
              </label>
              <input
                className="mt-2 block w-full border-b border-black/30 bg-transparent px-0 py-3 outline-none transition-colors focus:border-black"
                id="contact-name"
                name="name"
                required
                maxLength={120}
              />
            </p>
            <p>
              <label
                className="font-mono text-[0.68rem] tracking-[0.12em] text-black/60 uppercase"
                htmlFor="contact-email"
              >
                Email
              </label>
              <input
                className="mt-2 block w-full border-b border-black/30 bg-transparent px-0 py-3 outline-none transition-colors focus:border-black"
                id="contact-email"
                name="email"
                type="email"
                required
                maxLength={254}
              />
            </p>
            <p>
              <label
                className="font-mono text-[0.68rem] tracking-[0.12em] text-black/60 uppercase"
                htmlFor="contact-message"
              >
                Message
              </label>
              <textarea
                className="mt-2 block min-h-28 w-full resize-y border-b border-black/30 bg-transparent px-0 py-3 outline-none transition-colors focus:border-black"
                id="contact-message"
                name="message"
                required
                maxLength={5000}
              />
            </p>
            <button
              className="inline-flex items-center gap-3 bg-black px-5 py-3 font-mono text-xs tracking-[0.1em] text-white uppercase transition-colors hover:bg-black/75 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black disabled:cursor-not-allowed disabled:bg-black/45"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending…" : "Send message"}{" "}
              <span aria-hidden="true">↗</span>
            </button>
          </form>
          {contactStatus ? (
            <p className="mt-5 border-l-2 border-black pl-3 text-sm" role="status">
              {contactStatus}
            </p>
          ) : null}
        </div>
      </section>
    </main>
  );
}

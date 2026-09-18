import { useEffect, useRef, useState } from "react";

import {
  trackContactConversion,
  trackNavigation,
  trackOutboundReference,
  trackPageView,
  trackSectionEngagement,
} from "../analytics/events";
import { requestBackend, submitContact } from "../api/client";
import { PortfolioSection } from "../components/PortfolioSection";
import { portfolioSections } from "../content/sections";

export function HomePage() {
  const [healthStatus, setHealthStatus] = useState<string | null>(null);
  const [contactStatus, setContactStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const engagedSections = useRef(new Set<string>());

  useEffect(() => {
    trackPageView();
  }, []);

  function trackFirstSectionEngagement(sectionSlug: string) {
    if (!engagedSections.current.has(sectionSlug)) {
      engagedSections.current.add(sectionSlug);
      trackSectionEngagement(sectionSlug);
    }
  }

  async function checkBackendHealth() {
    setHealthStatus("Checking backend health…");
    try {
      const response = await requestBackend();
      setHealthStatus(`Backend status: ${response.status}`);
    } catch {
      setHealthStatus("Backend health check failed.");
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
            Spencer Wood / Portfolio
          </a>
          <span className="font-mono text-[0.68rem] tracking-[0.12em] text-black/55 uppercase">
            Analytics systems
          </span>
        </div>
        <nav className="mt-7 overflow-x-auto pb-1" aria-label="Primary navigation">
          <ul className="flex w-max items-center gap-x-5 gap-y-2 font-mono text-xs tracking-[0.08em] uppercase md:gap-x-7">
            {portfolioSections.map((section) => (
              <li key={section.slug}>
                <a
                  className="whitespace-nowrap text-black/65 transition-colors hover:text-black focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-black"
                  href={`#${section.slug}`}
                  onClick={() => trackNavigation(section.slug)}
                >
                  {section.title}
                </a>
              </li>
            ))}
            <li>
              <a
                className="whitespace-nowrap text-black/65 transition-colors hover:text-black focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-black"
                href="#about"
                onClick={() => trackNavigation("about")}
              >
                About
              </a>
            </li>
            <li>
              <a
                className="whitespace-nowrap text-black/65 transition-colors hover:text-black focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-black"
                href="#contact"
                onClick={() => trackNavigation("contact")}
              >
                Contact
              </a>
            </li>
          </ul>
        </nav>
      </header>
      <section
        id="top"
        className="grid gap-8 py-16 md:grid-cols-[minmax(0,1fr)_13rem] md:gap-16 md:py-24"
        aria-labelledby="lifecycle-heading"
      >
        <div>
          <p className="font-mono text-xs tracking-[0.16em] text-black/55 uppercase">
            An analytical portfolio
          </p>
          <h1
            id="lifecycle-heading"
            className="font-display mt-5 max-w-4xl text-5xl leading-[0.94] font-semibold tracking-[-0.055em] md:text-7xl lg:text-8xl"
          >
            Systems for turning data into better decisions.
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-8 text-black/75 md:text-xl md:leading-9">
            An end-to-end analytics lifecycle: from the events systems create to the
            evidence people use to act.
          </p>
          <a
            className="mt-9 inline-flex items-center gap-3 bg-black px-5 py-3 font-mono text-xs tracking-[0.1em] text-white uppercase transition-colors hover:bg-black/75 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
            href="#data-generation"
            onClick={() => trackNavigation("data-generation")}
          >
            Explore the lifecycle <span aria-hidden="true">↓</span>
          </a>
        </div>
        <aside className="border-l border-black/20 pl-5 md:self-end">
          <p className="font-mono text-[0.68rem] tracking-[0.14em] text-black/55 uppercase">
            Scope
          </p>
          <p className="mt-3 leading-7 text-black/75">
            Product instrumentation, analytical data platforms, modeling, reporting, and
            machine learning.
          </p>
        </aside>
      </section>
      {portfolioSections.map((section, index) => (
        <PortfolioSection
          key={section.slug}
          index={index}
          section={section}
          onEngage={trackFirstSectionEngagement}
          onOutboundReference={trackOutboundReference}
        />
      ))}
      <section
        id="about"
        className="border-t border-black/20 py-12 md:grid md:grid-cols-[10rem_minmax(0,1fr)] md:gap-8 md:py-16"
      >
        <p className="font-mono text-xs tracking-[0.16em] text-black/55 uppercase">
          About
        </p>
        <div className="mt-5 max-w-2xl md:mt-0">
          <h2 className="font-display text-3xl font-semibold tracking-[-0.045em] md:text-5xl">
            Clear systems make better work possible.
          </h2>
          <p className="mt-5 text-lg leading-8 text-black/75">
            Portfolio work focused on clear, durable analytical systems: useful data
            contracts, trustworthy models, and communication people can act on.
          </p>
        </div>
      </section>
      <section
        id="contact"
        className="border-t border-black/20 py-12 md:grid md:grid-cols-[10rem_minmax(0,1fr)] md:gap-8 md:py-16"
      >
        <p className="font-mono text-xs tracking-[0.16em] text-black/55 uppercase">
          Contact
        </p>
        <div className="mt-5 max-w-xl md:mt-0">
          <h2 className="font-display text-3xl font-semibold tracking-[-0.045em] md:text-5xl">
            Start a conversation.
          </h2>
          <p className="mt-4 leading-7 text-black/75">
            For a project, an analytical problem, or a useful exchange of ideas.
          </p>
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
      <section className="border-t border-black/20 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="font-mono text-[0.68rem] tracking-[0.12em] text-black/55 uppercase">
            Application status
          </p>
          <button
            className="border border-black/25 px-3 py-2 font-mono text-xs tracking-[0.08em] uppercase transition-colors hover:bg-black hover:text-white focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-black"
            type="button"
            onClick={checkBackendHealth}
          >
            Check backend health
          </button>
        </div>
        {healthStatus ? (
          <p className="mt-4 text-sm text-black/70" role="status">
            {healthStatus}
          </p>
        ) : null}
      </section>
    </main>
  );
}

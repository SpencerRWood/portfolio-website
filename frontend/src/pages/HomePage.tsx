import { useState } from "react";

import { requestBackend, submitContact } from "../api/client";
import { PortfolioSection } from "../components/PortfolioSection";
import { portfolioSections } from "../content/sections";

export function HomePage() {
  const [healthStatus, setHealthStatus] = useState<string | null>(null);
  const [contactStatus, setContactStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    } catch {
      setContactStatus("Your message could not be sent. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main>
      <header>
        <h1>Portfolio Website</h1>
        <p>
          An end-to-end analytics lifecycle: from how data is generated to how decisions
          are presented.
        </p>
        <nav aria-label="Primary navigation">
          <ul>
            {portfolioSections.map((section) => (
              <li key={section.slug}>
                <a href={`#${section.slug}`}>{section.title}</a>
              </li>
            ))}
            <li>
              <a href="#about">About</a>
            </li>
            <li>
              <a href="#contact">Contact</a>
            </li>
          </ul>
        </nav>
      </header>
      <section aria-labelledby="lifecycle-heading">
        <h2 id="lifecycle-heading">The analytics lifecycle</h2>
        <p>
          Each section explains a concept, its workflow, implementation choices, and
          supporting reference implementations.
        </p>
      </section>
      {portfolioSections.map((section) => (
        <PortfolioSection key={section.slug} section={section} />
      ))}
      <section id="about">
        <h2>About</h2>
        <p>Portfolio work focused on clear, durable analytical systems.</p>
      </section>
      <section id="contact">
        <h2>Contact</h2>
        <form onSubmit={submitContactForm}>
          <p>
            <label htmlFor="contact-name">Name</label>
            <input id="contact-name" name="name" required maxLength={120} />
          </p>
          <p>
            <label htmlFor="contact-email">Email</label>
            <input
              id="contact-email"
              name="email"
              type="email"
              required
              maxLength={254}
            />
          </p>
          <p>
            <label htmlFor="contact-message">Message</label>
            <textarea id="contact-message" name="message" required maxLength={5000} />
          </p>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Sending…" : "Send message"}
          </button>
        </form>
        {contactStatus ? <p role="status">{contactStatus}</p> : null}
      </section>
      <button type="button" onClick={checkBackendHealth}>
        Check backend health
      </button>
      {healthStatus ? <p role="status">{healthStatus}</p> : null}
    </main>
  );
}

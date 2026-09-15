import { useState } from "react";

import { requestBackend } from "../api/client";
import { PortfolioSection } from "../components/PortfolioSection";
import { portfolioSections } from "../content/sections";

export function HomePage() {
  const [healthStatus, setHealthStatus] = useState<string | null>(null);

  async function checkBackendHealth() {
    setHealthStatus("Checking backend health…");
    try {
      const response = await requestBackend();
      setHealthStatus(`Backend status: ${response.status}`);
    } catch {
      setHealthStatus("Backend health check failed.");
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
        <p>Contact options will be added in the dedicated lead-capture story.</p>
      </section>
      <button type="button" onClick={checkBackendHealth}>
        Check backend health
      </button>
      {healthStatus ? <p role="status">{healthStatus}</p> : null}
    </main>
  );
}

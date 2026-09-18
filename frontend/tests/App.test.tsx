import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("../src/api/client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../src/api/client")>();
  return {
    ...actual,
    getHomepageContent: vi.fn().mockResolvedValue({
      topics: [
        {
          title: "Data Generation",
          slug: "data-generation",
          summary: "How applications create analytical data.",
        },
      ],
      blog: [
        {
          title: "Designing events as data contracts",
          slug: "designing-events-as-data-contracts",
          featured: true,
        },
      ],
      projects: [
        {
          title: "Synthetic Website Analytics Platform",
          slug: "synthetic-website-analytics",
          summary: "A simulated website analytics system.",
          repository:
            "https://github.com/SpencerRWood/synthetic-website-analytics-platform",
          featured: true,
        },
      ],
      homepage: {
        identity: "Spencer Wood",
        hero_eyebrow: "Notes",
        title: "How analytical systems are built",
        summary: "Notes.",
        primary_link_label: "Explore topics",
        primary_link_destination: "topics",
        aside_title: "Topics",
        aside_summary: "Data systems.",
        topics_eyebrow: "01 / Topics",
        topics_title: "Topics",
        topics_summary: "A few areas.",
        blog_eyebrow: "02 / Blog",
        blog_title: "Blog",
        blog_summary: "Pieces.",
        projects_eyebrow: "03 / Projects",
        projects_title: "Projects",
        projects_summary: "Examples.",
        about_eyebrow: "04 / About",
        about_title: "About",
        about_summary: "About Spencer Wood.",
      },
      navigation: [
        { title: "Topics", destination: "topics", order: 1 },
        { title: "Blog", destination: "/blog", order: 2 },
        { title: "Projects", destination: "projects", order: 3 },
        { title: "Contact", destination: "/contact", order: 4 },
        { title: "About", destination: "about", order: 5 },
      ],
    }),
    getSiteNavigation: vi
      .fn()
      .mockResolvedValue([{ title: "Topics", destination: "/topics", order: 1 }]),
    getFooterNavigation: vi.fn().mockResolvedValue({
      topics_title: "Topics",
      items: [
        { title: "Blog", destination: "/blog", order: 1 },
        { title: "Projects", destination: "/projects", order: 2 },
        { title: "Contact", destination: "/contact", order: 3 },
        { title: "About", destination: "/about", order: 4 },
      ],
    }),
    getSitePage: vi.fn().mockResolvedValue({
      title: "Topics",
      slug: "topics",
      summary: "A few areas.",
      body_html: "<p>Topic index.</p>",
    }),
    getContentIndex: vi.fn().mockResolvedValue([
      {
        title: "Data Modeling",
        slug: "data-modeling",
        summary: "How data is represented.",
      },
    ]),
    getContentPage: vi.fn().mockResolvedValue({
      title: "Data Modeling",
      slug: "data-modeling",
      summary: "How data is represented.",
      body_html: "<p>Article body.</p>",
    }),
  };
});

import { App } from "../src/App";

describe("App", () => {
  it("renders the application shell", async () => {
    render(<App />);

    expect(
      await screen.findByRole("heading", {
        name: "How analytical systems are built",
      }),
    ).toBeInTheDocument();
  });

  it("uses topic-centric primary navigation", async () => {
    render(<App />);

    await screen.findByRole("heading", { name: "How analytical systems are built" });
    const navigation = screen.getByRole("navigation", {
      name: "Primary navigation",
    });
    expect(navigation).toHaveTextContent("Topics");
    expect(navigation).toHaveTextContent("Blog");
    expect(navigation).toHaveTextContent("Projects");
    expect(navigation).toHaveTextContent("Contact");
    expect(navigation).toHaveTextContent("About");
    expect(document.body).not.toHaveTextContent(/portfolio/i);
  });

  it("renders content supplied by the backend", async () => {
    render(<App />);

    expect((await screen.findAllByText("Data Generation"))[0]).toBeInTheDocument();
    expect(
      await screen.findByText("Designing events as data contracts"),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Synthetic Website Analytics Platform"),
    ).toBeInTheDocument();
  });

  it("includes an expanded footer with individual topic links", async () => {
    render(<App />);

    const footer = await screen.findByRole("navigation", { name: "Footer navigation" });
    expect(footer).toHaveTextContent("Topics");
    expect(footer).toHaveTextContent("Blog");
    expect(
      within(footer).getByRole("link", { name: "Data Generation" }),
    ).toHaveAttribute("href", "/topics/data-generation");
  });

  it("routes topic indexes and topic articles to dedicated pages", async () => {
    window.history.pushState({}, "", "/topics");
    const { unmount } = render(<App />);
    expect(await screen.findByRole("heading", { name: "Topics" })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Data Modeling" })[0]).toHaveAttribute(
      "href",
      "/topics/data-modeling",
    );
    unmount();

    window.history.pushState({}, "", "/topics/data-modeling");
    render(<App />);
    expect(await screen.findByText("Article body.")).toBeInTheDocument();
    window.history.pushState({}, "", "/");
  });

  it("uses an editorial post listing for the blog index", async () => {
    window.history.pushState({}, "", "/blog");
    render(<App />);

    expect(await screen.findByText("Latest post")).toBeInTheDocument();
    expect(
      within(screen.getByRole("region", { name: "Blog posts" })).getByRole("link", {
        name: "Data Modeling",
      }),
    ).toHaveAttribute("href", "/blog/data-modeling");
    window.history.pushState({}, "", "/");
  });
});

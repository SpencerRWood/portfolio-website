import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("../src/api/client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../src/api/client")>();
  return {
    ...actual,
    getHomepageContent: vi.fn().mockResolvedValue({
      areas: [
        {
          title: "Data Generation",
          group: "Analytics",
          order: 10,
          slug: "data-generation",
          summary: "How applications create analytical data.",
        },
        {
          title: "Systems & Infrastructure",
          slug: "systems-infrastructure",
          summary: "How operational systems fit together.",
          group: "Engineering",
          order: 10,
        },
      ],
      blog: [
        {
          title: "Designing events as data contracts",
          slug: "designing-events-as-data-contracts",
          areas: ["data-generation"],
          published: "2026-09-18",
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
        primary_link_label: "Explore Topics",
        primary_link_destination: "/topics",
        aside_title: "Topics",
        aside_summary: "Data systems.",
        areas_eyebrow: "01 / Topics",
        areas_title: "Topics",
        areas_summary: "A few areas.",
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
        { title: "Topics", destination: "/topics", order: 1 },
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
      areas_title: "Topics",
      items: [
        { title: "Blog", destination: "/blog", order: 1 },
        { title: "Projects", destination: "/projects", order: 2 },
        { title: "Contact", destination: "/contact", order: 3 },
        { title: "About", destination: "/about", order: 4 },
      ],
    }),
    getSitePage: vi.fn().mockResolvedValue({
      title: "Topics",
      slug: "areas",
      summary: "A few areas.",
      body_html: "<p>Topics index.</p>",
    }),
    getContentIndex: vi.fn().mockResolvedValue([
      {
        title: "Data Modeling",
        group: "Analytics",
        order: 30,
        slug: "data-modeling",
        summary: "How data is represented.",
        areas: ["data-modeling"],
        published: "2026-09-18",
      },
      {
        title: "Systems & Infrastructure",
        slug: "systems-infrastructure",
        summary: "How operational systems fit together.",
        group: "Engineering",
        order: 10,
        areas: [],
        published: null,
      },
    ]),
    getContentPage: vi.fn().mockResolvedValue({
      section: "areas",
      related_content: [],
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

  it("uses area-centric primary navigation", async () => {
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

  it("includes an expanded footer with individual area links", async () => {
    render(<App />);

    const footer = await screen.findByRole("navigation", { name: "Footer navigation" });
    expect(footer).toHaveTextContent("Topics");
    expect(footer).toHaveTextContent("Blog");
    expect(
      within(footer).getByRole("link", { name: "Data Generation" }),
    ).toHaveAttribute("href", "/topics/data-generation");
  });

  it("routes area indexes and area articles to dedicated pages", async () => {
    window.history.pushState({}, "", "/topics");
    const { unmount } = render(<App />);
    expect(await screen.findByRole("heading", { name: "Topics" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Analytics" })).toHaveTextContent(
      "Data Modeling",
    );
    expect(screen.getByRole("region", { name: "Engineering" })).toHaveTextContent(
      "Systems & Infrastructure",
    );
    expect(screen.getAllByRole("link", { name: "Data Modeling" })[0]).toHaveAttribute(
      "href",
      "/topics/data-modeling",
    );
    unmount();

    window.history.pushState({}, "", "/topics/data-modeling");
    render(<App />);
    expect(await screen.findByText("Article body.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "← Topics" })).toHaveAttribute(
      "href",
      "/topics",
    );
    window.history.pushState({}, "", "/");
  });

  it("groups homepage areas into Analytics and Engineering", async () => {
    render(<App />);
    await screen.findByRole("heading", { name: "How analytical systems are built" });
    expect(screen.getByRole("region", { name: "Analytics" })).toHaveTextContent(
      "Data Generation",
    );
    expect(screen.getByRole("region", { name: "Engineering" })).toHaveTextContent(
      "Systems & Infrastructure",
    );
  });

  it.each(["/areas", "/areas/data-modeling"])(
    "rejects the retired route %s",
    (path) => {
      window.history.pushState({}, "", path);
      render(<App />);
      expect(
        screen.getByRole("heading", { name: "Page not found" }),
      ).toBeInTheDocument();
      window.history.pushState({}, "", "/");
    },
  );

  it("uses an editorial post listing for the blog index", async () => {
    window.history.pushState({}, "", "/blog");
    render(<App />);

    expect(await screen.findByText("Featured note")).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: "Writing Topics" }),
    ).toHaveTextContent("Data Modeling");
    expect(
      within(screen.getAllByRole("heading", { name: "Data Modeling" })[0]).getByRole(
        "link",
        { name: "Data Modeling" },
      ),
    ).toHaveAttribute("href", "/blog/data-modeling");
    window.history.pushState({}, "", "/");
  });
});

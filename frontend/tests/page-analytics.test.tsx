import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getContentIndex: vi.fn(),
  getContentPage: vi.fn(),
  getFooterNavigation: vi.fn(),
  getHomepageContent: vi.fn(),
  getSiteNavigation: vi.fn(),
  getSitePage: vi.fn(),
  trackPageView: vi.fn(),
  trackClick: vi.fn(),
}));

vi.mock("../src/api/client", () => ({
  contentSectionPath: (section: string) => (section === "areas" ? "topics" : section),
  getContentIndex: mocks.getContentIndex,
  getContentPage: mocks.getContentPage,
  getFooterNavigation: mocks.getFooterNavigation,
  getHomepageContent: mocks.getHomepageContent,
  getSiteNavigation: mocks.getSiteNavigation,
  getSitePage: mocks.getSitePage,
}));

vi.mock("../src/analytics/events", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../src/analytics/events")>()),
  trackPageView: mocks.trackPageView,
  trackClick: mocks.trackClick,
}));

import { ArticlePage, SectionIndexPage, StaticPage } from "../src/pages/ContentPages";
import { HomePage } from "../src/pages/HomePage";

function contentPage(
  section: "areas" | "blog" | "projects",
  slug: string,
  title: string,
) {
  return {
    title,
    slug,
    section,
    summary: "A test page.",
    body_html: "<p>Article body.</p>",
    order: 1,
    areas: [],
    related_content: [],
    nav: false,
    featured: false,
    published: section === "blog" ? "2026-09-18" : null,
    repository: null,
    group: section === "areas" ? "Analytics" : null,
  };
}

function sitePage(slug: string, title: string) {
  return {
    title,
    slug,
    summary: "A test index.",
    body_html: "<p>Page body.</p>",
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getContentIndex.mockResolvedValue([]);
  mocks.getFooterNavigation.mockResolvedValue({ areas_title: "Topics", items: [] });
  mocks.getSiteNavigation.mockResolvedValue([]);
});

describe("content-driven page analytics", () => {
  it.each([
    ["areas", "area", "blog", "blog_article", "Related Writing"],
    ["areas", "area", "projects", "project", "Related Projects"],
    ["blog", "blog_article", "areas", "area", "Related Topics"],
    ["projects", "project", "areas", "area", "Related Topics"],
  ] as const)(
    "renders and tracks %s relationships to %s",
    async (section, sourceType, targetSection, targetType, label) => {
      mocks.getContentPage.mockResolvedValue({
        ...contentPage(section, "source", "Source page"),
        related_content: [
          {
            title: "Related page",
            slug: "target",
            section: targetSection,
            summary: "A related summary.",
          },
        ],
      });
      render(<ArticlePage section={section} path={section} slug="source" />);
      const region = await screen.findByRole("region", { name: label });
      const link = within(region).getByRole("link", { name: "Related page" });
      const targetPath = targetSection === "areas" ? "topics" : targetSection;
      expect(link).toHaveAttribute("href", `/${targetPath}/target`);
      expect(region).toHaveTextContent("A related summary.");
      fireEvent.click(link);
      expect(mocks.trackClick).toHaveBeenCalledWith({
        sourcePageType: sourceType,
        sourcePageSlug: "source",
        targetType: "internal_page",
        targetPageType: targetType,
        targetSlug: "target",
        destination: `/${targetPath}/target`,
      });
    },
  );

  it.each([
    [
      "blog",
      "blog_article",
      "simulating-realistic-website-traffic",
      "Simulating realistic website traffic",
    ],
    ["areas", "area", "data-generation", "Data Generation"],
    ["projects", "project", "wood-reports", "Wood Reports"],
  ] as const)(
    "tracks loaded %s content metadata",
    async (section, pageType, slug, title) => {
      mocks.getContentPage.mockResolvedValue(contentPage(section, slug, title));

      render(<ArticlePage section={section} path={section} slug={slug} />);

      await screen.findByText(title);
      await waitFor(() =>
        expect(mocks.trackPageView).toHaveBeenCalledWith({
          pageType,
          pageSlug: slug,
          pageTitle: title,
          section,
        }),
      );
      expect(mocks.trackPageView).toHaveBeenCalledTimes(1);
    },
  );

  it("tracks loaded section-index metadata", async () => {
    mocks.getSitePage.mockResolvedValue(sitePage("blog", "Writing"));

    render(<SectionIndexPage section="blog" path="blog" />);

    await screen.findByText("Writing");
    await waitFor(() =>
      expect(mocks.trackPageView).toHaveBeenCalledWith({
        pageType: "section_index",
        pageSlug: "blog",
        pageTitle: "Writing",
        section: "blog",
      }),
    );
  });

  it("tracks loaded static-page metadata", async () => {
    mocks.getSitePage.mockResolvedValue(sitePage("about", "About Spencer Wood"));

    render(<StaticPage slug="about" />);

    await screen.findByText("About Spencer Wood");
    await waitFor(() =>
      expect(mocks.trackPageView).toHaveBeenCalledWith({
        pageType: "static_page",
        pageSlug: "about",
        pageTitle: "About Spencer Wood",
      }),
    );
  });

  it("tracks the homepage only after its authored metadata loads", async () => {
    mocks.getHomepageContent.mockResolvedValue({
      homepage: {
        identity: "Spencer Wood",
        hero_eyebrow: "Notes",
        title: "How analytical systems are built",
        summary: "Notes.",
        primary_link_label: "Explore Topics",
        primary_link_destination: "/topics",
        aside_title: "Topics",
        aside_summary: "Data systems.",
        areas_eyebrow: "Topics",
        areas_title: "Topics",
        areas_summary: "A few areas.",
        blog_eyebrow: "Writing",
        blog_title: "Selected writing",
        blog_summary: "Notes.",
        projects_eyebrow: "Projects",
        projects_title: "Projects",
        projects_summary: "Examples.",
        about_eyebrow: "About",
        about_title: "About",
        about_summary: "About Spencer Wood.",
      },
      areas: [],
      blog: [],
      projects: [],
      navigation: [],
    });

    render(<HomePage />);

    await screen.findByText("How analytical systems are built");
    await waitFor(() =>
      expect(mocks.trackPageView).toHaveBeenCalledWith({
        pageType: "home",
        pageSlug: "home",
        pageTitle: "How analytical systems are built",
      }),
    );
  });
});

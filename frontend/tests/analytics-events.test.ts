import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const rudder = vi.hoisted(() => ({
  client: {
    load: vi.fn(),
    page: vi.fn(),
    track: vi.fn(),
  },
  RudderAnalytics: vi.fn(),
}));

vi.mock("@rudderstack/analytics-js", () => ({
  RudderAnalytics: rudder.RudderAnalytics,
}));

async function loadEvents() {
  return import("../src/analytics/events");
}

describe("analytics event serialization", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    rudder.RudderAnalytics.mockImplementation(function RudderAnalytics() {
      return rudder.client;
    });
    vi.stubEnv("VITE_RUDDERSTACK_WRITE_KEY", "test-write-key");
    vi.stubEnv("VITE_RUDDERSTACK_DATA_PLANE_URL", "https://analytics.example.com");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("converts content-aware page views to RudderStack snake_case properties", async () => {
    const { trackPageView } = await loadEvents();

    trackPageView({
      pageType: "blog_article",
      pageSlug: "simulating-realistic-website-traffic",
      pageTitle: "Simulating realistic website traffic",
      section: "blog",
    });

    expect(rudder.client.page).toHaveBeenCalledWith("site", "page_view", {
      page_type: "blog_article",
      page_slug: "simulating-realistic-website-traffic",
      page_title: "Simulating realistic website traffic",
      section: "blog",
    });
  });

  it("omits section when it is not meaningful", async () => {
    const { trackPageView } = await loadEvents();

    trackPageView({
      pageType: "home",
      pageSlug: "home",
      pageTitle: "How analytical systems are built",
    });

    expect(rudder.client.page).toHaveBeenCalledWith("site", "page_view", {
      page_type: "home",
      page_slug: "home",
      page_title: "How analytical systems are built",
    });
  });

  it("serializes internal and external clicks without empty optional properties", async () => {
    const { trackClick } = await loadEvents();

    trackClick({
      sourcePageType: "section_index",
      sourcePageSlug: "blog",
      targetType: "internal_page",
      targetPageType: "blog_article",
      targetSlug: "simulating-realistic-website-traffic",
      destination: "/blog/simulating-realistic-website-traffic",
    });
    trackClick({
      sourcePageType: "project",
      sourcePageSlug: "wood-reports",
      targetType: "external_reference",
      referenceType: "repository",
      destination: "https://github.com/SpencerRWood/wood-reports",
    });

    expect(rudder.client.track).toHaveBeenNthCalledWith(1, "click", {
      source_page_type: "section_index",
      source_page_slug: "blog",
      target_type: "internal_page",
      target_page_type: "blog_article",
      target_slug: "simulating-realistic-website-traffic",
      destination: "/blog/simulating-realistic-website-traffic",
    });
    expect(rudder.client.track).toHaveBeenNthCalledWith(2, "click", {
      source_page_type: "project",
      source_page_slug: "wood-reports",
      target_type: "external_reference",
      reference_type: "repository",
      destination: "https://github.com/SpencerRWood/wood-reports",
    });
  });

  it("serializes successful form submission and conversion", async () => {
    const { trackConversion, trackFormSubmit } = await loadEvents();

    trackFormSubmit({
      formType: "contact",
      status: "success",
      sourcePageType: "static_page",
      sourcePageSlug: "contact",
    });
    trackConversion({
      conversionType: "contact_lead",
      sourcePageType: "static_page",
      sourcePageSlug: "contact",
    });

    expect(rudder.client.track).toHaveBeenNthCalledWith(1, "form_submit", {
      form_type: "contact",
      status: "success",
      source_page_type: "static_page",
      source_page_slug: "contact",
    });
    expect(rudder.client.track).toHaveBeenNthCalledWith(2, "conversion", {
      conversion_type: "contact_lead",
      source_page_type: "static_page",
      source_page_slug: "contact",
    });
  });
});

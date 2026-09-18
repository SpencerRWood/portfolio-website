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

describe("trackPageView", () => {
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

    expect(rudder.client.page).toHaveBeenCalledWith("site", "blog_article", {
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

    expect(rudder.client.page).toHaveBeenCalledWith("site", "home", {
      page_type: "home",
      page_slug: "home",
      page_title: "How analytical systems are built",
    });
  });
});

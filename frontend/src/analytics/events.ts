import { RudderAnalytics } from "@rudderstack/analytics-js";

/**
 * Application-owned event contract. Properties use stable, snake_case keys so
 * downstream dbt models can use the raw event stream without parsing UI text.
 * Contact names, emails, and messages are intentionally never sent here.
 */
export const analyticsEvent = {
  navigationSelected: "site_navigation_selected",
  topicEngaged: "topic_engaged",
  outboundReferenceSelected: "site_outbound_reference_selected",
  contactSubmitted: "site_contact_submitted",
} as const;

type EventProperties = Record<string, string>;

export type PageType =
  "home" | "section_index" | "blog_article" | "topic" | "project" | "static_page";

export interface PageViewProperties {
  pageType: PageType;
  pageSlug: string;
  pageTitle: string;
  section?: "topics" | "blog" | "projects";
}

interface AnalyticsClient {
  load(writeKey: string, dataPlaneUrl: string): void;
  page(category: string, name: string, properties: EventProperties): void;
  track(name: string, properties: EventProperties): void;
}

const writeKey = import.meta.env.VITE_RUDDERSTACK_WRITE_KEY;
const dataPlaneUrl = import.meta.env.VITE_RUDDERSTACK_DATA_PLANE_URL;
const client: AnalyticsClient | null =
  writeKey && dataPlaneUrl ? new RudderAnalytics() : null;

if (client && writeKey && dataPlaneUrl) {
  client.load(writeKey, dataPlaneUrl);
}

function track(name: string, properties: EventProperties): void {
  client?.track(name, properties);
}

export function trackPageView({
  pageType,
  pageSlug,
  pageTitle,
  section,
}: PageViewProperties): void {
  client?.page("site", pageType, {
    page_type: pageType,
    page_slug: pageSlug,
    page_title: pageTitle,
    ...(section ? { section } : {}),
  });
}

export function trackNavigation(destination: string): void {
  track(analyticsEvent.navigationSelected, { destination });
}

export function trackTopicEngagement(topicSlug: string): void {
  track(analyticsEvent.topicEngaged, { topic_slug: topicSlug });
}

export function trackOutboundReference(
  sectionSlug: string,
  referenceLabel: string,
): void {
  track(analyticsEvent.outboundReferenceSelected, {
    reference_label: referenceLabel,
    section_slug: sectionSlug,
  });
}

export function trackContactConversion(): void {
  track(analyticsEvent.contactSubmitted, { conversion_type: "contact_form" });
}

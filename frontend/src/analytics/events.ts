import { RudderAnalytics } from "@rudderstack/analytics-js";

/**
 * Application-owned event contract. Properties use stable, snake_case keys so
 * downstream dbt models can use the raw event stream without parsing UI text.
 * Contact names, emails, and messages are intentionally never sent here.
 */
export const analyticsEvent = {
  pageView: "page_view",
  click: "click",
  formSubmit: "form_submit",
  conversion: "conversion",
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

export interface PageSource {
  sourcePageType: PageType;
  sourcePageSlug: string;
}

export type ClickTargetType = "internal_page" | "external_reference" | "action";

export interface ClickProperties extends PageSource {
  targetType: ClickTargetType;
  destination?: string;
  targetPageType?: PageType;
  targetSlug?: string;
  referenceType?: string;
}

export interface FormSubmitProperties extends PageSource {
  formType: "contact";
  status: "success";
}

export interface ConversionProperties extends PageSource {
  conversionType: "contact_lead";
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
  client?.page("site", analyticsEvent.pageView, {
    page_type: pageType,
    page_slug: pageSlug,
    page_title: pageTitle,
    ...(section ? { section } : {}),
  });
}

export function trackClick({
  sourcePageType,
  sourcePageSlug,
  targetType,
  destination,
  targetPageType,
  targetSlug,
  referenceType,
}: ClickProperties): void {
  track(analyticsEvent.click, {
    source_page_type: sourcePageType,
    source_page_slug: sourcePageSlug,
    target_type: targetType,
    ...(destination ? { destination } : {}),
    ...(targetPageType ? { target_page_type: targetPageType } : {}),
    ...(targetSlug ? { target_slug: targetSlug } : {}),
    ...(referenceType ? { reference_type: referenceType } : {}),
  });
}

export function trackFormSubmit({
  formType,
  status,
  sourcePageType,
  sourcePageSlug,
}: FormSubmitProperties): void {
  track(analyticsEvent.formSubmit, {
    form_type: formType,
    status,
    source_page_type: sourcePageType,
    source_page_slug: sourcePageSlug,
  });
}

export function trackConversion({
  conversionType,
  sourcePageType,
  sourcePageSlug,
}: ConversionProperties): void {
  track(analyticsEvent.conversion, {
    conversion_type: conversionType,
    source_page_type: sourcePageType,
    source_page_slug: sourcePageSlug,
  });
}

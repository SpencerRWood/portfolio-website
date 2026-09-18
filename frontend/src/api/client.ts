export interface HealthResponse {
  status: string;
}

export interface ContactSubmission {
  name: string;
  email: string;
  message: string;
}

export interface ContactSubmissionResponse {
  id: number;
  status: "accepted";
}

export interface ContentPage {
  title: string;
  slug: string;
  section: "topics" | "blog" | "projects";
  summary: string;
  body_html: string;
  order: number;
  topics: string[];
  nav: boolean;
  featured: boolean;
  published: string | null;
  repository: string | null;
}

export interface HomepageContent {
  topics: ContentPage[];
  blog: ContentPage[];
  projects: ContentPage[];
  homepage: Homepage;
  navigation: SiteNavigationItem[];
}

export interface Homepage {
  identity: string;
  hero_eyebrow: string;
  title: string;
  summary: string;
  primary_link_label: string;
  primary_link_destination: string;
  aside_title: string;
  aside_summary: string;
  topics_eyebrow: string;
  topics_title: string;
  topics_summary: string;
  blog_eyebrow: string;
  blog_title: string;
  blog_summary: string;
  projects_eyebrow: string;
  projects_title: string;
  projects_summary: string;
  about_eyebrow: string;
  about_title: string;
  about_summary: string;
}

export interface SiteNavigationItem {
  title: string;
  destination: string;
  order: number;
}

export interface FooterNavigation {
  topics_title: string;
  items: SiteNavigationItem[];
}

export interface SitePage {
  title: string;
  slug: string;
  summary: string;
  body_html: string;
}

function apiBaseUrl(): string {
  const configuredUrl = import.meta.env.VITE_API_BASE_URL;
  if (configuredUrl !== undefined) {
    return configuredUrl.replace(/\/$/, "");
  }
  if (typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.hostname}:8000`;
  }
  return "http://localhost:8000";
}

export async function requestBackend(
  request: typeof fetch = fetch,
): Promise<HealthResponse> {
  const response = await request(`${apiBaseUrl()}/health`);
  if (!response.ok) {
    throw new Error(`Backend health request failed with ${response.status}.`);
  }

  return (await response.json()) as HealthResponse;
}

export async function submitContact(
  submission: ContactSubmission,
  request: typeof fetch = fetch,
): Promise<ContactSubmissionResponse> {
  const response = await request(`${apiBaseUrl()}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(submission),
  });
  if (!response.ok) {
    throw new Error("Contact submission could not be saved. Please try again later.");
  }
  return (await response.json()) as ContactSubmissionResponse;
}

async function requestContent<T>(path: string, request: typeof fetch): Promise<T> {
  const response = await request(`${apiBaseUrl()}/content/${path}`);
  if (!response.ok) {
    throw new Error(`Content request failed for ${path}.`);
  }
  return (await response.json()) as T;
}

export function getContentIndex(
  section: ContentPage["section"],
  request: typeof fetch = fetch,
): Promise<ContentPage[]> {
  return requestContent<ContentPage[]>(section, request);
}

export function getContentPage(
  section: ContentPage["section"],
  slug: string,
  request: typeof fetch = fetch,
): Promise<ContentPage> {
  return requestContent<ContentPage>(`${section}/${slug}`, request);
}

export function getSitePage(
  slug: "topics" | "blog" | "projects" | "contact" | "about",
  request: typeof fetch = fetch,
): Promise<SitePage> {
  return requestContent<SitePage>(`site/${slug}`, request);
}

export function getSiteNavigation(
  request: typeof fetch = fetch,
): Promise<SiteNavigationItem[]> {
  return requestContent<SiteNavigationItem[]>("navigation", request);
}

export function getFooterNavigation(
  request: typeof fetch = fetch,
): Promise<FooterNavigation> {
  return requestContent<FooterNavigation>("footer-navigation", request);
}

export async function getHomepageContent(
  request: typeof fetch = fetch,
): Promise<HomepageContent> {
  const [topics, blog, projects, homepage, navigation] = await Promise.all([
    requestContent<ContentPage[]>("topics", request),
    requestContent<ContentPage[]>("blog", request),
    requestContent<ContentPage[]>("projects", request),
    requestContent<Homepage>("site/homepage", request),
    requestContent<SiteNavigationItem[]>("navigation", request),
  ]);
  return { topics, blog, projects, homepage, navigation };
}

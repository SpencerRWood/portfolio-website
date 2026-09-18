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
  section: "topics" | "writing" | "projects";
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
  writing: ContentPage[];
  projects: ContentPage[];
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
  const response = await request(`${apiBaseUrl()}/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(submission),
  });
  if (!response.ok) {
    throw new Error("Contact submission could not be saved. Please try again later.");
  }
  return (await response.json()) as ContactSubmissionResponse;
}

async function requestContent(
  section: "topics" | "writing" | "projects",
  request: typeof fetch,
): Promise<ContentPage[]> {
  const response = await request(`${apiBaseUrl()}/content/${section}`);
  if (!response.ok) {
    throw new Error(`Content request failed for ${section}.`);
  }
  return (await response.json()) as ContentPage[];
}

export async function getHomepageContent(
  request: typeof fetch = fetch,
): Promise<HomepageContent> {
  const [topics, writing, projects] = await Promise.all([
    requestContent("topics", request),
    requestContent("writing", request),
    requestContent("projects", request),
  ]);
  return { topics, writing, projects };
}

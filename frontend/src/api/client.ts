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

function apiBaseUrl(): string {
  return (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000").replace(
    /\/$/,
    "",
  );
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

export interface HealthResponse {
  status: string;
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

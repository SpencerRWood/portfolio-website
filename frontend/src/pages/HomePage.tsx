import { useState } from "react";

import { requestBackend } from "../api/client";

export function HomePage() {
  const [healthStatus, setHealthStatus] = useState<string | null>(null);

  async function checkBackendHealth() {
    setHealthStatus("Checking backend health…");
    try {
      const response = await requestBackend();
      setHealthStatus(`Backend status: ${response.status}`);
    } catch {
      setHealthStatus("Backend health check failed.");
    }
  }

  return (
    <main>
      <h1>portfolio-website</h1>
      <p>Portfolio application foundation</p>
      <button type="button" onClick={checkBackendHealth}>
        Check backend health
      </button>
      {healthStatus ? <p role="status">{healthStatus}</p> : null}
    </main>
  );
}

import { describe, expect, it, vi } from "vitest";

import { requestBackend, submitContact } from "../src/api/client";

describe("backend API client", () => {
  it("requests the backend health endpoint", async () => {
    const request = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ status: "ok" }), { status: 200 }),
      );

    await expect(requestBackend(request)).resolves.toEqual({ status: "ok" });
    expect(request).toHaveBeenCalledWith("http://localhost:8000/health");
  });

  it("rejects an unsuccessful health response", async () => {
    const request = vi.fn().mockResolvedValue(new Response(null, { status: 503 }));

    await expect(requestBackend(request)).rejects.toThrow(
      "Backend health request failed with 503.",
    );
  });
});

describe("contact API client", () => {
  it("posts validated contact data", async () => {
    const request = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ id: 7, status: "accepted" }), { status: 201 }),
      );

    await expect(
      submitContact(
        { name: "Ada", email: "ada@example.com", message: "Hello" },
        request,
      ),
    ).resolves.toEqual({ id: 7, status: "accepted" });
    expect(request).toHaveBeenCalledWith("http://localhost:8000/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Ada", email: "ada@example.com", message: "Hello" }),
    });
  });
});

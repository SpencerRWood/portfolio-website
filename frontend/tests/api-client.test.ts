import { describe, expect, it, vi } from "vitest";

import { getHomepageContent, requestBackend, submitContact } from "../src/api/client";

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

describe("content API client", () => {
  it("loads homepage sections from the backend", async () => {
    const request = vi
      .fn()
      .mockImplementation(() => new Response(JSON.stringify([]), { status: 200 }));

    await expect(getHomepageContent(request)).resolves.toEqual({
      topics: [],
      writing: [],
      projects: [],
    });
    expect(request).toHaveBeenNthCalledWith(1, "http://localhost:8000/content/topics");
    expect(request).toHaveBeenNthCalledWith(2, "http://localhost:8000/content/writing");
    expect(request).toHaveBeenNthCalledWith(
      3,
      "http://localhost:8000/content/projects",
    );
  });
});

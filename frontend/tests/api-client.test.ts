import { describe, expect, it, vi } from "vitest";

import {
  getContentPage,
  getHomepageContent,
  getSitePage,
  requestBackend,
  submitContact,
} from "../src/api/client";

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
    expect(request).toHaveBeenCalledWith("http://localhost:8000/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Ada", email: "ada@example.com", message: "Hello" }),
    });
  });
});

describe("content API client", () => {
  it("loads authored site pages and individual content pages", async () => {
    const request = vi
      .fn()
      .mockImplementation(
        () => new Response(JSON.stringify({ slug: "data-modeling" }), { status: 200 }),
      );

    await expect(getSitePage("areas", request)).resolves.toEqual({
      slug: "data-modeling",
    });
    await expect(getContentPage("areas", "data-modeling", request)).resolves.toEqual({
      slug: "data-modeling",
    });
    expect(request).toHaveBeenNthCalledWith(
      1,
      "http://localhost:8000/content/site/topics",
    );
    expect(request).toHaveBeenNthCalledWith(
      2,
      "http://localhost:8000/content/topics/data-modeling",
    );
  });

  it("loads homepage sections from the backend", async () => {
    const request = vi
      .fn()
      .mockImplementation(() => new Response(JSON.stringify([]), { status: 200 }));

    await expect(getHomepageContent(request)).resolves.toEqual({
      areas: [],
      blog: [],
      projects: [],
      homepage: [],
      navigation: [],
    });
    expect(request).toHaveBeenNthCalledWith(1, "http://localhost:8000/content/topics");
    expect(request).toHaveBeenNthCalledWith(2, "http://localhost:8000/content/blog");
    expect(request).toHaveBeenNthCalledWith(
      3,
      "http://localhost:8000/content/projects",
    );
    expect(request).toHaveBeenNthCalledWith(
      4,
      "http://localhost:8000/content/site/homepage",
    );
    expect(request).toHaveBeenNthCalledWith(
      5,
      "http://localhost:8000/content/navigation",
    );
  });
});

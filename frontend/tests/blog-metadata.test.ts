import { describe, expect, it } from "vitest";

import type { ContentPage } from "../src/api/client";
import { selectFeaturedPost } from "../src/components/blog/blogMetadata";

function post(slug: string, featured: boolean): ContentPage {
  return {
    title: slug,
    slug,
    section: "blog",
    summary: "A test post.",
    body_html: "",
    order: 0,
    areas: [],
    group: null,
    nav: false,
    featured,
    published: "2026-09-18",
    repository: null,
  };
}

describe("selectFeaturedPost", () => {
  it("selects a featured article even when it is not the newest post", () => {
    const posts = [post("newest", false), post("featured", true)];

    expect(selectFeaturedPost(posts)?.slug).toBe("featured");
  });

  it("falls back to the first, newest article when none are featured", () => {
    const posts = [post("newest", false), post("older", false)];

    expect(selectFeaturedPost(posts)?.slug).toBe("newest");
  });

  it("selects the first featured article from the supplied ordering", () => {
    const posts = [
      post("newest-featured", true),
      post("older-featured", true),
      post("oldest", false),
    ];

    expect(selectFeaturedPost(posts)?.slug).toBe("newest-featured");
  });
});

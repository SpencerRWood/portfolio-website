import type { ContentPage } from "../../api/client";

export function selectFeaturedPost(posts: ContentPage[]): ContentPage | undefined {
  return posts.find((post) => post.featured) ?? posts[0];
}

export function formatPublishedDate(value: string | null | undefined): string {
  if (!value) return "Recent post";
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

export function areaName(
  slug: string,
  areas: { slug: string; title: string }[],
): string {
  return areas.find((area) => area.slug === slug)?.title ?? slug.replaceAll("-", " ");
}

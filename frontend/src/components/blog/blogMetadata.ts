export function formatPublishedDate(value: string | null | undefined): string {
  if (!value) return "Recent post";
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

export function topicName(
  slug: string,
  topics: { slug: string; title: string }[],
): string {
  return (
    topics.find((topic) => topic.slug === slug)?.title ?? slug.replaceAll("-", " ")
  );
}

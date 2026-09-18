import { topicName } from "./blogMetadata";

interface TopicLinksProps {
  topics: { slug: string; title: string }[];
  slugs: string[];
}

export function TopicLinks({ topics, slugs }: TopicLinksProps) {
  return (
    <ul className="flex flex-wrap gap-x-3 gap-y-1" aria-label="Article topics">
      {slugs.map((slug) => (
        <li key={slug}>
          <a
            className="font-mono text-[0.68rem] tracking-[0.1em] text-black/55 uppercase transition-colors hover:text-black focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-black"
            href={`/topics/${slug}`}
          >
            {topicName(slug, topics)}
          </a>
        </li>
      ))}
    </ul>
  );
}

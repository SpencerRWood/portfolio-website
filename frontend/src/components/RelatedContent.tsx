import { contentSectionPath, type ContentPage } from "../api/client";
import { trackClick, contentPageType } from "../analytics/events";

const sections = [
  { section: "areas", title: "Related Topics", pageType: "area" },
  { section: "blog", title: "Related Writing", pageType: "blog_article" },
  { section: "projects", title: "Related Projects", pageType: "project" },
] as const;

export function RelatedContent({ page }: { page: ContentPage }) {
  return sections.map(({ section, title, pageType }) => {
    const items = (page.related_content ?? []).filter(
      (item) => item.section === section,
    );
    if (!items.length) return null;

    return (
      <section
        key={section}
        aria-label={title}
        className="mt-12 border-t border-black/20 pt-8"
      >
        <h2 className="font-display text-2xl font-semibold tracking-[-0.035em]">
          {title}
        </h2>
        <ul className="mt-5 space-y-5">
          {items.map((item) => (
            <li key={item.slug}>
              <a
                className="underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-3"
                href={`/${contentSectionPath(item.section)}/${item.slug}`}
                onClick={() =>
                  trackClick({
                    sourcePageType: contentPageType(page.section),
                    sourcePageSlug: page.slug,
                    targetType: "internal_page",
                    targetPageType: pageType,
                    targetSlug: item.slug,
                    destination: `/${contentSectionPath(item.section)}/${item.slug}`,
                  })
                }
              >
                {item.title}
              </a>
              <p className="mt-2 leading-7 text-black/70">{item.summary}</p>
            </li>
          ))}
        </ul>
      </section>
    );
  });
}

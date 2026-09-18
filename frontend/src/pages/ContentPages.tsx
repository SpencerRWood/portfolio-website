import { useEffect, useState } from "react";

import {
  getContentIndex,
  getContentPage,
  getSiteNavigation,
  getSitePage,
  type ContentPage,
  type SiteNavigationItem,
  type SitePage,
} from "../api/client";
import { trackPageView } from "../analytics/events";
import { ContactForm } from "../components/ContactForm";
import { BlogArticle } from "../components/blog/BlogArticle";
import { BlogIndex } from "../components/blog/BlogIndex";
import { SiteLayout } from "../components/layout/SiteLayout";

type Section = ContentPage["section"];
type SiteSlug = "topics" | "blog" | "projects" | "contact" | "about";

function useNavigation() {
  const [navigation, setNavigation] = useState<SiteNavigationItem[]>([]);

  useEffect(() => {
    void getSiteNavigation().then(setNavigation);
  }, []);

  return navigation;
}

function useTopics() {
  const [topics, setTopics] = useState<ContentPage[]>([]);

  useEffect(() => {
    void getContentIndex("topics").then(setTopics);
  }, []);

  return topics;
}

function LoadingOrError({ error }: { error: boolean }) {
  return (
    <p className="py-16 text-black/65" role="status">
      {error ? "This page could not be loaded. Please try again later." : "Loading…"}
    </p>
  );
}

function Intro({ page }: { page: SitePage }) {
  return (
    <>
      <p className="font-mono text-xs tracking-[0.16em] text-black/55 uppercase">
        {page.slug}
      </p>
      <h1 className="font-display mt-5 text-5xl leading-[0.94] font-semibold tracking-[-0.055em] md:text-7xl">
        {page.title}
      </h1>
      <p className="mt-7 max-w-2xl text-lg leading-8 text-black/75">{page.summary}</p>
      <div
        className="mt-7 max-w-2xl leading-7 text-black/70"
        dangerouslySetInnerHTML={{ __html: page.body_html }}
      />
    </>
  );
}

export function SectionIndexPage({
  section,
  path,
}: {
  section: Section;
  path: string;
}) {
  const [sitePage, setSitePage] = useState<SitePage | null>(null);
  const [pages, setPages] = useState<ContentPage[]>([]);
  const [error, setError] = useState(false);
  const navigation = useNavigation();
  const topics = useTopics();

  useEffect(() => {
    trackPageView();
    void Promise.all([getSitePage(section), getContentIndex(section)])
      .then(([nextSitePage, nextPages]) => {
        setSitePage(nextSitePage);
        setPages(nextPages);
      })
      .catch(() => setError(true));
  }, [section]);

  return (
    <SiteLayout navigation={navigation} topics={topics}>
      {sitePage ? (
        section === "blog" ? (
          <BlogIndex page={sitePage} posts={pages} topics={topics} />
        ) : (
          <section className="py-16 md:py-24">
            <Intro page={sitePage} />
            <div className="mt-14 border-t border-black/20">
              {pages.map((page, index) => (
                <article
                  key={page.slug}
                  className="grid gap-4 border-b border-black/15 py-7 md:grid-cols-[5rem_minmax(0,1fr)_minmax(16rem,0.8fr)] md:gap-8 md:py-9"
                >
                  <p className="font-mono text-xs tracking-[0.14em] text-black/55">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h2 className="font-display text-2xl font-semibold tracking-[-0.035em] md:text-3xl">
                    <a href={`/${path}/${page.slug}`}>{page.title}</a>
                  </h2>
                  <p className="max-w-xl leading-7 text-black/70">{page.summary}</p>
                </article>
              ))}
            </div>
          </section>
        )
      ) : (
        <LoadingOrError error={error} />
      )}
    </SiteLayout>
  );
}

export function ArticlePage({
  section,
  path,
  slug,
}: {
  section: Section;
  path: string;
  slug: string;
}) {
  const [page, setPage] = useState<ContentPage | null>(null);
  const [error, setError] = useState(false);
  const navigation = useNavigation();
  const topics = useTopics();

  useEffect(() => {
    trackPageView();
    void getContentPage(section, slug)
      .then(setPage)
      .catch(() => setError(true));
  }, [section, slug]);

  return (
    <SiteLayout navigation={navigation} topics={topics}>
      {page && section === "blog" ? (
        <BlogArticle page={page} topics={topics} />
      ) : page ? (
        <article className="max-w-3xl py-16 md:py-24">
          <a
            className="font-mono text-xs tracking-[0.14em] text-black/55 uppercase"
            href={`/${path}`}
          >
            ← {path}
          </a>
          <h1 className="font-display mt-8 text-5xl leading-[0.94] font-semibold tracking-[-0.055em] md:text-7xl">
            {page.title}
          </h1>
          <p className="mt-7 text-lg leading-8 text-black/75">{page.summary}</p>
          <div
            className="article-prose mt-10"
            dangerouslySetInnerHTML={{ __html: page.body_html }}
          />
          {page.repository ? (
            <a
              className="mt-10 inline-block font-mono text-xs underline underline-offset-4 uppercase"
              href={page.repository}
            >
              View repository ↗
            </a>
          ) : null}
        </article>
      ) : (
        <LoadingOrError error={error} />
      )}
    </SiteLayout>
  );
}

export function StaticPage({
  slug,
}: {
  slug: Exclude<SiteSlug, "topics" | "blog" | "projects">;
}) {
  const [page, setPage] = useState<SitePage | null>(null);
  const [error, setError] = useState(false);
  const navigation = useNavigation();
  const topics = useTopics();

  useEffect(() => {
    trackPageView();
    void getSitePage(slug)
      .then(setPage)
      .catch(() => setError(true));
  }, [slug]);

  return (
    <SiteLayout navigation={navigation} topics={topics}>
      {page ? (
        <section className="max-w-3xl py-16 md:py-24">
          <Intro page={page} />
          {slug === "contact" ? <ContactForm /> : null}
        </section>
      ) : (
        <LoadingOrError error={error} />
      )}
    </SiteLayout>
  );
}

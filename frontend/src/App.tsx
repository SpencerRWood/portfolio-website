import { useEffect, useState } from "react";

import { ArticlePage, SectionIndexPage, StaticPage } from "./pages/ContentPages";
import { HomePage } from "./pages/HomePage";

const sections = { topics: "areas", blog: "blog", projects: "projects" } as const;

export function App() {
  const [pathname, setPathname] = useState(window.location.pathname);

  useEffect(() => {
    const updatePathname = () => setPathname(window.location.pathname);
    window.addEventListener("popstate", updatePathname);
    return () => window.removeEventListener("popstate", updatePathname);
  }, []);

  const parts = pathname
    .replace(/^\/|\/$/g, "")
    .split("/")
    .filter(Boolean);
  const section = Object.hasOwn(sections, parts[0])
    ? sections[parts[0] as keyof typeof sections]
    : undefined;
  if (parts.length === 0) return <HomePage />;
  if (parts.length === 1 && section) {
    return <SectionIndexPage section={section} path={parts[0]} />;
  }
  if (parts.length === 1 && (parts[0] === "about" || parts[0] === "contact")) {
    return <StaticPage slug={parts[0]} />;
  }
  if (parts.length === 2 && section) {
    return <ArticlePage section={section} path={parts[0]} slug={parts[1]} />;
  }
  return (
    <main className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12">
      <h1 className="font-display text-5xl font-semibold">Page not found</h1>
    </main>
  );
}

import { useEffect, useState } from "react";

import { ArticlePage, SectionIndexPage, StaticPage } from "./pages/ContentPages";
import { HomePage } from "./pages/HomePage";

const sections = new Set(["areas", "blog", "projects"]);

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
  if (parts.length === 0) return <HomePage />;
  if (parts.length === 1 && sections.has(parts[0])) {
    return (
      <SectionIndexPage
        section={parts[0] as "areas" | "blog" | "projects"}
        path={parts[0]}
      />
    );
  }
  if (parts.length === 1 && (parts[0] === "about" || parts[0] === "contact")) {
    return <StaticPage slug={parts[0]} />;
  }
  if (parts.length === 2 && sections.has(parts[0])) {
    return (
      <ArticlePage
        section={parts[0] as "areas" | "blog" | "projects"}
        path={parts[0]}
        slug={parts[1]}
      />
    );
  }
  return (
    <main className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12">
      <h1 className="font-display text-5xl font-semibold">Page not found</h1>
    </main>
  );
}

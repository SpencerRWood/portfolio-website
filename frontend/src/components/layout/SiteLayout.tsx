import type { ReactNode } from "react";

import type { ContentPage, SiteNavigationItem } from "../../api/client";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

export function SiteLayout({
  navigation,
  topics,
  children,
}: {
  navigation: SiteNavigationItem[];
  topics: ContentPage[];
  children: ReactNode;
}) {
  return (
    <main className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 lg:px-12">
      <SiteHeader navigation={navigation} />
      {children}
      <SiteFooter topics={topics} />
    </main>
  );
}

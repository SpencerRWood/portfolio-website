import type { ReactNode } from "react";

import type { PageSource } from "../../analytics/events";
import type { ContentPage, SiteNavigationItem } from "../../api/client";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

export function SiteLayout({
  navigation,
  areas,
  source,
  children,
}: {
  navigation: SiteNavigationItem[];
  areas: ContentPage[];
  source?: PageSource;
  children: ReactNode;
}) {
  return (
    <>
      <SiteHeader navigation={navigation} source={source} />
      <main className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">{children}</main>
      <SiteFooter areas={areas} source={source} />
    </>
  );
}

import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("../src/analytics/events", () => ({ trackClick: vi.fn() }));

import { trackClick } from "../src/analytics/events";
import type { ContentPage } from "../src/api/client";
import { AreaList } from "../src/components/AreaList";

function area(
  title: string,
  slug: string,
  group: "Analytics" | "Engineering",
  order: number,
): ContentPage {
  return {
    title,
    slug,
    group,
    order,
    section: "areas",
    summary: title,
    body_html: "",
    areas: [],
    nav: true,
    featured: false,
    published: null,
    repository: null,
  };
}

describe("grouped area navigation", () => {
  it("orders groups and their links independently of input order and tracks area clicks", () => {
    const source = {
      sourcePageType: "section_index",
      sourcePageSlug: "areas",
    } as const;
    render(
      <AreaList
        source={source}
        areas={[
          area("Systems & Infrastructure", "systems-infrastructure", "Engineering", 10),
          area("Communication", "communication", "Analytics", 60),
          area("Machine Learning", "machine-learning", "Analytics", 50),
          area("Analytics", "analytics", "Analytics", 40),
          area("Data Modeling", "data-modeling", "Analytics", 30),
          area("Data Collection", "data-collection", "Analytics", 20),
          area("Data Generation", "data-generation", "Analytics", 10),
        ]}
      />,
    );

    expect(
      screen
        .getAllByRole("region")
        .map((region) => region.getAttribute("aria-labelledby")),
    ).toEqual(["area-group-analytics", "area-group-engineering"]);
    const links = within(
      screen.getByRole("region", { name: "Analytics" }),
    ).getAllByRole("link");
    expect(links.map((link) => link.textContent)).toEqual([
      "Data Generation",
      "Data Collection",
      "Data Modeling",
      "Analytics",
      "Machine Learning",
      "Communication",
    ]);
    const engineering = within(
      screen.getByRole("region", { name: "Engineering" }),
    ).getByRole("link");
    expect(engineering).toHaveAttribute("href", "/areas/systems-infrastructure");
    fireEvent.click(engineering);
    expect(trackClick).toHaveBeenCalledWith({
      ...source,
      targetType: "internal_page",
      targetPageType: "area",
      targetSlug: "systems-infrastructure",
      destination: "/areas/systems-infrastructure",
    });
  });
});

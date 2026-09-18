import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("../src/api/client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../src/api/client")>();
  return {
    ...actual,
    getHomepageContent: vi.fn().mockResolvedValue({
      topics: [
        {
          title: "Data Generation",
          slug: "data-generation",
          summary: "How applications create analytical data.",
        },
      ],
      writing: [
        {
          title: "Designing events as data contracts",
          slug: "designing-events-as-data-contracts",
          featured: true,
        },
      ],
      projects: [
        {
          title: "Synthetic Website Analytics Platform",
          slug: "synthetic-website-analytics",
          summary: "A simulated website analytics system.",
          repository:
            "https://github.com/SpencerRWood/synthetic-website-analytics-platform",
          featured: true,
        },
      ],
    }),
  };
});

import { App } from "../src/App";

describe("App", () => {
  it("renders the application shell", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", {
        name: "How analytical systems are built",
      }),
    ).toBeInTheDocument();
  });

  it("uses topic-centric primary navigation", () => {
    render(<App />);

    const navigation = screen.getByRole("navigation", {
      name: "Primary navigation",
    });
    expect(navigation).toHaveTextContent("Topics");
    expect(navigation).toHaveTextContent("Writing");
    expect(navigation).toHaveTextContent("Projects");
    expect(navigation).toHaveTextContent("About");
    expect(document.body).not.toHaveTextContent(/portfolio/i);
  });

  it("renders content supplied by the backend", async () => {
    render(<App />);

    expect(await screen.findByText("Data Generation")).toBeInTheDocument();
    expect(
      await screen.findByText("Designing events as data contracts"),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Synthetic Website Analytics Platform"),
    ).toBeInTheDocument();
  });
});

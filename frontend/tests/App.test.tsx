import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

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
    expect(navigation).not.toHaveTextContent("Portfolio");
  });
});

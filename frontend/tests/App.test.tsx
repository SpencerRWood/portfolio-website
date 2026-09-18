import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { App } from "../src/App";

describe("App", () => {
  it("renders the application shell", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", {
        name: "Systems for turning data into better decisions.",
      }),
    ).toBeInTheDocument();
  });

  it("uses the six conceptual sections as primary navigation", () => {
    render(<App />);

    const navigation = screen.getByRole("navigation", {
      name: "Primary navigation",
    });
    expect(navigation).toHaveTextContent("Data Generation");
    expect(navigation).toHaveTextContent("Data Collection");
    expect(navigation).toHaveTextContent("Data Modeling");
    expect(navigation).toHaveTextContent("Analytics");
    expect(navigation).toHaveTextContent("Machine Learning");
    expect(navigation).toHaveTextContent("Presentation");
    expect(navigation).toHaveTextContent("About");
    expect(navigation).toHaveTextContent("Contact");
    expect(navigation).not.toHaveTextContent("Projects");
  });
});

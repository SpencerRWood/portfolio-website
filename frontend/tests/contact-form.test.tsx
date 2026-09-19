import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  submitContact: vi.fn().mockResolvedValue({ id: 1, status: "accepted" }),
  trackConversion: vi.fn(),
  trackFormSubmit: vi.fn(),
}));

vi.mock("../src/api/client", () => ({ submitContact: mocks.submitContact }));
vi.mock("../src/analytics/events", () => ({
  trackConversion: mocks.trackConversion,
  trackFormSubmit: mocks.trackFormSubmit,
}));

import { ContactForm } from "../src/components/ContactForm";

describe("ContactForm", () => {
  it("tracks submit and conversion only after a successful submission", async () => {
    render(
      <ContactForm
        source={{ sourcePageType: "static_page", sourcePageSlug: "contact" }}
      />,
    );

    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Ada" } });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "ada@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Message"), { target: { value: "Hello" } });
    fireEvent.submit(
      screen.getByRole("button", { name: /send message/i }).closest("form")!,
    );

    await waitFor(() =>
      expect(mocks.trackFormSubmit).toHaveBeenCalledWith({
        formType: "contact",
        status: "success",
        sourcePageType: "static_page",
        sourcePageSlug: "contact",
      }),
    );
    expect(mocks.trackConversion).toHaveBeenCalledWith({
      conversionType: "contact_lead",
      sourcePageType: "static_page",
      sourcePageSlug: "contact",
    });
  });
});

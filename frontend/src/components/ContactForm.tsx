import { useState } from "react";

import { trackConversion, trackFormSubmit, type PageSource } from "../analytics/events";
import { submitContact } from "../api/client";

export function ContactForm({ source }: { source: PageSource }) {
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setIsSubmitting(true);
    setStatus(null);
    try {
      await submitContact({
        name: String(form.get("name") ?? ""),
        email: String(form.get("email") ?? ""),
        message: String(form.get("message") ?? ""),
      });
      formElement.reset();
      setStatus("Thanks — your message has been sent.");
      trackFormSubmit({ ...source, formType: "contact", status: "success" });
      trackConversion({ ...source, conversionType: "contact_lead" });
    } catch {
      setStatus("Your message could not be sent. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="mt-8 space-y-5" onSubmit={submit}>
      <p>
        <label
          className="font-mono text-[0.68rem] tracking-[0.12em] text-black/60 uppercase"
          htmlFor="contact-name"
        >
          Name
        </label>
        <input
          className="mt-2 block w-full border-b border-black/30 bg-transparent px-0 py-3 outline-none transition-colors focus:border-black"
          id="contact-name"
          name="name"
          required
          maxLength={120}
        />
      </p>
      <p>
        <label
          className="font-mono text-[0.68rem] tracking-[0.12em] text-black/60 uppercase"
          htmlFor="contact-email"
        >
          Email
        </label>
        <input
          className="mt-2 block w-full border-b border-black/30 bg-transparent px-0 py-3 outline-none transition-colors focus:border-black"
          id="contact-email"
          name="email"
          type="email"
          required
          maxLength={254}
        />
      </p>
      <p>
        <label
          className="font-mono text-[0.68rem] tracking-[0.12em] text-black/60 uppercase"
          htmlFor="contact-message"
        >
          Message
        </label>
        <textarea
          className="mt-2 block min-h-28 w-full resize-y border-b border-black/30 bg-transparent px-0 py-3 outline-none transition-colors focus:border-black"
          id="contact-message"
          name="message"
          required
          maxLength={5000}
        />
      </p>
      <button
        className="inline-flex items-center gap-3 bg-black px-5 py-3 font-mono text-xs tracking-[0.1em] text-white uppercase transition-colors hover:bg-black/75 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black disabled:cursor-not-allowed disabled:bg-black/45"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Sending…" : "Send message"} <span aria-hidden="true">↗</span>
      </button>
      {status ? (
        <p className="border-l-2 border-black pl-3 text-sm" role="status">
          {status}
        </p>
      ) : null}
    </form>
  );
}

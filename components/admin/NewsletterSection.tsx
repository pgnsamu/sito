"use client";

import { useState } from "react";

export default function NewsletterSection({ emails }: { emails: string[] | null }) {
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");

  async function copyEmails() {
    if (!emails?.length) return;

    try {
      await navigator.clipboard.writeText(emails.join("\n"));
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
  }

  return (
    <section aria-labelledby="newsletter-heading">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 id="newsletter-heading" className="font-serif text-5xl">Newsletter</h2>
        <button
          type="button"
          onClick={copyEmails}
          disabled={!emails?.length}
          className="rounded-full border border-black/35 px-6 py-3 text-xs uppercase tracking-[0.25em] enabled:hover:border-black disabled:opacity-50"
        >
          Copia tutte
        </button>
      </div>

      {emails === null ? (
        <p role="alert" className="text-red-700">Impossibile caricare gli iscritti alla newsletter.</p>
      ) : emails.length === 0 ? (
        <p className="text-black/65">Nessun iscritto alla newsletter.</p>
      ) : (
        <>
          <p className="mb-3 text-sm text-black/65">{emails.length} {emails.length === 1 ? "iscritto" : "iscritti"}</p>
          <p role="status" className="text-sm">
            {copyStatus === "copied" && "Indirizzi copiati negli appunti."}
            {copyStatus === "error" && <span className="text-red-700">Impossibile copiare gli indirizzi negli appunti.</span>}
          </p>
          <ul className="divide-y divide-black/15">
            {emails.map(email => <li key={email} className="break-all py-3">{email}</li>)}
          </ul>
        </>
      )}
    </section>
  );
}

"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function NewsletterSection({ emails: initialEmails }: { emails: string[] | null }) {
  const [emails, setEmails] = useState(initialEmails);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState("");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");

  async function refreshEmails() {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setRefreshError("");
    setCopyStatus("idle");
    try {
      const { data, error } = await createClient()
        .from("newsletter_subscribers")
        .select("email")
        .eq("subscribed", true)
        .order("email");

      if (error) throw error;
      
      setEmails(data.map(({ email }) => email));
    } catch {
      setRefreshError("Impossibile aggiornare gli iscritti alla newsletter. Riprova.");
    } finally {
      setIsRefreshing(false);
    }
  }

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
    <section aria-labelledby="newsletter-heading" aria-busy={isRefreshing}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 id="newsletter-heading" className="font-serif text-5xl">Newsletter</h2>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={refreshEmails}
            disabled={isRefreshing}
            className="rounded-full border border-black/35 px-6 py-3 text-xs uppercase tracking-[0.25em] enabled:hover:border-black disabled:opacity-50"
          >
            {isRefreshing ? "Aggiornamento…" : "Aggiorna"}
          </button>
          <button
            type="button"
            onClick={copyEmails}
            disabled={isRefreshing || !emails?.length}
            className="rounded-full border border-black/35 px-6 py-3 text-xs uppercase tracking-[0.25em] enabled:hover:border-black disabled:opacity-50"
          >
            Copia tutte
          </button>
        </div>
      </div>

      {refreshError && <p role="alert" className="mb-4 text-red-700">{refreshError}</p>}
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

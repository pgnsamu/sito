"use client";

import { useRef, useState } from "react";

export default function AboutPage() {
	// Nota importante: con mailto: non puoi allegare davvero file in automatico. 
	// Il bottone + ora apre il file picker e inserisce il nome del file nel corpo della mail, 
	// ma per allegati veri serve una API backend, ad esempio una route Next.js con Resend, Nodemailer, SendGrid o simili.
	// TODO: cambiare mail
  const recipientEmail = "your-email@example.com";

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [fileName, setFileName] = useState("");

  function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const subject = "Work with us";
    const body = [
      `Email: ${email}`,
      "",
      "Descrizione:",
      description,
      fileName ? "" : null,
      fileName ? `File selezionato: ${fileName}` : null,
      fileName ? "Nota: il file non può essere allegato automaticamente tramite mailto." : null,
    ]
      .filter(Boolean)
      .join("\n");

    const mailtoUrl = `mailto:${recipientEmail}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;

    window.location.href = mailtoUrl;
  }

  return (
    <main className="min-h-screen bg-white text-black">
      {/* ABOUT */}
      <section className="flex min-h-[52vh] flex-col items-center justify-start px-5 pt-28 sm:px-8 sm:pt-32 md:min-h-[55vh]">
        <h1 className="font-serif text-3xl font-semibold tracking-wide sm:text-4xl">
          ABOUT US
        </h1>

        <p className="mt-8 w-full max-w-xs text-[10px] uppercase tracking-wide text-neutral-700 sm:mt-10 md:ml-[22%] md:self-start">
          DESCRIZIONE PROGETTO
        </p>
      </section>

      {/* WORK WITH US */}
      <section className="bg-neutral-300 px-5 py-7 sm:px-8 md:min-h-[45vh]">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-7 md:grid-cols-[160px_minmax(320px,460px)_1fr] md:gap-8">
          <h2 className="font-serif text-sm font-semibold uppercase tracking-wide sm:text-base">
            WORK WITH US
          </h2>

          <form
            id="work-with-us-form"
            onSubmit={handleSubmit}
            className="relative flex flex-col gap-5"
          >
            <input
              type="email"
              placeholder="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="h-12 w-full bg-neutral-600 px-5 font-serif text-base text-white outline-none placeholder:text-white/90"
            />

            <textarea
              placeholder="Descrizione"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              required
              className="h-44 w-full resize-none bg-neutral-200 px-5 py-4 font-serif text-base text-black outline-none placeholder:text-black sm:h-52 md:h-[28vh]"
            />

            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                setFileName(file ? file.name : "");
              }}
            />

            {fileName && (
              <p className="font-serif text-xs text-neutral-700">
                File selezionato: {fileName}
              </p>
            )}

            <button
              type="button"
              aria-label="Add attachment"
              onClick={() => fileInputRef.current?.click()}
              className="relative flex h-14 w-14 cursor-pointer items-center justify-center self-center rounded-full bg-neutral-200 transition hover:scale-105 hover:bg-neutral-100 md:absolute md:-right-24 md:bottom-2 md:h-16 md:w-16"
            >
              <span className="absolute left-1/2 top-1/2 h-[2px] w-6 -translate-x-1/2 -translate-y-1/2 bg-black md:w-7" />
              <span className="absolute left-1/2 top-1/2 h-6 w-[2px] -translate-x-1/2 -translate-y-1/2 bg-black md:h-7" />
            </button>
          </form>

          <div className="flex justify-end md:items-end">
            <button
              type="submit"
              form="work-with-us-form"
              className="h-12 w-full cursor-pointer bg-neutral-600 font-serif text-base text-white transition hover:bg-neutral-700 sm:h-14 sm:w-44"
            >
              Send email
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
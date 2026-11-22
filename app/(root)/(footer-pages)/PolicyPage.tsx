import type { ReactNode } from "react";

export const studioEmail = "info.newguardstudio@gmail.com";

export function StudioEmail() {
  return <a href={`mailto:${studioEmail}`}>{studioEmail}</a>;
}

export function StudioInstagram() {
  return <a href="https://www.instagram.com/newguardstudio/">@newguardstudio</a>;
}

export function PolicyPage({ title, children, dated = true }: {
  title: string;
  children: ReactNode;
  dated?: boolean;
}) {
  return (
    <article lang="it" className="max-w-3xl">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">{title}</h1>
        {dated && (
          <p className="mt-4 text-sm text-neutral-600">
            Ultimo aggiornamento <time dateTime="2026-11-22">22 novembre 2026</time>
          </p>
        )}
      </header>
      <div className="space-y-8 text-base leading-7 text-neutral-800 [&_a]:break-words [&_a]:underline [&_a]:underline-offset-4 [&_li+li]:mt-2 [&_ul]:list-disc [&_ul]:pl-5">
        {children}
      </div>
    </article>
  );
}

export function PolicySection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold text-black">{title}</h2>
      {children}
    </section>
  );
}

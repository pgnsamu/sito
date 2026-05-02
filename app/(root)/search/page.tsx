type SearchPageProps = {
  searchParams: {
    q?: string;
  };
};

export default function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q ?? "";

  return (
    <main className="min-h-screen bg-white px-6 pt-32 text-neutral-900 md:px-10">
      <h1 className="text-4xl font-semibold tracking-tight">
        Search results
      </h1>

      {query ? (
        <p className="mt-4 text-neutral-500">
          Risultati per:{" "}
          <span className="font-medium text-neutral-900">{query}</span>
        </p>
      ) : (
        <p className="mt-4 text-neutral-500">
          Nessuna ricerca inserita.
        </p>
      )}

      <section className="mt-12 grid gap-6 md:grid-cols-3">
        <article className="rounded-2xl border border-neutral-200 p-6">
          <p className="text-sm uppercase tracking-wide text-neutral-400">
            Example
          </p>
          <h2 className="mt-3 text-xl font-medium">
            Primo risultato
          </h2>
        </article>

        <article className="rounded-2xl border border-neutral-200 p-6">
          <p className="text-sm uppercase tracking-wide text-neutral-400">
            Example
          </p>
          <h2 className="mt-3 text-xl font-medium">
            Secondo risultato
          </h2>
        </article>

        <article className="rounded-2xl border border-neutral-200 p-6">
          <p className="text-sm uppercase tracking-wide text-neutral-400">
            Example
          </p>
          <h2 className="mt-3 text-xl font-medium">
            Terzo risultato
          </h2>
        </article>
      </section>
    </main>
  );
}
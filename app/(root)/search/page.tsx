import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type SearchResult = {
  key: string;
  name: string;
  href: string;
  kind: "Artist" | "Work" | "Theme";
  artist?: string;
};

type WorkMatch = {
  id: number;
  name: string;
  artist_id: number;
  artists: { name: string };
};

const sectionThemes = [
  { key: "fashion", name: "Fashion", href: "/fashion", kind: "Theme" },
  { key: "visualculture", name: "Visual Culture", href: "/visualculture", kind: "Theme" },
] satisfies SearchResult[];

async function search(query: string) {
  const supabase = await createClient();
  // PostgREST imatch performs a case-insensitive regex search. Escape metacharacters for literal matching.
  const pattern = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const [artists, works, genres] = await Promise.all([
    supabase.from("artists").select("id, name").filter("name", "imatch", pattern).order("name"),
    supabase
      .from("works")
      .select("id, name, artist_id, artists!inner(name)")
      .eq("visible", true)
      .filter("name", "imatch", pattern)
      .order("name")
      .overrideTypes<WorkMatch[], { merge: false }>(),
    supabase.from("genres").select("id, name").filter("name", "imatch", pattern).order("name"),
  ]);

  const error = artists.error ?? works.error ?? genres.error;
  if (error) console.error("Could not load all search results", error);

  const term = query.toLowerCase();
  const themes: SearchResult[] = [
    ...sectionThemes.filter(({ name }) => name.toLowerCase().includes(term)),
    ...(genres.data ?? [])
      .filter(({ name }) => !sectionThemes.some((theme) => theme.name.toLowerCase() === name.toLowerCase()))
      .map(({ id, name }): SearchResult => ({
        key: `theme-${id}`,
        name,
        href: `/themes/${id}`,
        kind: "Theme",
      })),
  ];
  const results: SearchResult[] = [
    ...(artists.data ?? []).map(({ id, name }): SearchResult => ({
      key: `artist-${id}`,
      name,
      href: `/artists/${id}`,
      kind: "Artist",
    })),
    ...(works.data ?? []).map(({ id, name, artist_id, artists: artist }): SearchResult => ({
      key: `work-${id}`,
      name,
      href: `/artists/${artist_id}`,
      kind: "Work",
      artist: artist.name,
    })),
    ...themes,
  ];

  const exactMatches = results.filter(({ name }) => name.toLowerCase() === term);
  if (exactMatches.length) {
    if (!error && exactMatches.length === 1 && exactMatches[0].kind === "Theme") {
      redirect(exactMatches[0].href);
    }

    return { results: exactMatches, error };
  }

  const wholeWords = new RegExp(
    `(?:^|[^\\p{L}\\p{M}\\p{N}])${pattern}(?=$|[^\\p{L}\\p{M}\\p{N}])`,
    "iu",
  );
  const wholeMatches = results.filter(({ name }) => wholeWords.test(name));
  const prefixMatches = results.filter(({ name }) => name.toLowerCase().startsWith(term));
  const closestMatches = wholeMatches.length ? wholeMatches : prefixMatches;

  return {
    results: (closestMatches.length ? closestMatches : results).sort(
      (a, b) => a.name.length - b.name.length || a.name.localeCompare(b.name),
    ),
    error,
  };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const { q } = await searchParams;
  const query = (Array.isArray(q) ? q[0] : q)?.trim() ?? "";
  const { results, error } = query ? await search(query) : { results: [], error: null };

  return (
    <section className="min-h-screen bg-white px-6 pb-20 pt-32 text-neutral-900 md:px-10">
      <h1 className="text-4xl font-semibold tracking-tight">Search results</h1>
      <p className="mt-4 text-neutral-500">
        {query ? <>Results for <span className="text-neutral-900">{query}</span></> : "Enter a search term."}
      </p>

      {error && <p className="mt-6 text-neutral-600">Some results could not be loaded.</p>}
      {query && !error && !results.length && <p className="mt-6">No results found.</p>}

      {results.length > 0 && (
        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.map(({ key, name, href, kind, artist }) => (
            <li key={key}>
              <Link
                href={href}
                className="block h-full rounded-2xl border border-neutral-200 p-6 transition-colors hover:border-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-4"
              >
                <p className="text-sm uppercase tracking-wide text-neutral-500">{kind}</p>
                <h2 className="mt-2 text-xl font-semibold">{name}</h2>
                {artist && <p className="mt-1 text-neutral-600">{artist}</p>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

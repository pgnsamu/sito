import ArtistDirectoryResults, { type DirectoryArtist } from "@/components/ArtistDirectoryResults";
import { createClient } from "@/lib/supabase/server";

type Category = "fashion" | "visualculture" | { id: string; name: string };

type ArtistRow = Omit<DirectoryArtist, "genre" | "workGenres"> & {
  genres: { name: string } | null;
  works?: { genre_id: number; genres: { name: string } | null }[];
};

async function loadArtists(category: Category) {
  const supabase = await createClient();
  const artists = supabase
    .from("artists")
    .select(typeof category === "string"
      ? "id, name, url_image, description, genres(name), works(genre_id, genres(name))"
      : "id, name, url_image, description, genres(name)")
    .order("name")
    .order("id");

  if (typeof category === "object") {
    artists.eq("genre_id", category.id);
  } else {
    artists.eq("works.visible", true);
    const { data: genres, error } = await supabase
      .from("genres")
      .select("id")
      .ilike("name", "Fashion");

    if (error) return { data: null, error };

    const fashionIds = genres.map(({ id }) => id);

    if (category === "fashion") {
      if (!fashionIds.length) return { data: [], error: null };
      artists.in("genre_id", fashionIds);
    } else if (fashionIds.length) {
      artists.or(`genre_id.is.null,genre_id.not.in.(${fashionIds.join(",")})`);
    }
  }

  return artists.overrideTypes<ArtistRow[], { merge: false }>();
}

export default async function ArtistDirectory({
  category,
}: {
  category: Category;
}) {
  const { data: artists, error } = await loadArtists(category);
  if (error) console.error("Could not load artists", error);

  return (
    <section className="min-h-screen bg-white px-6 pb-20 pt-32 text-black md:px-12 lg:px-20">
      {typeof category === "object" && (
        <h1 className="mb-16 text-center text-3xl font-semibold tracking-tight md:text-5xl">
          {category.name}
        </h1>
      )}

      {artists?.length ? (
        <ArtistDirectoryResults
          artists={artists.map(({ genres, works = [], ...artist }) => {
            const workGenres = new Map<number, string>();
            for (const { genre_id, genres } of works) {
              if (genres) workGenres.set(genre_id, genres.name);
            }

            return { ...artist, genre: genres?.name ?? null, workGenres: [...workGenres] };
          })}
          showFilters={typeof category === "string"}
        />
      ) : (
        <p className="text-center text-neutral-500">
          {error ? "Artists could not be loaded." : "No artists in this category yet."}
        </p>
      )}
    </section>
  );
}

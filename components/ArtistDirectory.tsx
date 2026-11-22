import Link from "next/link";
import ArtistCard from "@/components/ArtistCard";
import { createClient } from "@/lib/supabase/server";

type Category = "fashion" | "visualculture" | { id: string; name: string };

async function loadArtists(category: Category) {
  const supabase = await createClient();
  const artists = supabase
    .from("artists")
    .select("id, name, url_image")
    .order("name")
    .order("id");

  if (typeof category === "object") {
    return artists.eq("genre_id", category.id);
  }

  const { data: genres, error } = await supabase
    .from("genres")
    .select("id")
    .ilike("name", "Fashion");

  if (error) return { data: null, error };

  const fashionIds = genres.map(({ id }) => id);

  if (category === "fashion") {
    if (!fashionIds.length) return { data: [], error: null };
    return artists.in("genre_id", fashionIds);
  }

  if (fashionIds.length) {
    artists.or(`genre_id.is.null,genre_id.not.in.(${fashionIds.join(",")})`);
  }

  return artists;
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
      {typeof category === "object" ? (
        <h1 className="mb-16 text-center text-3xl font-semibold tracking-tight md:text-5xl">
          {category.name}
        </h1>
      ) : (
        <div className="mb-16 flex justify-center">
          <div className="group flex h-12 w-[300px] items-center gap-3 rounded-full border border-neutral-300 bg-white-100 px-5 transition-all duration-300 ease-out hover:border-neutral-400 focus-within:w-[340px] focus-within:border-neutral-900 focus-within:bg-white">
            <div className="relative flex h-5 w-5 shrink-0 items-center justify-center">
              <span className="block h-3.5 w-3.5 rounded-full border border-neutral-500 transition-colors duration-300 group-focus-within:border-neutral-900" />
              <span className="absolute bottom-0.5 right-0.5 h-2 w-px rotate-[-45deg] rounded-full bg-white-500 transition-colors duration-300 group-focus-within:bg-white-900" />
            </div>
            <input
              type="text"
              placeholder="Search Artist"
              className="w-full bg-transparent text-base font-light tracking-wide text-neutral-900 outline-none placeholder:text-neutral-400"
            />
          </div>
        </div>
      )}

      {artists?.length ? (
        <div className="grid grid-cols-1 gap-x-10 gap-y-16 sm:grid-cols-2 lg:grid-cols-5">
          {artists.map((artist, index) => (
            <Link href={`/artists/${artist.id}`} className="group" key={artist.id}>
              <ArtistCard
                artist={{ id: artist.id, name: artist.name, image: artist.url_image }}
                isLower={index % 2 !== 0}
              />
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-center text-neutral-500">
          {error ? "Artists could not be loaded." : "No artists in this category yet."}
        </p>
      )}
    </section>
  );
}

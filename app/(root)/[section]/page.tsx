// app/[section]/page.tsx
import ArtistCard from "@/components/ArtistCard";
import Link from "next/link";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";


const sectionsData = {
  art: {
    title: "Art",
    description: "Opere, artisti e collezioni d'arte.",
    items: Array.from({ length: 40 }, (_, index) => ({
      id: index + 1,
      name: `Nome artista ${String(index + 1).padStart(2, "0")}`,
      url_image: `/artists/artist-${index + 1}.jpg`,
    }))
  },

  photography: {
    title: "Photography",
    description: "Scatti, serie fotografiche e progetti visuali.",
    items: Array.from({ length: 40 }, (_, index) => ({
      id: index + 1,
      name: `Nome artista ${String(index + 1).padStart(2, "0")}`,
      url_image: `/artists/artist-${index + 1}.jpg`,
    }))
  },

  moda: {
    title: "Moda",
    description: "Editoriali, designer e collezioni moda.",
    items: Array.from({ length: 40 }, (_, index) => ({
      id: index + 1,
      name: `Nome artista ${String(index + 1).padStart(2, "0")}`,
      url_image: `/artists/artist-${index + 1}.jpg`,
    }))
  },
};

type SectionKey = keyof typeof sectionsData;

const sectionPage = async ({ params }: { params: Promise<{ section: string }> }) => {

  const resolvedParams = await params;

  const section = resolvedParams.section as SectionKey;
  const data = sectionsData[section];
  const supabase = await createClient();

  const { data: genreData } = await supabase
    .from("genres")
    .select("id")
    .ilike("name", data?.title ?? section)
    .maybeSingle();

  const { data: artistsData } = genreData
    ? await supabase
        .from("artists")
        .select("id, name, url_image")
        .eq("genre_id", genreData.id)
        .order("name", { ascending: true })
    : { data: null };

  const artists = artistsData?.length ? artistsData : data?.items;
  console.log("ARTISTS DATA", genreData, artistsData);
  if (!data) {
    redirect("/");
  }

  return (
    <section className="mx-auto max-w-7xl px-6 pt-32 pb-20 md:px-10">
      {/* SEARCH */}
      <div className="mb-16 flex justify-center">
        <div className="group flex h-12 w-[300px] items-center gap-3 rounded-full border border-neutral-300 bg-neutral-100 px-5 transition-all duration-300 ease-out hover:border-neutral-400 focus-within:w-[340px] focus-within:border-neutral-900 focus-within:bg-white">
          <div className="relative flex h-5 w-5 shrink-0 items-center justify-center">
            <span className="block h-3.5 w-3.5 rounded-full border border-neutral-500 transition-colors duration-300 group-focus-within:border-neutral-900" />
            <span className="absolute bottom-0.5 right-0.5 h-2 w-px rotate-[-45deg] rounded-full bg-neutral-500 transition-colors duration-300 group-focus-within:bg-neutral-900" />
          </div>

          <input
            type="text"
            placeholder="Search Artist"
            className="w-full bg-transparent text-base font-light tracking-wide text-neutral-900 outline-none placeholder:text-neutral-400"
          />
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 gap-x-10 gap-y-16 sm:grid-cols-2 lg:grid-cols-5">
        {artists?.map((item, index) => (
          <Link href={`/artists/${item.id}`} className="group" key={item.id}>
            <ArtistCard
              key={item.id}
              artist={{ id: item.id, name: item.name, image: item.url_image }}
              isLower={index % 2 !== 0}
            />
          </Link>
        ))}
      </div>
    </section>
  );
}


export default sectionPage;
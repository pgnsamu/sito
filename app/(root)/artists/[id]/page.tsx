import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import WorkImage from "./WorkImage";

//TODO: capire come fare una specie di hash dell'id per evitare di esporre id sequenziali e prevedibili, magari usando un hashids o simili

const ArtistWorks = async ( {params}: {params: Promise<{id: string}>} ) => {
  const { id } = await params;

  const supabase = await createClient();
  
  const [artistResult, worksResult] = await Promise.all([
    supabase.from("artists").select("name").eq("id", id).maybeSingle(),
    supabase
      .from("works")
      .select("id, name, url_image")
      .eq("artist_id", id)
      .order("name", { ascending: true }),
  ]);

  if (artistResult.error) throw artistResult.error;
  if (!artistResult.data) notFound();
  if (worksResult.error) throw worksResult.error;

  const works = worksResult.data ?? [];

  return (
    <section className="min-h-screen bg-white px-1 pb-20 pt-32 text-black">
      <h1 className="mb-16 px-5 text-center text-3xl font-semibold tracking-tight md:text-5xl">
        {artistResult.data.name}
      </h1>
      {/* WORKS GRID */}
      <div className="grid grid-cols-4 gap-x-2 gap-y-6 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12">
        {works.map((work, index) => (
          <WorkItem 
            key={work.id} 
            work={{id: work.id, name: work.name, url_image: work.url_image}} 
            index={index} />
        ))}
      </div>
    </section>
  );
} 

type Work = {
  id: number;
  name: string;
  url_image: string | null;
};

function WorkItem({ 
  work, 
  index 
}: { 
  work: Work; 
  index: number 
}) {
  const sizes = [
    "col-span-1 aspect-square",
    "col-span-1 aspect-[4/3]",
    "col-span-1 aspect-[3/4]",
    "col-span-2 aspect-[4/3]",
    "col-span-1 aspect-[5/4]",
    "col-span-1 aspect-square",
    "col-span-2 aspect-square",
    "col-span-1 aspect-[3/5]",
    "col-span-1 aspect-[4/3]",
    "col-span-1 aspect-square",
    "col-span-2 aspect-[3/2]",
    "col-span-1 aspect-[2/3]",
  ];

  return (
    <article className={`group ${sizes[index % sizes.length]}`}>
      <Link href="#" className="block h-full w-full">
        <div className="relative h-full w-full overflow-hidden bg-neutral-200">
          <WorkImage key={work.url_image} src={work.url_image?.trim()} name={work.name} />
        </div>
      </Link>
    </article>
  );
}

export default ArtistWorks;

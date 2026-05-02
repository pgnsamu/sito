import Image from "next/image";

const works = Array.from({ length: 40 }, (_, index) => ({
  id: index + 1,
  title: `Opera ${String(index + 1).padStart(2, "0")}`,
  image: `/works/work-${index + 1}.jpg`,
}));


const ArtistWorks = async ( {params}: {params: Promise<{id: string}>} ) => {
  const { id } = await params;

  //TODO: fetch artist data by id

  return (
    <section className="px-1 pt-24 pb-20">
      <h1></h1>
      {/* WORKS GRID */}
      <div className="grid grid-cols-4 gap-x-2 gap-y-6 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12">
        {works.map((work, index) => (
          <WorkItem key={work.id} work={work} index={index} />
        ))}
      </div>
    </section>
  );
} 

type Work = {
  id: number;
  title: string;
  image: string;
};

function WorkItem({ work, index }: { work: Work; index: number }) {
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
      <a href="#" className="block h-full w-full">
        <div className="relative h-full w-full overflow-hidden bg-neutral-200">
          <Image
            src={work.image}
            alt={work.title}
            fill
            sizes="(max-width: 640px) 25vw, (max-width: 1024px) 16vw, 8vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        </div>
      </a>
    </article>
  );
}

export default ArtistWorks;
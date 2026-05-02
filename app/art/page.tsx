import Image from "next/image";
import Navbar from "@/app/components/navbar";

const artists = [
  {
    id: 1,
    name: "nome artista",
    image: "/artists/artist-1.jpg",
  },
  {
    id: 2,
    name: "nome artista",
    image: "/artists/artist-2.jpg",
  },
  {
    id: 3,
    name: "nome artista",
    image: "/artists/artist-3.jpg",
  },
  {
    id: 4,
    name: "nome artista",
    image: "/artists/artist-4.jpg",
  },
  {
    id: 5,
    name: "nome artista",
    image: "/artists/artist-5.jpg",
  },
  {
    id: 6,
    name: "nome artista",
    image: "/artists/artist-6.jpg",
  },
  {
    id: 7,
    name: "nome artista",
    image: "/artists/artist-7.jpg",
  },
  {
    id: 8,
    name: "nome artista",
    image: "/artists/artist-8.jpg",
  },
];

export default function ArtPage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <Navbar />

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
          {artists.map((artist, index) => (
            <ArtistCard
              key={artist.id}
              artist={artist}
              isLower={index % 2 !== 0}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

type Artist = {
  id: number;
  name: string;
  image: string;
};

function ArtistCard({
  artist,
  isLower,
}: {
  artist: Artist;
  isLower: boolean;
}) {
  return (
    <article
      className={`group flex flex-col items-center ${
        isLower ? "lg:mt-12" : ""
      }`}
    >
      <div className="h-[260px] w-full max-w-[220px] bg-neutral-300 transition-transform duration-500 ease-out group-hover:scale-[1.10]">
        <Image
          src={artist.image}
          alt={artist.name}
          width={220}
          height={260}
          className="h-full w-full object-cover"
        />
      </div>

      <h2 className="mt-5 text-center text-2xl font-light transition-[text-shadow,letter-spacing] duration-300 ease-out group-hover:font-semibold group-hover:tracking-[-0.01em] group-hover:[text-shadow:0_0_0.35px_currentColor,0_0_0.35px_currentColor]">
        {artist.name}
      </h2>
    </article>
  );
}
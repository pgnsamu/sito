import Image from "next/image";

type Artist = {
  id: number;
  name: string;
  image: string;
}


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

export default ArtistCard;
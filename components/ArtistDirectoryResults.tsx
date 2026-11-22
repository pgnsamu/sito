"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import ArtistCard from "@/components/ArtistCard";

export type DirectoryArtist = {
  id: number;
  name: string;
  url_image: string | null;
  description: string | null;
  genre: string | null;
  workGenres: [id: number, name: string][];
};

function normalizeKeyword(value: string) {
  return value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

export default function ArtistDirectoryResults({
  artists,
  showFilters,
}: {
  artists: DirectoryArtist[];
  showFilters: boolean;
}) {
  const [keywords, setKeywords] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);

  const { genres, indexedArtists } = useMemo(() => {
    const genres = new Map<number, string>();
    const indexedArtists = artists.map((artist) => {
      for (const [id, name] of artist.workGenres) genres.set(id, name);

      return {
        artist,
        keywords: normalizeKeyword([
          artist.name,
          artist.genre,
          artist.description,
          ...artist.workGenres.map(([, name]) => name),
        ].join(" ")),
      };
    });

    return { genres: [...genres].sort(([, a], [, b]) => a.localeCompare(b)), indexedArtists };
  }, [artists]);

  const terms = normalizeKeyword(keywords).split(/[\s,]+/).filter(Boolean);
  const visibleArtists = indexedArtists
    .filter(({ artist, keywords }) =>
      (selectedGenre === null || artist.workGenres.some(([id]) => id === selectedGenre)) &&
      terms.every((term) => keywords.includes(term)),
    )
    .map(({ artist }) => artist);
  return (
    <>
      {showFilters && (
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between gap-4">
            <input
              type="text"
              aria-label="Filter by keyword"
              value={keywords}
              onChange={(event) => setKeywords(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") setKeywords("");
              }}
              // TODO: capire se aumentare la dimensione del placeholder in base alla larghezza dello schermo
              placeholder="Filter by keyword"
              autoComplete="off"
              className="min-h-9 min-w-0 max-w-64 flex-1 border-0 bg-transparent text-base text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:placeholder:text-neutral-700 sm:text-sm"
            />
            {genres.length > 0 && (
              <div className="relative min-w-0 max-w-32">
                <select
                  aria-label="Work genre"
                  value={selectedGenre ?? ""}
                  onChange={(event) => setSelectedGenre(event.target.value ? Number(event.target.value) : null)}
                  className="min-h-9 w-full cursor-pointer appearance-none truncate rounded-md bg-transparent py-1 pl-1 pr-5 text-sm text-neutral-500 hover:text-neutral-900 focus-visible:outline-1"
                >
                  <option value="">All genres</option>
                  {genres.map(([id, name]) => (
                    <option key={id} value={id}>{name}</option>
                  ))}
                </select>
                <ChevronDown aria-hidden="true" size={13} className="pointer-events-none absolute top-1/2 right-0.5 -translate-y-1/2 text-neutral-500" />
              </div>
            )}
          </div>
          <p role="status" className="sr-only">
            {visibleArtists.length} {visibleArtists.length === 1 ? "artist" : "artists"}
          </p>
        </div>
      )}

      {visibleArtists.length ? (
        <div className="grid grid-cols-1 gap-x-10 gap-y-16 sm:grid-cols-2 lg:grid-cols-5">
          {visibleArtists.map((artist, index) => (
            <Link href={`/artists/${artist.id}`} className="group" key={artist.id}>
              <ArtistCard
                artist={{ id: artist.id, name: artist.name, image: artist.url_image }}
                isLower={index % 2 !== 0}
              />
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-center text-neutral-600">No artists match these filters.</p>
      )}
    </>
  );
}

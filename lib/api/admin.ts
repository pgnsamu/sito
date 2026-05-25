// lib/api/admin.ts

import { createClient } from "@/lib/supabase/client";

async function callAdminFunction<TResponse>(
  functionName: string,
  method: "POST" | "PATCH" | "DELETE",
  body: unknown
): Promise<TResponse> {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Non sei loggato");
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/${functionName}`,
    {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(body),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error ?? "Errore durante la richiesta");
  }

  return result;
}

export type Genre = {
  id: number;
  name: string;
  created_at?: string;
};

export type Artist = {
  id: number;
  name: string;
  description: string | null;
  genre_id: number | null;
  created_at?: string;
};

export type Work = {
  id: number;
  name: string;
  production_date: string | null;
  url_image: string;
  description: string | null;
  artist_id: number;
  genre_id: number;
  visible: boolean;
  featured: boolean;
  created_at?: string;
};

export function createGenre(input: { name: string }) {
  return callAdminFunction<{ genre: Genre }>("create-genre", "POST", input);
}

export function updateGenre(input: { id: number; name: string }) {
  return callAdminFunction<{ genre: Genre }>("update-genre", "PATCH", input);
}

export function deleteGenre(id: number) {
  return callAdminFunction<{ deletedGenre: Genre }>("delete-genre", "DELETE", {
    id,
  });
}

export function createArtist(input: {
  name: string;
  description?: string;
  genre_id?: number | null;
}) {
  return callAdminFunction<{ artist: Artist }>("create-artist", "POST", input);
}

export function updateArtist(input: {
  id: number;
  name?: string;
  description?: string;
  genre_id?: number | null;
}) {
  return callAdminFunction<{ artist: Artist }>("update-artist", "PATCH", input);
}

export function deleteArtist(id: number) {
  return callAdminFunction<{ deletedArtist: Artist }>(
    "delete-artist",
    "DELETE",
    { id }
  );
}

export function createWork(input: {
  name: string;
  production_date?: string | null;
  url_image: string;
  description?: string;
  artist_id: number;
  genre_id: number;
  visible?: boolean;
  featured?: boolean;
}) {
  return callAdminFunction<{ work: Work }>("create-work", "POST", input);
}

export function updateWork(input: {
  id: number;
  name?: string;
  production_date?: string | null;
  url_image?: string;
  description?: string;
  artist_id?: number;
  genre_id?: number;
  visible?: boolean;
  featured?: boolean;
}) {
  return callAdminFunction<{ work: Work }>("update-work", "PATCH", input);
}

export function deleteWork(id: number) {
  return callAdminFunction<{ deletedWork: Work }>("delete-work", "DELETE", {
    id,
  });
}
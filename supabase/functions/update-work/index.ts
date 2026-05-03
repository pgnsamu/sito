// supabase/functions/update-work/index.ts

import { createClient } from "npm:@supabase/supabase-js@2";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

async function getAdminSupabaseClient(req: Request) {
  const authHeader = req.headers.get("Authorization");

  if (!authHeader) {
    return {
      error: jsonResponse({ error: "Missing authorization header" }, 401),
      supabase: null,
    };
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    }
  );

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      error: jsonResponse({ error: "Unauthorized" }, 401),
      supabase: null,
    };
  }

  if (user.app_metadata?.role !== "admin") {
    return {
      error: jsonResponse({ error: "Forbidden" }, 403),
      supabase: null,
    };
  }

  return { error: null, supabase };
}

Deno.serve(async (req) => {
  if (req.method !== "PATCH") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const { error: authError, supabase } = await getAdminSupabaseClient(req);

  if (authError || !supabase) {
    return authError;
  }

  let body: {
    id?: number;
    name?: string;
    production_date?: string | null;
    url?: string;
    description?: string;
    artist_id?: number;
    genre_id?: number;
  };

  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const id = Number(body.id);

  if (!Number.isInteger(id)) {
    return jsonResponse({ error: "Valid work id is required" }, 400);
  }

  const updates: {
    name?: string;
    production_date?: string | null;
    url?: string;
    description?: string;
    artist_id?: number;
    genre_id?: number;
  } = {};

  if ("name" in body) {
    const name = String(body.name ?? "").trim();

    if (!name) {
      return jsonResponse({ error: "Work name cannot be empty" }, 400);
    }

    updates.name = name;
  }

  if ("production_date" in body) {
    if (body.production_date === null || body.production_date === "") {
      updates.production_date = null;
    } else {
      const productionDate = String(body.production_date);

      if (Number.isNaN(Date.parse(productionDate))) {
        return jsonResponse({ error: "Invalid production_date" }, 400);
      }

      updates.production_date = productionDate;
    }
  }

  if ("url" in body) {
    const url = String(body.url ?? "").trim();

    if (!url) {
      return jsonResponse({ error: "Work url cannot be empty" }, 400);
    }

    updates.url = url;
  }

  if ("description" in body) {
    updates.description = String(body.description ?? "").trim();
  }

  if ("artist_id" in body) {
    const artistId = Number(body.artist_id);

    if (!Number.isInteger(artistId)) {
      return jsonResponse({ error: "Valid artist_id is required" }, 400);
    }

    updates.artist_id = artistId;
  }

  if ("genre_id" in body) {
    const genreId = Number(body.genre_id);

    if (!Number.isInteger(genreId)) {
      return jsonResponse({ error: "Valid genre_id is required" }, 400);
    }

    updates.genre_id = genreId;
  }

  if (Object.keys(updates).length === 0) {
    return jsonResponse({ error: "No fields to update" }, 400);
  }

  const { data, error } = await supabase
    .from("works")
    .update(updates)
    .eq("id", id)
    .select(`
      id,
      created_at,
      name,
      production_date,
      url,
      description,
      artist_id,
      genre_id,
      artists (
        id,
        name
      ),
      genres (
        id,
        name
      )
    `)
    .single();

  if (error) {
    return jsonResponse({ error: error.message }, 400);
  }

  return jsonResponse({ work: data }, 200);
});
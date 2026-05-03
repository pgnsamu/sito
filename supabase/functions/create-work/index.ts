import { createClient } from "npm:@supabase/supabase-js@2";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const authHeader = req.headers.get("Authorization");

  if (!authHeader) {
    return jsonResponse({ error: "Missing authorization header" }, 401);
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
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  if (user.app_metadata?.role !== "admin") {
    return jsonResponse({ error: "Forbidden" }, 403);
  }

  let body: {
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

  const name = String(body.name ?? "").trim();
  const productionDate = body.production_date ?? null;
  const url = String(body.url ?? "").trim();
  const description = String(body.description ?? "").trim();
  const artistId = Number(body.artist_id);
  const genreId = Number(body.genre_id);

  if (!name) {
    return jsonResponse({ error: "Work name is required" }, 400);
  }

  if (!url) {
    return jsonResponse({ error: "Work url is required" }, 400);
  }

  if (!Number.isInteger(artistId)) {
    return jsonResponse({ error: "Valid artist_id is required" }, 400);
  }

  if (!Number.isInteger(genreId)) {
    return jsonResponse({ error: "Valid genre_id is required" }, 400);
  }

  if (productionDate && Number.isNaN(Date.parse(productionDate))) {
    return jsonResponse({ error: "Invalid production_date" }, 400);
  }

  const { data, error } = await supabase
    .from("works")
    .insert({
      name,
      production_date: productionDate,
      url,
      description,
      artist_id: artistId,
      genre_id: genreId,
    })
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

  return jsonResponse({ work: data }, 201);
});
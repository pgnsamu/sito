import { createClient } from "npm:@supabase/supabase-js@2";

const allowedOrigins = [
  "http://localhost:3000",
  "https://www.tuosito.com",
  "https://tuosito.com",
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("Origin");

  const allowedOrigin =
    origin && allowedOrigins.includes(origin)
      ? origin
      : "https://www.tuosito.com";

  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, PATCH, DELETE, OPTIONS",
    "Vary": "Origin",
  };
}

function jsonResponse(req: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...getCorsHeaders(req),
      "Content-Type": "application/json",
    },
  });
}

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: getCorsHeaders(req),
    });
  }

  if (req.method !== "POST") {
    return jsonResponse(req, { error: "Method not allowed" }, 405);
  }

  const authHeader = req.headers.get("Authorization");

  if (!authHeader) {
    return jsonResponse(req, { error: "Missing authorization header" }, 401);
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
    return jsonResponse(req, { error: "Unauthorized" }, 401);
  }

  if (user.app_metadata?.role !== "admin") {
    return jsonResponse(req, { error: "Forbidden" }, 403);
  }

  let body: {
    name?: string;
    production_date?: string | null;
    url_image?: string;
    description?: string;
    artist_id?: number;
    genre_id?: number;
    featured?: boolean;
  };

  try {
    body = await req.json();
  } catch {
    return jsonResponse(req, { error: "Invalid JSON body" }, 400);
  }

  const name = String(body.name ?? "").trim();
  const productionDate = body.production_date ?? null;
  const url_image = String(body.url_image ?? "").trim();
  const description = String(body.description ?? "").trim();
  const artistId = Number(body.artist_id);
  const genreId = Number(body.genre_id);
  const featured = Boolean(body.featured);

  if (!name) {
    return jsonResponse(req, { error: "Work name is required" }, 400);
  }

  if (!url_image) {
    return jsonResponse(req, { error: "Work url_image is required" }, 400);
  }

  if (!Number.isInteger(artistId)) {
    return jsonResponse(req, { error: "Valid artist_id is required" }, 400);
  }

  if (!Number.isInteger(genreId)) {
    return jsonResponse(req, { error: "Valid genre_id is required" }, 400);
  }

  if (productionDate && Number.isNaN(Date.parse(productionDate))) {
    return jsonResponse(req, { error: "Invalid production_date" }, 400);
  }

  const { data, error } = await supabase
    .from("works")
    .insert({
      name,
      production_date: productionDate,
      url_image: url_image,
      description,
      artist_id: artistId,
      genre_id: genreId,
      featured: featured,
    })
    .select(`
      id,
      created_at,
      name,
      production_date,
      url_image,
      description,
      artist_id,
      genre_id,
      featured,
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
    return jsonResponse(req, { error: error.message }, 400);
  }

  return jsonResponse(req, { work: data }, 201);
});
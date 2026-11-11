// supabase/functions/create-artist/index.ts

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

  // Only allow POST requests
  if (req.method !== "POST") {
    return jsonResponse(req, { error: "Method not allowed" }, 405);
  }
  // Get the authorization header from the request
  const authHeader = req.headers.get("Authorization");
  
  if (!authHeader) {
    return jsonResponse(req, { error: "Missing authorization header" }, 401);
  }
  
  // Initialize Supabase client with the authorization header
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

  // Get the user from the Supabase auth context
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  // Check if there was an error getting the user or if the user is not authenticated
  if (userError || !user) {
    return jsonResponse(req, { error: "Unauthorized" }, 401);
  }

  if (user.app_metadata?.role !== "admin") {
    return jsonResponse(req, { error: "Forbidden" }, 403);
  }

  // Parse the request body as JSON
  const body = await req.json();

  const name = String(body.name ?? "").trim();
  const description = String(body.description ?? "").trim();
  const genreId = body.genre_id == null ? null : Number(body.genre_id);
  const url_image = String(body.url_image ?? "").trim();

  if (!name) {
    return jsonResponse(req, { error: "Artist name is required" }, 400);
  }

  const roleIds = body.role_ids ?? [];
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!Array.isArray(roleIds) || roleIds.some(id => typeof id !== "string" || !uuid.test(id))) {
    return jsonResponse(req, { error: "Ruoli non validi." }, 400);
  }

  if (roleIds.length > 0) {
    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data, error } = await db.rpc("create_artist_with_roles", {
      p_name: name,
      p_description: description,
      p_genre_id: genreId,
      p_url_image: url_image,
      p_role_ids: roleIds,
    });
    if (error) return jsonResponse(req, { error: error.message }, 400);
    return jsonResponse(req, { artist: data }, 201);
  }

  const { data, error } = await supabase
    .from("artists")
    .insert({
      name,
      description,
      genre_id: genreId,
      url_image,
    })
    .select()
    .single();

  if (error) {
    return jsonResponse(req, { error: error.message }, 400);
  }

  return jsonResponse(req, { artist: data }, 201);
});
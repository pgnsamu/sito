// supabase/functions/update-work/index.ts

import { createClient } from "npm:@supabase/supabase-js@2";

async function getAdminSupabaseClient(req: Request) {
  const authHeader = req.headers.get("Authorization");

  if (!authHeader) {
    return {
      error: jsonResponse(req, { error: "Missing authorization header" }, 401),
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
      error: jsonResponse(req, { error: "Unauthorized" }, 401),
      supabase: null,
    };
  }

  if (user.app_metadata?.role !== "admin") {
    return {
      error: jsonResponse(req, { error: "Forbidden" }, 403),
      supabase: null,
    };
  }

  return { error: null, supabase };
}

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
  
  if (req.method !== "PATCH") {
    return jsonResponse(req, { error: "Method not allowed" }, 405);
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
    visible?: boolean;
  };

  try {
    body = await req.json();
  } catch {
    return jsonResponse(req, { error: "Invalid JSON body" }, 400);
  }

  const id = Number(body.id);

  if (!Number.isInteger(id)) {
    return jsonResponse(req, { error: "Valid work id is required" }, 400);
  }

  const updates: {
    name?: string;
    production_date?: string | null;
    url?: string;
    description?: string;
    artist_id?: number;
    genre_id?: number;
    visible?: boolean;
  } = {};

  if ("name" in body) {
    const name = String(body.name ?? "").trim();

    if (!name) {
      return jsonResponse(req, { error: "Work name cannot be empty" }, 400);
    }

    updates.name = name;
  }

  if ("production_date" in body) {
    if (body.production_date === null || body.production_date === "") {
      updates.production_date = null;
    } else {
      const productionDate = String(body.production_date);

      if (Number.isNaN(Date.parse(productionDate))) {
        return jsonResponse(req, { error: "Invalid production_date" }, 400);
      }

      updates.production_date = productionDate;
    }
  }

  if ("url" in body) {
    const url = String(body.url ?? "").trim();

    if (!url) {
      return jsonResponse(req, { error: "Work url cannot be empty" }, 400);
    }

    updates.url = url;
  }

  if ("description" in body) {
    updates.description = String(body.description ?? "").trim();
  }

  if ("artist_id" in body) {
    const artistId = Number(body.artist_id);

    if (!Number.isInteger(artistId)) {
      return jsonResponse(req, { error: "Valid artist_id is required" }, 400);
    }

    updates.artist_id = artistId;
  }

  if ("genre_id" in body) {
    const genreId = Number(body.genre_id);

    if (!Number.isInteger(genreId)) {
      return jsonResponse(req, { error: "Valid genre_id is required" }, 400);
    }

    updates.genre_id = genreId;
  }

  if ("visible" in body) {
    const visible = Boolean(body.visible);

    if (typeof body.visible !== "boolean" && body.visible !== "true" && body.visible !== "false") {
      return jsonResponse(req, { error: "Visible must be a boolean value" }, 400);
    }
    
    updates.visible = Boolean(body.visible);
  }

  if (Object.keys(updates).length === 0) {
    return jsonResponse(req, { error: "No fields to update" }, 400);
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
      ),
      visible
    `)
    .single();

  if (error) {
    return jsonResponse(req, { error: error.message }, 400);
  }

  return jsonResponse(req, { work: data }, 200);
});
// supabase/functions/update-artist/index.ts

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
    description?: string;
    genre_id?: number | null;
  };

  try {
    body = await req.json();
  } catch {
    return jsonResponse(req, { error: "Invalid JSON body" }, 400);
  }

  const id = Number(body.id);

  if (!Number.isInteger(id)) {
    return jsonResponse(req, { error: "Valid artist id is required" }, 400);
  }

  const updates: {
    name?: string;
    description?: string;
    genre_id?: number | null;
  } = {};

  if ("name" in body) {
    const name = String(body.name ?? "").trim();

    if (!name) {
      return jsonResponse(req, { error: "Artist name cannot be empty" }, 400);
    }

    updates.name = name;
  }

  if ("description" in body) {
    updates.description = String(body.description ?? "").trim();
  }

  if ("genre_id" in body) {
    if (body.genre_id === null) {
      updates.genre_id = null;
    } else {
      const genreId = Number(body.genre_id);

      if (!Number.isInteger(genreId)) {
        return jsonResponse(req, { error: "Valid genre_id is required" }, 400);
      }

      updates.genre_id = genreId;
    }
  }

  if (Object.keys(updates).length === 0) {
    return jsonResponse(req, { error: "No fields to update" }, 400);
  }

  const { data, error } = await supabase
    .from("artists")
    .update(updates)
    .eq("id", id)
    .select(`
      id,
      created_at,
      name,
      description,
      genre_id,
      genres (
        id,
        name
      )
    `)
    .single();

  if (error) {
    return jsonResponse(req, { error: error.message }, 400);
  }

  return jsonResponse(req, { artist: data }, 200);
});
// supabase/functions/update-artist/index.ts

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
    description?: string;
    genre_id?: number | null;
  };

  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const id = Number(body.id);

  if (!Number.isInteger(id)) {
    return jsonResponse({ error: "Valid artist id is required" }, 400);
  }

  const updates: {
    name?: string;
    description?: string;
    genre_id?: number | null;
  } = {};

  if ("name" in body) {
    const name = String(body.name ?? "").trim();

    if (!name) {
      return jsonResponse({ error: "Artist name cannot be empty" }, 400);
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
        return jsonResponse({ error: "Valid genre_id is required" }, 400);
      }

      updates.genre_id = genreId;
    }
  }

  if (Object.keys(updates).length === 0) {
    return jsonResponse({ error: "No fields to update" }, 400);
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
    return jsonResponse({ error: error.message }, 400);
  }

  return jsonResponse({ artist: data }, 200);
});
// supabase/functions/update-genre/index.ts

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
  };

  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const id = Number(body.id);
  const name = String(body.name ?? "").trim();

  if (!Number.isInteger(id)) {
    return jsonResponse({ error: "Valid genre id is required" }, 400);
  }

  if (!name) {
    return jsonResponse({ error: "Genre name is required" }, 400);
  }

  const { data, error } = await supabase
    .from("genres")
    .update({ name })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return jsonResponse({ error: error.message }, 400);
  }

  return jsonResponse({ genre: data }, 200);
});
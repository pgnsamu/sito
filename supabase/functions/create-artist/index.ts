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
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
  // Get the authorization header from the request
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: "Missing authorization header" }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
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
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
  
  // Check if the user has the "admin" role in their app metadata
  if (user.app_metadata?.role !== "admin") {
    return new Response(
      JSON.stringify({ error: "Forbidden" }),
      {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Parse the request body as JSON
  const body = await req.json();

  const name = String(body.name ?? "").trim();
  const description = String(body.description ?? "").trim();
  const genreId = Number(body.genreId);

  if (!name) {
    return new Response(
      JSON.stringify({ error: "Name is required" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  /* forse non serve perché lo fa lato server questo controllo grazie ai controlli */
  const { data, error } = await supabase
  .from("genres")
  .select("id")
  .eq("id", genreId)
  .single();
  
  if (error || !data) {
    return new Response(
      JSON.stringify({ error: "Invalid genre ID" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }


  const { data, error } = await supabase
    .from("artists")
    .insert({
      name,
      description,
      genre_id: genreId,
    })
    .select()
    .single();

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  return new Response(
    JSON.stringify({ artist: data }),
    {
      status: 201,
      headers: { "Content-Type": "application/json" },
    }
  );
});
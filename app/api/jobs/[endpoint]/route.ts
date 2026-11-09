async function forward(request: Request, { params }: RouteContext<"/api/jobs/[endpoint]">) {
  const { endpoint } = await params;
  if (endpoint !== "jobs" && endpoint !== "admin-jobs") {
    return Response.json({ error: "Endpoint non trovato." }, { status: 404 });
  }

  const headers = new Headers({
    apikey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    "Content-Type": "application/json",
  });
  const authorization = request.headers.get("Authorization");
  if (endpoint === "admin-jobs" && authorization) {
    headers.set("Authorization", authorization);
  }

  try {
    const upstream = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/${endpoint}`,
      {
        method: request.method,
        headers,
        body: request.method === "POST" ? await request.text() : undefined,
        cache: "no-store",
      },
    );
    if (!upstream.headers.get("Content-Type")?.includes("application/json")) {
      return Response.json({ error: "Risposta non valida da Supabase." }, { status: 502 });
    }
    return new Response(upstream.body, {
      status: upstream.status,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  } catch {
    return Response.json({ error: "Supabase non raggiungibile." }, { status: 502 });
  }
}

export { forward as GET, forward as POST };

export async function POST(request: Request) {
  const authorization = request.headers.get("Authorization");
  if (!authorization) return Response.json({ error: "Accesso richiesto." }, { status: 401 });
  const raw = await request.text();
  if (raw.length > 4096) return Response.json({ error: "Richiesta troppo grande." }, { status: 413 });
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/admin-photos`, {
      method: "POST",
      headers: {
        Authorization: authorization,
        apikey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        "Content-Type": "application/json",
      },
      body: raw,
      cache: "no-store",
    });
    if (!response.headers.get("Content-Type")?.includes("application/json")) {
      return Response.json({ error: "Risposta non valida dal servizio foto." }, { status: 502 });
    }
    return new Response(response.body, {
      status: response.status,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  } catch {
    return Response.json({ error: "Servizio foto non raggiungibile." }, { status: 502 });
  }
}

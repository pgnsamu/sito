const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Content-Type": "application/json",
};
const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers });
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function field(body: Record<string, unknown>, key: string, max = 160, required = true) {
  const value = body[key];
  if (typeof value !== "string" || value.trim().length > max || (required && !value.trim())) throw new Error(`Campo non valido: ${key}`);
  return value.trim();
}
function email(body: Record<string, unknown>) {
  const value = field(body, "email", 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) throw new Error("Email non valida.");
  return value;
}
async function readBody(req: Request): Promise<Record<string, unknown> | Response> {
    const raw = await req.text();
    if (raw.length > 20000) return reply({ error: "Richiesta troppo grande." }, 413);
    let body: Record<string, unknown>;
    try { body = JSON.parse(raw); } catch { return reply({ error: "JSON non valido." }, 400); }
    if (!body || typeof body !== "object" || Array.isArray(body)) return reply({ error: "Richiesta non valida." }, 400);
    return body;
}
function jobFields(body: Record<string, unknown>) {
  return {
    company: field(body, "company"),
    email: email(body),
    title: field(body, "title"),
    location: field(body, "location"),
    description: field(body, "description", 10000),
  };
}
export { headers, reply, uuid, field, email, readBody, jobFields };

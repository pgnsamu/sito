import { createClient } from "npm:@supabase/supabase-js@2";

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


Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers });
  if (req.method !== "POST") return reply({ error: "Metodo non consentito." }, 405);
  try {
    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
    const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
    if (!token) return reply({ error: "Accesso richiesto." }, 401);
    const { data: { user }, error } = await db.auth.getUser(token);
    if (error || !user) return reply({ error: "Sessione scaduta." }, 401);
    if (user.app_metadata?.role !== "admin") return reply({ error: "Accesso negato." }, 403);
    const body = await readBody(req);
    if (body instanceof Response) return body;
    if (body.action === "list") {
      const [jobs, applications] = await Promise.all([
        db.from("job_requests").select("*").order("created_at", { ascending: false }),
        db.from("job_applications").select("*").order("created_at", { ascending: false }),
      ]);
      if (jobs.error || applications.error) throw jobs.error || applications.error;
      return reply({ jobs: jobs.data, applications: applications.data });
    }
    if (body.action === "delete") {
      if (typeof body.id !== "string" || !uuid.test(body.id)) return reply({ error: "ID non valido." }, 400);
      const { data, error } = await db.from("job_requests").delete().eq("id", body.id).select("id").maybeSingle();
      if (error) throw error;
      return data ? reply({ ok: true }) : reply({ error: "Richiesta non trovata." }, 404);
    }
    if (body.action === "save" || body.action === "set-status") {
      const { id, status } = body;
      if (status !== "pending" && status !== "published" && status !== "closed") {
        return reply({ error: "Stato non valido." }, 400);
      }
      if ((id !== undefined || body.action === "set-status") && (typeof id !== "string" || !uuid.test(id))) {
        return reply({ error: "ID non valido." }, 400);
      }
      const values = body.action === "set-status" ? { status } : { ...jobFields(body), status };
      const query = id
        ? db.from("job_requests").update(values).eq("id", id)
        : db.from("job_requests").insert(values);
      const { data, error } = await query.select().maybeSingle();
      if (error) throw error;
      return data ? reply({ job: data }) : reply({ error: "Richiesta non trovata." }, 404);
    }
    return reply({ error: "Azione non valida." }, 400);
  } catch (error) {
    if (error instanceof Error && (error.message.startsWith("Campo non valido") || error.message === "Email non valida.")) return reply({ error: error.message }, 400);
    console.error("Jobs request failed", error);
    return reply({ error: "Servizio non disponibile. Riprova più tardi." }, 500);
  }
});

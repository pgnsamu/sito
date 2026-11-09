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
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers });
  if (!["GET", "POST"].includes(req.method)) return reply({ error: "Metodo non consentito." }, 405);
  try {
    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
    if (req.method === "GET") {
      const { data, error } = await db.from("job_requests").select("id, company, title, location, description").eq("status", "published").order("created_at", { ascending: false });
      if (error) throw error;
      return reply({ jobs: data });
    }
    const raw = await req.text();
    if (raw.length > 20000) return reply({ error: "Richiesta troppo grande." }, 413);
    let body: Record<string, unknown>;
    try { body = JSON.parse(raw); } catch { return reply({ error: "JSON non valido." }, 400); }
    if (!body || typeof body !== "object" || Array.isArray(body)) return reply({ error: "Richiesta non valida." }, 400);
    const adminAction = ["list", "save", "delete"].includes(String(body.action));
    if (adminAction) {
      const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
      if (!token) return reply({ error: "Accesso richiesto." }, 401);
      const { data: { user }, error } = await db.auth.getUser(token);
      if (error || !user) return reply({ error: "Sessione scaduta." }, 401);
      if (user.app_metadata?.role !== "admin") return reply({ error: "Accesso negato." }, 403);
    }
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
    if (body.action === "apply") {
      if (body.website) return reply({ error: "Invio non valido." }, 400);
      if (typeof body.job_id !== "string" || !uuid.test(body.job_id)) return reply({ error: "Seleziona una posizione." }, 400);
      const { error } = await db.rpc("apply_to_job", { p_job_id: body.job_id, p_name: field(body, "name"), p_email: email(body), p_message: field(body, "message", 10000, false) });
      if (error?.code === "23505") return reply({ error: "Hai già inviato una candidatura per questa posizione." }, 409);
      if (error?.code === "P0001") return reply({ error: "Questa posizione non è più disponibile." }, 409);
      if (error) throw error;
      return reply({ ok: true }, 201);
    }
    if (body.action === "submit" || body.action === "save") {
      if (body.website) return reply({ error: "Invio non valido." }, 400);
      const status = body.action === "submit" ? "pending" : body.status;
      if (!["pending", "published", "closed"].includes(String(status))) return reply({ error: "Stato non valido." }, 400);
      const values = { company: field(body, "company"), email: email(body), title: field(body, "title"), location: field(body, "location"), description: field(body, "description", 10000), status };
      if (body.action === "save" && body.id && (typeof body.id !== "string" || !uuid.test(body.id))) return reply({ error: "ID non valido." }, 400);
      const query = body.action === "save" && body.id
        ? db.from("job_requests").update(values).eq("id", body.id)
        : db.from("job_requests").insert(values);
      const { data, error } = await query.select().single();
      if (error) throw error;
      return reply(body.action === "save" ? { job: data } : { ok: true }, 200);
    }
    return reply({ error: "Azione non valida." }, 400);
  } catch (error) {
    if (error instanceof Error && (error.message.startsWith("Campo non valido") || error.message === "Email non valida.")) return reply({ error: error.message }, 400);
    console.error("Jobs request failed", error);
    return reply({ error: "Servizio non disponibile. Riprova più tardi." }, 500);
  }
});

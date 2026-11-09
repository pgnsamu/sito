import { createClient } from "npm:@supabase/supabase-js@2";

import { headers, reply, uuid, readBody, jobFields } from "../_shared/jobs.ts";

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
    if (body.action === "save") {
      const { id, status } = body;
      if (status !== "pending" && status !== "published" && status !== "closed") {
        return reply({ error: "Stato non valido." }, 400);
      }
      if (id !== undefined && (typeof id !== "string" || !uuid.test(id))) {
        return reply({ error: "ID non valido." }, 400);
      }
      const values = { ...jobFields(body), status };
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

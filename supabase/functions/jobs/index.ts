import { createClient } from "npm:@supabase/supabase-js@2";

import { headers, reply, uuid, field, email, readBody, jobFields } from "../_shared/jobs.ts";

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
    const body = await readBody(req);
    if (body instanceof Response) return body;
    if (body.action === "apply") {
      if (body.website) return reply({ error: "Invio non valido." }, 400);
      if (typeof body.job_id !== "string" || !uuid.test(body.job_id)) return reply({ error: "Seleziona una posizione." }, 400);
      const { error } = await db.rpc("apply_to_job", { p_job_id: body.job_id, p_name: field(body, "name"), p_email: email(body), p_message: field(body, "message", 10000, false) });
      if (error?.code === "23505") return reply({ error: "Hai già inviato una candidatura per questa posizione." }, 409);
      if (error?.code === "P0001") return reply({ error: "Questa posizione non è più disponibile." }, 409);
      if (error) throw error;
      return reply({ ok: true }, 201);
    }
    if (body.action === "submit") {
      if (body.website) return reply({ error: "Invio non valido." }, 400);
      const values = { ...jobFields(body), status: "pending" };
      const { error } = await db.from("job_requests").insert(values);
      if (error) throw error;
      return reply({ ok: true });
    }
    return reply({ error: "Azione non valida." }, 400);
  } catch (error) {
    if (error instanceof Error && (error.message.startsWith("Campo non valido") || error.message === "Email non valida.")) return reply({ error: error.message }, 400);
    console.error("Jobs request failed", error);
    return reply({ error: "Servizio non disponibile. Riprova più tardi." }, 500);
  }
});

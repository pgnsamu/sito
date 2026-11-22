import { createClient } from "npm:@supabase/supabase-js@2";
import { MAX_PHOTO_BYTES, PHOTO_TYPES, PhotoError, photoConfig, objectUrl, readPhoto } from "../_shared/photos.ts";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
  "Cache-Control": "no-store",
};
const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers });
  if (req.method !== "POST") return reply({ error: "Metodo non consentito." }, 405);
  try {
    const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
    if (!token) return reply({ error: "Accesso richiesto." }, 401);
    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
    const { data: { user }, error: authError } = await db.auth.getUser(token);
    if (authError || !user) return reply({ error: "Sessione scaduta." }, 401);
    if (user.app_metadata?.role !== "admin") return reply({ error: "Accesso negato." }, 403);
    const raw = await req.text();
    if (raw.length > 4096) return reply({ error: "Richiesta troppo grande." }, 413);
    let body;
    try { body = JSON.parse(raw); } catch { return reply({ error: "JSON non valido." }, 400); }
    if (!body || typeof body !== "object" || Array.isArray(body)) return reply({ error: "Richiesta non valida." }, 400);
    if (!["prepare", "complete", "discard", "cleanup"].includes(body.action)) return reply({ error: "Azione non valida." }, 400);
    const config = photoConfig();

    if (body.action === "prepare") {
      if (body.scope !== "artists" && body.scope !== "works") throw new PhotoError("Destinazione foto non valida.");
      if (typeof body.type !== "string" || !Object.hasOwn(PHOTO_TYPES, body.type)) throw new PhotoError("Scegli una foto JPEG, PNG o WebP.");
      if (!Number.isSafeInteger(body.size) || body.size < 1 || body.size > MAX_PHOTO_BYTES) throw new PhotoError("La foto deve pesare al massimo 10 MB.");
      const id = crypto.randomUUID();
      const key = `${body.scope}/${id}.${PHOTO_TYPES[body.type]}`;
      const url = `${config.publicUrl}/${key}`;
      const signed = await config.client.sign(new Request(`${objectUrl(config, `_uploads/${id}`)}?X-Amz-Expires=300`, {
        method: "PUT", headers: { "Content-Type": body.type },
      }), { aws: { signQuery: true, allHeaders: true } });
      const { error } = await db.from("photo_assets").insert({
        id, key, url, owner_id: user.id, content_type: body.type, size: body.size, status: "pending",
      });
      if (error) throw error;
      return reply({ id, uploadUrl: signed.url }, 201);
    }

    if (body.action === "complete") {
      if (typeof body.id !== "string" || !uuid.test(body.id)) throw new PhotoError("Caricamento non valido.");
      const { data: asset, error } = await db.from("photo_assets").select("*").eq("id", body.id).eq("owner_id", user.id).maybeSingle();
      if (error) throw error;
      if (!asset) throw new PhotoError("Caricamento non trovato.", 404);
      if (asset.status === "ready") return reply({ photo: { url_image: asset.url, image_key: asset.key } });
      if (Date.now() - Date.parse(asset.created_at) > 10 * 60 * 1000) throw new PhotoError("Caricamento scaduto. Seleziona nuovamente la foto.", 410);
      const { data: claimed, error: claimError } = await db.from("photo_assets").update({ status: "publishing" })
        .eq("id", asset.id).eq("status", "pending").select("id").maybeSingle();
      if (claimError) throw claimError;
      if (!claimed) throw new PhotoError("Foto già in elaborazione. Riprova tra qualche secondo.", 409);
      try {
        const response = await config.client.fetch(objectUrl(config, `_uploads/${asset.id}`));
        const bytes = await readPhoto(response, asset.size, asset.content_type);
        // Publish a separate object. Reusing the PUT URL can never overwrite a saved photo.
        const published = await config.client.fetch(objectUrl(config, asset.key), {
          method: "PUT",
          headers: { "Content-Type": asset.content_type, "Cache-Control": "public, max-age=31536000, immutable" },
          body: bytes,
        });
        if (!published.ok) throw new PhotoError("Impossibile pubblicare la foto. Riprova.", 502);
        const { error: readyError } = await db.from("photo_assets").update({ status: "ready" }).eq("id", asset.id);
        if (readyError) throw readyError;
      } catch (error) {
        await db.from("photo_assets").update({ status: "pending" }).eq("id", asset.id).eq("status", "publishing");
        throw error;
      }
      // The staging prefix also has a one-day R2 lifecycle rule, covering interrupted uploads.
      try { await config.client.fetch(objectUrl(config, `_uploads/${asset.id}`), { method: "DELETE" }); } catch { /* lifecycle rule retries */ }
      return reply({ photo: { url_image: asset.url, image_key: asset.key } });
    }

    if (body.action === "discard") {
      if (typeof body.key !== "string") throw new PhotoError("Foto non valida.");
      // Foreign keys prevent deleting photos already attached to an artist or work.
      const { error } = await db.from("photo_assets").delete().eq("key", body.key).eq("owner_id", user.id);
      if (error && error.code !== "23503") throw error;
    } else {
      const { error } = await db.rpc("prune_photo_drafts");
      if (error) throw error;
    }
    // Deletion triggers enqueue replaced/removed keys. Delete the asset row first:
    // FK constraints make concurrent attempts to reuse a photo safe.
    const { data: queue, error: queueError } = await db.from("photo_deletions").select("key").limit(50);
    if (queueError) throw queueError;
    let remaining = 0;
    for (const { key } of queue ?? []) {
      const { error: removeError } = await db.from("photo_assets").delete().eq("key", key);
      if (removeError?.code === "23503") {
        // Still in use elsewhere: another replacement/deletion will enqueue it again.
        await db.from("photo_deletions").delete().eq("key", key);
        continue;
      }
      if (removeError) { remaining++; continue; }
      try {
        const response = await config.client.fetch(objectUrl(config, key), { method: "DELETE" });
        if (!response.ok && response.status !== 404) { remaining++; continue; }
        const { error } = await db.from("photo_deletions").delete().eq("key", key);
        if (error) remaining++;
      } catch { remaining++; }
    }
    const { count, error: countError } = await db.from("photo_deletions").select("key", { count: "exact", head: true });
    if (countError) throw countError;
    return reply({ ok: true, remaining: Math.max(remaining, count ?? 0) });
  } catch (error) {
    if (error instanceof PhotoError) return reply({ error: error.message }, error.status);
    console.error("Photo request failed", error);
    return reply({ error: "Servizio foto non disponibile. Verifica la configurazione e riprova." }, 500);
  }
});

import { createClient } from "@/lib/supabase/client";

export type PhotoValue = { url_image: string; image_key: string | null };
export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
export const PHOTO_ACCEPT = "image/jpeg,image/png,image/webp";

async function photoRequest<T>(body: Record<string, unknown>, signal?: AbortSignal): Promise<T> {
  const { data: { session } } = await createClient().auth.getSession();
  if (!session) throw new Error("Accedi nuovamente per caricare una foto.");
  const response = await fetch("/api/photos", {
    method: "POST",
    headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
    signal,
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Servizio foto non disponibile.");
  return result;
}

export async function uploadPhoto(file: File, scope: "artists" | "works", onProgress: (message: string) => void, signal: AbortSignal) {
  if (!PHOTO_ACCEPT.split(",").includes(file.type)) throw new Error("Scegli una foto JPEG, PNG o WebP.");
  if (file.size < 1 || file.size > MAX_PHOTO_BYTES) throw new Error("La foto deve pesare al massimo 10 MB.");
  onProgress("Preparazione…");
  const upload = await photoRequest<{ id: string; uploadUrl: string }>({ action: "prepare", scope, type: file.type, size: file.size }, signal);
  onProgress("Caricamento…");
  let response: Response;
  try {
    response = await fetch(upload.uploadUrl, {
      method: "PUT", headers: { "Content-Type": file.type }, body: file, signal,
    });
  } catch (error) {
    if (signal.aborted) throw error;
    throw new Error("Il browser non riesce a caricare la foto su R2. Verifica l’endpoint S3 e che CORS consenta l’indirizzo del sito.");
  }
  if (!response.ok) throw new Error("Caricamento non riuscito. Riprova o verifica la configurazione CORS di R2.");
  onProgress("Verifica della foto…");
  const { photo } = await photoRequest<{ photo: PhotoValue }>({ action: "complete", id: upload.id }, signal);
  return photo;
}

export async function discardPhoto(key: string) {
  await photoRequest({ action: "discard", key });
}

export async function cleanupPhotos() {
  return photoRequest<{ ok: boolean; remaining: number }>({ action: "cleanup" });
}

// Saving a record must still succeed if R2 cleanup is temporarily unavailable.
// Queued keys remain in Supabase and are retried by the next cleanup.
export function retryPhotoCleanup() {
  void cleanupPhotos().catch(() => undefined);
}

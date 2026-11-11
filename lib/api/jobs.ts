import { createClient } from "@/lib/supabase/client";
export type JobRole = { id: string; name: string };
export type JobRoleAlias = { role_id: string; name: string };
export type ArtistJobRole = { artist_id: number; role_id: string };
export type PublicJob = { id: string; company: string; title: string; location: string; description: string };
export type Job = PublicJob & { role_id?: string | null; email: string; status: "pending" | "published" | "closed"; created_at: string };
export type Application = { role_id?: string | null; id: string; job_id: string | null; job_title: string; company: string; name: string; email: string; message: string; created_at: string };
export async function jobsRequest<T>(body?: Record<string, unknown>, admin = false): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (admin) {
    const { data: { session } } = await createClient().auth.getSession();
    if (!session) throw new Error("Accedi nuovamente per continuare.");
    headers.Authorization = `Bearer ${session.access_token}`;
  }
  const response = await fetch(`/api/jobs/${admin ? "admin-jobs" : "jobs"}`, { method: body ? "POST" : "GET", headers, ...(body ? { body: JSON.stringify(body) } : {}), cache: "no-store" });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || result.message || "Servizio non disponibile.");
  return result;
}

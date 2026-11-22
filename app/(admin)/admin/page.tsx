// app/admin/page.tsx

//TODO: add loading state while inserting new data e pure un qualcosa per confermare l'update

import { redirect } from "next/navigation";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import AdminDashboard from "@/components/admin/AdminDashboard";

async function loadNewsletterEmails(): Promise<string[] | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;

  if (!url || !key) return null;

  try {
    const supabase = createSupabaseClient(url, key, { auth: { persistSession: false } });
    const emails: string[] = [];

    while (true) {
      const query = supabase
        .from("newsletter_subscribers")
        .select("email")
        .eq("subscribed", true)
        .order("email")
        .limit(500);
      const lastEmail = emails.at(-1);
      if (lastEmail !== undefined) query.gt("email", lastEmail);

      const { data, error } = await query;
      if (error) {
        console.error("Newsletter list unavailable", error.code);
        return null;
      }

      if (data.length === 0) return emails;
      for (const { email } of data) emails.push(email);
    }
  } catch {
    return null;
  }
}

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  if (user.app_metadata?.role !== "admin") {
    console.warn("Unauthorized access attempt to admin page by user:", user);
    redirect("/carosello");
  }
  if (user.app_metadata?.role === "authenticated") {
    console.warn("Unauthorized access attempt to admin page by user:", user);
    redirect("/jobs");
  }

  const [
    { data: genres },
    { data: artists },
    { data: works },
    { data: jobs },
    { data: applications },
    { data: roles, error: rolesError },
    { data: aliases },
    { data: artistRoles, error: artistRolesError },
    newsletterEmails,
  ] = await Promise.all([
    supabase.from("genres").select("*").order("name", { ascending: true }),
    supabase.from("artists").select("*").order("name", { ascending: true }),
    supabase.from("works").select("*").order("created_at", { ascending: false }),
    supabase.from("job_requests").select("*").order("created_at", { ascending: false }),
    supabase.from("job_applications").select("*").order("created_at", { ascending: false }),
    supabase.from("job_roles").select("*").order("name"),
    supabase.from("job_role_aliases").select("role_id, name").order("name"),
    supabase.from("artist_job_roles").select("artist_id, role_id"),
    loadNewsletterEmails(),
  ]);

  return (
    <AdminDashboard
      initialGenres={genres ?? []}
      initialArtists={artists ?? []}
      initialWorks={works ?? []}
      initialJobs={jobs}
      initialApplications={applications}
      initialRoles={roles ?? []}
      initialAliases={aliases ?? []}
      initialArtistRoles={artistRoles ?? []}
      artistRolesUnavailable={Boolean(rolesError || artistRolesError)}
      newsletterEmails={newsletterEmails}
    />
  );
}

// app/admin/page.tsx

//TODO: add loading state while inserting new data e pure un qualcosa per confermare l'update

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminDashboard from "@/components/admin/AdminDashboard";

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
    redirect("/");
  }

  const [{ data: genres }, { data: artists }, { data: works }] =
    await Promise.all([
      supabase.from("genres").select("*").order("name", { ascending: true }),
      supabase.from("artists").select("*").order("name", { ascending: true }),
      supabase.from("works").select("*").order("created_at", { ascending: false }),
    ]);

  return (
    <AdminDashboard
      initialGenres={genres ?? []}
      initialArtists={artists ?? []}
      initialWorks={works ?? []}
    />
  );
}
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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

  return (
    <main className="min-h-screen bg-neutral-950 p-8 text-white">
      <h1 className="text-3xl font-semibold">Dashboard admin</h1>
    </main>
  );
}
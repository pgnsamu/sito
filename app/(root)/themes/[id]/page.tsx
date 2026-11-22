import { notFound } from "next/navigation";
import ArtistDirectory from "@/components/ArtistDirectory";
import { createClient } from "@/lib/supabase/server";

export default async function ThemePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();

  const supabase = await createClient();
  const { data: theme, error } = await supabase
    .from("genres")
    .select("name")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!theme) notFound();

  return <ArtistDirectory category={{ id, name: theme.name }} />;
}

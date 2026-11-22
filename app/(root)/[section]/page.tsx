import ArtistDirectory from "@/components/ArtistDirectory";
import { redirect } from "next/navigation";

export default async function SectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;

  if (section !== "fashion") redirect("/");

  return <ArtistDirectory category="fashion" />;
}

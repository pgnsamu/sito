// app/artworks/page.tsx

import { createClient } from "@/lib/supabase/server";

const ArtworksPage = async () => {
  const supabase = await createClient();

  const { data: artworks, error } = await supabase
    .from("genres")
    .select("*");

  if (error) {
    console.error("Errore durante il recupero delle opere:", error);
    return <div>Errore: {error.message}</div>;
  }
  console.log("Generi recuperati:", artworks);
  return (
    <html lang="en">
      <body>
        <h1>Genres</h1>
        <pre>{JSON.stringify(artworks, null, 2)}</pre>
      </body>
    </html>
  );
}

export default ArtworksPage;
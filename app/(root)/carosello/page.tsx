import FeaturedCarousel from "@/components/FeaturedCarousel";
import { createClient } from "@/lib/supabase/server";

export default async function CarouselPage() {
  const supabase = await createClient();
  const { data: works, error } = await supabase
    .from("works")
    .select("id, name, url_image")
    .eq("featured", true)
    .eq("visible", true)
    .not("url_image", "is", null)
    .neq("url_image", "")
    .order("id");

  if (error) console.error("Could not load featured works", error);

  const slides = (works ?? []).filter((work) => work.url_image?.trim());
  if (!slides.length) {
    return (
      <section className="grid min-h-screen place-items-center bg-white px-6 text-center text-neutral-500">
        <p>{error ? "Featured works could not be loaded." : "No featured works yet."}</p>
      </section>
    );
  }

  return <FeaturedCarousel slides={slides} />;
}

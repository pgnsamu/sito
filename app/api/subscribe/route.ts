import { createClient } from "@supabase/supabase-js";

const unavailableMessage = "Sign-ups are temporarily unavailable. Please try again later.";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SECRET_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error("Newsletter requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY.");
      return Response.json({ error: unavailableMessage }, { status: 503 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
    const { error } = await supabaseAdmin
      .from("newsletter_subscribers")
      .upsert(
        {
          email,
          subscribed: true,
          unsubscribed_at: null,
        },
        {
          onConflict: "email",
        }
      );

    if (error) {
      console.error("Newsletter sign-up failed", error.code);
      return Response.json({ error: unavailableMessage }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Newsletter sign-up failed", error instanceof Error ? error.name : undefined);
    return Response.json({ error: unavailableMessage }, { status: 500 });
  }
}

import { createClient } from "@supabase/supabase-js";

export default async function UnsubscribePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    );
    const { error } = await supabaseAdmin
      .from("newsletter_subscribers")
      .update({
        subscribed: false,
        unsubscribed_at: new Date().toISOString(),
      })
      .eq("unsubscribe_token", token);

    if (error) throw error;
  } catch {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
        <div className="max-w-md text-center">
          <h1 className="text-3xl font-bold">Something went wrong</h1>
          <p className="mt-4 text-white/60">
            We couldn&apos;t unsubscribe this email. Please try again later.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
      <div className="max-w-md text-center">
        <h1 className="text-3xl font-bold">You&apos;re unsubscribed</h1>
        <p className="mt-4 text-white/60">
          You will no longer receive emails from us.
        </p>
      </div>
    </main>
  );
}

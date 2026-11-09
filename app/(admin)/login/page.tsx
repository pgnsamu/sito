// app/login/page.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsLoading(true);
    setErrorMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);

    if (error) {
      setErrorMessage("Email o password non corretti.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center px-4">
      <section className="w-full max-w-sm rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl backdrop-blur">
        <div className="mb-8">
          <p className="mb-2 text-sm text-neutral-400">Dashboard</p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Accesso admin
          </h1>
          <p className="mt-3 text-sm leading-6 text-neutral-400">
            Inserisci le credenziali dell’account amministratore.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm text-neutral-300"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@example.com"
              className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-white/30 focus:bg-white/[0.09]"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm text-neutral-300"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-white/30 focus:bg-white/[0.09]"
            />
          </div>

          {errorMessage && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 w-full rounded-2xl bg-white px-4 py-3 text-sm font-medium text-neutral-950 transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Accesso in corso..." : "Accedi"}
          </button>
        </form>
      </section>
    </main>
  );
}
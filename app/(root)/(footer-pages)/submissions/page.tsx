import type { Metadata } from "next";

export const metadata: Metadata = { title: "Submissions" };

export default function Page() {
  return <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">Submissions</h1>;
}

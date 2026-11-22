export default function FooterPagesLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-5xl px-6 pb-20 pt-32 text-black md:px-10">
      {children}
    </section>
  );
}

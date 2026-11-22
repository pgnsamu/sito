import Link from "next/link";

const sections = [
  {
    title: "Information",
    links: [
      { href: "/about", label: "About" },
      { href: "/about", label: "Contact" },
      { href: "/jobs", label: "Submissions" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy-policy", label: "Privacy Policy" },
      //{ href: "/cookie-policy", label: "Cookie Policy" },
      { href: "/terms-and-conditions", label: "Terms & Conditions" },
      { href: "/copyright-and-credits", label: "Copyright & Credits" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-white/20 bg-black px-6 py-10 text-white md:px-10 md:py-14">
      <nav aria-label="Footer" className="mx-auto grid max-w-5xl grid-cols-2 gap-5 sm:gap-12">
        {sections.map(({ title, links }) => (
          <div key={title}>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider">{title}</h2>
            <ul className="space-y-1">
              {links.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="inline-flex min-h-7 items-center text-sm text-white/80 underline-offset-4 hover:text-white hover:underline focus-visible:underline">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </footer>
  );
}

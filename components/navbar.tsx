"use client";

import { useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRight, Search, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const searchToggle = useRef<HTMLButtonElement>(null);

  const primaryColor: string = "black"; // Colore primario
  const secondaryColor: string = "white"; // Colore secondario

  const router = useRouter();
  const pathname = usePathname();

  const sections = ["Fashion", "Visual culture", "Jobs"];

  function isActiveSection(section: string) {
    return pathname === `/${section.toLowerCase().replace(/\s+/g, "")}`;
  }

  function handleSearchSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    const query = searchValue.trim();

    if (!query) return;

    router.push(`/search?q=${encodeURIComponent(query)}`);

    setSearchValue("");
    setIsSearchOpen(false);
  }

  return (
    <>
      {/* NAVBAR */}
      <header className={`fixed left-0 top-0 z-50 w-full ${pathname.startsWith("/artists/") ? "bg-white text-black" : "bg-transparent"}`}>
        <nav className="relative flex h-20 items-center justify-between px-6 md:px-10">
          {/* SINISTRA - SEARCH */}
          <div className="flex flex-1 items-center justify-start gap-2">
            <button
              ref={searchToggle}
              type="button"
              onClick={() => setIsSearchOpen((prev) => !prev)}
              aria-label={isSearchOpen ? "Close search" : "Open search"}
              aria-expanded={isSearchOpen}
              aria-controls={isSearchOpen ? "navbar-search" : undefined}
              className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center text-black transition-opacity hover:opacity-60"
            >
              {isSearchOpen ? <X size={20} /> : <Search size={22} />}
            </button>

            {isSearchOpen && (
              <form
                id="navbar-search"
                role="search"
                onSubmit={handleSearchSubmit}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    event.preventDefault();
                    setIsSearchOpen(false);
                    searchToggle.current?.focus();
                  }
                }}
                className="absolute inset-x-6 top-full z-10 flex items-center gap-2 bg-white px-2 text-black motion-safe:animate-in motion-safe:fade-in motion-safe:duration-150 md:inset-x-10 lg:static lg:w-56 lg:bg-transparent lg:px-0"
              >
                <input
                  autoFocus
                  type="search"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  aria-label="Search for an artist, work or theme"
                  placeholder="Artist, work or theme"
                  className="min-h-10 min-w-0 flex-1 bg-transparent text-base placeholder:text-neutral-500 focus:outline-none"
                />
                <button
                  type="submit"
                  aria-label="Submit search"
                  className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center transition-opacity hover:opacity-60 lg:w-8"
                >
                  <ArrowRight size={16} />
                </button>
              </form>
            )}
          </div>

          {/* CENTRO - LOGO / NOME SITO */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <h1 className={`text-lg font-semibold tracking-wide text-${primaryColor} md:text-xl`}>
              <a onClick={() => router.push("/")} className="cursor-pointer">
                <Image
                  src="/svg/logo porca miseriaccia.svg"
                  alt="Logo"
                  width={1000}
                  height={400}
                  priority
                  className="h-auto w-40 md:w-48"
                />
              </a>
            </h1>
          </div>

          {/* DESTRA - SEZIONI + HAMBURGER */}
          <div className="flex flex-1 items-center justify-end gap-8">
            <div className="hidden items-center gap-8 md:flex">
              {sections.map((section) => (
                <Link 
                  key={section}
                  href={`/${section.toLowerCase().replace(/\s+/g, "")}`} 
                  className={`relative text-sm uppercase tracking-wide text-${primaryColor} transition-all duration-300 hover:opacity-70 ${
                    isActiveSection(section) ? "font-semibold" : "font-light"
                  }`}
                  >
                  {section}
                  <span
                    className={`absolute -bottom-0 left-0 h-px bg-current transition-all duration-300 ${
                      isActiveSection(section) ? "w-full opacity-100" : "w-0 opacity-0"
                    }`}
                  />
                
                </Link>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(true)}
              aria-label="Open menu"
              className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-${primaryColor} transition hover:bg-white/10`}
            >
              <Menu size={26} />
            </button>
          </div>
        </nav>
      </header>

      {/* OVERLAY SCURO */}
      <div
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 z-60 bg-black/50 backdrop-blur-[2px] transition-opacity duration-300 ${
          isOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      {/* MENU LATERALE */}
      <aside
        className={`fixed right-0 top-0 z-70 flex h-screen w-[85%] sm:w-[420px] lg:w-[360px] flex-col bg-white px-8 py-7 shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between">

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-neutral-900 transition hover:bg-neutral-100"
          >
            <X size={24} />
          </button>
        </div>

        <div className="mt-14 flex flex-col gap-7">
          {sections.map((section) => (
            <Link
              key={section}
              href={`/${section.toLowerCase().replace(/\s+/g, "")}`}
              onClick={() => setIsOpen(false)}
              className={`group relative w-fit text-4xl tracking-tight text-neutral-900 transition-all duration-300 hover:translate-x-2 md:text-5xl ${
                isActiveSection(section) ? "font-semibold" : "font-light"
              }`}
            >
              {section}
              <span
                className={`absolute -bottom-0 left-0 h-1 bg-neutral-900 transition-all duration-300 ${
                  isActiveSection(section) ? "w-full opacity-100" : "w-0 opacity-0"
                }`}
              />
            </Link>
          ))}
        </div>

        <div className="mb-auto mt-auto">
          <Link
            href="/about"
            onClick={() => setIsOpen(false)}
            className={`inline-block rounded-full border border-neutral-900 px-6 py-3 text-sm font-light uppercase tracking-wide text-neutral-900 transition hover:bg-neutral-900 hover:text-${secondaryColor}`}
          >
            Work with us
          </Link>
        </div>

        <div className="mt-auto border-t border-neutral-200 pt-6">
          <p className="mb-4 text-sm uppercase tracking-[0.2em] text-neutral-400">
            Contacts
          </p>

          <div className="flex flex-col gap-2 text-sm text-neutral-700">
            <a
              href="mailto:info.newguardstudio@gmail.com"
              className="transition hover:text-black"
            >
              <Image
                src="/svg/email.svg"
                alt="Email"
                width={20}
                height={20}
                className="mr-2 inline h-5 w-5"
              />
              <span>info.newguardstudio@gmail.com</span>
            </a>
            <a
              href="https://www.instagram.com/newguardstudio"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="flex items-center gap-2 transition hover:opacity-70"
            >
              <Image
                src="/svg/instagram.svg"
                alt="Instagram"
                width={20}
                height={20}
                className="h-5 w-5"
              />
              <span>newguardstudio</span>
            </a>
          </div>
        </div>
      </aside>
    </>
  );
}

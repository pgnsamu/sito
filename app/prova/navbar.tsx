"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Search, Menu, X } from "lucide-react";
import Image from "next/image";

export default function Navbar2() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const primaryColor: string = "black";
  const secondaryColor: string = "white";

  const router = useRouter();
  const pathname = usePathname();

  const sections = ["Art", "Photography", "Fashion"];

  const searchableItems = useMemo(
    () => [
      { title: "Art", href: "/art", type: "Section" },
      { title: "Photography", href: "/photography", type: "Section" },
      { title: "Fashion", href: "/fashion", type: "Section" },
      { title: "Work with us", href: "/about", type: "Page" },
    ],
    [],
  );

  const filteredResults = searchableItems.filter((item) =>
    item.title.toLowerCase().includes(searchValue.trim().toLowerCase()),
  );

  function isActiveSection(section: string) {
    return pathname === `/${section.toLowerCase()}`;
  }

  function closeSearch() {
    setIsSearchOpen(false);
    setSearchValue("");
  }

  function goToSearchResult(href: string) {
    router.push(href);
    closeSearch();
  }

  function handleSearchSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const query = searchValue.trim();

    if (!query) return;

    if (filteredResults.length > 0) {
      goToSearchResult(filteredResults[0].href);
      return;
    }

    router.push(`/search?q=${encodeURIComponent(query)}`);
    closeSearch();
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsSearchOpen(true);
      }

      if (event.key === "Escape") {
        closeSearch();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      {/* NAVBAR */}
      <header className="fixed left-0 top-0 z-50 w-full bg-transparent">
        <nav className="relative flex h-20 items-center justify-between px-6 md:px-10">
          {/* SINISTRA - SEARCH */}
          <div className="flex flex-1 justify-start">
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search"
              className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-${primaryColor} transition hover:bg-white/10`}
            >
              <Search size={22} />
            </button>
          </div>

          {/* CENTRO - LOGO / NOME SITO */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <h1 className={`text-lg font-semibold tracking-wide text-${primaryColor} md:text-xl`}>
              <a onClick={() => router.push("/")} className="cursor-pointer">
                Nome Sito
              </a>
            </h1>
          </div>

          {/* DESTRA - SEZIONI + HAMBURGER */}
          <div className="flex flex-1 items-center justify-end gap-8">
            <div className="hidden items-center gap-8 md:flex">
              {sections.map((section) => (
                <a
                  key={section}
                  href={`/${section.toLowerCase()}`}
                  className={`relative text-sm uppercase tracking-wide text-${primaryColor} transition-all duration-300 hover:opacity-70 ${
                    isActiveSection(section) ? "font-bold" : "font-medium"
                  }`}
                >
                  {section}
                  <span
                    className={`absolute -bottom-0 left-0 h-px bg-current transition-all duration-300 ${
                      isActiveSection(section) ? "w-full opacity-100" : "w-0 opacity-0"
                    }`}
                  />
                </a>
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

      {/* SPOTLIGHT SEARCH */}
      <div
        onClick={closeSearch}
        className={`fixed inset-0 z-[90] bg-black/40 px-4 pt-[16vh] backdrop-blur-sm transition-opacity duration-300 ${
          isSearchOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        <form
          onSubmit={handleSearchSubmit}
          onClick={(event) => event.stopPropagation()}
          className={`mx-auto w-full max-w-xl overflow-hidden rounded-3xl border border-white/20 bg-white shadow-2xl transition-all duration-300 ${
            isSearchOpen ? "translate-y-0 scale-100" : "-translate-y-4 scale-95"
          }`}
        >
          <div className="flex items-center gap-3 border-b border-neutral-200 px-5 py-4">
            <Search size={20} className="text-neutral-400" />

            <input
              autoFocus={isSearchOpen}
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search..."
              className="w-full bg-transparent text-lg text-neutral-900 outline-none placeholder:text-neutral-400"
            />

            <kbd className="hidden rounded-md border border-neutral-200 px-2 py-1 text-xs text-neutral-400 sm:block">
              ESC
            </kbd>
          </div>

          <div className="max-h-80 overflow-y-auto p-2">
            {searchValue.trim().length === 0 ? (
              <div className="px-4 py-6">
                <p className="text-sm text-neutral-400">
                  Cerca sezioni, pagine o contenuti del sito.
                </p>
                <p className="mt-2 text-xs text-neutral-300">
                  Shortcut: Cmd/Ctrl + K
                </p>
              </div>
            ) : filteredResults.length > 0 ? (
              <div className="flex flex-col gap-1">
                {filteredResults.map((item) => (
                  <button
                    key={item.href}
                    type="button"
                    onClick={() => goToSearchResult(item.href)}
                    className="flex w-full cursor-pointer items-center justify-between rounded-2xl px-4 py-3 text-left transition hover:bg-neutral-100"
                  >
                    <span>
                      <span className="block text-sm font-medium text-neutral-900">
                        {item.title}
                      </span>
                      <span className="block text-xs text-neutral-400">
                        {item.type}
                      </span>
                    </span>

                    <span className="text-xs text-neutral-300">↵</span>
                  </button>
                ))}
              </div>
            ) : (
              <button
                type="submit"
                className="flex w-full cursor-pointer items-center justify-between rounded-2xl px-4 py-3 text-left transition hover:bg-neutral-100"
              >
                <span className="text-sm text-neutral-900">
                  Cerca “{searchValue.trim()}”
                </span>
                <span className="text-xs text-neutral-300">↵</span>
              </button>
            )}
          </div>
        </form>
      </div>

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
        className={`fixed right-0 top-0 z-70 flex h-screen w-[85%] flex-col bg-white px-8 py-7 shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:w-[420px] lg:w-[360px] ${
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
            <a
              key={section}
              href={`/${section.toLowerCase()}`}
              onClick={() => setIsOpen(false)}
              className={`group relative w-fit text-4xl tracking-tight text-neutral-900 transition-all duration-300 hover:translate-x-2 md:text-5xl ${
                isActiveSection(section) ? "font-bold" : "font-medium"
              }`}
            >
              {section}
              <span
                className={`absolute -bottom-0 left-0 h-1 bg-neutral-900 transition-all duration-300 ${
                  isActiveSection(section) ? "w-full opacity-100" : "w-0 opacity-0"
                }`}
              />
            </a>
          ))}
        </div>

        <div className="mb-auto mt-auto">
          <a
            href="/about"
            onClick={() => setIsOpen(false)}
            className={`inline-block rounded-full border border-neutral-900 px-6 py-3 text-sm font-medium uppercase tracking-wide text-neutral-900 transition hover:bg-neutral-900 hover:text-${secondaryColor}`}
          >
            Work with us
          </a>
        </div>

        <div className="mt-auto border-t border-neutral-200 pt-6">
          <p className="mb-4 text-sm uppercase tracking-[0.2em] text-neutral-400">
            Contacts
          </p>

          <div className="flex flex-col gap-2 text-sm text-neutral-700">
            <a
              href="mailto:info@nomesito.com"
              className="transition hover:text-black"
            >
              <Image
                src="/svg/email.svg"
                alt="Email"
                width={20}
                height={20}
                className="mr-2 inline h-5 w-5"
              />
              <span>info@nomesito.com</span>
            </a>
            <a
              href="https://instagram.com"
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
              <span>instagram.com/nomesito</span>
            </a>
          </div>
        </div>
      </aside>
    </>
  );
}
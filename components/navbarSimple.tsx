"use client";

import Image from "next/image";
import Link from "next/link";

export default function NavbarSimple() {
  return (
    <header className="fixed left-0 top-0 z-50 w-full bg-transparent">
      <nav className="relative flex h-20 items-center justify-center px-6 md:px-10">
        <Link href="/" aria-label="Go to homepage" className="block">
          <Image
            src="/svg/logo porca miseriaccia.svg"
            alt="Logo"
            width={1000}
            height={400}
            priority
            className="h-auto w-40 invert md:w-48"
          />
        </Link>
      </nav>
    </header>
  );
}
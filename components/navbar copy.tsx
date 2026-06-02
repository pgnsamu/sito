"use client";

import Image from "next/image";
import Link from "next/link";

export default function NavbarSimple() {
  return (
    <header className="fixed left-0 top-0 z-50 w-full bg-transparent">
      <nav className="relative flex h-20 items-center justify-center px-6 md:px-10">
        <Link href="/" aria-label="Go to homepage" className="block">
          <Image
            src="/svg/logo.svg"
            alt="Logo"
            width={120}
            height={40}
            priority
            className="h-auto w-28 md:w-32"
          />
        </Link>
      </nav>
    </header>
  );
}
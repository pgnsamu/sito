"use client";

import {useRouter } from "next/navigation";

export default function PlainHeader() {

  const primaryColor: string = "black"; // Colore primario
  //const secondaryColor: string = "white"; // Colore secondario

  const router = useRouter();

  return (
    <>
      {/* NAVBAR */}
      <header className="fixed left-0 top-0 z-50 w-full bg-transparent">
        <nav className="relative flex h-20 items-center justify-between px-6 md:px-10">
          

          {/* CENTRO - LOGO / NOME SITO */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <h1 className={`text-lg font-semibold tracking-wide text-${primaryColor} md:text-xl`}>
              <a onClick={() => router.push("/")} className="cursor-pointer">
                Nome Sito
              </a>
            </h1>
          </div>

          
        </nav>
      </header>
    </>
  );
}
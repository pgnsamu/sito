import type { Metadata } from "next";
import Navbar from "@/components/navbar";
import NavbarSimple from "@/components/navbarSimple";
import "../globals.css";


export const metadata: Metadata = {
  title: "NEW GUARD STUDIO",
  description: "Creative platform",
  icons: {
    icon: "pio.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col" style={{ fontFamily: '"Arial Nova", Arial, sans-serif' }}>
        <header className="relative z-50 shrink-0">
          <NavbarSimple />
        </header>
        <main className="relative z-0 flex-1">
          {children}
        </main>
      </body>
    </html>
  );
}

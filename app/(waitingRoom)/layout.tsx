import type { Metadata } from "next";
import Navbar from "@/components/navbar";
import NavbarSimple from "@/components/navbarSimple";
import "../globals.css";


export const metadata: Metadata = {
  title: "NEW GUARD STUDIO",
  description: "Creative platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, viewport-fit=cover"
        />
      </head>
      <body className="min-h-full flex flex-col" style={{ 
          fontFamily: '"Arial Nova", Arial, sans-serif', 
          margin: 0,
          padding: 0,
          height: "100vh",
        }}>
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

import type { Metadata } from "next";
import { acumin } from "@/app/fonts";
import NavbarSimple from "@/components/navbarSimple";
import SiteFooter from "@/components/SiteFooter";
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
    <html lang="en" className={`${acumin.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <header className="relative z-50 shrink-0">
          <NavbarSimple />
        </header>
        <main className="relative z-0 flex-1">
          {children}
        </main>
        {/* <SiteFooter legalOnly /> */}
      </body>
    </html>
  );
}

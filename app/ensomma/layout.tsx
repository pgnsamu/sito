import Link from "next/link";
import "./globals.css";
import { SafeAreaMonitor } from "./safe-area-monitor";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, viewport-fit=cover"
        />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="SafeAreaBug" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          height: "100vh",
          fontFamily: "monospace",
        }}
      >
          {/* Page content */}
          {children}
      </body>
    </html>
  );
}

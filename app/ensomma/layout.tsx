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
        <title>iOS Safe Area Bug Demo</title>
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          height: "100vh",
          fontFamily: "monospace",
        }}
      >
        <div
          style={{
            height: "100vh",
            padding: "20px",
            position: "relative",
          }}
        >
          <h1>iOS Safe Area Bug Demo</h1>
          <SafeAreaMonitor />

          {/* Navigation buttons */}
          <div
            style={{
              display: "flex",
              gap: "10px",
              marginBottom: "20px",
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/"
              style={{
                display: "inline-block",
                padding: "8px 16px",
                background: "#10b981",
                color: "white",
                textDecoration: "none",
                borderRadius: "6px",
                fontSize: "14px",
              }}
            >
              Link → Page 1
            </Link>

            <Link
              href="/page2"
              style={{
                display: "inline-block",
                padding: "8px 16px",
                background: "#10b981",
                color: "white",
                textDecoration: "none",
                borderRadius: "6px",
                fontSize: "14px",
              }}
            >
              Link → Page 2
            </Link>

          </div>

          {/* Page content */}
          {children}

          {/* Safe area bar - fixed positioned */}
          <div
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              height: "env(safe-area-inset-bottom, 40px)",
              background: "#ff0000",
              zIndex: 9999,
            }}
          ></div>
        </div>
      </body>
    </html>
  );
}

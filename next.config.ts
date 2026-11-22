import type { NextConfig } from "next";

// Public image URL only; R2 access credentials belong in Supabase Edge secrets.
const photoUrl = process.env.R2_PUBLIC_URL ? new URL(process.env.R2_PUBLIC_URL) : null;
if (photoUrl && (photoUrl.protocol !== "https:" || photoUrl.search || photoUrl.hash || photoUrl.username || photoUrl.password)) {
  throw new Error("R2_PUBLIC_URL deve essere un URL HTTPS pubblico senza credenziali o query.");
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      ...(photoUrl ? [{
        protocol: "https" as const,
        hostname: photoUrl.hostname,
        port: photoUrl.port,
        pathname: `${photoUrl.pathname.replace(/\/$/, "")}/**`,
        search: "",
      }] : []),
      {
        protocol: "https",
        hostname: "*.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  }
};

export default nextConfig;

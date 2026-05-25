import type { NextConfig } from "next";

//TODO: aggiungere configurazione per immagini da s3

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
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

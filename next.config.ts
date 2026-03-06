import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV !== "development",
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "example.com" },
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "via.placeholder.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "flagcdn.com", pathname: "/w320/**" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "randomuser.me" },
      { protocol: "https", hostname: "res.cloudinary.com" },

      // Jiji
      { protocol: "https", hostname: "jiji.ng" },

      // ✅ Jijistatic CDN (THIS was missing)
      { protocol: "https", hostname: "pictures-nigeria.jijistatic.net" },

      // AliExpress
      { protocol: "https", hostname: "ae01.alicdn.com" },
      { protocol: "https", hostname: "ae04.alicdn.com" },

      // Alibaba
      { protocol: "https", hostname: "s.alicdn.com" },

      // Amazon
      { protocol: "https", hostname: "m.media-amazon.com" },
      { protocol: "https", hostname: "images-na.ssl-images-amazon.com" },
    ],
  },
  serverExternalPackages: ["@react-pdf/renderer", "pdfjs-dist"],
};

export default nextConfig;

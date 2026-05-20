import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "media.giphy.com" },
      { protocol: "https", hostname: "ipfs.io" },
    ],
  },
};

export default nextConfig;

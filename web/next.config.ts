import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Classic fetch caching (revalidate: 60) instead of Cache Components; simpler for a storefront.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.shopify.com" },
      { protocol: "https", hostname: "thealabanza.com", pathname: "/cdn/**" },
    ],
  },
  turbopack: {
    rules: {
      "*.css": { loaders: ["@tailwindcss/turbopack"], as: "*.css" },
    },
  },
};

export default nextConfig;

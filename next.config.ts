import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.SITES_BUILD === "1" ? undefined : "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;

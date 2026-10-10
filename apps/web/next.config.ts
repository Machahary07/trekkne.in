import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@trekne/brand", "@trekne/db", "@trekne/viewer"],
};

export default nextConfig;

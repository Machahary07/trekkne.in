import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@trekne/brand", "@trekne/db", "@trekne/viewer"],
  async redirects() {
    return [{ source: "/how-it-works", destination: "/about", permanent: true }];
  },
};

export default nextConfig;

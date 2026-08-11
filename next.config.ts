import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Allow local browser tooling that hits 127.0.0.1 instead of localhost
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;

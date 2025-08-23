import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // experimental: {
  //     ppr: "incremental",
  // },
  output: "standalone",
  transpilePackages: ["three"],
};

export default nextConfig;

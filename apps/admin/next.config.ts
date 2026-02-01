import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@eventpilot/types",
    "@eventpilot/firebase",
    "@eventpilot/utils",
  ],
};

export default nextConfig;

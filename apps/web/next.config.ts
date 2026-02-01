import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  transpilePackages: [
    "@eventpilot/types",
    "@eventpilot/firebase",
    "@eventpilot/utils",
  ],
};

export default nextConfig;

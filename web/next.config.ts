import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The CSV "database" is read at runtime, not imported, so tell Vercel to ship it with every function.
  outputFileTracingIncludes: { "/**/*": ["./data/**/*"] },
};

export default nextConfig;

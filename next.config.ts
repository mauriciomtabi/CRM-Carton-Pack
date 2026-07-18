import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: {
    // @ts-expect-error Next.js 15/16 appIsrStatus option is not yet typed but fully functional at runtime
    appIsrStatus: false,
  },
};

export default nextConfig;

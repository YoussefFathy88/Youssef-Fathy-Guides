import type { NextConfig } from "next";

// GitHub Pages build: STATIC_EXPORT=1 writes plain HTML to out/, served under PAGES_BASE_PATH.
const isStaticExport = process.env.STATIC_EXPORT === "1";
const basePath = isStaticExport ? (process.env.PAGES_BASE_PATH ?? "") : "";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  ...(isStaticExport && {
    output: "export",
    basePath,
    trailingSlash: true,
    images: { unoptimized: true },
  }),
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
    NEXT_PUBLIC_STATIC_EXPORT: isStaticExport ? "1" : "",
  },
  // Dev-only: allow local/LAN hosts when opening from another device.
  allowedDevOrigins: [
    "127.0.0.1",
    "localhost",
    "192.168.1.110",
    "host.docker.internal",
  ],
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  // Dev-only: allow local/LAN hosts when opening from another device.
  allowedDevOrigins: [
    "127.0.0.1",
    "localhost",
    "192.168.1.110",
    "host.docker.internal",
  ],
};

export default nextConfig;

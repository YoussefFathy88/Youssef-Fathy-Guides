import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  // Dev-only: allow RSC / middleware checks when opening the app from LAN or Docker Desktop hostnames.
  allowedDevOrigins: ["127.0.0.1", "localhost", "host.docker.internal"],
};

export default nextConfig;

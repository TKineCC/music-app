import { networkInterfaces } from "node:os";
import type { NextConfig } from "next";

function getAllowedDevOrigins() {
  const ips = Object.values(networkInterfaces())
    .flat()
    .flatMap((network) => {
      if (!network || network.family !== "IPv4" || network.internal) {
        return [];
      }

      return [network.address];
    });

  const extraOrigins = (process.env.NEXT_ALLOWED_DEV_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return Array.from(new Set(["localhost", "127.0.0.1", ...ips, ...extraOrigins]));
}

const nextConfig: NextConfig = {
  // Allow dev asset requests from the machine's active IPv4 addresses.
  allowedDevOrigins: getAllowedDevOrigins(),
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'p1.music.126.net',
      },
      {
        protocol: 'https',
        hostname: 'p2.music.126.net',
      },
      {
        protocol: 'https',
        hostname: 'p3.music.126.net',
      },
      {
        protocol: 'https',
        hostname: 'p4.music.126.net',
      },
      {
        protocol: 'http',
        hostname: 'p1.music.126.net',
      },
      {
        protocol: 'http',
        hostname: 'p2.music.126.net',
      },
      {
        protocol: 'http',
        hostname: 'p3.music.126.net',
      },
      {
        protocol: 'http',
        hostname: 'p4.music.126.net',
      },
    ],
  },
};

export default nextConfig;

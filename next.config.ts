import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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

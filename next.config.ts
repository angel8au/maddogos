import type { NextConfig } from "next";
import { spawnSync } from "node:child_process";
import withSerwistInit from "@serwist/next";

const revision =
  spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf-8" }).stdout?.trim() ??
  crypto.randomUUID();

/** Routes precached on SW install so they work offline without a prior visit. */
const OFFLINE_ROUTES = [
  "/",
  "/menu",
  "/eventos",
  "/ubicacion",
  "/gracias",
  "/api/menu",
] as const;

const withSerwist = withSerwistInit({
  additionalPrecacheEntries: [
    { url: "/~offline", revision },
    ...OFFLINE_ROUTES.map((url) => ({ url, revision })),
  ],
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
});

const nextConfig: NextConfig = {
  compiler: {
    styledComponents: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/renta",
        destination: "/eventos",
        permanent: true,
      },
    ];
  },
};

export default withSerwist(nextConfig);

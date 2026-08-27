import { defaultCache, PAGES_CACHE_NAME } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { ExpirationPlugin, NetworkFirst, Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const pageExpiration = new ExpirationPlugin({
  maxEntries: 64,
  maxAgeSeconds: 60 * 60 * 24 * 7,
});

const offlineFirstRoutes = [
  {
    matcher: ({
      request,
      sameOrigin,
      url: { pathname },
    }: {
      request: Request;
      sameOrigin: boolean;
      url: URL;
    }) =>
      sameOrigin &&
      !pathname.startsWith("/studio") &&
      (request.mode === "navigate" || request.destination === "document"),
    handler: new NetworkFirst({
      cacheName: PAGES_CACHE_NAME.html,
      networkTimeoutSeconds: 3,
      plugins: [pageExpiration],
    }),
  },
  {
    matcher: ({
      request,
      sameOrigin,
      url: { pathname },
    }: {
      request: Request;
      sameOrigin: boolean;
      url: URL;
    }) =>
      sameOrigin &&
      !pathname.startsWith("/api/") &&
      !pathname.startsWith("/studio") &&
      request.headers.get("RSC") === "1",
    handler: new NetworkFirst({
      cacheName: PAGES_CACHE_NAME.rsc,
      networkTimeoutSeconds: 3,
      plugins: [pageExpiration],
    }),
  },
];

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: false,
  runtimeCaching: [...offlineFirstRoutes, ...defaultCache],
  fallbacks: {
    entries: [
      {
        url: "/~offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

serwist.addEventListeners();

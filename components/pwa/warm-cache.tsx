"use client";

import { useEffect } from "react";

const ROUTES_TO_WARM = ["/", "/menu", "/eventos", "/ubicacion", "/api/menu"] as const;

export function WarmCache() {
  useEffect(() => {
    if (!navigator.onLine) return;

    window.serwist?.messageSW({
      type: "CACHE_URLS",
      payload: { urlsToCache: [...ROUTES_TO_WARM] },
    });

    for (const url of ROUTES_TO_WARM) {
      fetch(url, { credentials: "same-origin" }).catch(() => {});
      fetch(url, {
        credentials: "same-origin",
        headers: { RSC: "1" },
      }).catch(() => {});
    }
  }, []);

  return null;
}

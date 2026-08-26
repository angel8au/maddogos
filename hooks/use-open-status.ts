"use client";

import { useEffect, useState } from "react";
import {
  getLocationOpenStatus,
  getSiteOpenStatus,
  type LocationOpenStatus,
  type SiteOpenStatus,
} from "@/lib/opening-status";
import { LOCATIONS, type Location } from "@/lib/site-info";

const TICK_MS = 30_000;

export function useSiteOpenStatus(): SiteOpenStatus {
  const [status, setStatus] = useState<SiteOpenStatus>(() => getSiteOpenStatus());

  useEffect(() => {
    const refresh = () => setStatus(getSiteOpenStatus());
    refresh();
    const id = window.setInterval(refresh, TICK_MS);
    return () => window.clearInterval(id);
  }, []);

  return status;
}

export function useLocationOpenStatus(locationId: string): LocationOpenStatus | null {
  const location = LOCATIONS.find((item) => item.id === locationId) ?? null;
  const [status, setStatus] = useState<LocationOpenStatus | null>(() =>
    location ? getLocationOpenStatus(location) : null,
  );

  useEffect(() => {
    if (!location) {
      setStatus(null);
      return;
    }
    const refresh = () => setStatus(getLocationOpenStatus(location));
    refresh();
    const id = window.setInterval(refresh, TICK_MS);
    return () => window.clearInterval(id);
  }, [location]);

  return status;
}

export function useLocationOpenStatusFor(location: Location): LocationOpenStatus {
  const [status, setStatus] = useState(() => getLocationOpenStatus(location));

  useEffect(() => {
    const refresh = () => setStatus(getLocationOpenStatus(location));
    refresh();
    const id = window.setInterval(refresh, TICK_MS);
    return () => window.clearInterval(id);
  }, [location]);

  return status;
}

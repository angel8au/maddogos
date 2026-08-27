import { DEFAULT_SAUCE_OPTIONS } from "@/lib/menu-config";
import { fallbackMenuItems } from "@/lib/menu-data";
import type { MenuItem } from "@/lib/types";

export const MENU_CACHE_KEY = "maddogos-menu-v1";

export type CachedMenuData = {
  items: MenuItem[];
  sauceOptions: string[];
  cachedAt: number;
};

export function getOfflineMenuFallback(): Pick<CachedMenuData, "items" | "sauceOptions"> {
  return {
    items: fallbackMenuItems,
    sauceOptions: [...DEFAULT_SAUCE_OPTIONS],
  };
}

export function readCachedMenu(): CachedMenuData | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(MENU_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedMenuData;
    if (!Array.isArray(parsed.items)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeCachedMenu(data: Pick<CachedMenuData, "items" | "sauceOptions">): void {
  if (typeof window === "undefined") return;

  try {
    const payload: CachedMenuData = {
      items: data.items,
      sauceOptions: data.sauceOptions,
      cachedAt: Date.now(),
    };
    localStorage.setItem(MENU_CACHE_KEY, JSON.stringify(payload));
  } catch {
    // Storage full or unavailable — ignore.
  }
}

"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getOfflineMenuFallback,
  readCachedMenu,
  writeCachedMenu,
} from "@/lib/menu-offline";
import type { MenuItem } from "@/lib/types";

type MenuCatalogContextValue = {
  items: MenuItem[];
  sauceOptions: string[];
  loaded: boolean;
};

const MenuCatalogContext = createContext<MenuCatalogContextValue>({
  items: [],
  sauceOptions: [],
  loaded: false,
});

type MenuCatalogProviderProps = {
  children: ReactNode;
  initialItems?: MenuItem[];
  initialSauceOptions?: string[];
};

function resolveOfflineCatalog(
  initialItems?: MenuItem[],
  initialSauceOptions?: string[],
): Pick<MenuCatalogContextValue, "items" | "sauceOptions"> {
  if (initialItems?.length) {
    return {
      items: initialItems,
      sauceOptions: initialSauceOptions ?? getOfflineMenuFallback().sauceOptions,
    };
  }

  const cached = readCachedMenu();
  if (cached?.items.length) {
    return { items: cached.items, sauceOptions: cached.sauceOptions };
  }

  return getOfflineMenuFallback();
}

export function MenuCatalogProvider({
  children,
  initialItems,
  initialSauceOptions,
}: MenuCatalogProviderProps) {
  const offlineSeed = resolveOfflineCatalog(initialItems, initialSauceOptions);
  const [items, setItems] = useState<MenuItem[]>(offlineSeed.items);
  const [sauceOptions, setSauceOptions] = useState<string[]>(offlineSeed.sauceOptions);
  const [loaded, setLoaded] = useState(Boolean(initialItems?.length));

  useEffect(() => {
    let cancelled = false;

    fetch("/api/menu")
      .then((res) => {
        if (!res.ok) throw new Error("Menu fetch failed");
        return res.json();
      })
      .then((data: { items: MenuItem[]; sauceOptions: string[] }) => {
        if (cancelled) return;
        const nextItems = data.items ?? [];
        const nextSauces = data.sauceOptions ?? [];
        setItems(nextItems);
        setSauceOptions(nextSauces);
        if (nextItems.length) {
          writeCachedMenu({ items: nextItems, sauceOptions: nextSauces });
        }
        setLoaded(true);
      })
      .catch(() => {
        if (cancelled) return;
        const fallback = resolveOfflineCatalog(initialItems, initialSauceOptions);
        setItems(fallback.items);
        setSauceOptions(fallback.sauceOptions);
        setLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, [initialItems, initialSauceOptions]);

  const value = useMemo(
    () => ({ items, sauceOptions, loaded }),
    [items, sauceOptions, loaded],
  );

  return (
    <MenuCatalogContext.Provider value={value}>{children}</MenuCatalogContext.Provider>
  );
}

export function useMenuCatalog() {
  return useContext(MenuCatalogContext);
}

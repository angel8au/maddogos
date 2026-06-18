"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
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

export function MenuCatalogProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [sauceOptions, setSauceOptions] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/menu")
      .then((res) => res.json())
      .then((data: { items: MenuItem[]; sauceOptions: string[] }) => {
        if (cancelled) return;
        setItems(data.items ?? []);
        setSauceOptions(data.sauceOptions ?? []);
        setLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

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

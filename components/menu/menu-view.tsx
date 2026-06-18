"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CategoryTabs,
  MENU_STICKY_HEADER_OFFSET_PX,
  MENU_TAB_BAR_HEIGHT_PX,
} from "@/components/menu/category-tabs";
import { MenuItemsList } from "@/components/menu/menu-items-list";
import { ProductDetailSheet } from "@/components/menu/product-detail-sheet";
import { categoryLabels, categoryOrder } from "@/lib/menu-data";
import type { MenuCategory, MenuItem } from "@/lib/types";

const SCROLL_SPY_OFFSET = MENU_STICKY_HEADER_OFFSET_PX + MENU_TAB_BAR_HEIGHT_PX + 8;

type MenuViewProps = {
  items: MenuItem[];
  sauceOptions: string[];
  showCategorySections?: boolean;
};

export function MenuView({
  items,
  sauceOptions,
  showCategorySections = true,
}: MenuViewProps) {
  const [detailItem, setDetailItem] = useState<MenuItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const drinks = useMemo(
    () => items.filter((item) => item.category === "bebidas"),
    [items],
  );

  const availableCategories = useMemo(
    () => categoryOrder.filter((cat) => items.some((item) => item.category === cat)),
    [items],
  );

  const [activeCategory, setActiveCategory] = useState<MenuCategory>(
    () => availableCategories[0] ?? "hot-dogs",
  );

  useEffect(() => {
    if (!availableCategories.includes(activeCategory)) {
      setActiveCategory(availableCategories[0] ?? "hot-dogs");
    }
  }, [activeCategory, availableCategories]);

  const updateActiveFromScroll = useCallback(() => {
    if (isScrollingRef.current || !availableCategories.length) return;

    let current = availableCategories[0];
    for (const category of availableCategories) {
      const section = document.getElementById(category);
      if (!section) continue;
      if (section.getBoundingClientRect().top <= SCROLL_SPY_OFFSET) {
        current = category;
      }
    }
    setActiveCategory((prev) => (prev === current ? prev : current));
  }, [availableCategories]);

  useEffect(() => {
    updateActiveFromScroll();
    window.addEventListener("scroll", updateActiveFromScroll, { passive: true });
    window.addEventListener("resize", updateActiveFromScroll);
    return () => {
      window.removeEventListener("scroll", updateActiveFromScroll);
      window.removeEventListener("resize", updateActiveFromScroll);
    };
  }, [updateActiveFromScroll]);

  const scrollToCategory = useCallback((category: MenuCategory) => {
    const section = document.getElementById(category);
    if (!section) return;

    isScrollingRef.current = true;
    setActiveCategory(category);
    section.scrollIntoView({ behavior: "smooth", block: "start" });

    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      isScrollingRef.current = false;
      updateActiveFromScroll();
    }, 700);
  }, [updateActiveFromScroll]);

  useEffect(
    () => () => {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    },
    [],
  );

  const openDetail = (item: MenuItem) => {
    setDetailItem(item);
    setDetailOpen(true);
  };

  const detailSheet = (
    <ProductDetailSheet
      item={detailItem}
      allItems={items}
      drinks={drinks}
      sauceOptions={sauceOptions}
      open={detailOpen}
      onOpenChange={setDetailOpen}
    />
  );

  if (!showCategorySections) {
    return (
      <>
        <MenuItemsList items={items} onOpenDetail={openDetail} />
        {detailSheet}
      </>
    );
  }

  return (
    <>
      <div
        className="bg-background/95 sticky z-30 -mx-4 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:mx-0 md:px-0"
        style={{
          top: MENU_STICKY_HEADER_OFFSET_PX,
          height: MENU_TAB_BAR_HEIGHT_PX,
        }}
      >
        <CategoryTabs
          activeCategory={activeCategory}
          categories={availableCategories}
          onCategorySelect={scrollToCategory}
        />
      </div>

      <div className="flex flex-col gap-10">
        {availableCategories.map((category) => {
          const categoryItems = items.filter((item) => item.category === category);
          if (!categoryItems.length) return null;

          return (
            <section
              key={category}
              id={category}
              aria-labelledby={`menu-tab-${category}`}
              className="space-y-3"
              style={{ scrollMarginTop: SCROLL_SPY_OFFSET }}
            >
              <h2 className="font-display border-primary text-3xl tracking-wide border-l-4 pl-3 uppercase">
                {categoryLabels[category]}
              </h2>
              <MenuItemsList items={categoryItems} onOpenDetail={openDetail} />
            </section>
          );
        })}
      </div>
      {detailSheet}
    </>
  );
}

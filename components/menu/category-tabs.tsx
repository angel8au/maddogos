"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { categoryLabels } from "@/lib/menu-data";
import type { MenuCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

export const MENU_TAB_BAR_HEIGHT_PX = 44;
export const MENU_STICKY_HEADER_OFFSET_PX = 72;

type CategoryTabsProps = {
  activeCategory: MenuCategory;
  categories: MenuCategory[];
  onCategorySelect: (category: MenuCategory) => void;
};

export function CategoryTabs({
  activeCategory,
  categories,
  onCategorySelect,
}: CategoryTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef(new Map<MenuCategory, HTMLButtonElement>());
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  useLayoutEffect(() => {
    const container = scrollRef.current;
    const activeButton = tabRefs.current.get(activeCategory);
    if (!container || !activeButton) return;

    const updateIndicator = () => {
      setIndicator({
        left: activeButton.offsetLeft,
        width: activeButton.offsetWidth,
      });
    };

    updateIndicator();

    activeButton.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });

    container.addEventListener("scroll", updateIndicator, { passive: true });
    window.addEventListener("resize", updateIndicator);

    return () => {
      container.removeEventListener("scroll", updateIndicator);
      window.removeEventListener("resize", updateIndicator);
    };
  }, [activeCategory, categories]);

  return (
    <div
      ref={scrollRef}
      className="scrollbar-hide relative flex h-11 w-full overflow-x-auto"
      role="tablist"
      aria-label="Categorías del menú"
    >
      <span
        aria-hidden
        className="bg-foreground pointer-events-none absolute bottom-0 z-10 h-0.5 transition-[left,width] duration-300 ease-out"
        style={{ left: indicator.left, width: indicator.width }}
      />
      {categories.map((category) => {
        const isActive = activeCategory === category;
        return (
          <button
            key={category}
            ref={(node) => {
              if (node) tabRefs.current.set(category, node);
              else tabRefs.current.delete(category);
            }}
            type="button"
            role="tab"
            aria-selected={isActive}
            id={`menu-tab-${category}`}
            onClick={() => onCategorySelect(category)}
            className={cn(
              "relative z-20 flex h-11 shrink-0 items-center px-4 text-sm font-medium transition-colors",
              isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {categoryLabels[category]}
          </button>
        );
      })}
    </div>
  );
}

"use client";

import { categoryLabels, categoryOrder } from "@/lib/menu-data";
import type { MenuCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

type CategoryTabsProps = {
  activeCategory: MenuCategory | "all";
  onCategoryChange: (category: MenuCategory | "all") => void;
  availableCategories: MenuCategory[];
};

export function CategoryTabs({
  activeCategory,
  onCategoryChange,
  availableCategories,
}: CategoryTabsProps) {
  const tabs: { value: MenuCategory | "all"; label: string }[] = [
    { value: "all", label: "Todos" },
    ...categoryOrder
      .filter((cat) => availableCategories.includes(cat))
      .map((cat) => ({ value: cat, label: categoryLabels[cat] })),
  ];

  return (
    <div className="scrollbar-hide -mx-4 flex gap-1 overflow-x-auto px-4 md:mx-0 md:px-0">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onCategoryChange(tab.value)}
          className={cn(
            "shrink-0 border-b-2 px-3 py-2 text-sm font-medium transition-colors",
            activeCategory === tab.value
              ? "border-foreground text-foreground"
              : "text-muted-foreground hover:text-foreground border-transparent",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

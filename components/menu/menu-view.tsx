"use client";

import { useMemo, useState } from "react";
import { CategoryTabs } from "@/components/menu/category-tabs";
import { MenuItemsList } from "@/components/menu/menu-items-list";
import { ProductDetailSheet } from "@/components/menu/product-detail-sheet";
import { categoryLabels, categoryOrder } from "@/lib/menu-data";
import type { MenuCategory, MenuItem } from "@/lib/types";

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
  const [activeCategory, setActiveCategory] = useState<MenuCategory | "all">("all");
  const [detailItem, setDetailItem] = useState<MenuItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const drinks = useMemo(
    () => items.filter((item) => item.category === "bebidas"),
    [items],
  );

  const availableCategories = useMemo(
    () => categoryOrder.filter((cat) => items.some((item) => item.category === cat)),
    [items],
  );

  const filteredItems = useMemo(() => {
    if (activeCategory === "all") return items;
    return items.filter((item) => item.category === activeCategory);
  }, [items, activeCategory]);

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

  const categoryTabs = (
    <div className="sticky top-[57px] z-30 -mx-4 bg-background/95 px-0 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:top-[65px] md:mx-0">
      <CategoryTabs
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        availableCategories={availableCategories}
      />
    </div>
  );

  if (!showCategorySections || activeCategory !== "all") {
    return (
      <>
        {categoryTabs}
        <MenuItemsList items={filteredItems} onOpenDetail={openDetail} />
        {filteredItems.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center text-sm">
            No hay productos en esta categoría.
          </p>
        ) : null}
        {detailSheet}
      </>
    );
  }

  return (
    <>
      {categoryTabs}
      <div className="flex flex-col gap-10">
        {categoryOrder.map((category) => {
          const categoryItems = items.filter((item) => item.category === category);
          if (!categoryItems.length) return null;

          return (
            <section key={category} id={category} className="scroll-mt-36 space-y-3">
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

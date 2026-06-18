"use client";

import { useMemo, useState } from "react";
import { MenuGridCard } from "@/components/menu/menu-grid-card";
import { ProductDetailSheet } from "@/components/menu/product-detail-sheet";
import type { MenuItem } from "@/lib/types";

type FeaturedMenuProps = {
  items: MenuItem[];
  allItems: MenuItem[];
  sauceOptions: string[];
};

export function FeaturedMenu({ items, allItems, sauceOptions }: FeaturedMenuProps) {
  const [detailItem, setDetailItem] = useState<MenuItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const drinks = useMemo(
    () => allItems.filter((item) => item.category === "bebidas"),
    [allItems],
  );

  const openDetail = (item: MenuItem) => {
    setDetailItem(item);
    setDetailOpen(true);
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-4 md:gap-4">
        {items.map((item) => (
          <MenuGridCard key={item._id} item={item} onOpenDetail={openDetail} />
        ))}
      </div>
      <ProductDetailSheet
        item={detailItem}
        allItems={allItems}
        drinks={drinks}
        sauceOptions={sauceOptions}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </>
  );
}

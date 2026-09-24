"use client";

import { MenuCard } from "@/components/menu/menu-card";
import type { MenuItem } from "@/lib/types";

type MenuItemsListProps = {
  items: MenuItem[];
  onOpenDetail: (item: MenuItem) => void;
};

export function MenuItemsList({ items, onOpenDetail }: MenuItemsListProps) {
  if (!items.length) return null;

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
      {items.map((item) => (
        <MenuCard
          key={item._id}
          item={item}
          variant="grid"
          onOpenDetail={onOpenDetail}
        />
      ))}
    </div>
  );
}

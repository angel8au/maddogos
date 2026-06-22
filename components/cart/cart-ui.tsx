"use client";

import { useMemo, useState } from "react";
import { CartBar } from "@/components/cart/cart-bar";
import { CartFeedbackToast } from "@/components/cart/cart-add-toast";
import { CartSheet } from "@/components/cart/cart-sheet";
import { ProductDetailSheet } from "@/components/menu/product-detail-sheet";
import { useMenuCatalog } from "@/components/providers/menu-catalog-provider";
import { cartLineToMenuItem } from "@/lib/cart-line-utils";
import type { CartLineItem } from "@/lib/types";

export function CartUI() {
  const { items, sauceOptions } = useMenuCatalog();
  const [cartOpen, setCartOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editingLine, setEditingLine] = useState<CartLineItem | null>(null);

  const drinks = useMemo(
    () => items.filter((item) => item.category === "bebidas"),
    [items],
  );

  const detailItem = useMemo(() => {
    if (!editingLine) return null;
    return cartLineToMenuItem(editingLine, items);
  }, [editingLine, items]);

  const handleLineClick = (line: CartLineItem) => {
    setEditingLine(line);
    setDetailOpen(true);
  };

  const handleDetailOpenChange = (open: boolean) => {
    setDetailOpen(open);
    if (!open) setEditingLine(null);
  };

  return (
    <>
      <CartFeedbackToast />
      <CartBar onOpenCart={() => setCartOpen(true)} />
      <CartSheet
        open={cartOpen}
        onOpenChange={setCartOpen}
        onLineClick={handleLineClick}
      />
      <ProductDetailSheet
        item={detailItem}
        allItems={items}
        drinks={drinks}
        sauceOptions={sauceOptions}
        open={detailOpen}
        onOpenChange={handleDetailOpenChange}
        editingLine={editingLine}
        zIndexClass="z-[60]"
      />
    </>
  );
}

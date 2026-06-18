"use client";

import { MenuItemImage } from "@/components/menu/menu-item-image";
import { QuantityStepper } from "@/components/menu/quantity-stepper";
import { formatMXN } from "@/lib/whatsapp";
import type { MenuExtra, MenuItem } from "@/lib/types";

type ExtrasCarouselProps = {
  extras: MenuExtra[];
  allItems: MenuItem[];
  quantities: Record<string, number>;
  onQuantityChange: (extraId: string, quantity: number) => void;
};

function ExtraCard({
  extra,
  menuItem,
  quantity,
  onQuantityChange,
}: {
  extra: MenuExtra;
  menuItem?: MenuItem;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
}) {
  return (
    <div className="bg-card w-36 shrink-0 overflow-hidden rounded-xl border shadow-sm">
      <div className="bg-muted relative aspect-square">
        <MenuItemImage
          src={menuItem?.imageUrl}
          alt={extra.name}
          category={menuItem?.category ?? "extras"}
          slug={menuItem?.slug}
          sizes="144px"
        />
        <div className="absolute right-1.5 bottom-1.5">
          <QuantityStepper
            size="sm"
            quantity={quantity}
            onIncrement={() => onQuantityChange(quantity + 1)}
            onDecrement={() => onQuantityChange(Math.max(0, quantity - 1))}
          />
        </div>
      </div>
      <div className="space-y-0.5 p-2">
        <p className="line-clamp-2 text-xs leading-tight font-semibold">{extra.name}</p>
        <p className="text-muted-foreground text-xs">+{formatMXN(extra.price)}</p>
      </div>
    </div>
  );
}

export function ExtrasCarousel({
  extras,
  allItems,
  quantities,
  onQuantityChange,
}: ExtrasCarouselProps) {
  if (!extras.length) return null;

  const itemById = new Map(allItems.map((item) => [item._id, item]));

  return (
    <section className="space-y-3">
      <h3 className="font-display text-xl tracking-wide uppercase">Agrega extras</h3>
      <div className="scrollbar-hide -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
        {extras.map((extra) => (
          <ExtraCard
            key={extra._id}
            extra={extra}
            menuItem={itemById.get(extra._id)}
            quantity={quantities[extra._id] ?? 0}
            onQuantityChange={(qty) => onQuantityChange(extra._id, qty)}
          />
        ))}
      </div>
    </section>
  );
}

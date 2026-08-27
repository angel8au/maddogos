"use client";

import { useCart } from "@/components/providers/cart-provider";
import { MenuItemImage } from "@/components/menu/menu-item-image";
import { QuantityStepper } from "@/components/menu/quantity-stepper";
import { requiresDetailBeforeAdd } from "@/lib/menu-config";
import { formatMXN } from "@/lib/whatsapp";
import type { MenuItem } from "@/lib/types";
import { cn } from "@/lib/utils";

type MenuCardProps = {
  item: MenuItem;
  onOpenDetail: (item: MenuItem) => void;
  compact?: boolean;
  variant?: "list" | "grid";
};

export function MenuCard({ item, onOpenDetail, compact, variant = "list" }: MenuCardProps) {
  const {
    getDefaultLineQuantity,
    getQuantityForItem,
    addDefaultItem,
    removeDefaultItem,
    decrementItem,
  } = useCart();

  const needsDetail = requiresDetailBeforeAdd(item);
  const quantity = needsDetail
    ? getQuantityForItem(item._id)
    : getDefaultLineQuantity(item);

  const handleIncrement = () => {
    if (needsDetail) {
      onOpenDetail(item);
      return;
    }
    addDefaultItem(item);
  };

  const handleDecrement = () => {
    if (needsDetail) {
      decrementItem(item);
      return;
    }
    removeDefaultItem(item);
  };

  return (
    <article
      className={cn(
        "group relative flex gap-3 transition-colors",
        variant === "list" && "border-b py-4 last:border-b-0",
        variant === "grid" &&
          "border-border py-4 md:rounded-xl md:border md:p-3 md:hover:bg-muted/30",
        compact ? "px-0" : variant === "list" ? "px-1" : "px-0",
      )}
    >
      <button
        type="button"
        onClick={() => onOpenDetail(item)}
        className="absolute inset-0 z-0 rounded-xl focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none"
        aria-label={`Ver detalles de ${item.name}`}
      />

      <div className="pointer-events-none relative z-10 min-w-0 flex-1 space-y-1 text-left">
        <div className="flex items-start gap-2">
          <h3 className="font-semibold leading-snug">{item.name}</h3>
          {item.badge ? (
            <span className="bg-accent text-accent-foreground shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase">
              {item.badge}
            </span>
          ) : null}
        </div>
        <p className="text-sm font-semibold">{formatMXN(item.price)}</p>
        <p className="text-muted-foreground line-clamp-2 text-sm">{item.description}</p>
      </div>

      <div className="relative z-10 size-28 shrink-0 self-start">
        <div className="bg-muted pointer-events-none relative size-full overflow-hidden rounded-xl">
          <MenuItemImage
            src={item.imageUrl}
            alt=""
            category={item.category}
            slug={item.slug}
            sizes="112px"
          />
        </div>
        <div className="absolute right-1 bottom-1">
          <QuantityStepper
            quantity={quantity}
            productName={item.name}
            itemName={quantity > 0 ? item.name : undefined}
            onIncrement={handleIncrement}
            onDecrement={handleDecrement}
          />
        </div>
      </div>
    </article>
  );
}

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
  const titleId = `menu-card-title-${item._id}`;
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

  const isGrid = variant === "grid";

  return (
    <article
      className={cn(
        "group relative transition-[border-color]",
        variant === "list" && "border-b py-4 last:border-b-0",
        variant === "list" && (compact ? "px-0" : "px-1"),
        isGrid &&
          "overflow-hidden rounded-xl border-2 border-border hover:border-primary",
      )}
    >
      <div
        className={cn(
          "pointer-events-none relative z-0 flex",
          isGrid ? "min-h-36" : "gap-3",
        )}
      >
        <div
          className={cn(
            "min-w-0 flex-1 space-y-1 text-left",
            isGrid ? "p-3 pr-2" : null,
          )}
        >
          <div className="flex items-start gap-2">
            <h3 id={titleId} className="font-semibold leading-snug">
              {item.name}
            </h3>
            {item.badge ? (
              <span className="bg-accent text-accent-foreground shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase">
                {item.badge}
              </span>
            ) : null}
          </div>
          <p className="text-sm font-semibold">{formatMXN(item.price)}</p>
          <p className="text-muted-foreground line-clamp-2 text-sm">{item.description}</p>
        </div>

        <div
          className={cn(
            "relative shrink-0 overflow-hidden transition-transform duration-200 ease-out group-hover:scale-[1.04] group-focus-within:scale-[1.04]",
            isGrid
              ? "w-36 self-stretch"
              : "size-36 self-start rounded-xl",
            item.category === "extras" ? "bg-white" : "bg-muted",
          )}
        >
          <MenuItemImage
            src={item.imageUrl}
            alt=""
            category={item.category}
            slug={item.slug}
            sizes="144px"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={() => onOpenDetail(item)}
        aria-labelledby={titleId}
        className="absolute inset-0 z-[1] rounded-xl focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none"
      />

      <div
        className={cn(
          "pointer-events-none absolute z-10",
          isGrid ? "top-0 right-0 h-full w-36" : "top-4 right-1 size-36",
        )}
      >
        <div className="pointer-events-auto absolute right-1 bottom-1">
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

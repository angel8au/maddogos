"use client";

import { useCart } from "@/components/providers/cart-provider";
import { MenuItemImage } from "@/components/menu/menu-item-image";
import { QuantityStepper } from "@/components/menu/quantity-stepper";
import { requiresDetailBeforeAdd } from "@/lib/menu-config";
import { formatMXN } from "@/lib/whatsapp";
import type { MenuItem } from "@/lib/types";
import { cn } from "@/lib/utils";

type MenuGridCardProps = {
  item: MenuItem;
  onOpenDetail: (item: MenuItem) => void;
  className?: string;
};

export function MenuGridCard({ item, onOpenDetail, className }: MenuGridCardProps) {
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
      role="button"
      tabIndex={0}
      onClick={() => onOpenDetail(item)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpenDetail(item);
        }
      }}
      className={cn(
        "bg-card group w-full cursor-pointer overflow-hidden rounded-xl border shadow-sm transition-shadow hover:shadow-md",
        className,
      )}
    >
      <div className="bg-muted relative aspect-square">
        <MenuItemImage
          src={item.imageUrl}
          alt={item.name}
          category={item.category}
          slug={item.slug}
          sizes="(max-width: 768px) 50vw, 280px"
        />
        {item.badge ? (
          <span className="bg-accent text-accent-foreground absolute top-2 left-2 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase">
            {item.badge}
          </span>
        ) : null}
        <div
          className="absolute right-1.5 bottom-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          <QuantityStepper
            size="sm"
            quantity={quantity}
            itemName={quantity > 0 ? item.name : undefined}
            onIncrement={handleIncrement}
            onDecrement={handleDecrement}
          />
        </div>
      </div>
      <div className="space-y-1 p-3">
        <p className="line-clamp-2 text-sm leading-tight font-semibold">{item.name}</p>
        <p className="text-sm font-semibold">{formatMXN(item.price)}</p>
        {item.description ? (
          <p className="text-muted-foreground line-clamp-2 text-xs">{item.description}</p>
        ) : null}
      </div>
    </article>
  );
}

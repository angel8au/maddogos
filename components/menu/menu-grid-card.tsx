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
      className={cn(
        "bg-card group relative w-full overflow-hidden rounded-xl border shadow-sm transition-shadow hover:shadow-md",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onOpenDetail(item)}
        className="absolute inset-0 z-0 focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none"
        aria-label={`Ver detalles de ${item.name}`}
      />

      <div className="bg-muted relative aspect-square">
        <div className="pointer-events-none absolute inset-0">
          <MenuItemImage
            src={item.imageUrl}
            alt=""
            category={item.category}
            slug={item.slug}
            sizes="(max-width: 768px) 50vw, 280px"
          />
        </div>
        {item.badge ? (
          <span className="bg-accent text-accent-foreground pointer-events-none absolute top-2 left-2 z-10 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase">
            {item.badge}
          </span>
        ) : null}
        <div className="absolute right-1.5 bottom-1.5 z-20">
          <QuantityStepper
            size="sm"
            quantity={quantity}
            productName={item.name}
            itemName={quantity > 0 ? item.name : undefined}
            onIncrement={handleIncrement}
            onDecrement={handleDecrement}
          />
        </div>
      </div>
      <div className="pointer-events-none relative z-10 space-y-1 p-3 text-left">
        <p className="line-clamp-2 text-sm leading-tight font-semibold">{item.name}</p>
        <p className="text-sm font-semibold">{formatMXN(item.price)}</p>
        {item.description ? (
          <p className="text-muted-foreground line-clamp-2 text-xs">{item.description}</p>
        ) : null}
      </div>
    </article>
  );
}

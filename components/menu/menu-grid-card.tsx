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
        className="block w-full text-left focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none"
        aria-label={`Ver detalles de ${item.name}`}
      >
        <div className="bg-muted relative aspect-square">
          <MenuItemImage
            src={item.imageUrl}
            alt=""
            category={item.category}
            slug={item.slug}
            sizes="(max-width: 768px) 50vw, 280px"
          />
          {item.badge ? (
            <span className="bg-accent text-accent-foreground pointer-events-none absolute top-2 left-2 z-10 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase">
              {item.badge}
            </span>
          ) : null}
        </div>
        <div className="space-y-1 p-3">
          <p className="line-clamp-2 text-sm leading-tight font-semibold">{item.name}</p>
          <p className="text-sm font-semibold">{formatMXN(item.price)}</p>
          {item.description ? (
            <p className="text-muted-foreground line-clamp-2 text-xs">{item.description}</p>
          ) : null}
        </div>
      </button>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 aspect-square">
        <div className="pointer-events-auto absolute right-1.5 bottom-1.5">
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
    </article>
  );
}

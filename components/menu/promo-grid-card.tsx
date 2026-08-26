"use client";

import { useCart } from "@/components/providers/cart-provider";
import { MenuItemImage } from "@/components/menu/menu-item-image";
import { QuantityStepper } from "@/components/menu/quantity-stepper";
import { requiresDetailBeforeAdd } from "@/lib/menu-config";
import { formatMXN } from "@/lib/whatsapp";
import type { MenuItem } from "@/lib/types";
import { cn } from "@/lib/utils";

type PromoGridCardProps = {
  item: MenuItem;
  onOpenDetail: (item: MenuItem) => void;
  className?: string;
};

export function PromoGridCard({ item, onOpenDetail, className }: PromoGridCardProps) {
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
        "bg-card group flex w-full cursor-pointer overflow-hidden rounded-xl border-2 border-accent/40 shadow-sm transition-shadow hover:border-accent hover:shadow-md",
        className,
      )}
    >
      <div className="bg-muted relative aspect-[4/3] w-[42%] shrink-0 sm:w-[38%]">
        <MenuItemImage
          src={item.imageUrl}
          alt={item.name}
          category={item.category}
          slug={item.slug}
          sizes="(max-width: 768px) 40vw, 220px"
        />
        <span className="bg-accent text-accent-foreground absolute top-2 left-2 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
          Promo
        </span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-2 p-3 sm:p-4">
        <div className="space-y-1">
          <p className="line-clamp-2 text-sm leading-tight font-semibold sm:text-base">
            {item.name}
          </p>
          {item.description ? (
            <p className="text-muted-foreground line-clamp-2 text-xs sm:text-sm">
              {item.description}
            </p>
          ) : null}
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-primary text-base font-bold sm:text-lg">
            {formatMXN(item.price)}
          </p>
          <div onClick={(e) => e.stopPropagation()}>
            <QuantityStepper
              size="sm"
              quantity={quantity}
              itemName={quantity > 0 ? item.name : undefined}
              onIncrement={handleIncrement}
              onDecrement={handleDecrement}
            />
          </div>
        </div>
      </div>
    </article>
  );
}

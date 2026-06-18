"use client";

import { useCart } from "@/components/providers/cart-provider";
import { MenuItemImage } from "@/components/menu/menu-item-image";
import { QuantityStepper } from "@/components/menu/quantity-stepper";
import { formatMXN } from "@/lib/whatsapp";
import type { MenuItem } from "@/lib/types";

type DrinksCarouselProps = {
  drinks: MenuItem[];
};

function DrinkCard({ drink }: { drink: MenuItem }) {
  const { addDefaultItem, removeDefaultItem, getDefaultLineQuantity } = useCart();
  const quantity = getDefaultLineQuantity(drink);

  return (
    <div className="bg-card w-36 shrink-0 overflow-hidden rounded-xl border shadow-sm">
      <div className="bg-muted relative aspect-square">
        <MenuItemImage
          src={drink.imageUrl}
          alt={drink.name}
          category={drink.category}
          slug={drink.slug}
          sizes="144px"
        />
        <div className="absolute right-1.5 bottom-1.5">
          <QuantityStepper
            size="sm"
            quantity={quantity}
            itemName={quantity > 0 ? drink.name : undefined}
            onIncrement={() => addDefaultItem(drink)}
            onDecrement={() => removeDefaultItem(drink)}
          />
        </div>
      </div>
      <div className="space-y-0.5 p-2">
        <p className="line-clamp-2 text-xs leading-tight font-semibold">{drink.name}</p>
        <p className="text-muted-foreground text-xs">{formatMXN(drink.price)}</p>
      </div>
    </div>
  );
}

export function DrinksCarousel({ drinks }: DrinksCarouselProps) {
  if (!drinks.length) return null;

  return (
    <section className="space-y-3">
      <h3 className="font-display text-xl tracking-wide uppercase">
        ¿Algo para tomar?
      </h3>
      <div className="scrollbar-hide -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
        {drinks.map((drink) => (
          <DrinkCard key={drink._id} drink={drink} />
        ))}
      </div>
    </section>
  );
}

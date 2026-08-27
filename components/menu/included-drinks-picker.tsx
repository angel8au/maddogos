"use client";

import { MenuItemImage } from "@/components/menu/menu-item-image";
import { QuantityStepper } from "@/components/menu/quantity-stepper";
import { cn } from "@/lib/utils";
import type { MenuItem, SelectedDrink } from "@/lib/types";

type IncludedDrinksPickerProps = {
  drinks: MenuItem[];
  requiredCount: number;
  value: SelectedDrink[];
  onChange: (drinks: SelectedDrink[]) => void;
  error?: string;
  hint?: string;
};

export function IncludedDrinksPicker({
  drinks,
  requiredCount,
  value,
  onChange,
  error,
  hint,
}: IncludedDrinksPickerProps) {
  if (!drinks.length || requiredCount <= 0) return null;

  const selectedTotal = value.reduce((sum, d) => sum + d.quantity, 0);
  const remaining = Math.max(0, requiredCount - selectedTotal);

  const quantityFor = (id: string) =>
    value.find((d) => d.id === id)?.quantity ?? 0;

  const setQuantity = (drink: MenuItem, next: number) => {
    const current = quantityFor(drink._id);
    const othersTotal = selectedTotal - current;
    const capped = Math.max(0, Math.min(next, requiredCount - othersTotal));

    const nextValue = value
      .filter((d) => d.id !== drink._id)
      .concat(
        capped > 0
          ? [{ id: drink._id, name: drink.name, quantity: capped }]
          : [],
      );

    onChange(nextValue);
  };

  return (
    <section className="space-y-3">
      <div>
        <h3 className="font-semibold">
          {requiredCount === 1 ? "Elige tu bebida" : `Elige ${requiredCount} bebidas`}{" "}
          <span className="text-destructive">*</span>
        </h3>
        <p className="text-muted-foreground text-xs">
          {hint ?? "Incluidas en el combo"}
          {remaining > 0
            ? ` · faltan ${remaining}`
            : selectedTotal >= requiredCount
              ? " · listo"
              : null}
        </p>
      </div>

      <div className="scrollbar-hide -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
        {drinks.map((drink) => {
          const qty = quantityFor(drink._id);
          const selected = qty > 0;

          return (
            <div
              key={drink._id}
              className={cn(
                "bg-card w-36 shrink-0 overflow-hidden rounded-xl border shadow-sm transition-colors",
                selected && "border-primary ring-primary/20 ring-2",
                error && !selectedTotal && "border-destructive/50",
              )}
            >
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
                    quantity={qty}
                    itemName={qty > 0 ? drink.name : undefined}
                    onIncrement={() => setQuantity(drink, qty + 1)}
                    onDecrement={() => setQuantity(drink, qty - 1)}
                  />
                </div>
              </div>
              <div className="space-y-0.5 p-2">
                <p className="line-clamp-2 text-xs leading-tight font-semibold">
                  {drink.name}
                </p>
                <p className="text-muted-foreground text-xs">Incluida</p>
              </div>
            </div>
          );
        })}
      </div>

      {error ? <p className="text-destructive text-xs">{error}</p> : null}
    </section>
  );
}

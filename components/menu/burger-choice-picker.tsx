"use client";

import { MenuItemImage } from "@/components/menu/menu-item-image";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { formatMXN } from "@/lib/whatsapp";
import type { MenuItem, SelectedBurger } from "@/lib/types";

type BurgerChoicePickerProps = {
  burgers: MenuItem[];
  value?: SelectedBurger;
  onChange: (burger: SelectedBurger) => void;
  error?: string;
};

export function BurgerChoicePicker({
  burgers,
  value,
  onChange,
  error,
}: BurgerChoicePickerProps) {
  if (!burgers.length) return null;

  return (
    <section className="space-y-3">
      <div>
        <h3 className="font-semibold">
          Elige tu hamburguesa <span className="text-destructive">*</span>
        </h3>
        <p className="text-muted-foreground text-xs">
          Incluida en la charola · cualquier hamburguesa del menú
        </p>
      </div>

      <RadioGroup
        value={value?.id ?? ""}
        onValueChange={(id) => {
          const burger = burgers.find((b) => b._id === id);
          if (burger) onChange({ id: burger._id, name: burger.name });
        }}
        className="grid gap-2"
        aria-invalid={Boolean(error)}
      >
        {burgers.map((burger) => {
          const selected = value?.id === burger._id;
          const id = `burger-choice-${burger._id}`;

          return (
            <label
              key={burger._id}
              htmlFor={id}
              className={cn(
                "flex w-full cursor-pointer items-center gap-3 rounded-lg border p-2.5 text-sm transition-colors",
                selected
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/40",
                error && !value && "border-destructive/50",
              )}
            >
              <div className="bg-muted relative size-14 shrink-0 overflow-hidden rounded-md">
                <MenuItemImage
                  src={burger.imageUrl}
                  alt={burger.name}
                  category={burger.category}
                  slug={burger.slug}
                  sizes="56px"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold leading-tight">{burger.name}</p>
                <p className="text-muted-foreground text-xs">
                  {formatMXN(burger.price)} · incluida
                </p>
              </div>
              <RadioGroupItem value={burger._id} id={id} className="shrink-0" />
            </label>
          );
        })}
      </RadioGroup>

      {error ? (
        <p role="alert" className="text-destructive text-xs">
          {error}
        </p>
      ) : null}
    </section>
  );
}

"use client";

import { MenuItemImage } from "@/components/menu/menu-item-image";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import type { MenuItem, SelectedDog } from "@/lib/types";

type DogChoicePickerProps = {
  dogs: MenuItem[];
  value?: SelectedDog;
  onChange: (dog: SelectedDog) => void;
  error?: string;
  hint?: string;
};

export function DogChoicePicker({
  dogs,
  value,
  onChange,
  error,
  hint = "Si quieres distintos, indícalo en instrucciones especiales",
}: DogChoicePickerProps) {
  if (!dogs.length) return null;

  return (
    <section className="space-y-3">
      <div>
        <h3 className="font-semibold">
          Elige tu hot dog <span className="text-destructive">*</span>
        </h3>
        <p className="text-muted-foreground text-xs">{hint}</p>
      </div>

      <RadioGroup
        value={value?.id ?? ""}
        onValueChange={(id) => {
          const dog = dogs.find((d) => d._id === id);
          if (dog) onChange({ id: dog._id, name: dog.name });
        }}
        className="grid gap-2"
        aria-invalid={Boolean(error)}
      >
        {dogs.map((dog) => {
          const selected = value?.id === dog._id;
          const id = `dog-choice-${dog._id}`;

          return (
            <label
              key={dog._id}
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
                  src={dog.imageUrl}
                  alt={dog.name}
                  category={dog.category}
                  slug={dog.slug}
                  sizes="56px"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold leading-tight">{dog.name}</p>
                <p className="text-muted-foreground text-xs">Incluido</p>
              </div>
              <RadioGroupItem value={dog._id} id={id} className="shrink-0" />
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

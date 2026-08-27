"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

type SaucePickerProps = {
  options: string[];
  value?: string;
  onChange: (sauce: string) => void;
  error?: string;
  title?: string;
  description?: string;
  idPrefix?: string;
};

export function SaucePicker({
  options,
  value,
  onChange,
  error,
  title = "Selecciona salsa",
  description = "Obligatorio para alitas y boneless",
  idPrefix = "sauce",
}: SaucePickerProps) {
  return (
    <section className="space-y-3">
      <div>
        <h3 className="font-semibold">
          {title} <span className="text-destructive">*</span>
        </h3>
        {description ? (
          <p className="text-muted-foreground text-xs">{description}</p>
        ) : null}
      </div>

      <RadioGroup
        value={value ?? ""}
        onValueChange={onChange}
        className="grid gap-2 sm:grid-cols-2"
        aria-invalid={Boolean(error)}
      >
        {options.map((sauce) => {
          const id = `${idPrefix}-${sauce.replace(/\s+/g, "-").toLowerCase()}`;
          const selected = value === sauce;

          return (
            <label
              key={sauce}
              htmlFor={id}
              className={cn(
                "flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors",
                selected
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border hover:border-primary/40",
                error && !value && "border-destructive/50",
              )}
            >
              <span>{sauce}</span>
              <RadioGroupItem value={sauce} id={id} className="shrink-0" />
            </label>
          );
        })}
      </RadioGroup>

      {error ? <p className="text-destructive text-xs">{error}</p> : null}
    </section>
  );
}

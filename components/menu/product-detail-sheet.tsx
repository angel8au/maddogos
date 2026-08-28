"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { useCart } from "@/components/providers/cart-provider";
import { BurgerChoicePicker } from "@/components/menu/burger-choice-picker";
import { DogChoicePicker } from "@/components/menu/dog-choice-picker";
import { DrinksCarousel } from "@/components/menu/drinks-carousel";
import { ExtrasCarousel } from "@/components/menu/extras-carousel";
import { IncludedDrinksPicker } from "@/components/menu/included-drinks-picker";
import { MenuItemImage } from "@/components/menu/menu-item-image";
import { QuantityStepper } from "@/components/menu/quantity-stepper";
import { SaucePicker } from "@/components/menu/sauce-picker";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetBody, SheetFooter, SheetHeader } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { getDefaultIngredients, validateCartAdd } from "@/lib/cart-utils";
import { track } from "@/lib/analytics";
import { productAnalyticsProps } from "@/lib/analytics-cart";
import {
  burgersForChoice,
  dogsForChoice,
  filterIncludedDrinks,
  getCustomizationRules,
  resolveLinkedExtras,
} from "@/lib/menu-config";
import { formatMXN } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import type {
  CartLineItem,
  MenuItem,
  SelectedBurger,
  SelectedDog,
  SelectedDrink,
  SelectedExtra,
  SelectedIngredient,
} from "@/lib/types";

type ProductDetailSheetProps = {
  item: MenuItem | null;
  allItems: MenuItem[];
  drinks: MenuItem[];
  sauceOptions: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingLine?: CartLineItem | null;
  zIndexClass?: string;
};

export function ProductDetailSheet({
  item,
  allItems,
  drinks,
  sauceOptions,
  open,
  onOpenChange,
  editingLine,
  zIndexClass,
}: ProductDetailSheetProps) {
  const { addItem, removeLine } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [ingredients, setIngredients] = useState<SelectedIngredient[]>([]);
  const [selectedSauces, setSelectedSauces] = useState<string[]>([]);
  const [selectedDrinks, setSelectedDrinks] = useState<SelectedDrink[]>([]);
  const [selectedBurger, setSelectedBurger] = useState<SelectedBurger | undefined>();
  const [selectedDog, setSelectedDog] = useState<SelectedDog | undefined>();
  const [extraQuantities, setExtraQuantities] = useState<Record<string, number>>({});
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [formError, setFormError] = useState<string | undefined>();

  const availableExtras = useMemo(
    () => (item ? resolveLinkedExtras(item, allItems) : []),
    [item, allItems],
  );

  const burgerOptions = useMemo(() => burgersForChoice(allItems), [allItems]);
  const dogOptions = useMemo(
    () => (item ? dogsForChoice(allItems, item) : []),
    [allItems, item],
  );

  const rules = useMemo(
    () => (item ? getCustomizationRules(item) : { sauceCount: 0, includedDrinkCount: 0 }),
    [item],
  );

  const selectedExtras: SelectedExtra[] = useMemo(
    () =>
      availableExtras
        .filter((extra) => (extraQuantities[extra._id] ?? 0) > 0)
        .map((extra) => ({
          id: extra._id,
          name: extra.name,
          price: extra.price,
          quantity: extraQuantities[extra._id] ?? 0,
        })),
    [availableExtras, extraQuantities],
  );

  useEffect(() => {
    if (!item || !open) return;

    track({
      event: "product_view",
      ...productAnalyticsProps(item),
    });
  }, [item, open]);

  useEffect(() => {
    if (!item || !open) return;

    if (editingLine && editingLine.itemId === item._id) {
      setQuantity(editingLine.quantity);
      setIngredients(editingLine.selectedIngredients);
      setSelectedSauces(
        editingLine.selectedSauces?.length
          ? editingLine.selectedSauces
          : editingLine.selectedSauce
            ? [editingLine.selectedSauce]
            : [],
      );
      setSelectedDrinks(editingLine.selectedDrinks ?? []);
      setSelectedBurger(editingLine.selectedBurger);
      setSelectedDog(editingLine.selectedDog);
      setExtraQuantities(
        Object.fromEntries(
          editingLine.selectedExtras.map((extra) => [extra.id, extra.quantity]),
        ),
      );
      setSpecialInstructions(editingLine.specialInstructions ?? "");
    } else {
      setQuantity(1);
      setIngredients(getDefaultIngredients(item));
      setSelectedSauces([]);
      setSelectedDrinks([]);
      setSelectedBurger(undefined);
      setSelectedDog(undefined);
      setExtraQuantities({});
      setSpecialInstructions("");
    }
    setFormError(undefined);
  }, [item, open, editingLine]);

  if (!item) return null;

  const hasIngredients = ingredients.length > 0;
  const sauceCount = rules.sauceCount;
  const drinkCount = rules.includedDrinkCount;
  const sauceLabels = rules.sauceLabels;
  const unitPrice =
    item.price +
    selectedExtras.reduce((sum, extra) => sum + extra.price * extra.quantity, 0);
  const lineTotal = unitPrice * quantity;

  const handleAdd = () => {
    const validationError = validateCartAdd(
      item,
      selectedSauces[0],
      selectedSauces,
      selectedDrinks,
      selectedBurger,
      selectedDog,
    );
    if (validationError) {
      setFormError(validationError);
      return;
    }

    if (editingLine) removeLine(editingLine.lineId);

    const added = addItem(item, {
      quantity,
      selectedIngredients: ingredients,
      selectedSauce: selectedSauces[0],
      selectedSauces,
      selectedDrinks,
      selectedBurger,
      selectedDog,
      selectedExtras,
      specialInstructions: specialInstructions.trim() || undefined,
    });

    if (added) onOpenChange(false);
  };

  const isEditing = Boolean(editingLine);
  const dogError =
    formError && formError.toLowerCase().includes("hot dog")
      ? formError
      : undefined;
  const burgerError =
    formError && formError.toLowerCase().includes("hamburguesa")
      ? formError
      : undefined;
  const sauceError =
    formError && formError.toLowerCase().includes("salsa") ? formError : undefined;
  const drinkError =
    formError && formError.toLowerCase().includes("bebida") ? formError : undefined;

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      zIndexClass={zIndexClass}
      titleId="product-detail-title"
      descriptionId={item.description ? "product-detail-description" : undefined}
    >
      <SheetHeader>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2
              id="product-detail-title"
              className="font-display text-2xl tracking-wide uppercase"
            >
              {item.name}
            </h2>
            <p className="text-lg font-bold">{formatMXN(item.price)}</p>
            {item.description ? (
              <p
                id="product-detail-description"
                className="text-muted-foreground mt-1 text-sm"
              >
                {item.description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={() => onOpenChange(false)}
            className="hover:bg-muted flex size-8 shrink-0 items-center justify-center rounded-full transition-colors"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
      </SheetHeader>

      <SheetBody className="space-y-5">
        <div
          className={cn(
            "relative aspect-[16/10] overflow-hidden rounded-xl",
            item.category === "extras" ? "bg-white" : "bg-muted",
          )}
        >
          <MenuItemImage
            src={item.imageUrl}
            alt={item.name}
            category={item.category}
            slug={item.slug}
            sizes="(max-width: 768px) 100vw, 480px"
            priority
          />
        </div>

        {rules.requiresDogChoice ? (
          <DogChoicePicker
            dogs={dogOptions}
            value={selectedDog}
            onChange={(dog) => {
              setSelectedDog(dog);
              setFormError(undefined);
            }}
            error={dogError}
            hint={
              dogOptions.length > 2
                ? "Una opción para los 2. Si quieres distintos, escríbelo en instrucciones"
                : "Si quieres distintos, indícalo en instrucciones especiales"
            }
          />
        ) : null}

        {rules.requiresBurgerChoice ? (
          <BurgerChoicePicker
            burgers={burgerOptions}
            value={selectedBurger}
            onChange={(burger) => {
              setSelectedBurger(burger);
              setFormError(undefined);
            }}
            error={burgerError}
          />
        ) : null}

        {sauceCount === 1 ? (
          <SaucePicker
            options={sauceOptions}
            value={selectedSauces[0]}
            onChange={(sauce) => {
              setSelectedSauces([sauce]);
              setFormError(undefined);
            }}
            error={sauceError}
          />
        ) : null}

        {sauceCount > 1
          ? Array.from({ length: sauceCount }, (_, index) => (
              <SaucePicker
                key={`sauce-slot-${index}`}
                options={sauceOptions}
                value={selectedSauces[index]}
                idPrefix={`sauce-${item._id}-${index}`}
                title={sauceLabels?.[index] ?? `Salsa ${index + 1}`}
                description={
                  index === 0 ? "Elige una salsa distinta para cada proteína" : undefined
                }
                onChange={(sauce) => {
                  setSelectedSauces((prev) => {
                    const next = Array.from(
                      { length: sauceCount },
                      (_, i) => prev[i] ?? "",
                    );
                    next[index] = sauce;
                    return next;
                  });
                  setFormError(undefined);
                }}
                error={
                  sauceError && !selectedSauces[index] ? sauceError : undefined
                }
              />
            ))
          : null}

        {drinkCount > 0 ? (
          <IncludedDrinksPicker
            drinks={filterIncludedDrinks(item, drinks)}
            requiredCount={drinkCount}
            value={selectedDrinks}
            onChange={(next) => {
              setSelectedDrinks(next);
              setFormError(undefined);
            }}
            error={drinkError}
            hint={
              rules.includedDrinkIds?.length
                ? "Incluidas · solo Té o Jamaica"
                : undefined
            }
          />
        ) : null}

        {hasIngredients ? (
          <section className="space-y-3">
            <h3 className="font-semibold">Personaliza tu orden</h3>
            <p className="text-muted-foreground text-xs">
              Desmarca lo que no quieres en tu {item.name.toLowerCase()}
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {ingredients.map((ing, index) => (
                <Checkbox
                  key={ing.name}
                  id={`ing-${item._id}-${index}`}
                  label={ing.name}
                  checked={ing.included}
                  onCheckedChange={(checked) => {
                    setIngredients((prev) =>
                      prev.map((current, i) =>
                        i === index ? { ...current, included: checked } : current,
                      ),
                    );
                  }}
                />
              ))}
            </div>
          </section>
        ) : null}

        <section className="flex items-center justify-between gap-4">
          <h3 className="font-semibold">Cantidad</h3>
          <QuantityStepper
            quantity={quantity}
            productName={item.name}
            onIncrement={() => setQuantity((q) => q + 1)}
            onDecrement={() => setQuantity((q) => Math.max(1, q - 1))}
          />
        </section>

        <section className="space-y-2">
          <label htmlFor="special-instructions" className="font-semibold">
            Instrucciones especiales
          </label>
          <Textarea
            id="special-instructions"
            placeholder="Ej. sin cebolla, salsa aparte, extra picante..."
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            rows={3}
          />
        </section>

        <ExtrasCarousel
          extras={availableExtras}
          allItems={allItems}
          quantities={extraQuantities}
          onQuantityChange={(extraId, qty) =>
            setExtraQuantities((prev) => ({ ...prev, [extraId]: qty }))
          }
        />

        {item.category !== "bebidas" && drinkCount === 0 ? (
          <DrinksCarousel drinks={drinks} />
        ) : null}
      </SheetBody>

      <SheetFooter>
        {formError ? (
          <p role="alert" className="text-destructive mb-2 text-sm">
            {formError}
          </p>
        ) : null}
        <Button size="lg" className="w-full" onClick={handleAdd}>
          {isEditing ? "Actualizar" : "Agregar"} · {formatMXN(lineTotal)}
        </Button>
      </SheetFooter>
    </Sheet>
  );
}

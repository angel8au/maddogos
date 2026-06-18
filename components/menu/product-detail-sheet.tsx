"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { useCart } from "@/components/providers/cart-provider";
import { DrinksCarousel } from "@/components/menu/drinks-carousel";
import { ExtrasCarousel } from "@/components/menu/extras-carousel";
import { MenuItemImage } from "@/components/menu/menu-item-image";
import { QuantityStepper } from "@/components/menu/quantity-stepper";
import { SaucePicker } from "@/components/menu/sauce-picker";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetBody, SheetFooter, SheetHeader } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { getDefaultIngredients, validateCartAdd } from "@/lib/cart-utils";
import { requiresSauceSelection, resolveLinkedExtras } from "@/lib/menu-config";
import { formatMXN } from "@/lib/whatsapp";
import type { CartLineItem, MenuItem, SelectedExtra, SelectedIngredient } from "@/lib/types";

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
  const [selectedSauce, setSelectedSauce] = useState<string | undefined>();
  const [extraQuantities, setExtraQuantities] = useState<Record<string, number>>({});
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [sauceError, setSauceError] = useState<string | undefined>();

  const availableExtras = useMemo(
    () => (item ? resolveLinkedExtras(item, allItems) : []),
    [item, allItems],
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

    if (editingLine && editingLine.itemId === item._id) {
      setQuantity(editingLine.quantity);
      setIngredients(editingLine.selectedIngredients);
      setSelectedSauce(editingLine.selectedSauce);
      setExtraQuantities(
        Object.fromEntries(
          editingLine.selectedExtras.map((extra) => [extra.id, extra.quantity]),
        ),
      );
      setSpecialInstructions(editingLine.specialInstructions ?? "");
    } else {
      setQuantity(1);
      setIngredients(getDefaultIngredients(item));
      setSelectedSauce(undefined);
      setExtraQuantities({});
      setSpecialInstructions("");
    }
    setSauceError(undefined);
  }, [item, open, editingLine]);

  if (!item) return null;

  const hasIngredients = ingredients.length > 0;
  const needsSauce = requiresSauceSelection(item);
  const unitPrice =
    item.price +
    selectedExtras.reduce((sum, extra) => sum + extra.price * extra.quantity, 0);
  const lineTotal = unitPrice * quantity;

  const handleAdd = () => {
    const validationError = validateCartAdd(item, selectedSauce);
    if (validationError) {
      setSauceError(validationError);
      return;
    }

    if (editingLine) removeLine(editingLine.lineId);

    const added = addItem(item, {
      quantity,
      selectedIngredients: ingredients,
      selectedSauce,
      selectedExtras,
      specialInstructions: specialInstructions.trim() || undefined,
    });

    if (added) onOpenChange(false);
  };

  const isEditing = Boolean(editingLine);

  return (
    <Sheet open={open} onOpenChange={onOpenChange} zIndexClass={zIndexClass}>
      <SheetHeader>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-display text-2xl tracking-wide uppercase">{item.name}</h2>
            <p className="text-lg font-bold">{formatMXN(item.price)}</p>
            {item.description ? (
              <p className="text-muted-foreground mt-1 text-sm">{item.description}</p>
            ) : null}
          </div>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={() => onOpenChange(false)}
            className="hover:bg-muted flex size-8 shrink-0 items-center justify-center rounded-full transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>
      </SheetHeader>

      <SheetBody className="space-y-5">
        <div className="bg-muted relative aspect-[16/10] overflow-hidden rounded-xl">
          <MenuItemImage
            src={item.imageUrl}
            alt={item.name}
            category={item.category}
            slug={item.slug}
            sizes="(max-width: 768px) 100vw, 480px"
            priority
          />
        </div>

        {needsSauce ? (
          <SaucePicker
            options={sauceOptions}
            value={selectedSauce}
            onChange={(sauce) => {
              setSelectedSauce(sauce);
              setSauceError(undefined);
            }}
            error={sauceError}
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

        {item.category !== "bebidas" ? <DrinksCarousel drinks={drinks} /> : null}
      </SheetBody>

      <SheetFooter>
        <Button size="lg" className="w-full" onClick={handleAdd}>
          {isEditing ? "Actualizar" : "Agregar"} · {formatMXN(lineTotal)}
        </Button>
      </SheetFooter>
    </Sheet>
  );
}

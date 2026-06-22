"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { useCart } from "@/components/providers/cart-provider";
import { MenuItemImage } from "@/components/menu/menu-item-image";
import { Button } from "@/components/ui/button";
import {
  ConfirmDialog,
  confirmRemoveMessage,
} from "@/components/ui/confirm-dialog";
import { Sheet, SheetBody, SheetFooter, SheetHeader } from "@/components/ui/sheet";
import {
  CART_ORDER_STORAGE_KEY,
  formatExtrasForDisplay,
  formatIngredientsForDisplay,
} from "@/lib/cart-utils";
import type { CartLineItem } from "@/lib/types";
import {
  buildGraciasUrl,
  buildOrderMessage,
  formatMXN,
  lineSubtotal,
  lineUnitPrice,
} from "@/lib/whatsapp";

type CartSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLineClick: (line: CartLineItem) => void;
};

export function CartSheet({ open, onOpenChange, onLineClick }: CartSheetProps) {
  const router = useRouter();
  const { lines, total, itemCount, updateLineQuantity, removeLine } = useCart();
  const [lineToRemove, setLineToRemove] = useState<string | null>(null);

  const linePendingRemoval = lines.find((line) => line.lineId === lineToRemove);

  const handleCheckout = () => {
    if (!lines.length) return;

    const orderMessage = buildOrderMessage(lines);
    sessionStorage.setItem(CART_ORDER_STORAGE_KEY, orderMessage);
    onOpenChange(false);
    router.push(buildGraciasUrl({ source: "cart" }));
  };

  const confirmRemoveLine = () => {
    if (lineToRemove) removeLine(lineToRemove);
    setLineToRemove(null);
  };

  const handleDecrementLine = (lineId: string, currentQuantity: number) => {
    if (currentQuantity <= 1) {
      setLineToRemove(lineId);
      return;
    }
    updateLineQuantity(lineId, currentQuantity - 1);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange} fullscreen>
        <SheetHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl tracking-wide uppercase">Tu pedido</h2>
              <p className="text-muted-foreground text-sm">
                {itemCount} {itemCount === 1 ? "producto" : "productos"}
              </p>
            </div>
            <button
              type="button"
              aria-label="Cerrar pedido"
              onClick={() => onOpenChange(false)}
              className="hover:bg-muted flex size-8 items-center justify-center rounded-full transition-colors"
            >
              <X className="size-5" />
            </button>
          </div>
        </SheetHeader>

        <SheetBody className="space-y-3">
          {lines.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">
              Tu pedido está vacío. Agrega productos del menú.
            </p>
          ) : (
            lines.map((line) => {
              const ingText = formatIngredientsForDisplay(line.selectedIngredients);
              const extrasText = formatExtrasForDisplay(line.selectedExtras);
              const unitPrice = lineUnitPrice(line);

              return (
                <div
                  key={line.lineId}
                  className="border-border flex gap-3 rounded-xl border p-3"
                >
                  <button
                    type="button"
                    onClick={() => onLineClick(line)}
                    className="hover:bg-muted/50 flex min-w-0 flex-1 gap-3 rounded-lg text-left transition-colors"
                  >
                    <div className="bg-muted relative size-16 shrink-0 overflow-hidden rounded-lg">
                      <MenuItemImage
                        src={line.imageUrl}
                        alt={line.name}
                        category={line.category}
                        slug={line.slug}
                        sizes="64px"
                      />
                    </div>

                    <div className="min-w-0 flex-1 space-y-1 py-0.5">
                      <p className="font-semibold leading-tight">{line.name}</p>
                      <p className="text-sm font-medium">
                        {formatMXN(unitPrice)} c/u
                        {unitPrice !== line.basePrice ? (
                          <span className="text-muted-foreground font-normal">
                            {" "}
                            (base {formatMXN(line.basePrice)})
                          </span>
                        ) : null}
                      </p>
                      {line.selectedSauce ? (
                        <p className="text-muted-foreground text-xs">
                          Salsa: {line.selectedSauce}
                        </p>
                      ) : null}
                      {ingText ? (
                        <p className="text-muted-foreground text-xs">{ingText}</p>
                      ) : null}
                      {extrasText ? (
                        <p className="text-muted-foreground text-xs">Extra: {extrasText}</p>
                      ) : null}
                      {line.specialInstructions ? (
                        <p className="text-muted-foreground text-xs italic">
                          &ldquo;{line.specialInstructions}&rdquo;
                        </p>
                      ) : null}
                    </div>
                  </button>

                  <div className="flex shrink-0 flex-col items-end justify-center gap-2">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        aria-label="Restar"
                        onClick={() => handleDecrementLine(line.lineId, line.quantity)}
                        className="hover:bg-muted flex size-7 items-center justify-center rounded-full border"
                      >
                        {line.quantity === 1 ? (
                          <Trash2 className="size-3.5" />
                        ) : (
                          <Minus className="size-3.5" />
                        )}
                      </button>
                      <span className="min-w-5 text-center text-sm font-semibold">
                        {line.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label="Sumar"
                        onClick={() => updateLineQuantity(line.lineId, line.quantity + 1)}
                        className="hover:bg-muted flex size-7 items-center justify-center rounded-full border"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                    <p className="text-sm font-bold">{formatMXN(lineSubtotal(line))}</p>
                  </div>
                </div>
              );
            })
          )}
        </SheetBody>

        {lines.length > 0 ? (
          <SheetFooter className="space-y-3">
            <div className="flex items-center justify-between text-lg font-bold">
              <span>Total</span>
              <span>{formatMXN(total)}</span>
            </div>
            <Button size="lg" className="w-full" onClick={handleCheckout}>
              Enviar pedido por WhatsApp
            </Button>
          </SheetFooter>
        ) : null}
      </Sheet>

      <ConfirmDialog
        open={Boolean(linePendingRemoval)}
        title="¿Eliminar del pedido?"
        description={
          linePendingRemoval
            ? confirmRemoveMessage(linePendingRemoval.name)
            : ""
        }
        onConfirm={confirmRemoveLine}
        onCancel={() => setLineToRemove(null)}
      />
    </>
  );
}

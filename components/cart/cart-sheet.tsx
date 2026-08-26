"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Minus, Plus, Trash2, X } from "lucide-react";
import { useCart } from "@/components/providers/cart-provider";
import { MenuItemImage } from "@/components/menu/menu-item-image";
import { Button } from "@/components/ui/button";
import {
  ConfirmDialog,
  confirmRemoveMessage,
} from "@/components/ui/confirm-dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sheet, SheetBody, SheetFooter, SheetHeader } from "@/components/ui/sheet";
import { useSiteOpenStatus } from "@/hooks/use-open-status";
import { cartCheckoutLabel } from "@/lib/opening-status";
import {
  CART_ORDER_STORAGE_KEY,
  formatExtrasForDisplay,
  formatIngredientsForDisplay,
} from "@/lib/cart-utils";
import { LOCATIONS } from "@/lib/site-info";
import type { CartLineItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  buildGraciasUrl,
  buildOrderMessage,
  formatMXN,
  fulfillmentLabel,
  isWaLocationId,
  lineSubtotal,
  lineUnitPrice,
  locationLabel,
  type OrderFulfillment,
  type StoredCartOrder,
  type WaLocationId,
} from "@/lib/whatsapp";

type CartSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLineClick: (line: CartLineItem) => void;
};

type CheckoutStep = "cart" | "location" | "fulfillment";

const STEPS: CheckoutStep[] = ["cart", "location", "fulfillment"];

const STEP_COPY: Record<
  CheckoutStep,
  { title: string; subtitle: string }
> = {
  cart: {
    title: "Tu pedido",
    subtitle: "Revisa lo que vas a pedir",
  },
  location: {
    title: "Sucursal",
    subtitle: "¿En cuál sucursal quieres tu pedido?",
  },
  fulfillment: {
    title: "Modalidad",
    subtitle: "¿A domicilio o para recoger?",
  },
};

function StepProgress({ step }: { step: CheckoutStep }) {
  const index = STEPS.indexOf(step);

  return (
    <div className="flex items-center gap-1.5" aria-hidden>
      {STEPS.map((id, i) => (
        <span
          key={id}
          className={cn(
            "h-1.5 rounded-full transition-all",
            i === index ? "bg-primary w-6" : i < index ? "bg-primary/40 w-3" : "bg-muted w-3",
          )}
        />
      ))}
    </div>
  );
}

export function CartSheet({ open, onOpenChange, onLineClick }: CartSheetProps) {
  const router = useRouter();
  const { lines, total, itemCount, updateLineQuantity, removeLine } = useCart();
  const { isScheduled: siteIsScheduled, detailEs, locations } = useSiteOpenStatus();
  const [lineToRemove, setLineToRemove] = useState<string | null>(null);
  const [step, setStep] = useState<CheckoutStep>("cart");
  const [locationId, setLocationId] = useState<WaLocationId | "">("");
  const [fulfillment, setFulfillment] = useState<OrderFulfillment | "">("");
  const [stepAttempted, setStepAttempted] = useState(false);

  const linePendingRemoval = lines.find((line) => line.lineId === lineToRemove);

  const selectedLocationStatus = useMemo(
    () => (locationId ? locations.find((item) => item.locationId === locationId) : null),
    [locationId, locations],
  );

  const isScheduledOrder = selectedLocationStatus
    ? selectedLocationStatus.isScheduled
    : siteIsScheduled;

  const resetCheckout = () => {
    setStep("cart");
    setLocationId("");
    setFulfillment("");
    setStepAttempted(false);
  };

  useEffect(() => {
    if (!open) resetCheckout();
  }, [open]);

  useEffect(() => {
    if (!lines.length && step !== "cart") {
      setStep("cart");
      setStepAttempted(false);
    }
  }, [lines.length, step]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) resetCheckout();
    onOpenChange(nextOpen);
  };

  const goBack = () => {
    setStepAttempted(false);
    if (step === "fulfillment") setStep("location");
    else if (step === "location") setStep("cart");
  };

  const goToLocationStep = () => {
    if (!lines.length) return;
    setStepAttempted(false);
    setStep("location");
  };

  const goToFulfillmentStep = () => {
    setStepAttempted(true);
    if (!isWaLocationId(locationId)) return;
    setStepAttempted(false);
    setStep("fulfillment");
  };

  const handleCheckout = () => {
    if (!lines.length) return;

    setStepAttempted(true);
    if (!isWaLocationId(locationId) || !fulfillment) return;

    const orderMessage = buildOrderMessage(lines, {
      locationId,
      fulfillment,
      scheduled: isScheduledOrder,
      scheduleNote: selectedLocationStatus?.detailEs,
    });
    const payload: StoredCartOrder = {
      message: orderMessage,
      locationId,
      fulfillment,
    };
    sessionStorage.setItem(CART_ORDER_STORAGE_KEY, JSON.stringify(payload));
    handleOpenChange(false);
    router.push(buildGraciasUrl({ source: "cart", location: locationId }));
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

  const copy = STEP_COPY[step];
  const stepIndex = STEPS.indexOf(step);
  const headerSubtitle =
    step === "cart"
      ? `${itemCount} ${itemCount === 1 ? "producto" : "productos"}`
      : copy.subtitle;

  return (
    <>
      <Sheet open={open} onOpenChange={handleOpenChange} fullscreen>
        <SheetHeader>
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-start gap-2">
              {step !== "cart" ? (
                <button
                  type="button"
                  aria-label="Paso anterior"
                  onClick={goBack}
                  className="hover:bg-muted mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full transition-colors"
                >
                  <ChevronLeft className="size-5" />
                </button>
              ) : null}
              <div className="min-w-0 space-y-1">
                <p className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
                  Paso {stepIndex + 1} de {STEPS.length}
                </p>
                <h2 className="font-display text-2xl tracking-wide uppercase">
                  {copy.title}
                </h2>
                <p className="text-muted-foreground text-sm">{headerSubtitle}</p>
              </div>
            </div>
            <button
              type="button"
              aria-label="Cerrar pedido"
              onClick={() => handleOpenChange(false)}
              className="hover:bg-muted flex size-8 shrink-0 items-center justify-center rounded-full transition-colors"
            >
              <X className="size-5" />
            </button>
          </div>
          <div className="mt-3">
            <StepProgress step={step} />
          </div>
        </SheetHeader>

        <SheetBody className="space-y-3">
          {step === "cart" ? (
            lines.length === 0 ? (
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
                          <p className="text-muted-foreground text-xs">
                            Extra: {extrasText}
                          </p>
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
                          onClick={() =>
                            updateLineQuantity(line.lineId, line.quantity + 1)
                          }
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
            )
          ) : null}

          {step === "location" ? (
            <section className="space-y-3">
              <RadioGroup
                value={locationId}
                onValueChange={(value) => {
                  if (isWaLocationId(value)) {
                    setLocationId(value);
                    setStepAttempted(false);
                  }
                }}
                className="grid gap-3"
              >
                {LOCATIONS.map((location) => {
                  const status = locations.find(
                    (item) => item.locationId === location.id,
                  );
                  const selected = locationId === location.id;
                  const id = `checkout-location-${location.id}`;

                  return (
                    <label
                      key={location.id}
                      htmlFor={id}
                      className={cn(
                        "flex w-full cursor-pointer items-start justify-between gap-3 rounded-xl border px-4 py-3.5 text-sm transition-colors",
                        selected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/40",
                        stepAttempted && !locationId && "border-destructive/50",
                      )}
                    >
                      <span className="min-w-0">
                        <span className="block text-base font-semibold">
                          {location.label}
                        </span>
                        <span className="text-muted-foreground mt-1 block text-xs leading-relaxed">
                          {location.street}
                          {status
                            ? ` · ${status.labelEs}${status.isScheduled ? " · puedes programar" : ""}`
                            : null}
                        </span>
                      </span>
                      <RadioGroupItem
                        value={location.id}
                        id={id}
                        className="mt-1 shrink-0"
                      />
                    </label>
                  );
                })}
              </RadioGroup>
              {stepAttempted && !locationId ? (
                <p className="text-destructive text-xs">Elige una sucursal para continuar</p>
              ) : null}
              {locationId && isScheduledOrder && selectedLocationStatus ? (
                <p className="bg-muted text-muted-foreground rounded-xl px-4 py-3 text-xs leading-relaxed">
                  {selectedLocationStatus.label} está{" "}
                  {selectedLocationStatus.labelEs.toLowerCase()} (
                  {selectedLocationStatus.detailEs}). Puedes programar tu pedido y lo
                  preparamos al abrir.
                </p>
              ) : null}
            </section>
          ) : null}

          {step === "fulfillment" ? (
            <section className="space-y-4">
              {isWaLocationId(locationId) ? (
                <p className="text-muted-foreground text-sm">
                  Sucursal:{" "}
                  <span className="text-foreground font-medium">
                    {locationLabel(locationId)}
                  </span>
                </p>
              ) : null}

              <RadioGroup
                value={fulfillment}
                onValueChange={(value) => {
                  if (value === "pickup" || value === "delivery") {
                    setFulfillment(value);
                    setStepAttempted(false);
                  }
                }}
                className="grid gap-3"
              >
                {(
                  [
                    {
                      value: "pickup" as const,
                      label: "Para recoger",
                      hint: "Pásalo a buscar en la sucursal",
                    },
                    {
                      value: "delivery" as const,
                      label: "A domicilio",
                      hint: "Te lo llevamos a tu dirección",
                    },
                  ] as const
                ).map((option) => {
                  const id = `checkout-fulfillment-${option.value}`;
                  const selected = fulfillment === option.value;

                  return (
                    <label
                      key={option.value}
                      htmlFor={id}
                      className={cn(
                        "flex w-full cursor-pointer items-start justify-between gap-3 rounded-xl border px-4 py-3.5 text-sm transition-colors",
                        selected
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border hover:border-primary/40",
                        stepAttempted && !fulfillment && "border-destructive/50",
                      )}
                    >
                      <span className="min-w-0">
                        <span className="block text-base font-semibold">
                          {option.label}
                        </span>
                        <span className="text-muted-foreground mt-1 block text-xs">
                          {option.hint}
                        </span>
                      </span>
                      <RadioGroupItem
                        value={option.value}
                        id={id}
                        className="mt-1 shrink-0"
                      />
                    </label>
                  );
                })}
              </RadioGroup>

              {stepAttempted && !fulfillment ? (
                <p className="text-destructive text-xs">Elige una modalidad para continuar</p>
              ) : null}

              {fulfillment === "delivery" ? (
                <p className="bg-muted text-muted-foreground rounded-xl px-4 py-3 text-xs leading-relaxed">
                  El costo del servicio de entrega depende de la distancia a donde se lleve
                  el pedido. Te confirmamos el monto por WhatsApp al recibir tu orden.
                </p>
              ) : null}

              {fulfillment ? (
                <div className="border-border rounded-xl border px-4 py-3 text-sm">
                  <p className="font-medium">Resumen</p>
                  <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                    {isWaLocationId(locationId) ? locationLabel(locationId) : "—"} ·{" "}
                    {fulfillmentLabel(fulfillment)} · {formatMXN(total)}
                    {isScheduledOrder ? " · Pedido programado" : ""}
                  </p>
                </div>
              ) : null}
            </section>
          ) : null}
        </SheetBody>

        {lines.length > 0 ? (
          <SheetFooter className="space-y-3">
            {step === "cart" ? (
              <>
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatMXN(total)}</span>
                </div>
                <Button size="lg" className="w-full" onClick={goToLocationStep}>
                  Continuar
                </Button>
              </>
            ) : null}

            {step === "location" ? (
              <Button size="lg" className="w-full" onClick={goToFulfillmentStep}>
                Continuar
              </Button>
            ) : null}

            {step === "fulfillment" ? (
              <>
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatMXN(total)}</span>
                </div>
                <Button size="lg" className="w-full" onClick={handleCheckout}>
                  {cartCheckoutLabel(isScheduledOrder)}
                </Button>
                {isScheduledOrder && !selectedLocationStatus ? (
                  <p className="text-muted-foreground text-center text-xs">{detailEs}</p>
                ) : null}
              </>
            ) : null}
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

"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, Minus, Plus, Trash2, X } from "lucide-react";
import posthog from "posthog-js";
import { useCart } from "@/components/providers/cart-provider";
import { MenuItemImage } from "@/components/menu/menu-item-image";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  clearCartStorage,
  formatDrinksForDisplay,
  formatExtrasForDisplay,
  formatIngredientsForDisplay,
  formatSaucesForDisplay,
} from "@/lib/cart-utils";
import { getCustomizationRules } from "@/lib/menu-config";
import {
  ORDER_COMPLEMENTS,
  formatComplementsForDisplay,
  resolveComplementNames,
} from "@/lib/order-complements";
import type { CartLineItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  buildGraciasUrl,
  buildOrderMessage,
  formatMXN,
  fulfillmentLabel,
  isMobileDevice,
  lineSubtotal,
  lineUnitPrice,
  openWhatsApp,
  type OrderFulfillment,
  type StoredCartOrder,
} from "@/lib/whatsapp";

type CartSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLineClick: (line: CartLineItem) => void;
};

type CheckoutStep = "cart" | "details" | "fulfillment";

const STEPS: CheckoutStep[] = ["cart", "details", "fulfillment"];

const STEP_COPY: Record<
  CheckoutStep,
  { title: string; subtitle: string }
> = {
  cart: {
    title: "Tu pedido",
    subtitle: "Revisa lo que vas a pedir",
  },
  details: {
    title: "Complementos y nombre",
    subtitle: "Opcional — solo mandamos lo que elijas",
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
  const { lines, total, itemCount, updateLineQuantity, removeLine } = useCart();
  const { isScheduled: siteIsScheduled, detailEs, locations } = useSiteOpenStatus();
  const [lineToRemove, setLineToRemove] = useState<string | null>(null);
  const [step, setStep] = useState<CheckoutStep>("cart");
  const [fulfillment, setFulfillment] = useState<OrderFulfillment | "">("");
  const [selectedComplements, setSelectedComplements] = useState<string[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [stepAttempted, setStepAttempted] = useState(false);

  const linePendingRemoval = lines.find((line) => line.lineId === lineToRemove);
  const locationStatus = locations[0];
  const isScheduledOrder = locationStatus?.isScheduled ?? siteIsScheduled;
  const complementSummary = formatComplementsForDisplay(selectedComplements);
  const trimmedName = customerName.trim();

  const resetCheckout = () => {
    setStep("cart");
    setFulfillment("");
    setSelectedComplements([]);
    setCustomerName("");
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
    if (step === "fulfillment") setStep("details");
    else if (step === "details") setStep("cart");
  };

  const goToDetailsStep = () => {
    if (!lines.length) return;
    setStepAttempted(false);
    setStep("details");
  };

  const goToFulfillmentStep = () => {
    if (!lines.length) return;
    setStepAttempted(false);
    setStep("fulfillment");
  };

  const toggleComplement = (id: string, checked: boolean) => {
    setSelectedComplements((prev) =>
      checked ? [...prev, id] : prev.filter((current) => current !== id),
    );
  };

  const handleCheckout = () => {
    if (!lines.length) return;

    setStepAttempted(true);
    if (!fulfillment) return;

    const orderMessage = buildOrderMessage(lines, {
      fulfillment,
      scheduled: isScheduledOrder,
      scheduleNote: locationStatus?.detailEs,
      customerName: trimmedName || undefined,
      complements: selectedComplements,
    });

    posthog.capture("cart_checkout_details", {
      complements_count: selectedComplements.length,
      has_customer_name: Boolean(trimmedName),
    });

    posthog.capture("whatsapp_redirect", {
      source: "cart",
      type: "order",
      fulfillment,
    });

    handleOpenChange(false);
    clearCartStorage();

    // Mobile/PWA: open WhatsApp in the same tap (required by iOS standalone apps).
    if (isMobileDevice()) {
      openWhatsApp(orderMessage);
      return;
    }

    const payload: StoredCartOrder = {
      message: orderMessage,
      fulfillment,
    };
    sessionStorage.setItem(CART_ORDER_STORAGE_KEY, JSON.stringify(payload));
    window.location.assign(buildGraciasUrl({ source: "cart" }));
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
      <Sheet open={open} onOpenChange={handleOpenChange} fullscreen titleId="cart-sheet-title">
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
                  <ChevronLeft className="size-5" aria-hidden />
                </button>
              ) : null}
              <div className="min-w-0 space-y-1">
                <p className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
                  Paso {stepIndex + 1} de {STEPS.length}
                </p>
                <h2
                  id="cart-sheet-title"
                  className="font-display text-2xl tracking-wide uppercase"
                >
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
              <X className="size-5" aria-hidden />
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
                        {line.selectedDog ? (
                          <p className="text-muted-foreground text-xs">
                            Hot dog: {line.selectedDog.name}
                          </p>
                        ) : null}
                        {line.selectedBurger ? (
                          <p className="text-muted-foreground text-xs">
                            Hamburguesa: {line.selectedBurger.name}
                          </p>
                        ) : null}
                        {(() => {
                          const sauceText = formatSaucesForDisplay(
                            line,
                            getCustomizationRules({
                              _id: line.itemId,
                              category: line.category,
                              sauceRequired: line.sauceRequired,
                              customizationType: line.customizationType,
                              includedDrinkCount: line.includedDrinkCount,
                            }).sauceLabels,
                          );
                          return sauceText ? (
                            <p className="text-muted-foreground text-xs">{sauceText}</p>
                          ) : null;
                        })()}
                        {(() => {
                          const drinksText = formatDrinksForDisplay(line.selectedDrinks);
                          return drinksText ? (
                            <p className="text-muted-foreground text-xs">
                              Bebidas: {drinksText}
                            </p>
                          ) : null;
                        })()}
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

          {step === "details" ? (
            <section className="space-y-6">
              <div className="space-y-3">
                <div className="space-y-1">
                  <h3 className="font-semibold">Complementos</h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Solo mandamos lo que elijas. Si no marcas nada, van cubiertos y
                    servilletas.
                  </p>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {ORDER_COMPLEMENTS.map((complement) => (
                    <Checkbox
                      key={complement.id}
                      id={`complement-${complement.id}`}
                      label={complement.name}
                      checked={selectedComplements.includes(complement.id)}
                      onCheckedChange={(checked) =>
                        toggleComplement(complement.id, checked)
                      }
                    />
                  ))}
                </div>
                <p className="text-muted-foreground text-xs">
                  {selectedComplements.length
                    ? `Elegiste: ${resolveComplementNames(selectedComplements).join(", ")}`
                    : "Sin complementos"}
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="customer-name" className="font-semibold">
                  Nombre de quien ordena
                </label>
                <input
                  id="customer-name"
                  type="text"
                  autoComplete="name"
                  placeholder="Ej. Kevin"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="border-border bg-background placeholder:text-muted-foreground focus-visible:ring-primary w-full rounded-xl border px-4 py-3 text-sm outline-none focus-visible:ring-2"
                />
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Nos ayuda a confirmar tu pedido y darte seguimiento por WhatsApp
                </p>
              </div>
            </section>
          ) : null}

          {step === "fulfillment" ? (
            <section className="space-y-4">
              {isScheduledOrder && locationStatus ? (
                <p className="bg-muted text-muted-foreground rounded-xl px-4 py-3 text-xs leading-relaxed">
                  Ahora estamos {locationStatus.labelEs.toLowerCase()} (
                  {locationStatus.detailEs}). Puedes programar tu pedido y lo preparamos al
                  abrir.
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
                      hint: "Pásalo a buscar en el local",
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
                    {fulfillmentLabel(fulfillment)} · {formatMXN(total)}
                    {isScheduledOrder ? " · Pedido programado" : ""}
                  </p>
                  {trimmedName ? (
                    <p className="text-muted-foreground mt-1 text-xs">
                      Cliente: {trimmedName}
                    </p>
                  ) : null}
                  <p className="text-muted-foreground mt-1 text-xs">
                    Complementos: {complementSummary}
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
                <Button size="lg" className="w-full" onClick={goToDetailsStep}>
                  Continuar
                </Button>
              </>
            ) : null}

            {step === "details" ? (
              <>
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatMXN(total)}</span>
                </div>
                <Button size="lg" className="w-full" onClick={goToFulfillmentStep}>
                  Continuar
                </Button>
              </>
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
                {isScheduledOrder ? (
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

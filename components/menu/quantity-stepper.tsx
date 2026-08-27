"use client";

import { useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import {
  ConfirmDialog,
  confirmRemoveMessage,
} from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";

type QuantityStepperProps = {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  size?: "sm" | "md";
  className?: string;
  /** Product name for VoiceOver labels and remove confirmation. */
  itemName?: string;
  /** Always used for aria-labels even when quantity is 0. */
  productName?: string;
};

export function QuantityStepper({
  quantity,
  onIncrement,
  onDecrement,
  size = "md",
  className,
  itemName,
  productName,
}: QuantityStepperProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const labelName = productName ?? itemName;
  const addLabel = labelName ? `Agregar ${labelName}` : "Agregar";
  const removeLabel = labelName ? `Eliminar ${labelName}` : "Eliminar";
  const decreaseLabel = labelName ? `Restar ${labelName}` : "Restar";

  const handleDecrement = () => {
    if (quantity === 1 && (itemName || productName)) {
      setConfirmOpen(true);
      return;
    }
    onDecrement();
  };

  const handleConfirmRemove = () => {
    setConfirmOpen(false);
    onDecrement();
  };

  if (quantity === 0) {
    return (
      <button
        type="button"
        aria-label={addLabel}
        onClick={(e) => {
          e.stopPropagation();
          onIncrement();
        }}
        className={cn(
          "bg-background flex items-center justify-center rounded-full border shadow-md transition-transform active:scale-95",
          size === "sm" ? "size-8" : "size-9",
          className,
        )}
      >
        <Plus className="size-4" aria-hidden />
      </button>
    );
  }

  return (
    <>
      <div
        className={cn(
          "bg-background flex items-center gap-1 rounded-full border px-1 shadow-md",
          size === "sm" ? "h-8" : "h-9",
          className,
        )}
      >
        <button
          type="button"
          aria-label={quantity === 1 ? removeLabel : decreaseLabel}
          onClick={(e) => {
            e.stopPropagation();
            handleDecrement();
          }}
          className="hover:bg-muted flex size-7 items-center justify-center rounded-full transition-colors"
        >
          {quantity === 1 ? (
            <Trash2 className="size-3.5" aria-hidden />
          ) : (
            <Minus className="size-3.5" aria-hidden />
          )}
        </button>
        <span className="min-w-5 text-center text-sm font-semibold" aria-live="polite">
          {quantity}
        </span>
        <button
          type="button"
          aria-label={addLabel}
          onClick={(e) => {
            e.stopPropagation();
            onIncrement();
          }}
          className="hover:bg-muted flex size-7 items-center justify-center rounded-full transition-colors"
        >
          <Plus className="size-3.5" aria-hidden />
        </button>
      </div>

      {itemName || productName ? (
        <ConfirmDialog
          open={confirmOpen}
          title="¿Eliminar del pedido?"
          description={confirmRemoveMessage(itemName || productName || "")}
          onConfirm={handleConfirmRemove}
          onCancel={() => setConfirmOpen(false)}
        />
      ) : null}
    </>
  );
}

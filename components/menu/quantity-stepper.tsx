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
  /** Si se define, al bajar de 1 a 0 pide confirmación */
  itemName?: string;
};

export function QuantityStepper({
  quantity,
  onIncrement,
  onDecrement,
  size = "md",
  className,
  itemName,
}: QuantityStepperProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleDecrement = () => {
    if (quantity === 1 && itemName) {
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
        aria-label="Agregar"
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
        <Plus className="size-4" />
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
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label={quantity === 1 ? "Quitar" : "Restar"}
          onClick={handleDecrement}
          className="hover:bg-muted flex size-7 items-center justify-center rounded-full transition-colors"
        >
          {quantity === 1 ? (
            <Trash2 className="size-3.5" />
          ) : (
            <Minus className="size-3.5" />
          )}
        </button>
        <span className="min-w-5 text-center text-sm font-semibold">{quantity}</span>
        <button
          type="button"
          aria-label="Agregar"
          onClick={onIncrement}
          className="hover:bg-muted flex size-7 items-center justify-center rounded-full transition-colors"
        >
          <Plus className="size-3.5" />
        </button>
      </div>

      {itemName ? (
        <ConfirmDialog
          open={confirmOpen}
          title="¿Quitar del carrito?"
          description={confirmRemoveMessage(itemName)}
          onConfirm={handleConfirmRemove}
          onCancel={() => setConfirmOpen(false)}
        />
      ) : null}
    </>
  );
}

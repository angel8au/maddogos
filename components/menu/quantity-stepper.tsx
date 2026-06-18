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

const sizeStyles = {
  sm: {
    add: "size-10",
    bar: "h-10",
    control: "size-8",
    icon: "size-3.5",
    qty: "text-sm",
  },
  md: {
    add: "size-12",
    bar: "h-12",
    control: "size-10",
    icon: "size-4",
    qty: "text-base",
  },
} as const;

export function QuantityStepper({
  quantity,
  onIncrement,
  onDecrement,
  size = "md",
  className,
  itemName,
}: QuantityStepperProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const styles = sizeStyles[size];

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
          styles.add,
          className,
        )}
      >
        <Plus className={styles.icon} />
      </button>
    );
  }

  return (
    <>
      <div
        className={cn(
          "bg-background flex items-center gap-1 rounded-full border px-1 shadow-md",
          styles.bar,
          className,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label={quantity === 1 ? "Quitar" : "Restar"}
          onClick={handleDecrement}
          className={cn(
            "hover:bg-muted flex items-center justify-center rounded-full transition-colors",
            styles.control,
          )}
        >
          {quantity === 1 ? (
            <Trash2 className={styles.icon} />
          ) : (
            <Minus className={styles.icon} />
          )}
        </button>
        <span className={cn("min-w-5 text-center font-semibold", styles.qty)}>
          {quantity}
        </span>
        <button
          type="button"
          aria-label="Agregar"
          onClick={onIncrement}
          className={cn(
            "hover:bg-muted flex items-center justify-center rounded-full transition-colors",
            styles.control,
          )}
        >
          <Plus className={styles.icon} />
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

"use client";

import { useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import {
  ConfirmDialog,
  confirmRemoveMessage,
} from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";

const focusRing =
  "outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-offset-2";

/** 44×44 hit target wrapping a 36×36 visual control. */
const hitTarget = "flex size-11 items-center justify-center rounded-full";
const visualControl = "flex size-9 items-center justify-center rounded-full";

type QuantityStepperProps = {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  /** Kept for callers; hit targets are always ≥44px. */
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
          hitTarget,
          focusRing,
          "hover:[&>span]:bg-success-hover active:[&>span]:scale-95",
          className,
        )}
      >
        <span
          className={cn(
            visualControl,
            "bg-success text-success-foreground shadow-md transition-[transform,background-color]",
          )}
          aria-hidden
        >
          <Plus className="size-4" />
        </span>
      </button>
    );
  }

  return (
    <>
      <div
        className={cn(
          "bg-background flex h-11 items-center rounded-full border shadow-md",
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
          className={cn(hitTarget, focusRing, "hover:[&>span]:bg-muted")}
        >
          <span className={cn(visualControl, "transition-colors")} aria-hidden>
            {quantity === 1 ? (
              <Trash2 className="size-3.5" />
            ) : (
              <Minus className="size-3.5" />
            )}
          </span>
        </button>
        <span
          className="min-w-5 text-center text-sm font-semibold tabular-nums"
          aria-live="polite"
        >
          {quantity}
        </span>
        <button
          type="button"
          aria-label={addLabel}
          onClick={(e) => {
            e.stopPropagation();
            onIncrement();
          }}
          className={cn(hitTarget, focusRing, "hover:[&>span]:bg-success/10")}
        >
          <span
            className={cn(visualControl, "text-success transition-colors")}
            aria-hidden
          >
            <Plus className="size-3.5" />
          </span>
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

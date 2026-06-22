"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Trash2 } from "lucide-react";
import {
  useCart,
  type CartFeedbackType,
} from "@/components/providers/cart-provider";
import { playCartAddSound } from "@/lib/cart-feedback";
import { cn } from "@/lib/utils";

export function CartFeedbackToast() {
  const { lastFeedback } = useCart();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [type, setType] = useState<CartFeedbackType>("add");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!lastFeedback) return;

    const label =
      lastFeedback.quantity > 1
        ? `${lastFeedback.quantity}× ${lastFeedback.name}`
        : lastFeedback.name;

    setType(lastFeedback.type);
    setMessage(label);
    setVisible(true);
    if (lastFeedback.type === "add") playCartAddSound();

    const timer = window.setTimeout(() => setVisible(false), 2400);
    return () => window.clearTimeout(timer);
  }, [lastFeedback]);

  if (!mounted || !visible) return null;

  const isRemove = type === "remove";
  const Icon = isRemove ? Trash2 : Check;
  const title = isRemove ? "Eliminado de tu pedido" : "¡Agregado a tu pedido!";

  return createPortal(
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={cn(
        "pointer-events-none fixed inset-x-0 z-[2147483647] flex justify-center px-4",
        "bottom-[calc(4.5rem+env(safe-area-inset-bottom))]",
      )}
    >
      <div className="cart-add-toast bg-foreground text-background flex max-w-sm items-center gap-3 rounded-2xl px-4 py-3 shadow-2xl">
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full",
            isRemove
              ? "bg-destructive text-destructive-foreground"
              : "bg-success text-success-foreground",
          )}
        >
          <Icon className="size-4" strokeWidth={3} aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold">{title}</p>
          <p className="truncate text-xs opacity-80">{message}</p>
        </div>
      </div>
    </div>,
    document.body,
  );
}

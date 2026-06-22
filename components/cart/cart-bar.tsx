"use client";

import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/components/providers/cart-provider";
import { cn } from "@/lib/utils";

type CartBarProps = {
  onOpenCart: () => void;
};

export function CartBar({ onOpenCart }: CartBarProps) {
  const { itemCount, lastFeedback } = useCart();
  const [bump, setBump] = useState(false);

  useEffect(() => {
    if (!lastFeedback || lastFeedback.type !== "add") return;
    setBump(true);
    const timer = window.setTimeout(() => setBump(false), 500);
    return () => window.clearTimeout(timer);
  }, [lastFeedback]);

  if (itemCount === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <button
        type="button"
        onClick={onOpenCart}
        className={cn(
          "bg-accent text-accent-foreground hover:bg-accent-hover pointer-events-auto flex h-12 items-center gap-2 rounded-full px-6 shadow-xl transition-[transform,background-color] active:scale-[0.98]",
          bump && "cart-bar-bump",
        )}
      >
        <ShoppingCart className={cn("size-5", bump && "cart-icon-pop")} />
        <span className="font-semibold">
          Ver mi pedido · <span className={cn(bump && "cart-count-pop")}>{itemCount}</span>
        </span>
      </button>
    </div>
  );
}

"use client";

import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type SheetSide = "bottom" | "right" | "responsive";

type SheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  className?: string;
  fullscreen?: boolean;
  zIndexClass?: string;
  side?: SheetSide;
};

export function Sheet({
  open,
  onOpenChange,
  children,
  className,
  fullscreen = false,
  zIndexClass = "z-50",
  side = "responsive",
}: SheetProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const isResponsive = side === "responsive";
  const isRight = side === "right" || isResponsive;
  const isBottom = side === "bottom" || isResponsive;

  return (
    <div
      className={cn(
        "fixed inset-0 flex",
        isBottom && !isRight && "flex-col justify-end",
        isBottom && isRight && "flex-col justify-end md:flex-row md:justify-end",
        isRight && !isBottom && "flex-row justify-end",
        zIndexClass,
      )}
    >
      <button
        type="button"
        aria-label="Cerrar"
        className="absolute inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "bg-background relative z-10 flex w-full flex-col shadow-2xl duration-300",
          isBottom &&
            !fullscreen &&
            "max-md:max-h-[92vh] max-md:animate-in max-md:slide-in-from-bottom max-md:rounded-t-2xl",
          isBottom &&
            fullscreen &&
            "max-md:h-[100dvh] max-md:max-h-[100dvh] max-md:animate-in max-md:slide-in-from-bottom max-md:rounded-none",
          isRight &&
            "md:h-full md:max-h-none md:w-full md:max-w-md md:animate-in md:slide-in-from-right md:rounded-none md:rounded-l-2xl",
          fullscreen && isRight && "md:max-w-lg",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function SheetHeader({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("border-border shrink-0 border-b px-4 py-3", className)}>
      {children}
    </div>
  );
}

export function SheetBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-h-0 flex-1 overflow-y-auto px-4 py-4", className)}>
      {children}
    </div>
  );
}

export function SheetFooter({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border-border bg-background shrink-0 border-t px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]",
        className,
      )}
    >
      {children}
    </div>
  );
}

"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

type SheetSide = "bottom" | "right" | "responsive";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

type SheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  className?: string;
  fullscreen?: boolean;
  zIndexClass?: string;
  side?: SheetSide;
  /** Element id for aria-labelledby (e.g. sheet title h2). */
  titleId?: string;
  /** Element id for aria-describedby. */
  descriptionId?: string;
};

export function Sheet({
  open,
  onOpenChange,
  children,
  className,
  fullscreen = false,
  zIndexClass = "z-50",
  side = "responsive",
  titleId,
  descriptionId,
}: SheetProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const autoTitleId = useId();
  const resolvedTitleId = titleId ?? autoTitleId;

  const getFocusable = useCallback(() => {
    const root = dialogRef.current;
    if (!root) return [] as HTMLElement[];
    return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
      (el) => !el.hasAttribute("disabled") && el.getAttribute("aria-hidden") !== "true",
    );
  }, []);

  useEffect(() => {
    if (!open) return;

    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusFirst = () => {
      const focusable = getFocusable();
      const target =
        focusable.find((el) => el.getAttribute("aria-label") === "Cerrar") ??
        focusable[0] ??
        dialogRef.current;
      target?.focus();
    };

    const frame = requestAnimationFrame(focusFirst);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onOpenChange(false);
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = getFocusable();
      if (focusable.length === 0) {
        event.preventDefault();
        dialogRef.current?.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
      previousFocusRef.current?.focus?.();
    };
  }, [open, onOpenChange, getFocusable]);

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
        tabIndex={-1}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={resolvedTitleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        className={cn(
          "bg-background relative z-10 flex w-full flex-col shadow-2xl duration-300 outline-none",
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
        {!titleId ? (
          <span id={resolvedTitleId} className="sr-only">
            Diálogo
          </span>
        ) : null}
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

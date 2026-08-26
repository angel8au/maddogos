"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { useSiteOpenStatus } from "@/hooks/use-open-status";
import { orderActionLabel } from "@/lib/opening-status";
import { buildGraciasUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

type OrderWhatsAppButtonProps = {
  source: string;
  item?: string;
  children?: ReactNode;
  className?: string;
  size?: "default" | "sm" | "lg";
  variant?: "primary" | "outline-on-primary" | "default";
};

export function OrderWhatsAppButton({
  source,
  item,
  children,
  className,
  size = "lg",
  variant = "default",
}: OrderWhatsAppButtonProps) {
  const { isScheduled, detailEs } = useSiteOpenStatus();

  const label = isScheduled
    ? orderActionLabel(true)
    : (children ?? orderActionLabel(false));

  return (
    <div className={cn("flex w-full flex-col gap-2 sm:w-auto", className)}>
      <Link
        href={buildGraciasUrl({ item, source })}
        className={cn(
          buttonVariants({ size }),
          "w-full sm:w-auto",
          variant === "outline-on-primary" &&
            "border border-primary-foreground/40 bg-transparent text-primary-foreground hover:border-accent/70 hover:bg-primary-foreground/15",
          variant === "primary" &&
            "bg-accent text-accent-foreground shadow-md hover:bg-accent-hover hover:shadow-lg",
        )}
      >
        {label}
      </Link>
      {isScheduled ? (
        <p
          className={cn(
            "text-xs",
            variant === "outline-on-primary" || variant === "primary"
              ? "text-primary-foreground/80"
              : "text-muted-foreground",
          )}
        >
          Ahora estamos cerrados. {detailEs}
        </p>
      ) : null}
    </div>
  );
}

"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  useLocationOpenStatusFor,
  useSiteOpenStatus,
} from "@/hooks/use-open-status";
import { orderActionLabel } from "@/lib/opening-status";
import { LOCATIONS, type Location } from "@/lib/site-info";
import {
  buildGraciasUrl,
  isWaLocationId,
  type WaLocationId,
} from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

type OrderWhatsAppButtonProps = {
  source: string;
  item?: string;
  /** When set, routes the order to that branch WhatsApp. */
  locationId?: WaLocationId;
  children?: ReactNode;
  className?: string;
  size?: "default" | "sm" | "lg";
  variant?: "primary" | "outline-on-primary" | "default";
};

function OrderWhatsAppButtonInner({
  source,
  item,
  locationId,
  location,
  children,
  className,
  size = "lg",
  variant = "default",
}: OrderWhatsAppButtonProps & { location?: Location }) {
  const siteStatus = useSiteOpenStatus();
  const locationStatus = useLocationOpenStatusFor(
    location ?? LOCATIONS[0],
  );

  const isScheduled = location
    ? locationStatus.isScheduled
    : siteStatus.isScheduled;
  const detailEs = location ? locationStatus.detailEs : siteStatus.detailEs;

  const label = isScheduled
    ? orderActionLabel(true)
    : (children ?? orderActionLabel(false));

  return (
    <div className={cn("flex w-full flex-col gap-2 sm:w-auto", className)}>
      <Link
        href={buildGraciasUrl({
          item,
          source,
          ...(locationId ? { location: locationId } : {}),
        })}
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
          {location
            ? `${location.label} está cerrada ahora. ${detailEs}`
            : `Ahora estamos cerrados. ${detailEs}`}
        </p>
      ) : null}
    </div>
  );
}

export function OrderWhatsAppButton(props: OrderWhatsAppButtonProps) {
  const location =
    props.locationId && isWaLocationId(props.locationId)
      ? LOCATIONS.find((entry) => entry.id === props.locationId)
      : undefined;

  return <OrderWhatsAppButtonInner {...props} location={location} />;
}

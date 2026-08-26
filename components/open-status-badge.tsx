"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { OpenStatusKind } from "@/lib/opening-status";
import {
  useLocationOpenStatusFor,
  useSiteOpenStatus,
} from "@/hooks/use-open-status";
import type { Location } from "@/lib/site-info";
import { LOCATIONS } from "@/lib/site-info";

const STATUS_STYLES: Record<
  OpenStatusKind,
  { badge: string; dot: string }
> = {
  open: {
    badge: "bg-emerald-600 text-white",
    dot: "bg-white",
  },
  closes_soon: {
    badge: "bg-amber-500 text-black",
    dot: "bg-black",
  },
  opens_soon: {
    badge: "bg-sky-600 text-white",
    dot: "bg-white",
  },
  closed: {
    badge: "bg-zinc-700 text-white",
    dot: "bg-white/80",
  },
};

type OpenStatusBadgeProps = {
  status: OpenStatusKind;
  label: string;
  detail?: string;
  href?: string;
  size?: "sm" | "md";
  className?: string;
  showDetail?: boolean;
};

export function OpenStatusBadge({
  status,
  label,
  detail,
  href,
  size = "sm",
  className,
  showDetail = false,
}: OpenStatusBadgeProps) {
  const styles = STATUS_STYLES[status];
  const content = (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 rounded-full font-semibold tracking-wide uppercase",
        size === "sm" ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs",
        styles.badge,
        href && "transition-opacity hover:opacity-90",
        className,
      )}
      title={detail}
    >
      <span className={cn("size-1.5 shrink-0 rounded-full", styles.dot)} aria-hidden />
      <span className="truncate">{label}</span>
      {showDetail && detail ? (
        <span className="hidden font-normal normal-case tracking-normal opacity-90 sm:inline">
          · {detail}
        </span>
      ) : null}
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex max-w-full" aria-label={`${label}. ${detail ?? ""}`}>
        {content}
      </Link>
    );
  }

  return content;
}

export function SiteOpenStatusBadge({
  className,
  size = "sm",
  showDetail = false,
}: {
  className?: string;
  size?: "sm" | "md";
  showDetail?: boolean;
}) {
  const status = useSiteOpenStatus();

  return (
    <OpenStatusBadge
      status={status.status}
      label={status.labelEs}
      detail={status.detailEs}
      href="/ubicacion"
      size={size}
      showDetail={showDetail}
      className={className}
    />
  );
}

export function LocationOpenStatusBadge({
  location,
  className,
  size = "md",
  showDetail = true,
  showLocationName = false,
  href,
}: {
  location: Location;
  className?: string;
  size?: "sm" | "md";
  showDetail?: boolean;
  showLocationName?: boolean;
  href?: string;
}) {
  const status = useLocationOpenStatusFor(location);
  const label = showLocationName
    ? `${location.label} · ${status.labelEs}`
    : status.labelEs;

  return (
    <OpenStatusBadge
      status={status.status}
      label={label}
      detail={status.detailEs}
      href={href}
      size={size}
      showDetail={showDetail}
      className={className}
    />
  );
}

export function HeroLocationStatusBadges({
  className,
}: {
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {LOCATIONS.map((location) => (
        <LocationOpenStatusBadge
          key={location.id}
          location={location}
          size="md"
          showLocationName
          showDetail={false}
          href="/ubicacion"
        />
      ))}
    </div>
  );
}

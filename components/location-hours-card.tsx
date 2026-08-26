"use client";

import { Clock } from "lucide-react";
import { LocationOpenStatusBadge } from "@/components/open-status-badge";
import {
  formatScheduleHours,
  WEEKDAY_LABELS,
  getMazatlanClock,
} from "@/lib/opening-status";
import type { Location } from "@/lib/site-info";
import { cn } from "@/lib/utils";

type LocationHoursCardProps = {
  location: Location;
  className?: string;
  /** Hide name/badge when the parent already shows them. */
  hideHeader?: boolean;
};

export function LocationHoursCard({
  location,
  className,
  hideHeader = false,
}: LocationHoursCardProps) {
  const { day: today } = getMazatlanClock();

  return (
    <div className={cn("space-y-3", className)}>
      {hideHeader ? (
        <h3 className="font-display text-xl tracking-wide uppercase">Horario</h3>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-display text-xl tracking-wide uppercase">{location.label}</h3>
          <LocationOpenStatusBadge location={location} size="sm" showDetail={false} />
        </div>
      )}
      <ul className="divide-y rounded-xl border">
        {location.hours.map((row) => {
          const isToday = row.day === today;
          return (
            <li
              key={row.day}
              className={cn(
                "flex items-center justify-between gap-4 px-4 py-2.5 text-sm",
                isToday && "bg-accent/15",
              )}
            >
              <span className={cn("font-medium", isToday && "flex items-center gap-1.5")}>
                {isToday ? <Clock className="size-3.5 shrink-0" aria-hidden /> : null}
                {WEEKDAY_LABELS[row.day]}
              </span>
              <span className={cn(row.closed ? "text-muted-foreground" : "text-foreground")}>
                {formatScheduleHours(row)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

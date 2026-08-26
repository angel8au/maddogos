import {
  BUSINESS_TIMEZONE,
  LOCATIONS,
  STATUS_SOON_MINUTES,
  WEEKDAY_LABELS,
  WEEKDAY_ORDER,
  type DayOfWeek,
  type DaySchedule,
  type Location,
} from "@/lib/site-info";

export type OpenStatusKind = "open" | "closes_soon" | "opens_soon" | "closed";

export type LocationOpenStatus = {
  locationId: string;
  label: string;
  status: OpenStatusKind;
  /** True when the kitchen is currently in service hours. */
  isOpenNow: boolean;
  /** True when the order would be scheduled for later (closed / abre pronto). */
  isScheduled: boolean;
  /** Always true — we take live and scheduled orders. */
  acceptsOrders: boolean;
  labelEs: string;
  detailEs: string;
  todaySchedule: DaySchedule;
};

export type SiteOpenStatus = {
  status: OpenStatusKind;
  isOpenNow: boolean;
  isScheduled: boolean;
  acceptsOrders: boolean;
  labelEs: string;
  detailEs: string;
  openLocations: LocationOpenStatus[];
  locations: LocationOpenStatus[];
};

export function isLiveOpenStatus(status: OpenStatusKind): boolean {
  return status === "open" || status === "closes_soon";
}

export function orderActionLabel(isScheduled: boolean): string {
  return isScheduled ? "Programa tu pedido" : "Pedir por WhatsApp";
}

export function cartCheckoutLabel(isScheduled: boolean): string {
  return isScheduled
    ? "Programar pedido por WhatsApp"
    : "Enviar pedido por WhatsApp";
}

type MazatlanClock = {
  day: DayOfWeek;
  /** Minutes since local midnight. */
  minutes: number;
};

const WEEKDAY_FROM_SHORT: Record<string, DayOfWeek> = {
  Mon: "monday",
  Tue: "tuesday",
  Wed: "wednesday",
  Thu: "thursday",
  Fri: "friday",
  Sat: "saturday",
  Sun: "sunday",
};

const SCHEMA_DAY: Record<DayOfWeek, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

export function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function formatTimeEs(time: string): string {
  const minutes = parseTimeToMinutes(time);
  const h24 = Math.floor(minutes / 60);
  const m = minutes % 60;
  const period = h24 >= 12 ? "p.m." : "a.m.";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const mm = m === 0 ? "" : `:${String(m).padStart(2, "0")}`;
  return `${h12}${mm} ${period}`;
}

export function formatScheduleHours(schedule: DaySchedule): string {
  if (schedule.closed) return "Cerrado";
  return `${formatTimeEs(schedule.open)} – ${formatTimeEs(schedule.close)}`;
}

export function getMazatlanClock(now: Date = new Date()): MazatlanClock {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: BUSINESS_TIMEZONE,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);

  const weekday = parts.find((p) => p.type === "weekday")?.value ?? "Mon";
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? "0");

  return {
    day: WEEKDAY_FROM_SHORT[weekday] ?? "monday",
    minutes: hour * 60 + minute,
  };
}

function getScheduleForDay(location: Location, day: DayOfWeek): DaySchedule {
  return (
    location.hours.find((row) => row.day === day) ?? {
      day,
      closed: true as const,
    }
  );
}

function dayOffset(day: DayOfWeek, offset: number): DayOfWeek {
  const index = WEEKDAY_ORDER.indexOf(day);
  return WEEKDAY_ORDER[(index + offset + 7) % 7];
}

function minutesUntilClose(schedule: DaySchedule, nowMinutes: number): number | null {
  if (schedule.closed) return null;
  const close = parseTimeToMinutes(schedule.close);
  return close - nowMinutes;
}

function minutesUntilOpen(schedule: DaySchedule, nowMinutes: number): number | null {
  if (schedule.closed) return null;
  const open = parseTimeToMinutes(schedule.open);
  return open - nowMinutes;
}

function findNextOpen(
  location: Location,
  clock: MazatlanClock,
): { day: DayOfWeek; open: string; minutesAway: number } | null {
  for (let offset = 0; offset < 7; offset++) {
    const day = dayOffset(clock.day, offset);
    const schedule = getScheduleForDay(location, day);
    if (schedule.closed) continue;

    const openMinutes = parseTimeToMinutes(schedule.open);
    if (offset === 0) {
      if (clock.minutes < openMinutes) {
        return {
          day,
          open: schedule.open,
          minutesAway: openMinutes - clock.minutes,
        };
      }
      continue;
    }

    const minutesAway = offset * 24 * 60 - clock.minutes + openMinutes;
    return { day, open: schedule.open, minutesAway };
  }
  return null;
}

function buildLocationStatus(
  location: Location,
  status: OpenStatusKind,
  labelEs: string,
  detailEs: string,
  todaySchedule: DaySchedule,
): LocationOpenStatus {
  const isOpenNow = isLiveOpenStatus(status);
  return {
    locationId: location.id,
    label: location.label,
    status,
    isOpenNow,
    isScheduled: !isOpenNow,
    acceptsOrders: true,
    labelEs,
    detailEs,
    todaySchedule,
  };
}

export function getLocationOpenStatus(
  location: Location,
  now: Date = new Date(),
): LocationOpenStatus {
  const clock = getMazatlanClock(now);
  const todaySchedule = getScheduleForDay(location, clock.day);

  if (!todaySchedule.closed) {
    const openAt = parseTimeToMinutes(todaySchedule.open);
    const closeAt = parseTimeToMinutes(todaySchedule.close);
    const isOpen = clock.minutes >= openAt && clock.minutes < closeAt;

    if (isOpen) {
      const untilClose = minutesUntilClose(todaySchedule, clock.minutes) ?? 0;
      if (untilClose <= STATUS_SOON_MINUTES) {
        return buildLocationStatus(
          location,
          "closes_soon",
          "Cierra pronto",
          `Cierra a las ${formatTimeEs(todaySchedule.close)}`,
          todaySchedule,
        );
      }
      return buildLocationStatus(
        location,
        "open",
        "Abierto",
        `Abierto hasta las ${formatTimeEs(todaySchedule.close)}`,
        todaySchedule,
      );
    }

    const untilOpen = minutesUntilOpen(todaySchedule, clock.minutes);
    if (untilOpen !== null && untilOpen > 0 && untilOpen <= STATUS_SOON_MINUTES) {
      return buildLocationStatus(
        location,
        "opens_soon",
        "Abre pronto",
        `Abre a las ${formatTimeEs(todaySchedule.open)}`,
        todaySchedule,
      );
    }
  }

  const next = findNextOpen(location, clock);
  if (next && next.minutesAway <= STATUS_SOON_MINUTES) {
    return buildLocationStatus(
      location,
      "opens_soon",
      "Abre pronto",
      `Abre a las ${formatTimeEs(next.open)}`,
      todaySchedule,
    );
  }

  if (next) {
    const when =
      next.day === clock.day
        ? `hoy a las ${formatTimeEs(next.open)}`
        : `${WEEKDAY_LABELS[next.day]} a las ${formatTimeEs(next.open)}`;
    return buildLocationStatus(
      location,
      "closed",
      "Cerrado",
      `Abre ${when}`,
      todaySchedule,
    );
  }

  return buildLocationStatus(
    location,
    "closed",
    "Cerrado",
    "Sin horario disponible",
    todaySchedule,
  );
}

export function getSiteOpenStatus(now: Date = new Date()): SiteOpenStatus {
  const locations = LOCATIONS.map((location) => getLocationOpenStatus(location, now));
  const openLocations = locations.filter((l) => l.isOpenNow);

  const hasOpen = locations.some((l) => l.status === "open");
  const hasClosesSoon = locations.some((l) => l.status === "closes_soon");
  const hasOpensSoon = locations.some((l) => l.status === "opens_soon");

  let status: OpenStatusKind;
  if (hasOpen) status = "open";
  else if (hasClosesSoon) status = "closes_soon";
  else if (hasOpensSoon) status = "opens_soon";
  else status = "closed";

  const isOpenNow = openLocations.length > 0;
  const isScheduled = !isOpenNow;

  const opensSoon = locations.find((l) => l.status === "opens_soon");

  const labelEs =
    status === "open"
      ? "Abierto"
      : status === "closes_soon"
        ? "Cierra pronto"
        : status === "opens_soon"
          ? "Abre pronto"
          : "Cerrado";

  let detailEs: string;
  if (isOpenNow) {
    detailEs = openLocations[0]?.detailEs ?? "Estamos abiertos";
  } else if (opensSoon) {
    detailEs = `Puedes programar tu pedido. ${opensSoon.detailEs}`;
  } else {
    const nextDetails = locations.map((l) => l.detailEs).join(" · ");
    detailEs = `Puedes programar tu pedido. ${nextDetails}`;
  }

  return {
    status,
    isOpenNow,
    isScheduled,
    acceptsOrders: true,
    labelEs,
    detailEs,
    openLocations,
    locations,
  };
}

export function openingHoursToSchema(location: Location) {
  return location.hours
    .filter((row): row is Extract<DaySchedule, { open: string; close: string }> => !row.closed)
    .map((row) => ({
      "@type": "OpeningHoursSpecification" as const,
      dayOfWeek: SCHEMA_DAY[row.day],
      opens: row.open,
      closes: row.close,
    }));
}

export { WEEKDAY_LABELS };

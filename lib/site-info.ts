export const BUSINESS_TIMEZONE = "America/Mazatlan";

/** Minutes before open/close to show "abre pronto" / "cierra pronto". */
export const STATUS_SOON_MINUTES = 30;

export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export const WEEKDAY_ORDER: DayOfWeek[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export const WEEKDAY_LABELS: Record<DayOfWeek, string> = {
  monday: "Lunes",
  tuesday: "Martes",
  wednesday: "Miércoles",
  thursday: "Jueves",
  friday: "Viernes",
  saturday: "Sábado",
  sunday: "Domingo",
};

export type DaySchedule =
  | { day: DayOfWeek; closed: true }
  | { day: DayOfWeek; closed?: false; open: string; close: string };

export type Location = {
  id: string;
  label: string;
  street: string;
  neighborhood: string;
  postalCode?: string;
  city: string;
  state: string;
  full: string;
  mapsUrl: string;
  mapsEmbedUrl: string;
  /** Weekly schedule Mon→Sun. Times are local (America/Mazatlan), 24h "HH:MM". */
  hours: DaySchedule[];
};

const ANTONIO_ROSALES_HOURS: DaySchedule[] = [
  { day: "monday", open: "17:00", close: "23:00" },
  { day: "tuesday", closed: true },
  { day: "wednesday", open: "17:00", close: "23:00" },
  { day: "thursday", open: "17:00", close: "23:00" },
  { day: "friday", open: "17:00", close: "23:00" },
  { day: "saturday", open: "17:00", close: "23:00" },
  { day: "sunday", open: "17:00", close: "23:00" },
];

export const LOCATIONS: Location[] = [
  {
    id: "antonio-rosales",
    label: "Antonio Rosales",
    street: "Francisco Zarco 510-528",
    neighborhood: "Antonio Rosales",
    postalCode: "80230",
    city: "Culiacán Rosales",
    state: "Sin.",
    full: "Francisco Zarco 510-528, Antonio Rosales, 80230 Culiacán Rosales, Sin.",
    mapsUrl: "https://maps.app.goo.gl/QFho6YEpDJFMy6uz8",
    mapsEmbedUrl:
      "https://www.google.com/maps?q=Francisco+Zarco+510-528,+Antonio+Rosales,+80230+Culiac%C3%A1n+Rosales,+Sinaloa&output=embed",
    hours: ANTONIO_ROSALES_HOURS,
  },
];

export const BUSINESS_ADDRESS = LOCATIONS[0];

export const SOCIAL_LINKS = {
  instagram: "https://www.instagram.com/MadDogosHotdogs/",
  facebook: "https://www.facebook.com/MadDogosHotdogs/",
} as const;

export const OPENING_HOURS_SUMMARY =
  "Lun, Mié-Dom 5:00 PM – 11:00 PM · Mar cerrado";

/** Google Maps of the primary Place used for reviews. */
export const GOOGLE_MAPS_URL = LOCATIONS[0].mapsUrl;

export const GOOGLE_PLACE_SEARCH_QUERY =
  "Mad Dogos Hotdogs Burgers Boneless & Wings Francisco Zarco 510 Culiacán Sinaloa";

export const GOOGLE_PLACE_FEATURE_ID = "0x86bcd77054d0d361:0x9dc6a38cea4b74e6";

export const GOOGLE_MAPS_EMBED_URL = LOCATIONS[0].mapsEmbedUrl;

export const EVENT_TYPES = [
  "Bodas",
  "XV años",
  "Fiestas infantiles",
  "Eventos corporativos",
  "Graduaciones",
  "Reuniones familiares",
] as const;

export const EVENT_INCLUDES = [
  "Carrito Mad Dogos en tu evento",
  "Preparación en el momento",
  "Menú de hot dogs, burgers y más",
  "Atención personalizada para tus invitados",
  "Cotización según número de personas y ubicación",
] as const;

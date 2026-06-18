export const BUSINESS_ADDRESS = {
  street: "Francisco Zarco 510-528",
  neighborhood: "Antonio Rosales",
  postalCode: "80230",
  city: "Culiacán Rosales",
  state: "Sin.",
  full: "Francisco Zarco 510-528, Antonio Rosales, 80230 Culiacán Rosales, Sin.",
} as const;

export const GOOGLE_MAPS_URL = "https://maps.app.goo.gl/QFho6YEpDJFMy6uz8";

export const GOOGLE_PLACE_SEARCH_QUERY =
  "Mad Dogos Hotdogs Burgers Boneless & Wings Francisco Zarco 510 Culiacán Sinaloa";

export const GOOGLE_PLACE_FEATURE_ID = "0x86bcd77054d0d361:0x9dc6a38cea4b74e6";

export const GOOGLE_MAPS_EMBED_URL =
  "https://www.google.com/maps?q=Francisco+Zarco+510-528,+Antonio+Rosales,+80230+Culiac%C3%A1n+Rosales,+Sinaloa&output=embed";

export type OpeningHour = {
  day: string;
  hours: string;
  closed?: boolean;
};

export const OPENING_HOURS: OpeningHour[] = [
  { day: "Lunes", hours: "5:00 – 11:00 p.m." },
  { day: "Martes", hours: "Cerrado", closed: true },
  { day: "Miércoles", hours: "5:00 – 11:00 p.m." },
  { day: "Jueves", hours: "5:00 – 11:00 p.m." },
  { day: "Viernes", hours: "5:00 – 11:00 p.m." },
  { day: "Sábado", hours: "5:00 – 11:00 p.m." },
  { day: "Domingo", hours: "5:00 – 11:00 p.m." },
];

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

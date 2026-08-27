/** Canonical production origin — never fall back to vercel.app (breaks GSC). */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://maddogos.com"
).replace(/\/$/, "");

export const SITE_NAME = "Mad Dogos Hotdogs";

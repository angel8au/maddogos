import "dotenv/config";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fetchGoogleReviewsFromPlacesApi } from "../lib/google-reviews";
import type { TestimonialsSummary } from "../lib/testimonials-data";

function formatTestimonialsFile(data: TestimonialsSummary): string {
  return `export type Testimonial = {
  id: string;
  author: string;
  rating: number;
  text: string;
  relativeTime?: string;
  source: "google";
};

export type TestimonialsSummary = {
  rating: number;
  reviewCount: number;
  reviews: Testimonial[];
};

/** Generado por scripts/fetch-google-reviews.ts */
export const GOOGLE_TESTIMONIALS_SUMMARY: TestimonialsSummary = ${JSON.stringify(data, null, 2)};
`;
}

async function main() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    console.error("Falta GOOGLE_PLACES_API_KEY en .env.local");
    process.exit(1);
  }

  const data = await fetchGoogleReviewsFromPlacesApi(apiKey);
  if (!data) {
    console.error("No se pudieron obtener reseñas de Google Places API.");
    process.exit(1);
  }

  const target = resolve(process.cwd(), "lib/testimonials-data.ts");
  writeFileSync(target, formatTestimonialsFile(data), "utf8");
  console.log(`Guardadas ${data.reviews.length} reseñas en lib/testimonials-data.ts`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

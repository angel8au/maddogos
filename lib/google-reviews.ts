import type { TestimonialsSummary } from "@/lib/testimonials-data";
import { GOOGLE_TESTIMONIALS_SUMMARY } from "@/lib/testimonials-data";
import { GOOGLE_PLACE_SEARCH_QUERY } from "@/lib/site-info";

type PlacesReview = {
  name?: string;
  rating?: number;
  text?: { text?: string };
  authorAttribution?: { displayName?: string };
  relativePublishTimeDescription?: string;
};

type PlacesSearchResponse = {
  places?: {
    id?: string;
    rating?: number;
    userRatingCount?: number;
    reviews?: PlacesReview[];
  }[];
};

function mapPlacesReview(
  review: PlacesReview,
  index: number,
): TestimonialsSummary["reviews"][number] | null {
  const text = review.text?.text?.trim();
  const author = review.authorAttribution?.displayName?.trim();
  if (!text || !author) return null;

  return {
    id: review.name ?? `google-review-${index}`,
    author,
    rating: review.rating ?? 5,
    text,
    relativeTime: review.relativePublishTimeDescription,
    source: "google",
  };
}

export async function fetchGoogleReviewsFromPlacesApi(
  apiKey: string,
): Promise<TestimonialsSummary | null> {
  const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask":
        "places.id,places.rating,places.userRatingCount,places.reviews",
    },
    body: JSON.stringify({ textQuery: GOOGLE_PLACE_SEARCH_QUERY }),
    next: { revalidate: 86_400 },
  });

  if (!response.ok) {
    console.error("Google Places API error:", response.status, await response.text());
    return null;
  }

  const data = (await response.json()) as PlacesSearchResponse;
  const place = data.places?.[0];
  if (!place) return null;

  const reviews =
    place.reviews
      ?.map((review, index) => mapPlacesReview(review, index))
      .filter((review): review is NonNullable<typeof review> => Boolean(review)) ?? [];

  if (!reviews.length && !place.rating) return null;

  return {
    rating: place.rating ?? GOOGLE_TESTIMONIALS_SUMMARY.rating,
    reviewCount: place.userRatingCount ?? GOOGLE_TESTIMONIALS_SUMMARY.reviewCount,
    reviews: reviews.length ? reviews : GOOGLE_TESTIMONIALS_SUMMARY.reviews,
  };
}

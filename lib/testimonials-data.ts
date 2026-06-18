export type Testimonial = {
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

/** Reseñas destacadas de Google Maps (estáticas) */
export const GOOGLE_TESTIMONIALS_SUMMARY: TestimonialsSummary = {
  rating: 4.6,
  reviewCount: 138,
  reviews: [
    {
      id: "google-kevin-reynaldo",
      author: "Kevin Reynaldo López T.",
      rating: 5,
      text: "Están bien buenos los hot dogs y la hamburguesa. Muy buen precio y calidad; te llenas y quedas satisfecho. Solo falta probar las alitas y boneless. ¡Recomendado!",
      relativeTime: "hace 3 meses",
      source: "google",
    },
    {
      id: "google-itzel-hernandez",
      author: "Itzel Hernández A.",
      rating: 5,
      text: "Muy buen servicio, siempre son muy amables y la comida es riquísima. Recomiendo el Combo DR, delicioso y bien llenador. Tienen hamburguesa keto.",
      relativeTime: "hace 4 meses",
      source: "google",
    },
    {
      id: "google-eulalia-valenzuela",
      author: "Eulalia Valenzuela S.",
      rating: 5,
      text: "Todo el producto es de excelente calidad, además de que el trato del personal es muy amable.",
      relativeTime: "hace 5 meses",
      source: "google",
    },
    {
      id: "google-hector-r",
      author: "Hector R.",
      rating: 5,
      text: "Muy rico todo y excelente calidad y porción, todo muy bien.",
      relativeTime: "reciente",
      source: "google",
    },
  ],
};

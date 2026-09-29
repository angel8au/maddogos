import { JsonLd } from "@/components/seo/json-ld";
import { openingHoursToSchema } from "@/lib/opening-status";
import {
  BUSINESS_GEO,
  GOOGLE_PLACE_URL,
  LOCATIONS,
  SOCIAL_LINKS,
} from "@/lib/site-info";
import { SITE_NAME, SITE_URL } from "@/lib/site-url";
import { getWhatsAppNumber } from "@/lib/whatsapp";

const location = LOCATIONS[0];

const foodImages = [
  `${SITE_URL}/images/schema/burger-1x1.jpg`,
  `${SITE_URL}/images/schema/burger-4x3.jpg`,
  `${SITE_URL}/images/schema/burger-16x9.jpg`,
];

export function RestaurantJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FastFoodRestaurant",
    "@id": `${SITE_URL}/#restaurant`,
    name: SITE_NAME,
    description:
      "Hamburguesas y hot dogs estilo Sinaloa, alitas y boneless a domicilio en Culiacán.",
    url: SITE_URL,
    telephone: `+${getWhatsAppNumber()}`,
    image: foodImages,
    logo: `${SITE_URL}/images/logo-maddogos.png`,
    sameAs: [
      SOCIAL_LINKS.instagram,
      SOCIAL_LINKS.facebook,
      SOCIAL_LINKS.tiktok,
      GOOGLE_PLACE_URL,
    ],
    address: {
      "@type": "PostalAddress",
      streetAddress: location.street,
      addressLocality: location.city,
      addressRegion: "Sinaloa",
      postalCode: location.postalCode,
      addressCountry: "MX",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: BUSINESS_GEO.latitude,
      longitude: BUSINESS_GEO.longitude,
    },
    areaServed: {
      "@type": "City",
      name: location.city,
      containedInPlace: {
        "@type": "State",
        name: "Sinaloa",
      },
    },
    openingHoursSpecification: openingHoursToSchema(location),
    hasMap: GOOGLE_PLACE_URL,
    menu: `${SITE_URL}/menu`,
    servesCuisine: ["Hamburgers", "Hot Dogs", "American"],
    priceRange: "$$",
  };

  return <JsonLd data={schema} />;
}

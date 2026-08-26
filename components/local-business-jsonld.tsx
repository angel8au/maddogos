import { getWhatsAppNumber } from "@/lib/whatsapp";
import { GOOGLE_MAPS_URL, LOCATIONS } from "@/lib/site-info";
import { openingHoursToSchema } from "@/lib/opening-status";

const location = LOCATIONS[0];

export function LocalBusinessJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "Restaurant"],
    name: "Mad Dogos Hotdogs",
    description:
      "Hot dogs estilo Sinaloa, hamburguesas, alitas y boneless a domicilio en Culiacán.",
    telephone: `+${getWhatsAppNumber()}`,
    sameAs: [
      "https://www.instagram.com/MadDogosHotdogs",
      "https://www.facebook.com/MadDogosHotdogs",
    ],
    address: {
      "@type": "PostalAddress",
      streetAddress: location.street,
      addressLocality: location.city,
      addressRegion: "Sinaloa",
      postalCode: location.postalCode,
      addressCountry: "MX",
    },
    openingHoursSpecification: openingHoursToSchema(location),
    hasMap: GOOGLE_MAPS_URL,
    servesCuisine: ["Hot Dogs", "American", "Mexican"],
    priceRange: "$",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

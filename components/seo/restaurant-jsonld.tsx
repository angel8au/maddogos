import { JsonLd } from "@/components/seo/json-ld";
import { openingHoursToSchema } from "@/lib/opening-status";
import { GOOGLE_MAPS_URL, LOCATIONS, SOCIAL_LINKS } from "@/lib/site-info";
import { SITE_NAME, SITE_URL } from "@/lib/site-url";
import { getWhatsAppNumber } from "@/lib/whatsapp";

const location = LOCATIONS[0];

export function RestaurantJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "Restaurant", "FastFoodRestaurant"],
    "@id": `${SITE_URL}/#restaurant`,
    name: SITE_NAME,
    description:
      "Hot dogs estilo Sinaloa, hamburguesas, alitas y boneless a domicilio en Culiacán.",
    url: SITE_URL,
    telephone: `+${getWhatsAppNumber()}`,
    image: `${SITE_URL}/icons/icon-512.png`,
    logo: `${SITE_URL}/images/logo-maddogso.png`,
    sameAs: [SOCIAL_LINKS.instagram, SOCIAL_LINKS.facebook],
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
    menu: `${SITE_URL}/menu`,
    servesCuisine: ["Hot Dogs", "American", "Mexican"],
    priceRange: "$$",
  };

  return <JsonLd data={schema} />;
}

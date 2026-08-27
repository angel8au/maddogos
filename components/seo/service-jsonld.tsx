import { JsonLd } from "@/components/seo/json-ld";
import { EVENT_INCLUDES, EVENT_TYPES, LOCATIONS } from "@/lib/site-info";
import { SITE_NAME, SITE_URL } from "@/lib/site-url";

const location = LOCATIONS[0];

export function ServiceJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${SITE_URL}/eventos#service`,
    name: `Renta de carrito ${SITE_NAME}`,
    description:
      "Llevamos el carrito de Mad Dogos a bodas, XV años, fiestas y eventos corporativos en Culiacán.",
    url: `${SITE_URL}/eventos`,
    serviceType: "Food cart rental for events",
    areaServed: {
      "@type": "City",
      name: location.city,
    },
    provider: {
      "@id": `${SITE_URL}/#restaurant`,
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Tipos de evento",
      itemListElement: EVENT_TYPES.map((name) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name,
        },
      })),
    },
    additionalProperty: EVENT_INCLUDES.map((value) => ({
      "@type": "PropertyValue",
      name: "Incluye",
      value,
    })),
  };

  return <JsonLd data={schema} />;
}

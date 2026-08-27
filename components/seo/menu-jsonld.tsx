import { JsonLd } from "@/components/seo/json-ld";
import { categoryLabels } from "@/lib/menu-data";
import type { MenuItem } from "@/lib/types";
import { SITE_NAME, SITE_URL } from "@/lib/site-url";

/** Cap sections/items so HTML stays reasonable for crawlers. */
const MAX_ITEMS_PER_SECTION = 12;

type MenuJsonLdProps = {
  items: MenuItem[];
};

export function MenuJsonLd({ items }: MenuJsonLdProps) {
  const byCategory = new Map<string, MenuItem[]>();

  for (const item of items) {
    if (item.category === "extras" || item.category === "promociones") continue;
    const list = byCategory.get(item.category) ?? [];
    if (list.length < MAX_ITEMS_PER_SECTION) {
      list.push(item);
      byCategory.set(item.category, list);
    }
  }

  const hasMenuSection = [...byCategory.entries()].map(([category, sectionItems]) => ({
    "@type": "MenuSection",
    name: categoryLabels[category as keyof typeof categoryLabels] ?? category,
    hasMenuItem: sectionItems.map((item) => ({
      "@type": "MenuItem",
      name: item.name,
      description: item.description || undefined,
      offers: {
        "@type": "Offer",
        price: item.price,
        priceCurrency: "MXN",
      },
    })),
  }));

  const schema = {
    "@context": "https://schema.org",
    "@type": "Menu",
    "@id": `${SITE_URL}/menu#menu`,
    name: `Menú ${SITE_NAME}`,
    description:
      "Menú completo de Mad Dogos: hot dogs, hamburguesas, alitas, boneless y más en Culiacán.",
    url: `${SITE_URL}/menu`,
    mainEntityOfPage: `${SITE_URL}/menu`,
    hasMenuSection,
    provider: {
      "@id": `${SITE_URL}/#restaurant`,
    },
  };

  return <JsonLd data={schema} />;
}

import { config } from "dotenv";
import { createClient } from "@sanity/client";
import {
  burgerIngredients,
  hotDogIngredients,
} from "../lib/cart-utils";
import {
  customizationTypeForFallback,
  DEFAULT_SAUCE_OPTIONS,
  LINKED_EXTRA_IDS,
  sauceRequiredForFallback,
} from "../lib/menu-config";
import { menuSeed } from "../lib/menu-data";

config({ path: ".env.local" });

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const token = process.env.SANITY_API_TOKEN;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2025-01-01";

if (!projectId || !token) {
  throw new Error(
    "Faltan NEXT_PUBLIC_SANITY_PROJECT_ID o SANITY_API_TOKEN en .env.local",
  );
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
});

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

function linkedExtraRefs(category: string) {
  const ids = LINKED_EXTRA_IDS[category];
  if (!ids?.length) return undefined;
  return ids.map((id) => ({
    _type: "reference" as const,
    _ref: `menuItem.${id}`,
    _key: id,
  }));
}

async function seedSiteConfig() {
  await client.createOrReplace({
    _id: "siteConfig",
    _type: "siteConfig",
    whatsappNumber: "526674769492",
    whatsappMessage: "Hola, quiero hacer un pedido",
    sauceOptions: [...DEFAULT_SAUCE_OPTIONS],
  });
  console.log("  ✓ siteConfig");
}

async function seedMenu() {
  console.log(`Subiendo ${menuSeed.length} productos a Sanity (${dataset})...`);

  for (const item of menuSeed) {
    const ingredients =
      item.category === "hamburguesas"
        ? burgerIngredients
        : item.category === "hot-dogs" && item.name !== "Easy Dog"
          ? hotDogIngredients
          : undefined;

    const customizationType = customizationTypeForFallback(item.category, item.name);
    const sauceRequired = sauceRequiredForFallback(item.category);
    const linkedExtras = linkedExtraRefs(item.category);

    await client.createOrReplace({
      _id: `menuItem.${item.id}`,
      _type: "menuItem",
      name: item.name,
      slug: { _type: "slug", current: slugify(item.name) },
      description: item.description,
      price: item.price,
      category: item.category,
      badge: item.badge,
      available: true,
      featured: item.featured ?? false,
      order: item.order,
      customizationType,
      sauceRequired,
      ...(ingredients ? { ingredients } : {}),
      ...(linkedExtras ? { linkedExtras } : {}),
    });
    console.log(`  ✓ ${item.name}`);
  }

  console.log("\nMenú cargado en Sanity.");
}

async function main() {
  await seedSiteConfig();
  await seedMenu();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

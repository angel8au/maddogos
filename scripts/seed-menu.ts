import { config } from "dotenv";
import { createClient } from "@sanity/client";
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

async function seedMenu() {
  console.log(`Subiendo ${menuSeed.length} productos a Sanity (${dataset})...`);

  for (const item of menuSeed) {
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
    });
    console.log(`  ✓ ${item.name}`);
  }

  console.log("\nMenú cargado en Sanity.");
}

seedMenu().catch((error) => {
  console.error(error);
  process.exit(1);
});

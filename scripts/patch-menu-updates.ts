import { config } from "dotenv";
import { createClient } from "@sanity/client";
import { burgerIngredients, hotDogIngredients } from "../lib/cart-utils";
import {
  customizationTypeForFallback,
  DEFAULT_SAUCE_OPTIONS,
  includedDrinkCountForFallback,
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

async function main() {
  const existingConfig = await client.fetch<{
    _id: string;
    whatsappNumber?: string;
    whatsappMessage?: string;
  } | null>(`*[_type == "siteConfig"][0]{_id, whatsappNumber, whatsappMessage}`);

  if (existingConfig?._id) {
    await client
      .patch(existingConfig._id)
      .set({ sauceOptions: [...DEFAULT_SAUCE_OPTIONS] })
      .commit();
    console.log(`✓ sauceOptions (+ Natural) on ${existingConfig._id}`);
  } else {
    await client.createOrReplace({
      _id: "siteConfig",
      _type: "siteConfig",
      whatsappNumber: "526671900771",
      whatsappMessage: "Hola, quiero hacer un pedido",
      sauceOptions: [...DEFAULT_SAUCE_OPTIONS],
    });
    console.log("✓ siteConfig creado (+ Natural)");
  }

  try {
    await client
      .patch("menuItem.extra-combo-dr")
      .set({ available: false })
      .commit();
    console.log("✓ extra-combo-dr → available: false");
  } catch {
    console.log("· extra-combo-dr no existe");
  }

  for (const item of menuSeed) {
    const id = `menuItem.${item.id}`;
    const exists = await client.fetch<string | null>(`*[_id == $id][0]._id`, {
      id,
    });

    const ingredients =
      item.category === "hamburguesas"
        ? burgerIngredients
        : item.category === "hot-dogs" && item.name !== "Easy Dog"
          ? hotDogIngredients
          : undefined;

    const customizationType = customizationTypeForFallback(
      item.category,
      item.name,
      item.id,
    );
    const sauceRequired = sauceRequiredForFallback(item.category, item.id);
    const includedDrinkCount = includedDrinkCountForFallback(item.id);
    const linkedIds = LINKED_EXTRA_IDS[item.category];
    const linkedExtras = linkedIds?.map((eid) => ({
      _type: "reference" as const,
      _ref: `menuItem.${eid}`,
      _key: eid,
    }));

    const fields = {
      name: item.name,
      slug: { _type: "slug" as const, current: slugify(item.name) },
      description: item.description,
      price: item.price,
      category: item.category,
      badge: item.badge ?? null,
      available: true,
      featured: item.featured ?? false,
      order: item.order,
      customizationType: customizationType ?? null,
      sauceRequired: sauceRequired ?? false,
      includedDrinkCount: includedDrinkCount ?? 0,
      ...(ingredients ? { ingredients } : {}),
      ...(linkedExtras ? { linkedExtras } : {}),
    };

    if (!exists) {
      await client.createOrReplace({
        _id: id,
        _type: "menuItem",
        ...fields,
      });
      console.log(`+ ${item.name}`);
    } else {
      await client.patch(id).set(fields).commit();
      console.log(`~ ${item.name}`);
    }
  }

  console.log("\nListo (imágenes intactas).");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

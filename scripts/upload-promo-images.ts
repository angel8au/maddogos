/**
 * Sube fotos de promociones desde workspace/ y las asocia en Sanity.
 * Uso: npx tsx scripts/upload-promo-images.ts
 */
import { config } from "dotenv";
import { createClient } from "@sanity/client";
import fs from "node:fs";
import path from "node:path";

config({ path: ".env.local" });

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const token = process.env.SANITY_API_TOKEN;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2025-01-01";

if (!projectId || !token) {
  throw new Error("Faltan NEXT_PUBLIC_SANITY_PROJECT_ID o SANITY_API_TOKEN");
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
});

const WORKSPACE = path.join(process.cwd(), "workspace");

/** filename en workspace → id de menú (sin prefijo menuItem.) */
const PROMO_MAP: Record<string, string> = {
  "Combo Maddogos- promo.jpg": "combo-maddogos",
  "2 mad burhes mas papas.jpg": "promo-2-madburguer-papas",
  "combo dr.jpg": "combo-dr",
  "combo mad.jpg": "combo-mad",
  "Sampler MadBurger promo.jpg": "sampler-madburguer",
  "Alitas o Boneless.jpg": "alitas-boneless-pieza",
};

async function main() {
  console.log(`Subiendo ${Object.keys(PROMO_MAP).length} fotos de promo...\n`);

  let ok = 0;
  let fail = 0;

  for (const [filename, itemKey] of Object.entries(PROMO_MAP)) {
    const filePath = path.join(WORKSPACE, filename);
    const docId = `menuItem.${itemKey}`;

    if (!fs.existsSync(filePath)) {
      console.log(`  ✗ no existe: ${filename}`);
      fail += 1;
      continue;
    }

    const exists = await client.fetch<string | null>(`*[_id == $id][0]._id`, {
      id: docId,
    });
    if (!exists) {
      console.log(`  ✗ sin producto CMS: ${docId} (${filename})`);
      fail += 1;
      continue;
    }

    try {
      const buffer = fs.readFileSync(filePath);
      const asset = await client.assets.upload("image", buffer, {
        filename: `${itemKey}.jpg`,
        contentType: "image/jpeg",
      });

      await client
        .patch(docId)
        .set({
          image: {
            _type: "image",
            asset: { _type: "reference", _ref: asset._id },
            alt: filename.replace(/\.[^.]+$/, ""),
          },
        })
        .commit();

      console.log(`  ✓ ${itemKey} ← ${filename}`);
      ok += 1;
    } catch (error) {
      fail += 1;
      console.error(`  ✗ ${itemKey}:`, error);
    }
  }

  // Descripción Charola Dogos alineada a 4 opciones
  await client
    .patch("menuItem.charola-dogos")
    .set({
      description:
        "2 hot dogs (Easy Dog, Easy Especial, Chilli Dog o Perro Bacon), alitas, boneless, vegetales, papas y 2 bebidas (Té o Jamaica)",
    })
    .commit();
  console.log("\n✓ charola-dogos description actualizada");

  console.log(`\nListo: ${ok} fotos, ${fail} fallidas.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

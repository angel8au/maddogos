/**
 * Normaliza escala de bebidas y sube a Sanity.
 * Uso: npx tsx scripts/upload-normalized-drinks.ts
 */
import { config } from "dotenv";
import { createClient } from "@sanity/client";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

config({ path: ".env.local" });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2025-01-01",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

const NORMALIZED = path.join(
  process.cwd(),
  "workspace/imagenes-cms/03-bebidas/cms-ready-normalized",
);
const CMS_READY = path.join(
  process.cwd(),
  "workspace/imagenes-cms/03-bebidas/cms-ready",
);

const NAMES: Record<string, string> = {
  "bebida-coca-500": "Coca-Cola 500ml",
  "bebida-coca-600": "Coca-Cola 600ml",
  "bebida-jamaica": "Jamaica",
  "bebida-jazmin": "Té",
  "bebida-tonicol": "Tonicol 600ml",
  "bebida-hielo": "Vaso con Hielo",
};

async function main() {
  execSync("python3 scripts/normalize-drink-images.py", {
    cwd: process.cwd(),
    stdio: "inherit",
  });

  console.log("\nSubiendo a Sanity...\n");

  for (const id of Object.keys(NAMES)) {
    const file = path.join(NORMALIZED, `${id}.jpg`);
    if (!fs.existsSync(file)) {
      console.log(`  ✗ ${id}`);
      continue;
    }

    fs.copyFileSync(file, path.join(CMS_READY, `${id}.jpg`));

    const buffer = fs.readFileSync(file);
    const asset = await client.assets.upload("image", buffer, {
      filename: `${id}.jpg`,
      contentType: "image/jpeg",
    });

    await client
      .patch(`menuItem.${id}`)
      .set({
        image: {
          _type: "image",
          asset: { _type: "reference", _ref: asset._id },
          alt: NAMES[id],
        },
      })
      .commit();

    console.log(`  ✓ ${NAMES[id]}`);
  }

  console.log("\nListo.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

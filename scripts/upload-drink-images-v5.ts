/**
 * Exporta bebidas (v5 vidrio/jamaica/té/vaso + v4 600ml) y sube a Sanity.
 * Uso: npx tsx scripts/upload-drink-images-v5.ts
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

const NAMES: Record<string, string> = {
  "bebida-coca-500": "Coca-Cola 500ml",
  "bebida-jamaica": "Jamaica",
  "bebida-jazmin": "Té",
  "bebida-coca-600": "Coca-Cola 600ml",
  "bebida-tonicol": "Tonicol 600ml",
  "bebida-hielo": "Vaso con Hielo",
};

async function main() {
  execSync("python3 scripts/export-drink-images-v3.py", {
    cwd: process.cwd(),
    stdio: "inherit",
  });

  const dir = path.join(
    process.cwd(),
    "workspace/imagenes-cms/03-bebidas/cms-ready",
  );

  console.log("\nSubiendo a Sanity...\n");

  for (const [id, name] of Object.entries(NAMES)) {
    const file = path.join(dir, `${id}.jpg`);
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
          alt: name,
        },
      })
      .commit();
    console.log(`  ✓ ${name}`);
  }

  console.log("\nListo.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

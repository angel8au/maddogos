/**
 * Sube bebidas AI v2 (4:3 con margen seguro) a Sanity.
 * Uso: npx tsx scripts/upload-drink-images-v2.ts
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

const ASSETS =
  "/Users/angel8au/.cursor/projects/Users-angel8au-Documents-code-maddogos/assets";
const OUT = path.join(
  process.cwd(),
  "workspace/imagenes-cms/03-bebidas/cms-ready",
);

const DRINKS: Record<string, { file: string; name: string }> = {
  "bebida-coca-500": { file: "bebida-coca-500-v2.png", name: "Coca-Cola 500ml" },
  "bebida-jamaica": { file: "bebida-jamaica-v2.png", name: "Jamaica" },
  "bebida-jazmin": { file: "bebida-jazmin-v2.png", name: "Té" },
  "bebida-coca-600": { file: "bebida-coca-600-v2.png", name: "Coca-Cola 600ml" },
  "bebida-tonicol": { file: "bebida-tonicol-v2.png", name: "Tonicol 600ml" },
  "bebida-hielo": { file: "bebida-hielo-v2.png", name: "Vaso con Hielo" },
};

async function main() {
  fs.mkdirSync(OUT, { recursive: true });

  for (const [id, meta] of Object.entries(DRINKS)) {
    const src = path.join(ASSETS, meta.file);
    const jpg = path.join(OUT, `${id}.jpg`);

    if (!fs.existsSync(src)) {
      console.log(`  ✗ falta ${meta.file}`);
      continue;
    }

    // 1600×1200 landscape 4:3 — coincide con crop Sanity 800×600
    execSync(
      `sips -z 1200 1600 -s format jpeg -s formatOptions 88 "${src}" --out "${jpg}"`,
      { stdio: "pipe" },
    );

    const buffer = fs.readFileSync(jpg);
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
          alt: meta.name,
        },
      })
      .commit();

    const dims = execSync(`sips -g pixelWidth -g pixelHeight "${jpg}"`, {
      encoding: "utf8",
    });
    const w = /pixelWidth:\s*(\d+)/.exec(dims)?.[1];
    const h = /pixelHeight:\s*(\d+)/.exec(dims)?.[1];
    console.log(`  ✓ ${meta.name} → ${w}×${h}`);
  }

  console.log("\nListo (sin cambios de código).");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

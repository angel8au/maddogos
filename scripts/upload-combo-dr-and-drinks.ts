/**
 * Combo DR sin bebidas, botellas Té/Jamaica, reuse boneless en alitas.
 * Uso: npx tsx scripts/upload-combo-dr-and-drinks.ts
 */
import { config } from "dotenv";
import { createClient } from "@sanity/client";
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

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

function toJpg(src: string, out: string, w: number, h: number) {
  fs.mkdirSync(path.dirname(out), { recursive: true });
  execSync(
    `sips -z ${h} ${w} -s format jpeg -s formatOptions 85 "${src}" --out "${out}"`,
    { stdio: "pipe" },
  );
}

async function uploadImage(docId: string, filePath: string, alt: string) {
  const buffer = fs.readFileSync(filePath);
  const asset = await client.assets.upload("image", buffer, {
    filename: path.basename(filePath),
    contentType: "image/jpeg",
  });
  await client
    .patch(docId)
    .set({
      image: {
        _type: "image",
        asset: { _type: "reference", _ref: asset._id },
        alt,
      },
    })
    .commit();
  return asset._id;
}

async function reuseAsset(fromId: string, toId: string, alt: string) {
  const image = await client.fetch<{
    asset?: { _ref: string };
  } | null>(`*[_id == $id][0].image`, { id: fromId });
  if (!image?.asset?._ref) throw new Error(`${fromId} sin imagen`);
  await client
    .patch(toId)
    .set({
      image: {
        _type: "image",
        asset: { _type: "reference", _ref: image.asset._ref },
        alt,
      },
    })
    .commit();
  console.log(`✓ ${toId} ← asset de ${fromId}`);
}

async function main() {
  const root = process.cwd();

  // Combo DR promo — sin bebidas
  const comboOut = path.join(
    root,
    "workspace/imagenes-cms/02-comida/cms-ready/combo-dr.jpg",
  );
  toJpg(`${ASSETS}/combo-dr-no-drinks.png`, comboOut, 1200, 900);
  await uploadImage("menuItem.combo-dr", comboOut, "Combo DR + Bebida");
  console.log("✓ combo-dr (sin bebidas en foto)");

  // Combo Dr Alitas ← misma imagen oscura que boneless
  await reuseAsset(
    "menuItem.combo-dr-boneless",
    "menuItem.combo-dr-alitas",
    "Combo Dr Alitas",
  );

  // Bebidas botella sin etiqueta
  const jamaicaOut = path.join(
    root,
    "workspace/imagenes-cms/03-bebidas/cms-ready/bebida-jamaica.jpg",
  );
  const teOut = path.join(
    root,
    "workspace/imagenes-cms/03-bebidas/cms-ready/bebida-jazmin.jpg",
  );
  toJpg(`${ASSETS}/bebida-jamaica-bottle.png`, jamaicaOut, 1200, 1200);
  toJpg(`${ASSETS}/bebida-te-bottle.png`, teOut, 1200, 1200);
  await uploadImage("menuItem.bebida-jamaica", jamaicaOut, "Jamaica");
  console.log("✓ bebida-jamaica");
  await uploadImage("menuItem.bebida-jazmin", teOut, "Té");
  console.log("✓ bebida-jazmin → Té");

  // Renombrar producto en Sanity
  await client
    .patch("menuItem.bebida-jazmin")
    .set({
      name: "Té",
      slug: { _type: "slug", current: "te" },
    })
    .commit();
  console.log("✓ nombre Té en CMS");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

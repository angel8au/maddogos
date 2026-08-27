/**
 * 1) Reusa foto de Combo DR en Combo DR Alitas
 * 2) Sube extra-chile (Chile Amarillo) desde cms-ready
 */
import { config } from "dotenv";
import { createClient } from "@sanity/client";
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

async function reuseComboDrPhoto() {
  const image = await client.fetch<{
    asset?: { _ref: string };
    alt?: string;
  } | null>(`*[_id == "menuItem.combo-dr"][0].image`);

  if (!image?.asset?._ref) {
    throw new Error("combo-dr no tiene imagen");
  }

  await client
    .patch("menuItem.combo-dr-alitas")
    .set({
      image: {
        _type: "image",
        asset: { _type: "reference", _ref: image.asset._ref },
        alt: image.alt ?? "Combo Dr Alitas",
      },
    })
    .commit();

  console.log(`✓ combo-dr-alitas ← misma asset que combo-dr (${image.asset._ref})`);
}

async function uploadChile(filePath: string) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`No existe ${filePath}`);
  }

  const buffer = fs.readFileSync(filePath);
  const asset = await client.assets.upload("image", buffer, {
    filename: "extra-chile.jpg",
    contentType: "image/jpeg",
  });

  await client
    .patch("menuItem.extra-chile")
    .set({
      image: {
        _type: "image",
        asset: { _type: "reference", _ref: asset._id },
        alt: "Chile Amarillo 3 pzas",
      },
    })
    .commit();

  console.log(`✓ extra-chile ← ${path.basename(filePath)} (${asset._id})`);
}

async function main() {
  await reuseComboDrPhoto();

  const chilePath = path.join(
    process.cwd(),
    "workspace/imagenes-cms/01-salsas/cms-ready-padded/extra-chile.jpg",
  );
  const chileFallback = path.join(
    process.cwd(),
    "workspace/imagenes-cms/01-salsas/cms-ready/extra-chile.jpg",
  );

  const file = fs.existsSync(chilePath) ? chilePath : chileFallback;
  await uploadChile(file);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

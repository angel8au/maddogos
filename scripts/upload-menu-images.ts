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

const MATCHED_DIR = path.join(process.cwd(), "workspace/fotos-jpg/matched");

type CmsItem = {
  _id: string;
  name: string;
  slug: string | null;
};

async function uploadAndPatch(photoId: string, item: CmsItem) {
  const filePath = path.join(MATCHED_DIR, `${photoId}.jpg`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`No existe ${filePath}`);
  }

  const buffer = fs.readFileSync(filePath);
  const asset = await client.assets.upload("image", buffer, {
    filename: `${photoId}.jpg`,
    contentType: "image/jpeg",
  });

  await client
    .patch(item._id)
    .set({
      image: {
        _type: "image",
        asset: {
          _type: "reference",
          _ref: asset._id,
        },
      },
    })
    .commit();

  return asset._id;
}

async function main() {
  const items: CmsItem[] = await client.fetch(
    `*[_type == "menuItem"]{ _id, name, "slug": slug.current }`,
  );

  const byIdTail = new Map(
    items.map((item) => [item._id.replace(/^menuItem\./, ""), item]),
  );

  const photos = fs
    .readdirSync(MATCHED_DIR)
    .filter((f) => f.endsWith(".jpg"))
    .map((f) => f.replace(/\.jpg$/, ""));

  console.log(`Subiendo ${photos.length} fotos a Sanity (${dataset})...\n`);

  let ok = 0;
  let fail = 0;

  for (const photoId of photos) {
    const item = byIdTail.get(photoId);
    if (!item) {
      console.log(`  ✗ ${photoId}.jpg — sin producto en CMS`);
      fail += 1;
      continue;
    }

    try {
      const assetId = await uploadAndPatch(photoId, item);
      console.log(`  ✓ ${item.name} ← ${photoId}.jpg (${assetId})`);
      ok += 1;
    } catch (error) {
      fail += 1;
      console.error(`  ✗ ${item.name}:`, error);
    }
  }

  console.log(`\nListo: ${ok} asociadas, ${fail} fallidas.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

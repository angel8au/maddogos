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

const MATCHED_DIR = path.join(process.cwd(), "workspace/fotos-jpg/matched");

type CmsItem = {
  _id: string;
  name: string;
  slug: string | null;
  category: string;
  price: number;
  available: boolean;
  hasImage: boolean;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  const items: CmsItem[] = await client.fetch(
    `*[_type == "menuItem"] | order(category asc, order asc) {
      _id, name, "slug": slug.current, category, price, available,
      "hasImage": defined(image.asset)
    }`,
  );

  const jpgFiles = fs
    .readdirSync(MATCHED_DIR)
    .filter((f) => f.endsWith(".jpg"))
    .map((f) => f.replace(/\.jpg$/, ""));

  const bySlug = new Map<string, CmsItem>();
  const byIdTail = new Map<string, CmsItem>();
  const byNameSlug = new Map<string, CmsItem>();

  for (const item of items) {
    if (item.slug) bySlug.set(item.slug, item);
    // _id like menuItem.easy-dog
    const tail = item._id.replace(/^menuItem\./, "");
    byIdTail.set(tail, item);
    byNameSlug.set(slugify(item.name), item);
  }

  const matches: Array<{
    photoId: string;
    cms: CmsItem;
    matchedBy: string;
    photoPath: string;
  }> = [];
  const unmatchedPhotos: string[] = [];

  for (const photoId of jpgFiles) {
    const cms =
      byIdTail.get(photoId) ||
      bySlug.get(photoId) ||
      byNameSlug.get(photoId) ||
      null;

    if (cms) {
      matches.push({
        photoId,
        cms,
        matchedBy: byIdTail.has(photoId)
          ? "id"
          : bySlug.has(photoId)
            ? "slug"
            : "name",
        photoPath: path.join(MATCHED_DIR, `${photoId}.jpg`),
      });
    } else {
      unmatchedPhotos.push(photoId);
    }
  }

  const matchedIds = new Set(matches.map((m) => m.cms._id));
  const cmsWithoutPhotoFile = items.filter((i) => !matchedIds.has(i._id));

  console.log(
    JSON.stringify(
      {
        cmsTotal: items.length,
        cmsWithImage: items.filter((i) => i.hasImage).length,
        cmsWithoutImage: items.filter((i) => !i.hasImage).length,
        jpgCount: jpgFiles.length,
        matchedCount: matches.length,
        matches: matches.map((m) => ({
          photo: `${m.photoId}.jpg`,
          product: m.cms.name,
          _id: m.cms._id,
          slug: m.cms.slug,
          category: m.cms.category,
          alreadyHasImage: m.cms.hasImage,
          matchedBy: m.matchedBy,
        })),
        unmatchedPhotos,
        cmsWithoutLocalPhoto: cmsWithoutPhotoFile.map((i) => ({
          name: i.name,
          _id: i._id,
          slug: i.slug,
          category: i.category,
          hasImage: i.hasImage,
        })),
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

/**
 * Procesa placeholders AI generados y sube a Sanity.
 * Uso: npx tsx scripts/upload-missing-placeholders.ts
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

const ASSETS = path.join(
  process.cwd(),
  "../.cursor/projects/Users-angel8au-Documents-code-maddogos/assets",
);

// Fallback if relative path differs
function assetsDir(): string {
  const candidates = [
    ASSETS,
    "/Users/angel8au/.cursor/projects/Users-angel8au-Documents-code-maddogos/assets",
  ];
  for (const dir of candidates) {
    if (fs.existsSync(dir)) return dir;
  }
  throw new Error("No se encontró carpeta assets");
}

/** id → nombre alt, ratio */
const ITEMS: Record<string, { name: string; ratio: "food" | "drink" }> = {
  "perro-bacon": { name: "Perro Bacon", ratio: "food" },
  "smash-madburger": { name: "Smash MadBurger", ratio: "food" },
  "mad-cheese-burguer": { name: "Mad Cheese Burguer", ratio: "food" },
  "mad-cheese-jalapeno": { name: "MadCheese Jalapeño", ratio: "food" },
  "eyeye-madburger": { name: "Eyeyé MadBurger", ratio: "food" },
  "in-n-out-burguer": { name: "IN-N-OUT Burguer", ratio: "food" },
  "lowcarb-burguer": { name: "LowCarb Burguer", ratio: "food" },
  "lowcarb-double": { name: "LowCarb Double Burguer", ratio: "food" },
  "papas-francesa": { name: "Papas a la Francesa", ratio: "food" },
  "papas-curly": { name: "Papas Curly Lemonpepper", ratio: "food" },
  "papas-salvajes": { name: "Papas Salvajes", ratio: "food" },
  "aros-cebolla": { name: "Orden de Aros de Cebolla", ratio: "food" },
  "charola-burguer": { name: "Charola MadCombo Burguer", ratio: "food" },
  "charola-sv": { name: "Charola SV", ratio: "food" },
  "charola-especial": { name: "Charola Especial MadDogos", ratio: "food" },
  "combo-2-bacon": { name: "Combo 2 Perro Bacon", ratio: "food" },
  "combo-2-chilli": { name: "Combo 2 Chilli Dog", ratio: "food" },
  "combo-bacon-chilli": { name: "Combo Perro Bacon + Chilli Dog", ratio: "food" },
  "combo-3-easy": { name: "Combo 3 Easy Dog", ratio: "food" },
  "extra-gratinado": { name: "Gratinado de Papas", ratio: "food" },
  "extra-aro": { name: "Aro de Cebolla 1 pza", ratio: "food" },
  "extra-papas": { name: "Papas Salvajes o Animal Style", ratio: "food" },
  "bebida-jazmin": { name: "Té de Jazmín", ratio: "drink" },
  "bebida-jamaica": { name: "Jamaica", ratio: "drink" },
  "bebida-tonicol": { name: "Tonicol 600ml", ratio: "drink" },
};

function cmsPath(id: string, ratio: "food" | "drink"): string {
  const base =
    ratio === "drink"
      ? "workspace/imagenes-cms/03-bebidas"
      : "workspace/imagenes-cms/02-comida";
  return path.join(process.cwd(), base, "cms-ready", `${id}.jpg`);
}

async function main() {
  const assets = assetsDir();
  let ok = 0;
  let fail = 0;

  for (const [id, meta] of Object.entries(ITEMS)) {
    const src = path.join(assets, `${id}.png`);
    const out = cmsPath(id, meta.ratio);
    const genDir =
      meta.ratio === "drink"
        ? path.join(process.cwd(), "workspace/imagenes-cms/03-bebidas/01-generadas")
        : path.join(process.cwd(), "workspace/imagenes-cms/02-comida/01-generadas");

    if (!fs.existsSync(src)) {
      console.log(`  ✗ falta ${id}.png`);
      fail += 1;
      continue;
    }

    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.mkdirSync(genDir, { recursive: true });
    fs.copyFileSync(src, path.join(genDir, `${id}-placeholder.png`));

    // sips -z is HEIGHT then WIDTH. Food = 1600×1200 landscape (like mad-burguer).
    // NEVER pass "1200 900" — that becomes 900×1200 portrait and stretches 4:3 sources.
    const { execSync } = await import("node:child_process");
    const sipsSize =
      meta.ratio === "drink" ? "-z 1200 1200" : "-z 1200 1600";
    execSync(
      `sips ${sipsSize} -s format jpeg -s formatOptions 85 "${src}" --out "${out}"`,
      { stdio: "pipe" },
    );

    try {
      const buffer = fs.readFileSync(out);
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

      console.log(`  ✓ ${meta.name} (${id})`);
      ok += 1;
    } catch (error) {
      fail += 1;
      console.error(`  ✗ ${id}:`, error);
    }
  }

  console.log(`\nListo: ${ok} subidas, ${fail} fallidas.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

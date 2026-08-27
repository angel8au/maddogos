/**
 * Re-exporta placeholders AI a 1600×1200 (landscape) sin estirar
 * y los vuelve a subir a Sanity.
 *
 * Causa del bug: sips -z H W con "1200 900" → 900×1200 portrait estirado.
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

const FOOD_IDS = [
  "perro-bacon",
  "smash-madburger",
  "mad-cheese-burguer",
  "mad-cheese-jalapeno",
  "eyeye-madburger",
  "in-n-out-burguer",
  "lowcarb-burguer",
  "lowcarb-double",
  "papas-francesa",
  "papas-curly",
  "papas-salvajes",
  "aros-cebolla",
  "charola-burguer",
  "charola-sv",
  "charola-especial",
  "combo-2-bacon",
  "combo-2-chilli",
  "combo-bacon-chilli",
  "combo-3-easy",
  "extra-gratinado",
  "extra-aro",
  "extra-papas",
] as const;

const NAMES: Record<string, string> = {
  "perro-bacon": "Perro Bacon",
  "smash-madburger": "Smash MadBurger",
  "mad-cheese-burguer": "Mad Cheese Burguer",
  "mad-cheese-jalapeno": "MadCheese Jalapeño",
  "eyeye-madburger": "Eyeyé MadBurger",
  "in-n-out-burguer": "IN-N-OUT Burguer",
  "lowcarb-burguer": "LowCarb Burguer",
  "lowcarb-double": "LowCarb Double Burguer",
  "papas-francesa": "Papas a la Francesa",
  "papas-curly": "Papas Curly Lemonpepper",
  "papas-salvajes": "Papas Salvajes",
  "aros-cebolla": "Orden de Aros de Cebolla",
  "charola-burguer": "Charola MadCombo Burguer",
  "charola-sv": "Charola SV",
  "charola-especial": "Charola Especial MadDogos",
  "combo-2-bacon": "Combo 2 Perro Bacon",
  "combo-2-chilli": "Combo 2 Chilli Dog",
  "combo-bacon-chilli": "Combo Perro Bacon + Chilli Dog",
  "combo-3-easy": "Combo 3 Easy Dog",
  "extra-gratinado": "Gratinado de Papas",
  "extra-aro": "Aro de Cebolla 1 pza",
  "extra-papas": "Papas Salvajes o Animal Style",
};

function exportLandscape(src: string, out: string) {
  fs.mkdirSync(path.dirname(out), { recursive: true });
  // sips -z height width → 1200×1600 landscape 4:3 (same as mad-burguer family)
  execSync(
    `sips -z 1200 1600 -s format jpeg -s formatOptions 85 "${src}" --out "${out}"`,
    { stdio: "pipe" },
  );
}

async function main() {
  let ok = 0;
  let fail = 0;

  for (const id of FOOD_IDS) {
    const src = path.join(ASSETS, `${id}.png`);
    const out = path.join(
      process.cwd(),
      "workspace/imagenes-cms/02-comida/cms-ready",
      `${id}.jpg`,
    );

    if (!fs.existsSync(src)) {
      console.log(`  ✗ falta ${id}.png`);
      fail += 1;
      continue;
    }

    exportLandscape(src, out);

    const dims = execSync(`sips -g pixelWidth -g pixelHeight "${out}"`, {
      encoding: "utf8",
    });
    const w = /pixelWidth:\s*(\d+)/.exec(dims)?.[1];
    const h = /pixelHeight:\s*(\d+)/.exec(dims)?.[1];
    if (w !== "1600" || h !== "1200") {
      console.log(`  ⚠ ${id} dims ${w}x${h} (esperado 1600x1200)`);
    }

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
            alt: NAMES[id] ?? id,
          },
        })
        .commit();
      console.log(`  ✓ ${NAMES[id] ?? id} → ${w}×${h}`);
      ok += 1;
    } catch (e) {
      fail += 1;
      console.error(`  ✗ ${id}:`, e);
    }
  }

  // Fix the upload script so future runs don't stretch
  console.log(`\nListo: ${ok} corregidas, ${fail} fallidas.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

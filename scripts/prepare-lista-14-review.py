#!/usr/bin/env python3
"""
Prepara fotos reales de la lista-14 para revisión CMS.

- NO modifica textura ni píxeles de la comida (solo resize bicúbico al encajar).
- Canvas 1600×1200, fondo charcoal, márgenes ≥12%.
- Convierte HEIC vía sips. Sin color grading, sin sharpen, sin IA.
"""

from __future__ import annotations

import subprocess
import tempfile
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "workspace/fotos-mayo-2026"
OUT = ROOT / "workspace/fotos-mayo-2026/review"
ORIGINALS_OUT = ROOT / "workspace/fotos-mayo-2026/review-originals-jpg"

CANVAS_W, CANVAS_H = 1600, 1200
# Márgenes mínimos (zona segura UI)
MARGIN = 0.12
# Fondo look Mad Dogos (oscuro) — no toca la comida
BG = (18, 14, 12)  # charcoal cálido

# id → archivo fuente en fotos-mayo-2026
SOURCES: dict[str, str] = {
    "easy-dog": "EasyDog.HEIC",
    "maddogo-especial": "MadDogo especial.HEIC",
    "perro-bacon": "PerroBacon.jpg",
    "mad-double-burguer": "MadDouble Burguer.HEIC",
    "lowcarb-burguer": "Lowcarb.jpg",
    "lowcarb-double": "Lowcarb doble_.jpg",
    "mad-cheese-burguer": "MadChesse burger_.jpg",
    "mad-west-burguer": "MadWest Burguer.HEIC",
    "in-n-out-burguer": "IN  n out madburger_",
    "alitas-especiales": "Alitas Especiales.HEIC",
    # Parcial: Sampler MadBurger (no MadDogos exacto) — para revisar
    "sampler-madburguer": "Sampler MadBurguer .HEIC",
}

MISSING = [
    "smash-madburger",
    "mad-cheese-jalapeno",
    "eyeye-madburger",
    "sampler-maddogos",  # no hay toma exacta; solo sampler-madburguer
]


def heic_to_jpg(src: Path, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        [
            "sips",
            "-s",
            "format",
            "jpeg",
            "-s",
            "formatOptions",
            "92",
            str(src),
            "--out",
            str(dest),
        ],
        check=True,
        capture_output=True,
    )


def load_rgb(path: Path) -> Image.Image:
    """Carga imagen; HEIC/sin extensión → JPG temporal vía sips."""
    suffix = path.suffix.lower()
    if suffix in {".jpg", ".jpeg", ".png", ".webp"}:
        img = Image.open(path)
        img = ImageOps_exif_transpose(img)
        return img.convert("RGB")

    # HEIC u archivo sin extensión (HEIF)
    with tempfile.TemporaryDirectory() as td:
        tmp = Path(td) / "converted.jpg"
        heic_to_jpg(path, tmp)
        img = Image.open(tmp)
        img = ImageOps_exif_transpose(img)
        return img.convert("RGB")


def ImageOps_exif_transpose(img: Image.Image) -> Image.Image:
    from PIL import ImageOps

    return ImageOps.exif_transpose(img) or img


def fit_on_canvas(food: Image.Image) -> Image.Image:
    """Escala la foto (sin estirar) y la centra en canvas oscuro."""
    canvas = Image.new("RGB", (CANVAS_W, CANVAS_H), BG)

    max_w = int(CANVAS_W * (1 - 2 * MARGIN))
    max_h = int(CANVAS_H * (1 - 2 * MARGIN))

    fw, fh = food.size
    scale = min(max_w / fw, max_h / fh)
    new_w = max(1, int(fw * scale))
    new_h = max(1, int(fh * scale))

    # Solo resize al encajar — no filtros extras
    resized = food.resize((new_w, new_h), Image.Resampling.LANCZOS)

    x = (CANVAS_W - new_w) // 2
    y = (CANVAS_H - new_h) // 2
    canvas.paste(resized, (x, y))
    return canvas


def crop_vertical_instagram(food: Image.Image) -> Image.Image:
    """
    Fotos verticales tipo Stories/IG suelen tener comida arriba
    y marca/vacío abajo. Recorta a 4:3 centrado en el tercio superior-medio
    SIN retocar píxeles, solo crop.
    """
    w, h = food.size
    if h <= w * 1.15:
        return food  # ya landscape o casi cuadrada

    # Target 4:3 region inside the vertical frame
    target_ratio = 4 / 3
    crop_h = int(w / target_ratio)
    if crop_h > h:
        return food

    # Prefer upper-middle (comida suele estar arriba en estas tomas)
    top = int(h * 0.08)
    if top + crop_h > h:
        top = h - crop_h
    return food.crop((0, top, w, top + crop_h))


def process_one(item_id: str, filename: str) -> Path:
    src = SRC / filename
    if not src.exists():
        raise FileNotFoundError(src)

    food = load_rgb(src)

    # Guardar JPG del original orientado (sin canvas) para referencia
    ORIGINALS_OUT.mkdir(parents=True, exist_ok=True)
    original_jpg = ORIGINALS_OUT / f"{item_id}-original.jpg"
    food.save(original_jpg, "JPEG", quality=92, optimize=True)

    food = crop_vertical_instagram(food)
    out_img = fit_on_canvas(food)

    OUT.mkdir(parents=True, exist_ok=True)
    out_path = OUT / f"{item_id}.jpg"
    out_img.save(out_path, "JPEG", quality=88, optimize=True)
    return out_path


def main() -> None:
    print(f"Fuente: {SRC}")
    print(f"Review: {OUT}")
    print(f"Canvas: {CANVAS_W}×{CANVAS_H}, margen {int(MARGIN*100)}%, bg {BG}")
    print("Sin filtros / sin IA — solo crop + pad.\n")

    ok = []
    fail = []
    for item_id, filename in SOURCES.items():
        try:
            path = process_one(item_id, filename)
            w, h = Image.open(path).size
            print(f"  ✓ {item_id:24} → {path.name} ({w}×{h})")
            ok.append(item_id)
        except Exception as e:
            print(f"  ✗ {item_id:24} — {e}")
            fail.append(item_id)

    print("\n--- Faltan (sin foto real) ---")
    for m in MISSING:
        print(f"  ○ {m}")

    print(f"\nListas para revisar: {len(ok)} | errores: {len(fail)}")
    print(f"Abrir carpeta: {OUT}")


if __name__ == "__main__":
    main()

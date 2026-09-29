#!/usr/bin/env python3
"""
Composición review v2: comida REAL (sin retocar textura) + look mesa madera / fondo oscuro.

- rembg solo quita fondo (cocina/pared); no regenera la comida
- Canvas 1600×1200, márgenes generosos (≥15%) para que nada salga mochado
- Sombra suave bajo el sujeto
"""

from __future__ import annotations

import io
import subprocess
import tempfile
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageOps
from rembg import remove

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "workspace/fotos-mayo-2026"
OUT = ROOT / "workspace/fotos-mayo-2026/review-v2"
BG_PATH = ROOT / "workspace/fotos-mayo-2026/_assets/mesa-madera-fondo.jpg"

CANVAS_W, CANVAS_H = 1600, 1200
# Márgenes amplios → nada mochado (UI object-cover + detalle 16:10)
MARGIN = 0.16
# Sujeto máximo ~68% del canvas
MAX_SUBJECT = 0.68

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
    "sampler-madburguer": "Sampler MadBurguer .HEIC",
}


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
    suffix = path.suffix.lower()
    if suffix in {".jpg", ".jpeg", ".png", ".webp"}:
        img = Image.open(path)
        img = ImageOps.exif_transpose(img) or img
        return img.convert("RGB")

    with tempfile.TemporaryDirectory() as td:
        tmp = Path(td) / "converted.jpg"
        heic_to_jpg(path, tmp)
        img = Image.open(tmp)
        img = ImageOps.exif_transpose(img) or img
        return img.convert("RGB")


def make_wood_background(w: int = CANVAS_W, h: int = CANVAS_H) -> Image.Image:
    """Mesa madera oscura + fondo charcoal (procedural, reutilizable)."""
    rng = np.random.default_rng(42)
    # Base madera oscura
    base = np.zeros((h, w, 3), dtype=np.float32)
    base[:, :, 0] = 42  # R
    base[:, :, 1] = 28
    base[:, :, 2] = 18

    # Vetas horizontales suaves
    for i in range(40):
        y = int(rng.uniform(0, h))
        thickness = int(rng.integers(2, 8))
        shade = float(rng.uniform(-12, 18))
        y0, y1 = max(0, y - thickness), min(h, y + thickness)
        base[y0:y1, :, :] += shade

    # Ruido fino de grano
    noise = rng.normal(0, 6, (h, w, 1)).astype(np.float32)
    base += noise

    # Gradiente vertical: mesa abajo más clara, fondo arriba más negro
    yy = np.linspace(0, 1, h, dtype=np.float32)[:, None, None]
    # Arriba (fondo) → más oscuro
    base = base * (0.35 + 0.75 * yy) + (8 * (1 - yy))

    # Viñeta hacia negro en bordes
    xs = np.linspace(-1, 1, w, dtype=np.float32)
    ys = np.linspace(-1, 1, h, dtype=np.float32)
    xv, yv = np.meshgrid(xs, ys)
    vignette = np.clip(1.15 - np.sqrt(xv**2 + yv**2) * 0.55, 0.25, 1.0)[:, :, None]
    base *= vignette

    base = np.clip(base, 0, 255).astype(np.uint8)
    img = Image.fromarray(base, "RGB")
    # Soft blur ligero para “mesa desenfocada” en bordes
    img = img.filter(ImageFilter.GaussianBlur(radius=1.2))
    return img


def alpha_bbox(rgba: Image.Image, threshold: int = 16) -> tuple[int, int, int, int]:
    a = np.array(rgba.split()[-1])
    mask = a > threshold
    if not mask.any():
        return (0, 0, rgba.width, rgba.height)
    ys, xs = np.where(mask)
    pad = 8
    return (
        max(0, int(xs.min()) - pad),
        max(0, int(ys.min()) - pad),
        min(rgba.width, int(xs.max()) + pad),
        min(rgba.height, int(ys.max()) + pad),
    )


def extract_subject(rgb: Image.Image) -> Image.Image:
    """Quita fondo; conserva píxeles de comida tal cual (RGBA)."""
    buf = io.BytesIO()
    rgb.save(buf, format="PNG")
    out = remove(buf.getvalue())
    rgba = Image.open(io.BytesIO(out)).convert("RGBA")
    # Recorta al sujeto (sin mochar: bbox + pad ya en alpha_bbox)
    box = alpha_bbox(rgba)
    return rgba.crop(box)


def soft_shadow(size: tuple[int, int], opacity: int = 110) -> Image.Image:
    w, h = size
    shadow = Image.new("RGBA", (w, int(h * 0.35)), (0, 0, 0, 0))
    draw = ImageDraw.Draw(shadow)
    # Elipse suave
    draw.ellipse(
        (int(w * 0.08), 0, int(w * 0.92), shadow.height),
        fill=(0, 0, 0, opacity),
    )
    return shadow.filter(ImageFilter.GaussianBlur(radius=28))


def compose(subject: Image.Image, bg: Image.Image) -> Image.Image:
    canvas = bg.copy().convert("RGBA")

    max_w = int(CANVAS_W * (1 - 2 * MARGIN))
    max_h = int(CANVAS_H * (1 - 2 * MARGIN))
    # Cap tamaño sujeto
    max_w = min(max_w, int(CANVAS_W * MAX_SUBJECT))
    max_h = min(max_h, int(CANVAS_H * MAX_SUBJECT))

    sw, sh = subject.size
    scale = min(max_w / sw, max_h / sh)
    new_w = max(1, int(sw * scale))
    new_h = max(1, int(sh * scale))
    # Solo scale para caber — sin filtros sobre la comida
    subject_r = subject.resize((new_w, new_h), Image.Resampling.LANCZOS)

    x = (CANVAS_W - new_w) // 2
    # Un poco más abajo = “asentado” en mesa
    y = int((CANVAS_H - new_h) * 0.55)

    # Sombra bajo el plato
    sh_img = soft_shadow((new_w, new_h))
    sh_x = x
    sh_y = y + new_h - sh_img.height // 2
    canvas.paste(sh_img, (sh_x, sh_y), sh_img)

    canvas.paste(subject_r, (x, y), subject_r)
    return canvas.convert("RGB")


def process_one(item_id: str, filename: str, bg: Image.Image) -> Path:
    src = SRC / filename
    if not src.exists():
        raise FileNotFoundError(src)

    print(f"  → {item_id}: cargando…", flush=True)
    rgb = load_rgb(src)
    print(f"     rembg…", flush=True)
    subject = extract_subject(rgb)
    print(f"     compose…", flush=True)
    out_img = compose(subject, bg)

    OUT.mkdir(parents=True, exist_ok=True)
    out_path = OUT / f"{item_id}.jpg"
    out_img.save(out_path, "JPEG", quality=90, optimize=True)
    return out_path


def main() -> None:
    BG_PATH.parent.mkdir(parents=True, exist_ok=True)
    if BG_PATH.exists():
        bg = Image.open(BG_PATH).convert("RGB").resize(
            (CANVAS_W, CANVAS_H), Image.Resampling.LANCZOS
        )
        print(f"Fondo: {BG_PATH}")
    else:
        print("Generando mesa madera + fondo oscuro…")
        bg = make_wood_background()
        bg.save(BG_PATH, "JPEG", quality=92)

    print(f"Salida: {OUT}")
    print("Comida = píxeles reales (solo quitar fondo + encajar). Sin IA de comida.\n")

    ok, fail = [], []
    for item_id, filename in SOURCES.items():
        try:
            path = process_one(item_id, filename, bg)
            print(f"  ✓ {item_id} → {path.name}")
            ok.append(item_id)
        except Exception as e:
            print(f"  ✗ {item_id} — {e}")
            fail.append(item_id)

    print(f"\nListas: {len(ok)} | errores: {len(fail)}")
    print(f"Abrir: {OUT}")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Normaliza escala de bebidas en canvas 1200² blanco (baseline alineado)."""
from __future__ import annotations

from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC_DIR = ROOT / "workspace/imagenes-cms/03-bebidas/cms-ready"
OUT_DIR = ROOT / "workspace/imagenes-cms/03-bebidas/cms-ready-normalized"
CANVAS = 1200
WHITE_THRESHOLD = 248

# Altura del sujeto vs canvas — escala relativa por tipo (solo en el JPG)
TIERS: dict[str, float] = {
    # Vidrio + botellas altas agua fresca (misma altura)
    "bebida-coca-500": 0.82,
    "bebida-jamaica": 0.82,
    "bebida-jazmin": 0.82,
    # 600 ml plástico (misma altura entre sí)
    "bebida-coca-600": 0.72,
    "bebida-tonicol": 0.72,
    # Vaso — más pequeño
    "bebida-hielo": 0.50,
}


def subject_bbox(img: Image.Image) -> tuple[int, int, int, int]:
    rgb = img.convert("RGB")
    w, h = rgb.size
    pixels = rgb.load()
    min_x, min_y, max_x, max_y = w, h, 0, 0
    found = False
    for y in range(h):
        for x in range(w):
            r, g, b = pixels[x, y]
            if r < WHITE_THRESHOLD or g < WHITE_THRESHOLD or b < WHITE_THRESHOLD:
                found = True
                min_x = min(min_x, x)
                min_y = min(min_y, y)
                max_x = max(max_x, x)
                max_y = max(max_y, y)
    if not found:
        return (0, 0, w, h)
    pad = 4
    return (
        max(0, min_x - pad),
        max(0, min_y - pad),
        min(w, max_x + pad),
        min(h, max_y + pad),
    )


def normalize_one(src: Path, out: Path, height_ratio: float) -> None:
    img = Image.open(src).convert("RGB")
    bbox = subject_bbox(img)
    subject = img.crop(bbox)

    target_h = int(CANVAS * height_ratio)
    scale = target_h / subject.height
    target_w = int(subject.width * scale)

    max_w = int(CANVAS * 0.76)
    if target_w > max_w:
        scale = max_w / subject.width
        target_w = max_w
        target_h = int(subject.height * scale)

    subject = subject.resize((target_w, target_h), Image.Resampling.LANCZOS)

    canvas = Image.new("RGB", (CANVAS, CANVAS), (255, 255, 255))
    x = (CANVAS - target_w) // 2
    y = (CANVAS - target_h) // 2
    canvas.paste(subject, (x, y))
    out.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(out, "JPEG", quality=88, optimize=True)
    print(f"  ✓ {out.name} → {target_w}×{target_h} @ y={y}")


def main() -> None:
    print("Normalizando bebidas...\n")
    for drink_id, ratio in TIERS.items():
        src = SRC_DIR / f"{drink_id}.jpg"
        if not src.exists():
            print(f"  ✗ falta {src}")
            continue
        normalize_one(src, OUT_DIR / f"{drink_id}.jpg", ratio)
    print("\nListo.")


if __name__ == "__main__":
    main()

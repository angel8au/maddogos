#!/usr/bin/env python3
"""Escala exacta de bebidas → 1600×1200 para menú/detalle."""
from __future__ import annotations

from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS = Path(
    "/Users/angel8au/.cursor/projects/Users-angel8au-Documents-code-maddogos/assets"
)
OUT = ROOT / "workspace/imagenes-cms/03-bebidas/cms-ready"

CANVAS_W, CANVAS_H = 1600, 1200
WHITE_THRESHOLD = 248

# Altura producto en px. Detalle 16:10 recorta ~100px arriba/abajo → tall max 1000.
TIERS: dict[str, int] = {
    "bebida-coca-500": 1000,  # 83% — vidrio + agua fresca (margen detalle)
    "bebida-jamaica": 1000,
    "bebida-jazmin": 1000,
    "bebida-coca-600": 960,   # 80% — OK en menú y detalle
    "bebida-tonicol": 960,
    "bebida-hielo": 660,      # 55% — un solo vaso
}

SOURCE_FILES = {
    "bebida-coca-500": "bebida-coca-500-v5.png",
    "bebida-jamaica": "bebida-jamaica-v5.png",
    "bebida-jazmin": "bebida-jazmin-v5.png",
    "bebida-coca-600": "bebida-coca-600-v4.png",
    "bebida-tonicol": "bebida-tonicol-v4.png",
    "bebida-hielo": "bebida-hielo-v5.png",
}


def bbox(img: Image.Image) -> tuple[int, int, int, int]:
    rgb = img.convert("RGB")
    w, h = rgb.size
    px = rgb.load()
    min_x, min_y, max_x, max_y = w, h, 0, 0
    found = False
    for y in range(h):
        for x in range(w):
            r, g, b = px[x, y]
            if r < WHITE_THRESHOLD or g < WHITE_THRESHOLD or b < WHITE_THRESHOLD:
                found = True
                min_x = min(min_x, x)
                min_y = min(min_y, y)
                max_x = max(max_x, x)
                max_y = max(max_y, y)
    if not found:
        return (0, 0, w, h)
    p = 6
    return (
        max(0, min_x - p),
        max(0, min_y - p),
        min(w, max_x + p),
        min(h, max_y + p),
    )


def export_one(drink_id: str, src: Path, target_h: int) -> Path:
    img = Image.open(src).convert("RGB")
    subject = img.crop(bbox(img))
    scale = target_h / subject.height
    target_w = int(subject.width * scale)
    max_w = int(CANVAS_W * 0.82)
    if target_w > max_w:
        scale = max_w / subject.width
        target_w = max_w
        target_h = int(subject.height * scale)
    subject = subject.resize((target_w, target_h), Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", (CANVAS_W, CANVAS_H), (255, 255, 255))
    x = (CANVAS_W - target_w) // 2
    y = (CANVAS_H - target_h) // 2
    canvas.paste(subject, (x, y))
    out = OUT / f"{drink_id}.jpg"
    out.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(out, "JPEG", quality=90, optimize=True)
    print(f"  ✓ {drink_id}.jpg → {target_w}×{target_h}px")
    return out


def main() -> None:
    print("Exportando bebidas...\n")
    for drink_id, target_h in TIERS.items():
        src = ASSETS / SOURCE_FILES[drink_id]
        if not src.exists():
            print(f"  ✗ falta {src.name}")
            continue
        export_one(drink_id, src, target_h)
    print("\nListo.")


if __name__ == "__main__":
    main()

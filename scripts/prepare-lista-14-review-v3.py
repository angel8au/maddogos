#!/usr/bin/env python3
"""
Review v3: comida REAL + look mesa madera / fondo oscuro.

- rembg solo si el mask es sólido (sin huecos en la comida)
- si rembg falla → soft-pad: foto completa sobre madera con viñeta
  (píxeles de comida 100% intactos; no inventa bordes)
- Canvas 1600×1200, márgenes ≥16%
"""

from __future__ import annotations

import io
import subprocess
import tempfile
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageOps
from rembg import new_session, remove

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "workspace/fotos-mayo-2026"
OUT = ROOT / "workspace/fotos-mayo-2026/review-v3"
BG_PATH = ROOT / "workspace/fotos-mayo-2026/_assets/mesa-madera-fondo.jpg"

CANVAS_W, CANVAS_H = 1600, 1200
MARGIN = 0.16
MAX_SUBJECT = 0.72

# Si el centro del sujeto tiene > este % de huecos → descartar rembg
HOLE_RATIO_MAX = 0.08
# Cobertura alpha del bbox (cutout típico)
ALPHA_COVERAGE_MIN = 0.55
ALPHA_COVERAGE_MAX = 0.97
# Si rembg deja opaca gran parte de la imagen entera → no quitó fondo
FULL_OPAQUE_MAX = 0.65

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
    if suffix in {".jpg", ".jpeg", ".png", ".webp"} or not path.suffix:
        # Algunos archivos sin extensión (IN  n out…)
        try:
            img = Image.open(path)
            img = ImageOps.exif_transpose(img) or img
            return img.convert("RGB")
        except Exception:
            pass

    with tempfile.TemporaryDirectory() as td:
        tmp = Path(td) / "converted.jpg"
        heic_to_jpg(path, tmp)
        img = Image.open(tmp)
        img = ImageOps.exif_transpose(img) or img
        return img.convert("RGB")


def make_wood_background(w: int = CANVAS_W, h: int = CANVAS_H) -> Image.Image:
    rng = np.random.default_rng(42)
    base = np.zeros((h, w, 3), dtype=np.float32)
    base[:, :, 0] = 48
    base[:, :, 1] = 32
    base[:, :, 2] = 20

    for _ in range(55):
        y = int(rng.uniform(0, h))
        thickness = int(rng.integers(2, 10))
        shade = float(rng.uniform(-14, 20))
        y0, y1 = max(0, y - thickness), min(h, y + thickness)
        base[y0:y1, :, :] += shade

    noise = rng.normal(0, 7, (h, w, 1)).astype(np.float32)
    base += noise

    yy = np.linspace(0, 1, h, dtype=np.float32)[:, None, None]
    # Arriba más negro (fondo), abajo mesa un poco más clara
    base = base * (0.28 + 0.85 * yy) + (6 * (1 - yy))

    xs = np.linspace(-1, 1, w, dtype=np.float32)
    ys = np.linspace(-1, 1, h, dtype=np.float32)
    xv, yv = np.meshgrid(xs, ys)
    vignette = np.clip(1.2 - np.sqrt(xv**2 + yv**2) * 0.5, 0.22, 1.0)[:, :, None]
    base *= vignette

    base = np.clip(base, 0, 255).astype(np.uint8)
    img = Image.fromarray(base, "RGB")
    return img.filter(ImageFilter.GaussianBlur(radius=1.0))


def alpha_bbox(rgba: Image.Image, threshold: int = 20) -> tuple[int, int, int, int]:
    a = np.array(rgba.split()[-1])
    mask = a > threshold
    if not mask.any():
        return (0, 0, rgba.width, rgba.height)
    ys, xs = np.where(mask)
    pad = 12
    return (
        max(0, int(xs.min()) - pad),
        max(0, int(ys.min()) - pad),
        min(rgba.width, int(xs.max()) + pad),
        min(rgba.height, int(ys.max()) + pad),
    )


def mask_quality(rgba: Image.Image) -> tuple[bool, str]:
    """True si el cutout es usable (comida sólida, fondo sí removido)."""
    a = np.array(rgba.split()[-1])
    full_opaque = float((a > 20).mean())
    if full_opaque > FULL_OPAQUE_MAX:
        return False, f"fondo casi intacto {full_opaque:.2f}"

    box = alpha_bbox(rgba)
    crop = a[box[1] : box[3], box[0] : box[2]]
    if crop.size == 0:
        return False, "bbox vacío"

    solid = crop > 20
    coverage = float(solid.mean())
    if coverage < ALPHA_COVERAGE_MIN:
        return False, f"coverage baja {coverage:.2f}"
    if coverage > ALPHA_COVERAGE_MAX:
        return False, f"casi no quitó fondo {coverage:.2f}"

    # Huecos en el tercio central del bbox
    h, w = crop.shape
    cy0, cy1 = h // 3, 2 * h // 3
    cx0, cx1 = w // 3, 2 * w // 3
    center = crop[cy0:cy1, cx0:cx1]
    holes = float((center < 40).mean())
    if holes > HOLE_RATIO_MAX:
        return False, f"huecos centro {holes:.2f}"

    return True, f"ok cov={coverage:.2f} full={full_opaque:.2f} holes={holes:.2f}"


def extract_subject(rgb: Image.Image, session) -> Image.Image | None:
    out = remove(
        rgb,
        session=session,
        post_process_mask=True,
        alpha_matting=False,
    )
    rgba = out.convert("RGBA") if isinstance(out, Image.Image) else Image.open(io.BytesIO(out)).convert("RGBA")
    ok, reason = mask_quality(rgba)
    print(f"     mask: {reason}", flush=True)
    if not ok:
        return None
    return rgba.crop(alpha_bbox(rgba))


def soft_shadow(size: tuple[int, int], opacity: int = 100) -> Image.Image:
    w, h = size
    shadow = Image.new("RGBA", (w, max(24, int(h * 0.28))), (0, 0, 0, 0))
    draw = ImageDraw.Draw(shadow)
    draw.ellipse(
        (int(w * 0.1), 0, int(w * 0.9), shadow.height),
        fill=(0, 0, 0, opacity),
    )
    return shadow.filter(ImageFilter.GaussianBlur(radius=32))


def fit_size(sw: int, sh: int) -> tuple[int, int]:
    max_w = int(CANVAS_W * (1 - 2 * MARGIN))
    max_h = int(CANVAS_H * (1 - 2 * MARGIN))
    max_w = min(max_w, int(CANVAS_W * MAX_SUBJECT))
    max_h = min(max_h, int(CANVAS_H * MAX_SUBJECT))
    scale = min(max_w / sw, max_h / sh)
    return max(1, int(sw * scale)), max(1, int(sh * scale))


def compose_cutout(subject: Image.Image, bg: Image.Image) -> Image.Image:
    canvas = bg.copy().convert("RGBA")
    new_w, new_h = fit_size(*subject.size)
    subject_r = subject.resize((new_w, new_h), Image.Resampling.LANCZOS)

    x = (CANVAS_W - new_w) // 2
    y = int((CANVAS_H - new_h) * 0.52)

    sh_img = soft_shadow((new_w, new_h))
    canvas.paste(sh_img, (x, y + new_h - sh_img.height // 2), sh_img)
    canvas.paste(subject_r, (x, y), subject_r)
    return canvas.convert("RGB")


def edge_feather_mask(w: int, h: int, edge_pct: float = 0.06) -> Image.Image:
    """Máscara rectangular: comida 100% visible; solo bordes externos se funden a madera."""
    mask = Image.new("L", (w, h), 255)
    draw = ImageDraw.Draw(mask)
    # Anillo exterior transparente → blur = fundido suave sin comer el centro
    ex = max(8, int(w * edge_pct))
    ey = max(8, int(h * edge_pct))
    # Dibujar marco negro (transparente al aplicar) en el perímetro
    draw.rectangle((0, 0, w, h), fill=0)
    draw.rectangle((ex, ey, w - ex, h - ey), fill=255)
    blur = max(18, int(min(w, h) * 0.045))
    return mask.filter(ImageFilter.GaussianBlur(radius=blur))


def compose_softpad(rgb: Image.Image, bg: Image.Image) -> Image.Image:
    """Foto completa sobre madera; solo bordes externos fundidos. Comida intacta."""
    canvas = bg.copy().convert("RGBA")
    # Soft-pad: márgenes más chicos para que la comida se vea grande
    # (fotos verticales en canvas 4:3 necesitan aprovechar altura)
    pad = 0.08
    max_w = int(CANVAS_W * (1 - 2 * pad))
    max_h = int(CANVAS_H * (1 - 2 * pad))
    scale = min(max_w / rgb.width, max_h / rgb.height)
    new_w = max(1, int(rgb.width * scale))
    new_h = max(1, int(rgb.height * scale))

    photo = rgb.resize((new_w, new_h), Image.Resampling.LANCZOS).convert("RGBA")
    # Fundido mínimo en bordes (2%) — no comer comida
    feather = edge_feather_mask(new_w, new_h, edge_pct=0.02)
    photo.putalpha(feather)

    x = (CANVAS_W - new_w) // 2
    y = (CANVAS_H - new_h) // 2

    sh_img = soft_shadow((new_w, new_h), opacity=60)
    canvas.paste(sh_img, (x, y + new_h - sh_img.height // 3), sh_img)
    canvas.paste(photo, (x, y), photo)
    return canvas.convert("RGB")


def process_one(item_id: str, filename: str, bg: Image.Image, session) -> Path:
    src = SRC / filename
    if not src.exists():
        raise FileNotFoundError(src)

    print(f"  → {item_id}: cargando…", flush=True)
    rgb = load_rgb(src)

    print("     rembg…", flush=True)
    subject = extract_subject(rgb, session)

    if subject is not None:
        print("     compose cutout…", flush=True)
        out_img = compose_cutout(subject, bg)
        mode = "cutout"
    else:
        print("     compose soft-pad (comida intacta)…", flush=True)
        out_img = compose_softpad(rgb, bg)
        mode = "soft-pad"

    OUT.mkdir(parents=True, exist_ok=True)
    out_path = OUT / f"{item_id}.jpg"
    out_img.save(out_path, "JPEG", quality=91, optimize=True)
    print(f"  ✓ {item_id} [{mode}] → {out_path.name}")
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
    print("Comida = píxeles reales. Sin IA de comida.\n")

    session = new_session("u2net")
    ok, fail = [], []
    for item_id, filename in SOURCES.items():
        try:
            process_one(item_id, filename, bg, session)
            ok.append(item_id)
        except Exception as e:
            print(f"  ✗ {item_id} — {e}")
            fail.append(item_id)

    print(f"\nListas: {len(ok)} | errores: {len(fail)}")
    print(f"Abrir: {OUT}")


if __name__ == "__main__":
    main()

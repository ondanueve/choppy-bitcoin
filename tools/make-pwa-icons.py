#!/usr/bin/env python3
"""Build the 512px install icons from favicon-192.png.

Does not replace or delete favicon-192.png, favicon.svg, or the smaller icons.
The maskable file keeps the emblem inside the central safe zone and paints the
corners with the source icon's own corner color.
"""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "favicon-192.png"
ANY = ROOT / "favicon-512.png"
MASK = ROOT / "favicon-maskable-512.png"
SAFE = 0.72
COLORS = 128


def quantize(im):
    return im.quantize(colors=COLORS, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.FLOYDSTEINBERG)


def main():
    src = Image.open(SRC).convert("RGBA")
    any_icon = src.resize((512, 512), Image.Resampling.LANCZOS)
    quantize(any_icon).save(ANY, "PNG", optimize=True)

    corner = src.getpixel((0, 0))
    canvas = Image.new("RGBA", (512, 512), corner)
    side = int(round(512 * SAFE))
    emblem = src.resize((side, side), Image.Resampling.LANCZOS)
    offset = (512 - side) // 2
    canvas.paste(emblem, (offset, offset), emblem)
    quantize(canvas).save(MASK, "PNG", optimize=True)
    print("wrote", ANY.name, ANY.stat().st_size, "and", MASK.name, MASK.stat().st_size)


if __name__ == "__main__":
    main()

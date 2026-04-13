from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "public" / "images" / "characters"
OUTPUT_DIR = ROOT / "public" / "images" / "characters-webp"
MAX_SIZE = (640, 640)
QUALITY = 82


def build_webp(source_path: Path, output_path: Path) -> None:
    with Image.open(source_path) as image:
        converted = image.convert("RGBA")
        converted.thumbnail(MAX_SIZE, Image.Resampling.LANCZOS)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        converted.save(output_path, format="WEBP", quality=QUALITY, method=6)


def main() -> None:
    png_files = sorted(path for path in SOURCE_DIR.glob("*.png") if path.is_file())
    if not png_files:
      raise FileNotFoundError(f"No PNG files found in {SOURCE_DIR}")

    for source_path in png_files:
        output_path = OUTPUT_DIR / f"{source_path.stem}.webp"
        build_webp(source_path, output_path)
        print(f"Generated {output_path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()

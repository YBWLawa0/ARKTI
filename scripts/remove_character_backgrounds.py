from __future__ import annotations

from collections import Counter, deque
from pathlib import Path
import shutil

import numpy as np
from PIL import Image, ImageFilter


ROOT = Path(r"C:\Users\TX\Documents\Coding\projects\ARKTI\public\images\characters")
BACKUP_DIR = ROOT / "_original-backgrounds"


def build_palette(rgb: np.ndarray) -> np.ndarray:
    quantized = (rgb // 8).reshape(-1, 3)
    counts = Counter(map(tuple, quantized))
    most_common = counts.most_common(8)
    palette = np.array([[channel * 8 + 4 for channel in color] for color, _ in most_common], dtype=np.int16)
    return palette


def distance_to_palette(pixel: np.ndarray, palette: np.ndarray) -> np.ndarray:
    deltas = palette - pixel.astype(np.int16)
    return np.sqrt(np.sum(deltas * deltas, axis=1))


def build_background_mask(image: Image.Image) -> np.ndarray:
    rgba = np.array(image.convert("RGBA"), dtype=np.uint8)
    rgb = rgba[:, :, :3]
    height, width = rgb.shape[:2]

    edge_pixels = np.concatenate(
        [
            rgb[0, :, :],
            rgb[-1, :, :],
            rgb[:, 0, :],
            rgb[:, -1, :],
        ],
        axis=0,
    )
    palette = build_palette(edge_pixels)

    brightness = rgb.mean(axis=2)
    saturation = rgb.max(axis=2) - rgb.min(axis=2)
    rgb_i32 = rgb.astype(np.int32)
    palette_i32 = palette.astype(np.int32)
    deltas = rgb_i32[:, :, None, :] - palette_i32[None, None, :, :]
    palette_distance = np.sqrt(np.sum(deltas * deltas, axis=3)).min(axis=2)

    seed_mask = (palette_distance <= 20) & (saturation <= 45) & (brightness >= 180)
    grow_mask = (
        ((palette_distance <= 28) & (saturation <= 55) & (brightness >= 165))
        | ((palette_distance <= 42) & (saturation <= 38) & (brightness >= 135))
    )

    visited = np.zeros((height, width), dtype=bool)
    background = np.zeros((height, width), dtype=bool)
    queue: deque[tuple[int, int]] = deque()

    def enqueue(y: int, x: int) -> None:
        if visited[y, x] or not seed_mask[y, x]:
            return
        visited[y, x] = True
        background[y, x] = True
        queue.append((y, x))

    for x in range(width):
        enqueue(0, x)
        enqueue(height - 1, x)
    for y in range(height):
        enqueue(y, 0)
        enqueue(y, width - 1)

    while queue:
        y, x = queue.popleft()
        current = rgb[y, x].astype(np.int16)

        for ny, nx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
            if ny < 0 or ny >= height or nx < 0 or nx >= width or visited[ny, nx]:
                continue

            visited[ny, nx] = True
            if not grow_mask[ny, nx]:
                continue

            neighbor = rgb[ny, nx].astype(np.int16)
            if np.linalg.norm(neighbor - current) > 26 and palette_distance[ny, nx] > 22:
                continue

            background[ny, nx] = True
            queue.append((ny, nx))

    return background


def apply_alpha(image: Image.Image, background_mask: np.ndarray) -> Image.Image:
    rgba = np.array(image.convert("RGBA"), dtype=np.uint8)
    alpha = np.where(background_mask, 0, 255).astype(np.uint8)
    alpha_image = Image.fromarray(alpha, mode="L").filter(ImageFilter.GaussianBlur(radius=1.2))
    rgba[:, :, 3] = np.array(alpha_image, dtype=np.uint8)
    return Image.fromarray(rgba, mode="RGBA")


def main() -> None:
    BACKUP_DIR.mkdir(exist_ok=True)
    image_paths = sorted(path for path in ROOT.glob("*.png") if path.is_file())
    if not image_paths:
        raise SystemExit("No PNG images found.")

    for path in image_paths:
        backup_path = BACKUP_DIR / path.name
        if not backup_path.exists():
            shutil.copy2(path, backup_path)

        with Image.open(path) as image:
            background_mask = build_background_mask(image)
            transparent_image = apply_alpha(image, background_mask)
            transparent_image.save(path)
            print(f"processed {path.name}")


if __name__ == "__main__":
    main()

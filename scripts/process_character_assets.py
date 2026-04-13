from __future__ import annotations

import json
from collections import Counter, deque
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "public" / "images" / "characters"
OUTPUT_DIR = SOURCE_DIR / "transparent"
VISUALS_PATH = ROOT / "src" / "data" / "characterVisuals.json"
CHARACTERS_PATH = ROOT / "src" / "data" / "characters.json"

NAME_ALIASES = {
    "江户川柯南": "柯南",
    "明日香": "明日香",
    "初音未来": "初音未来",
    "绫波丽": "绫波丽",
    "博丽灵梦": "博丽灵梦",
    "后藤一里": "后藤一里",
    "藤原千花": "藤原千花",
    "琪露诺": "琪露诺",
    "御坂美琴": "御坂美琴",
    "鹿目圆": "鹿目圆",
    "芙宁娜": "芙宁娜",
    "高松灯": "高松灯",
    "千早爱音": "千早爱音",
    "乐奈": "乐奈",
    "长崎素世": "长崎素世",
    "椎名立希": "椎名立希",
    "丰川祥子": "丰川祥子",
    "若叶睦 / Mortis": "若叶睦",
    "三角初华 / Doloris": "三角初华",
    "八幡海铃 / Timoris": "八幡海铃",
    "祐天寺若麦 / Amoris": "祐天寺若麦",
    "嘉然": "嘉然",
}


def build_background_model(image: Image.Image) -> tuple[tuple[int, int, int], int]:
    width, height = image.size
    step_x = max(1, width // 80)
    step_y = max(1, height // 80)
    samples: list[tuple[int, int, int]] = []
    buckets: Counter[tuple[int, int, int]] = Counter()

    def add_sample(x: int, y: int) -> None:
        r, g, b, _ = image.getpixel((x, y))
        samples.append((r, g, b))
        buckets[(round(r / 12) * 12, round(g / 12) * 12, round(b / 12) * 12)] += 1

    for x in range(0, width, step_x):
        add_sample(x, 0)
        add_sample(x, height - 1)

    for y in range(0, height, step_y):
        add_sample(0, y)
        add_sample(width - 1, y)

    background = buckets.most_common(1)[0][0]
    spread = max(
        max(channel) - min(channel)
        for channel in (
            [sample[0] for sample in samples],
            [sample[1] for sample in samples],
            [sample[2] for sample in samples],
        )
    )
    tolerance = max(18, min(54, 12 + spread))
    return background, tolerance


def is_background(
    pixel: tuple[int, int, int, int],
    background: tuple[int, int, int],
    tolerance: int,
) -> bool:
    r, g, b, a = pixel
    if a == 0:
        return True

    dr = r - background[0]
    dg = g - background[1]
    db = b - background[2]
    distance_sq = dr * dr + dg * dg + db * db

    brightness = (r + g + b) / 3
    return brightness >= 180 and distance_sq <= tolerance * tolerance * 3


def remove_background(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    width, height = rgba.size
    pixels = rgba.load()
    background, tolerance = build_background_model(rgba)

    visited = [[False] * width for _ in range(height)]
    queue: deque[tuple[int, int]] = deque()

    def seed(x: int, y: int) -> None:
        if visited[y][x] or not is_background(pixels[x, y], background, tolerance):
            return
        visited[y][x] = True
        queue.append((x, y))

    for x in range(width):
        seed(x, 0)
        seed(x, height - 1)

    for y in range(height):
        seed(0, y)
        seed(width - 1, y)

    while queue:
        x, y = queue.popleft()
        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if nx < 0 or nx >= width or ny < 0 or ny >= height:
                continue
            if visited[ny][nx] or not is_background(pixels[nx, ny], background, tolerance):
                continue
            visited[ny][nx] = True
            queue.append((nx, ny))

    cleaned = rgba.copy()
    cleaned_pixels = cleaned.load()
    for y in range(height):
        for x in range(width):
            if visited[y][x]:
                cleaned_pixels[x, y] = (255, 255, 255, 0)

    alpha_box = cleaned.getchannel("A").getbbox()
    if not alpha_box:
        return cleaned

    left, top, right, bottom = alpha_box
    pad_x = max(24, int((right - left) * 0.05))
    pad_y = max(24, int((bottom - top) * 0.05))

    crop_box = (
        max(0, left - pad_x),
        max(0, top - pad_y),
        min(width, right + pad_x),
        min(height, bottom + pad_y),
    )
    return cleaned.crop(crop_box)


def pick_accent(image: Image.Image) -> str:
    sampled = image.copy()
    sampled.thumbnail((160, 160))
    colors: Counter[tuple[int, int, int]] = Counter()

    for r, g, b, a in sampled.getdata():
        if a < 64:
            continue

        bucket = (
            min(255, int(round(r / 16) * 16)),
            min(255, int(round(g / 16) * 16)),
            min(255, int(round(b / 16) * 16)),
        )
        colors[bucket] += 1

    best_color = (140, 162, 96)
    best_score = -1.0

    for (r, g, b), count in colors.items():
        brightest = max(r, g, b)
        darkest = min(r, g, b)
        saturation = (brightest - darkest) / brightest if brightest else 0
        value = brightest / 255 if brightest else 0

        if saturation < 0.16 or value < 0.2:
            continue

        score = count * ((saturation**2) * 2.4 + 0.1) * (0.7 + min(value, 0.9))
        if score > best_score:
            best_score = score
            best_color = (r, g, b)

    return "#{:02x}{:02x}{:02x}".format(*best_color)


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    characters = json.loads(CHARACTERS_PATH.read_text(encoding="utf-8"))
    visuals: dict[str, dict[str, str]] = {}

    for character in characters:
        alias = NAME_ALIASES.get(character["name"], character["name"].split(" / ")[0])
        source_path = SOURCE_DIR / f"{alias}.png"
        if not source_path.exists():
            raise FileNotFoundError(f"Missing source image for {character['name']}: {source_path}")

        cleaned = remove_background(Image.open(source_path))
        output_path = OUTPUT_DIR / f"{character['id']}.png"
        cleaned.save(output_path)

        visuals[character["id"]] = {
            "image": f"/images/characters/transparent/{character['id']}.png",
            "accent": pick_accent(cleaned),
        }

    VISUALS_PATH.write_text(
        json.dumps(visuals, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    print(f"Processed {len(visuals)} character assets.")


if __name__ == "__main__":
    main()

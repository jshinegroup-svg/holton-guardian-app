#!/usr/bin/env python3
from __future__ import annotations

import argparse
import io
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

from PIL import Image

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_CARDS_DIR = PROJECT_ROOT / "assets" / "cards"


@dataclass
class AssetStat:
    path: Path
    relative_path: str
    original_bytes: int
    optimized_bytes: int
    width: int
    height: int
    optimized_width: int
    optimized_height: int

    @property
    def savings_bytes(self) -> int:
        return self.original_bytes - self.optimized_bytes

    @property
    def savings_ratio(self) -> float:
        if self.original_bytes == 0:
            return 0.0
        return self.savings_bytes / self.original_bytes


def format_bytes(value: int) -> str:
    if value < 1024:
        return f"{value} B"
    kb = value / 1024
    if kb < 1024:
        return f"{kb:.1f} KB"
    return f"{kb / 1024:.2f} MB"


def list_pngs(root: Path) -> list[Path]:
    return sorted(path for path in root.rglob("*.png") if path.is_file())


def optimize_image_bytes(source: Path, max_width: int, max_height: int, colors: int) -> tuple[bytes, tuple[int, int], tuple[int, int]]:
    with Image.open(source) as image:
        original_size = image.size
        working = image.copy()
        working.thumbnail((max_width, max_height), Image.Resampling.LANCZOS)

        if working.mode not in ("RGB", "RGBA"):
            working = working.convert("RGBA")

        quantize_method = Image.Quantize.MEDIANCUT
        if working.mode == "RGBA":
            quantize_method = Image.Quantize.FASTOCTREE

        optimized = working.quantize(colors=colors, method=quantize_method)
        buffer = io.BytesIO()
        optimized.save(buffer, format="PNG", optimize=True, compress_level=9)
        return buffer.getvalue(), original_size, working.size


def collect_stats(paths: Iterable[Path], max_width: int, max_height: int, colors: int) -> list[AssetStat]:
    stats: list[AssetStat] = []
    for path in paths:
        optimized_bytes, original_size, optimized_size = optimize_image_bytes(path, max_width, max_height, colors)
        stats.append(
            AssetStat(
                path=path,
                relative_path=path.relative_to(PROJECT_ROOT).as_posix(),
                original_bytes=path.stat().st_size,
                optimized_bytes=len(optimized_bytes),
                width=original_size[0],
                height=original_size[1],
                optimized_width=optimized_size[0],
                optimized_height=optimized_size[1],
            )
        )
    return stats


def print_audit(stats: list[AssetStat], top: int, warn_threshold_bytes: int) -> None:
    total_original = sum(item.original_bytes for item in stats)
    total_optimized = sum(item.optimized_bytes for item in stats)
    oversized = [item for item in stats if item.original_bytes >= warn_threshold_bytes]

    print("Holton card asset audit")
    print(f"- Files scanned: {len(stats)}")
    print(f"- Current size: {format_bytes(total_original)}")
    print(f"- Estimated optimized size: {format_bytes(total_optimized)}")
    print(f"- Estimated savings: {format_bytes(total_original - total_optimized)} ({((total_original - total_optimized) / total_original * 100) if total_original else 0:.1f}%)")
    print(f"- Oversized files (>= {format_bytes(warn_threshold_bytes)}): {len(oversized)}")

    folder_totals: dict[str, int] = {}
    for item in stats:
        folder = Path(item.relative_path).parent.name
        folder_totals[folder] = folder_totals.get(folder, 0) + item.original_bytes

    print("- Folder totals:")
    for folder, total in sorted(folder_totals.items(), key=lambda pair: pair[1], reverse=True):
        print(f"  - {folder}: {format_bytes(total)}")

    print("- Largest current files:")
    for item in sorted(stats, key=lambda asset: asset.original_bytes, reverse=True)[:top]:
        print(
            f"  - {item.relative_path} | {item.width}x{item.height} | {format_bytes(item.original_bytes)}"
            f" -> est. {item.optimized_width}x{item.optimized_height} | {format_bytes(item.optimized_bytes)}"
        )

    print("- Best optimization candidates:")
    for item in sorted(stats, key=lambda asset: asset.savings_bytes, reverse=True)[:top]:
        print(
            f"  - {item.relative_path} | save {format_bytes(item.savings_bytes)}"
            f" ({item.savings_ratio * 100:.1f}%)"
        )


def write_optimized_files(stats: list[AssetStat], max_width: int, max_height: int, colors: int, min_savings_bytes: int) -> tuple[int, int]:
    changed = 0
    saved = 0
    for item in stats:
        if item.savings_bytes < min_savings_bytes:
            continue

        optimized_bytes, _, _ = optimize_image_bytes(item.path, max_width, max_height, colors)
        item.path.write_bytes(optimized_bytes)
        changed += 1
        saved += item.savings_bytes
    return changed, saved


def main() -> None:
    parser = argparse.ArgumentParser(description="Audit or optimize Holton card PNG assets.")
    parser.add_argument("mode", choices=["audit", "optimize"], help="Run a dry audit or rewrite assets in place.")
    parser.add_argument("--root", type=Path, default=DEFAULT_CARDS_DIR, help="Directory to scan. Defaults to assets/cards.")
    parser.add_argument("--max-width", type=int, default=640, help="Maximum width after optimization.")
    parser.add_argument("--max-height", type=int, default=960, help="Maximum height after optimization.")
    parser.add_argument("--colors", type=int, default=256, help="Palette size used during PNG quantization.")
    parser.add_argument("--top", type=int, default=8, help="How many rows to show in the audit tables.")
    parser.add_argument("--warn-threshold-kb", type=int, default=700, help="Count files at or above this size as oversized during audit.")
    parser.add_argument("--min-savings-kb", type=int, default=40, help="Only overwrite files when at least this many KB are saved.")
    args = parser.parse_args()

    root = args.root.resolve()
    if not root.exists():
        raise SystemExit(f"Asset directory not found: {root}")

    pngs = list_pngs(root)
    if not pngs:
        raise SystemExit(f"No PNG files found under: {root}")

    stats = collect_stats(pngs, args.max_width, args.max_height, args.colors)
    print_audit(stats, args.top, args.warn_threshold_kb * 1024)

    if args.mode == "optimize":
        changed, saved = write_optimized_files(stats, args.max_width, args.max_height, args.colors, args.min_savings_kb * 1024)
        print("")
        print(f"Optimized files written: {changed}")
        print(f"Total bytes saved: {format_bytes(saved)}")


if __name__ == "__main__":
    main()

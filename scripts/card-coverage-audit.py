#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Iterable

PROJECT_ROOT = Path(__file__).resolve().parent.parent
APP_TSX = PROJECT_ROOT / "App.tsx"
ASSETS_ROOT = PROJECT_ROOT / "assets" / "cards"

SECTIONS: dict[str, dict[str, str]] = {
    "timeChallenges": {"array": r"const timeChallenges: TimeChallenge\[\] = \[(.*?)\n\];", "label": "Time Challenges", "asset_dir": "challenges"},
    "transitionCards": {"array": r"const transitionCards: ToolCard\[\] = \[(.*?)\n\];", "label": "Transition Cards", "asset_dir": "transition"},
    "sopCards": {"array": r"const sopCards: ToolCard\[\] = \[(.*?)\n\];", "label": "SOP Cards", "asset_dir": "sop"},
    "activeSkills": {"array": r"const activeSkills: ToolCard\[\] = \[(.*?)\n\];", "label": "Active Skills", "asset_dir": "active"},
    "supportTools": {"array": r"const supportTools: ToolCard\[\] = \[(.*?)\n\];", "label": "Support Tools", "asset_dir": "support"},
    "heroCards": {"array": r"const heroCards: HeroCard\[\] = \[(.*?)\n\];", "label": "Hero Cards", "asset_dir": "heroes"},
    "worldEvents": {"array": r"const worldEvents: EventCard\[\] = \[(.*?)\n\];", "label": "World Events", "asset_dir": "events"},
}

ENTRY_LINE_PATTERN = re.compile(r"^\s*\{\s*id:\s*\"([^\"]+)\".*$", re.M)
TITLE_PATTERN = re.compile(r"(?:name|title):\s*\"([^\"]+)\"")
DRIVE_ID_PATTERN = re.compile(r"sourceDriveId:\s*\"([^\"]+)\"")
IMAGE_PATTERN = re.compile(r"imageSource:")


def slugify(value: str) -> str:
    value = value.lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-")


def list_asset_files(folder: Path) -> list[str]:
    if not folder.exists():
        return []
    return sorted(p.name for p in folder.iterdir() if p.is_file())


def parse_section(app_text: str, name: str) -> dict:
    config = SECTIONS[name]
    match = re.search(config["array"], app_text, re.S)
    if not match:
        raise RuntimeError(f"Section not found: {name}")

    block = match.group(1)
    items = []
    for line in block.splitlines():
        if '{ id:' not in line:
            continue
        id_match = re.search(r'id:\s*\"([^\"]+)\"', line)
        if not id_match:
            continue
        item_id = id_match.group(1)
        title_match = TITLE_PATTERN.search(line)
        drive_match = DRIVE_ID_PATTERN.search(line)
        items.append(
            {
                "id": item_id,
                "title": title_match.group(1) if title_match else item_id,
                "has_image": bool(IMAGE_PATTERN.search(line)),
                "source_drive_id": drive_match.group(1) if drive_match else None,
                "expected_basename": slugify(item_id),
            }
        )

    asset_dir = ASSETS_ROOT / config["asset_dir"]
    files = list_asset_files(asset_dir)
    return {
        "key": name,
        "label": config["label"],
        "asset_dir": str(asset_dir.relative_to(PROJECT_ROOT)),
        "asset_files": files,
        "items": items,
    }


def audit() -> dict:
    app_text = APP_TSX.read_text()
    sections = [parse_section(app_text, key) for key in SECTIONS]
    return {
        "project_root": str(PROJECT_ROOT),
        "sections": sections,
    }


def summarize(report: dict) -> str:
    lines: list[str] = []
    lines.append("Holton card coverage audit")
    for section in report["sections"]:
        total = len(section["items"])
        with_image = sum(1 for item in section["items"] if item["has_image"])
        with_drive = sum(1 for item in section["items"] if item["source_drive_id"])
        lines.append(f"- {section['label']}: total={total} | mapped={with_image} | missing={total - with_image} | driveIds={with_drive} | assetFiles={len(section['asset_files'])}")
        missing = [item for item in section["items"] if not item["has_image"]]
        if missing:
            for item in missing:
                lines.append(f"    · missing image -> {item['id']} | {item['title']}")
    return "\n".join(lines)


def to_markdown(report: dict) -> str:
    lines: list[str] = []
    lines.append("# Holton Card Image Coverage Audit")
    lines.append("")
    for section in report["sections"]:
        total = len(section["items"])
        with_image = sum(1 for item in section["items"] if item["has_image"])
        with_drive = sum(1 for item in section["items"] if item["source_drive_id"])
        lines.append(f"## {section['label']}")
        lines.append(f"- Asset dir: `{section['asset_dir']}`")
        lines.append(f"- Total cards: **{total}**")
        lines.append(f"- App image mappings: **{with_image}/{total}**")
        lines.append(f"- Source Drive IDs recorded: **{with_drive}/{total}**")
        lines.append(f"- Local asset files: **{len(section['asset_files'])}**")
        missing = [item for item in section["items"] if not item["has_image"]]
        if missing:
            lines.append("- Missing image mappings:")
            for item in missing:
                lines.append(f"  - `{item['id']}` — {item['title']}")
        else:
            lines.append("- Missing image mappings: none")
        lines.append("")
    lines.append("## Update workflow")
    lines.append("1. Put exported card images into the correct `assets/cards/<group>/` folder.")
    lines.append("2. Add or update the corresponding image map entry in `App.tsx`.")
    lines.append("3. Bind the `imageSource` on the target card object.")
    lines.append("4. Run `npm run -s typecheck` and `python3 ./scripts/card-coverage-audit.py`.")
    return "\n".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser(description="Audit Holton card image coverage.")
    parser.add_argument("--json", action="store_true", help="Print JSON report")
    parser.add_argument("--markdown", type=Path, help="Write markdown report to path")
    args = parser.parse_args()

    report = audit()
    if args.markdown:
        args.markdown.write_text(to_markdown(report))
        print(f"Markdown report written to {args.markdown}")
    if args.json:
        print(json.dumps(report, ensure_ascii=False, indent=2))
    else:
        print(summarize(report))


if __name__ == "__main__":
    main()

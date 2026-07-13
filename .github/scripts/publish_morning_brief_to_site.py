#!/usr/bin/env python3
"""Publish one Morning Brief entry into the static website data file.

Usage:
    python 06_TECH/Automation/publish_morning_brief_to_site.py brief.json

The input JSON must be one object shaped like a single item in
04_WEBSITE/site/data/daily-brief.json -> morning_briefs.
Existing entries with the same date are replaced.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
SITE_DATA = ROOT / "04_WEBSITE" / "site" / "data" / "daily-brief.json"


def read_json(path: Path) -> object:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def write_json(path: Path, data: object) -> None:
    with path.open("w", encoding="utf-8", newline="\n") as handle:
        json.dump(data, handle, ensure_ascii=False, indent=2)
        handle.write("\n")


def validate_entry(entry: object) -> dict:
    if not isinstance(entry, dict):
        raise SystemExit("Morning Brief input must be a JSON object.")

    required = ["date", "title", "summary"]
    missing = [key for key in required if not entry.get(key)]
    if missing:
        raise SystemExit(f"Morning Brief input missing required keys: {', '.join(missing)}")

    return entry


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("brief_json", type=Path, help="Path to one Morning Brief JSON object.")
    parser.add_argument(
        "--site-data",
        type=Path,
        default=SITE_DATA,
        help="Website daily-brief.json path.",
    )
    args = parser.parse_args()

    entry = validate_entry(read_json(args.brief_json))
    data = read_json(args.site_data)
    if not isinstance(data, dict):
        raise SystemExit("Website data file must contain a JSON object.")

    morning_briefs = data.get("morning_briefs")
    if not isinstance(morning_briefs, list):
        morning_briefs = []

    by_date = {item.get("date"): item for item in morning_briefs if isinstance(item, dict)}
    by_date[entry["date"]] = entry
    data["morning_briefs"] = sorted(by_date.values(), key=lambda item: item["date"], reverse=True)
    data["updated"] = max(data.get("updated", ""), entry["date"])

    write_json(args.site_data, data)
    print(f"Published Morning Brief {entry['date']} to {args.site_data}")


if __name__ == "__main__":
    main()

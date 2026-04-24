"""
Collect historical NV1/NV2/NV3 cutoffs from ts10.hcm.edu.vn and merge them
into data/schools.json as `priority_scores`.

Usage:
    python scripts/collect_priority_scores.py
"""

from __future__ import annotations

import json
import os
import re
import sys
import time
import unicodedata
from typing import Dict, Optional

import requests


SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(SCRIPT_DIR, "..")
SCHOOLS_JSON = os.path.join(ROOT, "data", "schools.json")

BASE_URL = "https://ts10.hcm.edu.vn"
REQUEST_HEADERS = {
    "User-Agent": "Mozilla/5.0",
    "X-Requested-With": "XMLHttpRequest",
}


DETAIL_ID_OVERRIDES = {
    "tran dai nghia": 682,
}

NAME_ALIASES = {
    "ernst thalmann": "ten lo man",
    "th thuc hanh su pham": "thuc hanh dai hoc su pham",
    "th thuc hanh sai gon": "thuc hanh sai gon",
    "le thi hong gam": "le thi hong gam",
    "dien hong": "dien hong",
    "suong nguyet anh": "suong nguyet anh",
    "nang khieu tdtt bc": "nang khieu tdtt binh chanh",
}


def normalize_name(name: str) -> str:
    name = name.strip().lower().replace("Đ", "d").replace("đ", "d")
    for prefix in [
        "trường ",
        "thpt chuyên ",
        "thcs và thpt ",
        "thcs-thpt ",
        "thpt ",
        "tt gdktth và hn ",
        "tt gdnn-gdtx ",
        "trung học ",
        "phổ thông ",
    ]:
        name = name.replace(prefix, "")
    name = unicodedata.normalize("NFD", name)
    name = "".join(ch for ch in name if unicodedata.category(ch) != "Mn")
    name = re.sub(r"\([^)]*\)", " ", name)
    name = re.sub(r"[^a-z0-9]+", " ", name)
    return " ".join(name.split())


def to_float(value: str) -> Optional[float]:
    value = value.strip()
    if not value:
        return None
    try:
        return float(value)
    except ValueError:
        return None


def fetch_public_school_catalog(session: requests.Session):
    response = session.get(
        f"{BASE_URL}/Home/GetDanhMucTruongByLoaiHinh",
        params={"ma_huyen": "", "ma_loai_hinh": "1"},
        timeout=30,
    )
    response.raise_for_status()
    return response.json()


def parse_priority_rows(html: str) -> Dict[str, Dict[str, Optional[float]]]:
    pattern = re.compile(
        r'<tr data-year="(\d{4})">\s*'
        r'<td[^>]*>[^<]*</td>\s*'
        r'<td[^>]*>([^<]*)</td>\s*'
        r'<td[^>]*>([^<]*)</td>\s*'
        r'<td[^>]*>([^<]*)</td>',
        re.S,
    )
    rows: Dict[str, Dict[str, Optional[float]]] = {}
    for year, nv1, nv2, nv3 in pattern.findall(html):
        rows[year] = {
            "nv1": to_float(nv1),
            "nv2": to_float(nv2),
            "nv3": to_float(nv3),
        }
    return rows


def main():
    sys.stdout.reconfigure(encoding="utf-8")

    with open(SCHOOLS_JSON, "r", encoding="utf-8") as f:
        schools_data = json.load(f)

    session = requests.Session()
    session.headers.update(REQUEST_HEADERS)

    catalog = fetch_public_school_catalog(session)
    catalog_by_name = {}
    for item in catalog:
        normalized_item_name = normalize_name(item["ten_truong"])
        catalog_by_name.setdefault(normalized_item_name, item)

    resolved = 0
    unmatched = []
    year_counts = {}

    for school in schools_data["schools"]:
        normalized = normalize_name(school["name"])

        detail_id = DETAIL_ID_OVERRIDES.get(normalized)
        if detail_id is None:
            alias_key = NAME_ALIASES.get(normalized, normalized)
            catalog_item = catalog_by_name.get(alias_key)
            if catalog_item is not None:
                detail_id = catalog_item["id"]

        if detail_id is None:
            school.pop("priority_scores", None)
            unmatched.append(school["name"])
            continue

        response = session.get(
            f"{BASE_URL}/thong-tin-truong-chi-tiet/{detail_id}",
            timeout=30,
        )
        response.raise_for_status()
        rows = parse_priority_rows(response.text)

        if not rows:
            school.pop("priority_scores", None)
            unmatched.append(school["name"])
            continue

        school["priority_scores"] = rows
        resolved += 1

        for year in rows:
            year_counts[year] = year_counts.get(year, 0) + 1

        time.sleep(0.1)

    sources = schools_data["meta"].setdefault("sources", {})
    sources["priority_scores_2022_2025"] = (
        "ts10.hcm.edu.vn school detail pages, collected 2026-04-24"
    )
    schools_data["meta"]["notes"] = (
        "Diem chuan NV1 trong truong `scores`. "
        "Diem chuan NV1/NV2/NV3 thuc te duoc luu them trong `priority_scores` khi co du lieu."
    )

    with open(SCHOOLS_JSON, "w", encoding="utf-8") as f:
        json.dump(schools_data, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print(f"[COLLECT] Resolved priority scores for {resolved}/{len(schools_data['schools'])} schools")
    for year in sorted(year_counts):
        print(f"[COLLECT] {year}: {year_counts[year]} schools")
    if unmatched:
        print("[COLLECT] Unmatched schools:")
        for name in unmatched:
            print(f"  - {name}")


if __name__ == "__main__":
    main()

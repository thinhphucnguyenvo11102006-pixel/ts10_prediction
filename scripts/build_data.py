"""
build_data.py — Sinh js/data.js từ data/schools.json và data/exam_stats.json
Chạy: python scripts/build_data.py
Tier được tính tự động từ điểm 2025 (không gán tay).
"""
import json
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(SCRIPT_DIR, "..")
SCHOOLS_JSON = os.path.join(ROOT, "data", "schools.json")
STATS_JSON = os.path.join(ROOT, "data", "exam_stats.json")
OUTPUT_JS = os.path.join(ROOT, "js", "data.js")

# (Logic tính Tier thủ công đã được thay thế bằng KMeans Clustering trong cluster_schools.py)

def build():
    with open(SCHOOLS_JSON, "r", encoding="utf-8") as f:
        schools_data = json.load(f)
    with open(STATS_JSON, "r", encoding="utf-8") as f:
        stats_data = json.load(f)

    schools = schools_data["schools"]
    meta = schools_data["meta"]

    # Build EXAM_STATS
    exam_stats_lines = []
    for year, info in sorted(stats_data["exam_stats"].items()):
        parts = [f"candidates: {info['candidates']}, quota: {info['quota']}"]
        # Add avg fields if present in original
        for key in ["avgMath", "avgLit", "avgEng", "avgTotal"]:
            if key in info:
                val = info[key]
                parts.append(f"{key}: {val}" if val is not None else f"{key}: null")
        exam_stats_lines.append(f"    {year}: {{ {', '.join(parts)} }},")

    # Build SCHOOLS_DATA with auto-computed tier
    school_lines = []
    districts_seen = set()
    current_district = None
    for s in schools:
        tier = s.get("tier", "C")
        stability = s.get("stability_rating", "N/A")

        if s["district"] != current_district:
            current_district = s["district"]
            districts_seen.add(current_district)
            school_lines.append("")
            school_lines.append(f"    // {'=' * 31}")
            school_lines.append(f"    // {current_district.upper()}")
            school_lines.append(f"    // {'=' * 31}")

        scores_str = ", ".join(f"{y}: {s['scores'][y]:.2f}" for y in ["2022", "2023", "2024", "2025"])
        priority_scores = s.get("priority_scores", {})
        priority_years = [y for y in ["2022", "2023", "2024", "2025"] if y in priority_scores]
        priority_scores_str = ", ".join(
            (
                f'{y}: {{ '
                f'nv1: {priority_scores[y]["nv1"] if priority_scores[y].get("nv1") is not None else "null"}, '
                f'nv2: {priority_scores[y]["nv2"] if priority_scores[y].get("nv2") is not None else "null"}, '
                f'nv3: {priority_scores[y]["nv3"] if priority_scores[y].get("nv3") is not None else "null"} '
                f"}}"
            )
            for y in priority_years
        )
        school_lines.append(
            f'    {{ id: {s["id"]}, name: "{s["name"]}", district: "{s["district"]}", '
            f'scores: {{ {scores_str} }}, '
            f'priorityScores: {{ {priority_scores_str} }}, '
            f'tier: "{tier}", stability: "{stability}" }},'
        )

    # Build DISTRICTS
    districts_ordered = list(dict.fromkeys(s["district"] for s in schools))

    # Build SCORE_DISTRIBUTION_PARAMS
    dist_lines = []
    for year, params in sorted(stats_data.get("score_distribution_params", {}).items()):
        math = params["math"]
        lit = params["lit"]
        eng = params["eng"]
        dist_lines.append(
            f"    {year}: {{ math: {{ mean: {math['mean']}, std: {math['std']} }}, "
            f"lit: {{ mean: {lit['mean']}, std: {lit['std']} }}, "
            f"eng: {{ mean: {eng['mean']}, std: {eng['std']} }} }},"
        )

    # Assemble output
    js = f"""/**
 * data.js — SINH TỰ ĐỘNG bởi scripts/build_data.py
 * KHÔNG CHỈNH SỬA THỦ CÔNG. Sửa data/schools.json rồi chạy lại build.
 *
 * Nguồn: {meta.get('sources', {}).get('2025', 'Sở GD&ĐT TPHCM')}
 * Phiên bản dữ liệu: {meta.get('version', 'unknown')}
 * Tổng: {meta.get('total', len(schools))} trường THPT công lập
 */

const EXAM_STATS = {{
{chr(10).join(exam_stats_lines)}
}};

const DISTRICTS = {json.dumps(districts_ordered, ensure_ascii=False)};

const SCHOOLS_DATA = [
{chr(10).join(school_lines)}
];

// 8-Tier system — ngưỡng được dùng bởi build script để tự phân loại
const TIER_INFO = {{
    "S":  {{ label: "Xuất sắc",       color: "#f59e0b", min: 24 }},
    "A+": {{ label: "Rất cao",        color: "#eab308", min: 22 }},
    "A":  {{ label: "Cao",            color: "#3b82f6", min: 20 }},
    "A-": {{ label: "Khá cao",        color: "#06b6d4", min: 18 }},
    "B+": {{ label: "Khá",            color: "#8b5cf6", min: 16 }},
    "B":  {{ label: "Trung bình khá", color: "#a78bfa", min: 14 }},
    "B-": {{ label: "Trung bình",     color: "#6b7280", min: 12 }},
    "C":  {{ label: "Thấp",           color: "#71717a", min: 10 }}
}};

// Phổ điểm mô phỏng
const SCORE_DISTRIBUTION_PARAMS = {{
{chr(10).join(dist_lines)}
}};
"""

    with open(OUTPUT_JS, "w", encoding="utf-8") as f:
        f.write(js)

    print(f"[BUILD] Sinh data.js thanh cong: {len(schools)} truong, {len(districts_ordered)} quan/huyen")
    print(f"[BUILD] Tier duoc tinh tu dong tu diem 2025")

if __name__ == "__main__":
    build()

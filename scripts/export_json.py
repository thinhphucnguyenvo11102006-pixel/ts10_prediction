import json
import re

# Read data.js
with open(r'e:\AI Prediction for TS10\js\data.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract schools
schools = []
pattern = r'\{\s*id:\s*(\d+),\s*name:\s*"([^"]+)",\s*district:\s*"([^"]+)",\s*scores:\s*\{\s*2022:\s*([\d.]+),\s*2023:\s*([\d.]+),\s*2024:\s*([\d.]+),\s*2025:\s*([\d.]+)\s*\},\s*tier:\s*"([^"]+)"\s*\}'

for m in re.finditer(pattern, content):
    schools.append({
        "id": int(m.group(1)),
        "name": m.group(2),
        "district": m.group(3),
        "scores": {
            "2022": float(m.group(4)),
            "2023": float(m.group(5)),
            "2024": float(m.group(6)),
            "2025": float(m.group(7))
        }
    })

# Build JSON
data = {
    "meta": {
        "version": "2026-04-20",
        "total": len(schools),
        "years": [2022, 2023, 2024, 2025],
        "sources": {
            "2025": "So GDDT TPHCM - cong bo 26/06/2025",
            "2022-2024": "VnExpress, Tuoi Tre, Thanh Nien, Dan Tri (tong hop)"
        },
        "notes": "Diem chuan NV1. Toan + Van + Anh (he so 1). Tu 2022 tro di."
    },
    "schools": schools
}

with open(r'e:\AI Prediction for TS10\data\schools.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

# Extract exam stats
exam_stats = {}
stats_pattern = r'(\d{4}):\s*\{\s*candidates:\s*(\d+),\s*quota:\s*(\d+)'
for m in re.finditer(stats_pattern, content):
    year = m.group(1)
    exam_stats[year] = {
        "candidates": int(m.group(2)),
        "quota": int(m.group(3))
    }

# Extract distribution params
dist_params = {}
dist_pattern = r"(\d{4}):\s*\{\s*math:\s*\{\s*mean:\s*([\d.]+),\s*std:\s*([\d.]+)\s*\},\s*lit:\s*\{\s*mean:\s*([\d.]+),\s*std:\s*([\d.]+)\s*\},\s*eng:\s*\{\s*mean:\s*([\d.]+),\s*std:\s*([\d.]+)\s*\}"
for m in re.finditer(dist_pattern, content):
    year = m.group(1)
    dist_params[year] = {
        "math": {"mean": float(m.group(2)), "std": float(m.group(3))},
        "lit": {"mean": float(m.group(4)), "std": float(m.group(5))},
        "eng": {"mean": float(m.group(6)), "std": float(m.group(7))}
    }

stats_data = {
    "exam_stats": exam_stats,
    "score_distribution_params": dist_params
}

with open(r'e:\AI Prediction for TS10\data\exam_stats.json', 'w', encoding='utf-8') as f:
    json.dump(stats_data, f, ensure_ascii=False, indent=2)

print(f"Exported {len(schools)} schools to data/schools.json")
print(f"Exported {len(exam_stats)} years of exam stats to data/exam_stats.json")

<p align="center">
  <h1 align="center">🎯 TS10 Prediction — Dự Đoán Điểm Chuẩn Lớp 10 TPHCM</h1>
  <p align="center">
    <strong>AI-powered Grade 10 Admission Forecasting for Ho Chi Minh City</strong>
  </p>
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/Version-6.0-blue?style=for-the-badge" alt="Version"></a>
  <a href="#"><img src="https://img.shields.io/badge/Algorithm-Anchor_%26_Adjust-purple?style=for-the-badge" alt="Algorithm"></a>
  <a href="#"><img src="https://img.shields.io/badge/Tiering-K--Means_Clustering-orange?style=for-the-badge" alt="Clustering"></a>
  <a href="#"><img src="https://img.shields.io/badge/Exam_Bank-77+_Papers-green?style=for-the-badge" alt="Exam Bank"></a>
  <a href="#"><img src="https://img.shields.io/badge/PDF_Storage-GitHub_Releases-red?style=for-the-badge" alt="PDF Storage"></a>
</p>

---

> **🇻🇳 Tiếng Việt** · [Jump to English ↓](#-english)

## 🇻🇳 Giới Thiệu

**TS10 Prediction** là nền tảng phân tích dữ liệu và dự đoán điểm chuẩn tuyển sinh lớp 10 THPT công lập tại TP. Hồ Chí Minh. Hệ thống kết hợp phân tích dữ liệu lịch sử 4 năm (2022–2025) với thuật toán **Anchor & Adjust** được thiết kế riêng để xử lý **bước ngoặt cấu trúc đề thi 2025** (chuyển sang chương trình GDPT 2018).

### ✨ Tính Năng Chính

| # | Tính năng | Mô tả |
|---|-----------|-------|
| 📊 | **Dự đoán điểm chuẩn** | Dự báo cho 107 trường THPT công lập, kèm khoảng tin cậy và xu hướng |
| 🎯 | **Đánh giá khả thi** | Nhập điểm → đánh giá xác suất trúng tuyển 3 nguyện vọng NV1/NV2/NV3 |
| 💡 | **Gợi ý nguyện vọng** | Gợi ý trường phù hợp theo quận/huyện và năng lực thí sinh |
| 📈 | **Phổ điểm mô phỏng** | So sánh phổ điểm 3 môn qua 4 năm, dự đoán phổ điểm 2026 |
| 🧠 | **Tối ưu NV** | Nhập điểm HK2 + TBCN → ước lượng điểm thi thật → gợi ý NV1-NV2-NV3 tối ưu |
| 📚 | **Ngân hàng đề thi** | 77+ đề thi (Toán, Văn, Anh) tự động cập nhật, xem trực tiếp trên web |

### 🧠 Thuật Toán

#### Anchor & Adjust (Xử lý Structural Break 2025)

Mô hình hồi quy truyền thống không còn phù hợp khi format đề thi thay đổi hoàn toàn năm 2025. Hệ thống sử dụng:

- **Anchor (Neo):** Lấy điểm chuẩn 2025 làm mốc chính
- **ΔCompetition:** Điều chỉnh theo biến động cung-cầu (thí sinh vs chỉ tiêu)
- **ΔAdaptation:** Hiệu ứng mean-reversion — trường biến động mạnh sẽ có xu hướng hồi quy về trung bình
- **Micro-trend:** Xu hướng riêng của từng trường trong 2 năm gần nhất

#### K-Means Clustering (Phân hạng trường tự động)

107 trường được phân thành **8 Tier (S → C)** bằng thuật toán K-Means dựa trên:
- Điểm chuẩn trung bình nhiều năm
- Độ biến động (volatility)
- Chỉ số ổn định (stability rating)

### 📚 Ngân Hàng Đề Thi — Crawler Pipeline v6.0

Hệ thống crawler tự động 6 giai đoạn:

```
Search → Crawl → Filter (TPHCM + Lớp 10) → Resolve PDF → Download → Upload GitHub Releases
```

- **77+ đề thi** từ 2017–2026, 3 môn: Toán, Ngữ Văn, Tiếng Anh
- **PDF lưu trữ trên GitHub Releases** — repo luôn nhẹ (< 1 MB code)
- Tự động phát hiện và loại bỏ đề ngoài TPHCM, đề học kì, đề kiểm tra

### 🏗️ Kiến Trúc Kỹ Thuật

```
📂 ts10_prediction/
├── index.html              ← SPA chính (Single Page Application)
├── css/style.css           ← Glassmorphism Earth-tone UI
├── js/
│   ├── app.js              ← Logic điều khiển UI
│   ├── model.js            ← Thuật toán Anchor & Adjust
│   ├── data.js             ← Dữ liệu 107 trường (auto-generated)
│   ├── exams_data.js       ← Metadata đề thi (auto-generated)
│   ├── charts.js           ← Biểu đồ Chart.js
│   ├── backtest.js         ← Module kiểm định ngược
│   └── tabs/               ← Modules cho từng tab
├── scripts/
│   ├── exams_crawler.py    ← Crawler pipeline v6.0
│   ├── build_data.py       ← Sinh data.js từ schools.json
│   ├── cluster_schools.py  ← K-Means clustering
│   └── migrate_pdfs_to_release.py  ← Migration tool
├── data/
│   ├── schools.json        ← Dữ liệu gốc 107 trường
│   └── exam_stats.json     ← Thống kê phổ điểm
└── pdfs/                   ← Local cache (không commit, PDF trên GitHub Releases)
```

| Công nghệ | Chi tiết |
|------------|----------|
| **Frontend** | HTML5, CSS3 (Glassmorphism), Vanilla JavaScript |
| **Charts** | Chart.js |
| **Data Pipeline** | Python 3.x (Requests, Scikit-learn) |
| **PDF Storage** | GitHub Releases CDN |
| **Hosting** | Static SPA — không cần server |

### 🚀 Bắt Đầu Nhanh

```bash
# 1. Clone repo (nhẹ < 1 MB nhờ PDF trên GitHub Releases)
git clone https://github.com/thinhphucnguyenvo11102006-pixel/ts10_prediction.git

# 2. Mở index.html trong trình duyệt (hoặc dùng Live Server)

# 3. (Tùy chọn) Cập nhật dữ liệu
pip install -r scripts/requirements.txt
python scripts/build_data.py         # Cập nhật data trường
python scripts/cluster_schools.py    # Chạy lại K-Means
python scripts/exams_crawler.py      # Cào đề thi mới → auto upload GitHub Releases
```

### 🔧 Bảo Trì Hằng Năm

| Thời điểm | Công việc |
|-----------|-----------|
| **Tháng 3–4** | Cập nhật `data/exam_stats.json` (thí sinh, chỉ tiêu mới) |
| **Tháng 5** | Chạy `exams_crawler.py` để cào đề tham khảo mới |
| **Tháng 6–7** | Cập nhật điểm chuẩn thực tế vào `data/schools.json`, chạy `build_data.py` |
| **Tháng 8** | Chạy `cluster_schools.py` để phân hạng lại |

---

## 🇬🇧 English

### Overview

**TS10 Prediction** is a data-driven platform that forecasts Grade 10 public high school admission cutoff scores in Ho Chi Minh City, Vietnam. It analyzes 4 years of historical data (2022–2025) using a custom **Anchor & Adjust** algorithm designed to handle the **2025 structural break** when TPHCM transitioned to the new 2018 General Education Program exam format.

### Key Features

| # | Feature | Description |
|---|---------|-------------|
| 📊 | **Score Prediction** | Forecasts for 107 public high schools with confidence intervals |
| 🎯 | **Feasibility Check** | Enter scores → evaluate admission probability for 3 school choices |
| 💡 | **Smart Recommender** | Suggests schools by district, tier, and safety margin |
| 📈 | **Score Distribution** | Simulated bell curves for Math, Literature, English (2022–2026) |
| 🧠 | **Choice Optimizer** | Estimates real exam scores from school grades → recommends optimal NV1-NV2-NV3 |
| 📚 | **Exam Bank** | 77+ curated exam papers with auto-crawling pipeline and built-in PDF viewer |

### Algorithm

#### Anchor & Adjust (Structural Break Handler)

Traditional regression models fail when the exam format changes drastically (as happened in 2025). Our model uses:

- **Anchor**: 2025 cutoff score as the primary baseline
- **ΔCompetition**: Adjustment for supply-demand shifts (candidates vs. quota)
- **ΔAdaptation**: Mean-reversion for volatile schools
- **Micro-trend**: Individual school trends from the last 2 years

#### K-Means School Tiering

107 schools are automatically classified into **8 Tiers (S through C)** using K-Means clustering on multi-year admission data, volatility metrics, and stability ratings.

### Exam Bank — Crawler Pipeline v6.0

Fully automated 6-stage pipeline:

```
Search → Crawl → Filter (TPHCM only) → Resolve PDF → Download → Upload to GitHub Releases
```

- **77+ exam papers** (2017–2026) in Math, Literature, and English
- **PDFs stored on GitHub Releases** — keeps the repo lightweight (< 1 MB of code)
- Automatic filtering: rejects non-TPHCM, non-entrance, and semester exams

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | HTML5, CSS3 (Glassmorphism), Vanilla JS |
| **Charts** | Chart.js |
| **Data Pipeline** | Python 3.x (Requests, Scikit-learn for K-Means) |
| **PDF Storage** | GitHub Releases CDN |
| **Hosting** | Fully static SPA — zero server dependency |

### Quick Start

```bash
# 1. Clone (lightweight < 1 MB — PDFs are on GitHub Releases)
git clone https://github.com/thinhphucnguyenvo11102006-pixel/ts10_prediction.git

# 2. Open index.html in any modern browser (or use VS Code Live Server)

# 3. (Optional) Update data pipeline
pip install -r scripts/requirements.txt
python scripts/build_data.py         # Rebuild school data
python scripts/cluster_schools.py    # Re-run K-Means clustering
python scripts/exams_crawler.py      # Crawl new exams → auto-upload to GitHub Releases
```

### Annual Maintenance

| Period | Task |
|--------|------|
| **Mar–Apr** | Update `data/exam_stats.json` with new candidate/quota numbers |
| **May** | Run `exams_crawler.py` to crawl latest reference exams |
| **Jun–Jul** | Update actual cutoff scores in `data/schools.json`, run `build_data.py` |
| **Aug** | Run `cluster_schools.py` to re-tier schools |

---

<p align="center">
  <strong>Made by Võ Nguyễn Phúc Thịnh</strong><br>
  <em>Last Updated: April 28, 2026 · Version 6.0</em>
</p>

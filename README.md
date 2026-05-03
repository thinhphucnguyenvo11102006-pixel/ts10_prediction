# 🎓 Dự Đoán Điểm Chuẩn Lớp 10 TPHCM 2026 | Grade 10 Admission Score Predictor HCMC 2026

> **[VN]** Mô hình dự đoán điểm chuẩn tuyển sinh lớp 10 THPT công lập tại TP.HCM, sử dụng thuật toán Anchor & Adjust kết hợp K-Means Clustering.
>
> **[EN]** A statistical prediction model for Grade 10 public high school admission cutoff scores in Ho Chi Minh City, using an Anchor & Adjust algorithm combined with K-Means Clustering.

**Made by Võ Nguyễn Phúc Thịnh** (a.k.a thầy Thịnh)

---

## 📑 Mục lục | Table of Contents

- [Tổng quan | Overview](#-tổng-quan--overview)
- [Kiến trúc | Architecture](#-kiến-trúc--architecture)
- [Thuật toán | Algorithm](#-thuật-toán-cốt-lõi--core-algorithm)
- [Tính năng chi tiết | Features](#-tính-năng-chi-tiết--detailed-features)
- [Dữ liệu | Data](#-dữ-liệu--data)
- [Pipeline tự động | Automation Pipeline](#-pipeline-tự-động--automation-pipeline)
- [Cài đặt & Chạy | Setup & Run](#-cài-đặt--chạy--setup--run)
- [Cấu trúc thư mục | File Structure](#-cấu-trúc-thư-mục--file-structure)

---

## 🌟 Tổng quan | Overview

### Tiếng Việt

Hệ thống phân tích dữ liệu điểm chuẩn **106 trường THPT công lập** tại TPHCM qua **4 năm** (2022–2025) để dự đoán điểm chuẩn năm 2026. Ứng dụng web tĩnh (HTML/JS/CSS) không cần backend, chạy hoàn toàn trên trình duyệt.

**Đặc điểm nổi bật:**
- Thuật toán **Anchor & Adjust** — chịu được structural break (đổi chương trình GDPT 2018 từ 2025)
- Phân nhóm trường bằng **K-Means Clustering** (scikit-learn)
- **6 tab chức năng**: Dự đoán, Đánh giá khả thi, Gợi ý nguyện vọng, Phổ điểm, Tối ưu NV, Ngân hàng đề
- **77 đề thi** được crawl tự động từ nhiều nguồn, lưu trữ trên GitHub Releases
- Backtest module để validate mô hình

### English

A system that analyzes cutoff score data from **106 public high schools** in HCMC across **4 years** (2022–2025) to predict 2026 scores. It's a static web app (HTML/JS/CSS) with no backend — runs entirely in the browser.

**Key highlights:**
- **Anchor & Adjust** algorithm — resilient to structural breaks (curriculum change GDPT 2018 from 2025)
- School tiering via **K-Means Clustering** (scikit-learn)
- **6 functional tabs**: Prediction, Feasibility, Recommendations, Score Distribution, NV Optimizer, Exam Bank
- **77 exam papers** auto-crawled and stored on GitHub Releases
- Backtest module for model validation

---

## 🏗 Kiến trúc | Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Browser)                    │
│  index.html + css/style.css + Chart.js                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐ │
│  │  app.js   │ │ model.js │ │charts.js │ │backtest.js │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────────┘ │
│  ┌────────────────┐ ┌───────────┐ ┌──────────────────┐ │
│  │tabs/optimize.js│ │tabs/      │ │tabs/exams.js     │ │
│  │                │ │distrib.js │ │                  │ │
│  └────────────────┘ └───────────┘ └──────────────────┘ │
│  ┌──────────┐ ┌──────────────┐                         │
│  │ data.js  │ │exams_data.js │  ← Auto-generated       │
│  └──────────┘ └──────────────┘                         │
└─────────────────────────────────────────────────────────┘
                         ▲
                         │ build_data.py generates
┌─────────────────────────────────────────────────────────┐
│               DATA PIPELINE (Python)                     │
│  ┌──────────────┐  ┌─────────────┐  ┌────────────────┐ │
│  │kmeans_tier.py│→ │build_data.py│→ │  js/data.js    │ │
│  └──────────────┘  └─────────────┘  └────────────────┘ │
│  ┌──────────────────┐  ┌──────────────────────────┐    │
│  │collect_priority_ │  │   exams_crawler.py        │    │
│  │scores.py         │  │   → js/exams_data.js      │    │
│  └──────────────────┘  └──────────────────────────┘    │
│  ┌──────────────┐  ┌──────────────────────────────┐    │
│  │fix_schools.py│  │migrate_pdfs_to_release.py    │    │
│  └──────────────┘  └──────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

---

## 🧮 Thuật toán cốt lõi | Core Algorithm

### Anchor & Adjust (v2 — post Structural-Break)

**[VN]** Linear Regression và WMA truyền thống trở nên vô nghĩa khi đề thi thay đổi hoàn toàn từ 2025 (chương trình GDPT 2018). Thuật toán mới:

```
Score_2026_i = Anchor_2025_i + ΔCompetition + ΔAdaptation + ΔMicroTrend
```

**[EN]** Traditional Linear Regression and WMA become meaningless when exam structure changed completely from 2025 (GDPT 2018 curriculum). The new algorithm:

| Thành phần / Component | Mô tả VN | Description EN |
|---|---|---|
| **Anchor** | Điểm chuẩn 2025 làm mỏ neo | 2025 cutoff as anchor point |
| **ΔCompetition** | Biến động tỷ lệ chọi (candidates/quota) giữa 2026 vs 2025, nhạy theo tier | Competition ratio change, tier-sensitive |
| **ΔAdaptation** | Hiệu ứng phục hồi năm thứ 2 sau đổi form (mean reversion) | 2nd-year bounce-back after format change |
| **ΔMicroTrend** | Xu hướng ranking tương đối của trường so với mặt bằng chung | Relative ranking trend vs system median |

### Tier Classification (K-Means)

**[VN]** Trường được phân 4 nhóm bằng K-Means Clustering (scikit-learn) dựa trên 2 features:
- **Điểm trung bình** 4 năm (mean)  
- **Độ lệch chuẩn** (std — đo độ ổn định)

**[EN]** Schools are classified into 4 tiers using K-Means with 2 features:
- **Mean score** across 4 years
- **Standard deviation** (volatility measure)

| Tier | Label VN | Label EN | Sensitivity |
|---|---|---|---|
| Nhóm 1 | Cao nhất | Top | Competition: 0.06, Recovery: 40% |
| Nhóm 2 | Khá cao | High | Competition: 0.09, Recovery: 35% |
| Nhóm 3 | Trung bình | Mid | Competition: 0.12, Recovery: 30% |
| Nhóm 4 | Thấp | Low | Competition: 0.10, Recovery: 20% |

### Confidence Interval

**[VN]** Khoảng dự đoán được tính từ kết hợp raw volatility (40%) và relative volatility (60%). Mở rộng thêm x1.6 nếu trường thiếu dữ liệu 2025.

**[EN]** Prediction interval is computed from blended raw volatility (40%) and relative volatility (60%). Widened by x1.6 if 2025 data is missing.

### NV Priority Penalties

| Nguyện vọng | Penalty |
|---|---|
| NV1 | +0.00 |
| NV2 | +0.75 |
| NV3 | +1.50 |

---

## 📊 Tính năng chi tiết | Detailed Features

### Tab 1: 📊 Dự Đoán Điểm Chuẩn | Cutoff Score Prediction

**[VN]**
- Bảng dự đoán 106 trường THPT công lập với cột: Tier, Ổn định, Tên trường, Quận, Điểm 2022-2025, Dự đoán 2026, Khoảng dự kiến, Xu hướng, Độ tin cậy
- **Tìm kiếm** theo tên trường hoặc quận
- **Lọc** theo quận/huyện (22 quận huyện)
- **Sắp xếp** theo bất kỳ cột nào (click tiêu đề)
- **Xem chi tiết** trường: Click vào hàng → hiển thị biểu đồ xu hướng (Chart.js line chart), điểm dự đoán, khoảng CI, độ tin cậy

**[EN]**
- Prediction table for 106 public high schools with columns: Tier, Stability, Name, District, Scores 2022-2025, Predicted 2026, CI Range, Trend, Confidence
- **Search** by school name or district
- **Filter** by district (22 districts)
- **Sort** by any column (click header)
- **Detail view**: Click a row → shows trend chart (Chart.js), predicted score, CI range, confidence

**Cách hoạt động:** `app.js:renderPredictionTable()` lọc → sắp xếp → render HTML. `PredictionModel.predictAll()` chạy thuật toán Anchor & Adjust cho tất cả trường.

---

### Tab 2: 🎯 Đánh Giá Khả Thi | Feasibility Assessment

**[VN]**
1. Nhập **điểm 3 môn** (Toán, Văn, Anh) — 0-10, bước 0.25
2. Chọn **3 nguyện vọng** (NV1=Vươn cao, NV2=Vừa sức, NV3=An toàn)
3. Hệ thống tính:
   - **Ngưỡng hiệu quả** = Điểm chuẩn DK + penalty NV
   - **Chênh lệch** = Điểm bạn − Ngưỡng hiệu quả
   - **Mức khả thi** bằng hàm Logistic: `100 / (1 + exp(-1.15 × (margin - 0.15)))`
4. Hiển thị **gauge chart** (doughnut bán nguyệt), status (An toàn/Khả thi/May rủi/Rủi ro/Rất khó), gợi ý

**[EN]**
1. Input **3 subject scores** (Math, Literature, English) — 0-10, step 0.25
2. Select **3 choices** (NV1=Reach, NV2=Match, NV3=Safety)
3. System computes: effective threshold = predicted + NV penalty, margin, feasibility via Logistic function
4. Displays **gauge charts**, status badges, recommendations

**Cách hoạt động:** `PredictionModel.evaluateChoices()` → tính margin → Logistic probability → phân loại status.

---

### Tab 3: 💡 Gợi Ý Nguyện Vọng | School Recommendations

**[VN]**
1. Nhập điểm 3 môn + chọn quận/huyện (hoặc tất cả)
2. Hệ thống liệt kê **tất cả trường** phù hợp, sắp xếp theo mức phù hợp (5 mức)
3. Ưu tiên hiển thị trường "Khả thi" và "An toàn" lên trước

**[EN]**
1. Enter 3-subject scores + select district (or all)
2. System lists **all matching schools** sorted by match level (5 levels)
3. Prioritizes "Feasible" and "Safe" schools first

| Match Level | VN | EN | Margin |
|---|---|---|---|
| 5 | Rất an toàn | Very Safe | ≥ 2.5 |
| 4 | An toàn | Safe | ≥ 1.5 |
| 3 | Khả thi | Feasible | ≥ 0.5 |
| 2 | May rủi | Risky | ≥ -0.25 |
| 1 | Rủi ro | High Risk | ≥ -1.0 |
| 0 | Khó đậu | Very Hard | < -1.0 |

**Cách hoạt động:** `PredictionModel.recommendByDistrict()` → predict all → filter by district → score matching → sort.

---

### Tab 4: 📈 Phổ Điểm | Score Distribution

**[VN]**
1. **Insight Cards** — So sánh điểm TB 2025 vs 2026 cho từng môn + tổng
2. **Grouped Bar Chart** — Điểm TB Toán/Văn/Anh qua 5 năm (2022-2026*)
3. **Distribution Overlay** — Phổ điểm phân bố chuẩn (Normal PDF) cho 2025 vs 2026, 4 biểu đồ: Toán, Văn, Anh, Tổng
4. **Bảng tham số** — Mean và σ cho từng môn, từng năm

**[EN]**
1. **Insight Cards** — Mean comparison 2025 vs 2026 per subject + total
2. **Grouped Bar Chart** — Mean Math/Lit/Eng across 5 years
3. **Distribution Overlay** — Normal PDF curves for 2025 vs 2026 (4 charts)
4. **Parameter Table** — Mean and σ per subject per year

**Cách hoạt động:** `PredictionModel.predict2026Distribution()` dùng Anchor & Adjust cho từng tham số phổ điểm. `Charts.createDistributionOverlayChart()` vẽ Normal PDF.

---

### Tab 5: 🧠 Tối Ưu Nguyện Vọng | NV Optimizer

**[VN]**
1. Nhập **điểm HK2** (cuối kì 2) + **điểm TBCN** (trung bình cuối năm) cho 3 môn
2. Hệ thống **ước lượng điểm thi vào 10**: `(HK2 × 60% + TBCN × 40%) × 0.85`
3. Tự động chọn **3 nguyện vọng tối ưu**:
   - NV1: Vươn cao — trường cao nhất trong tầm với (+1.0)
   - NV2: Vừa sức — trường thấp hơn 0.75-2.5 điểm
   - NV3: An toàn — trường thấp hơn ≥2.5 điểm (đủ chịu penalty +1.5)
4. Hiển thị **trường thay thế** khác trong khoảng phù hợp

**[EN]**
1. Input **Semester 2 exam scores** + **Year-end GPA** for 3 subjects
2. System **estimates entrance exam score**: `(HK2 × 60% + GPA × 40%) × 0.85`
3. Auto-selects **3 optimal choices**: NV1=Reach, NV2=Match, NV3=Safety
4. Shows **alternative schools** within range

**Cách hoạt động:** `App.estimateEntranceScore()` quy đổi → `App.renderTab5_Optimize()` tìm NV tối ưu từ danh sách predictions đã sắp xếp.

---

### Tab 6: 📚 Ngân Hàng Đề Thi | Exam Bank

**[VN]**
1. **77 đề thi** TPHCM từ 2017-2026, tự động crawl từ thcs.toanmath.com, langgo.edu.vn, ptnk.edu.vn, v.v.
2. **Lọc theo môn**: Toán, Văn, Anh, Lý, Hóa
3. **Xem trực tiếp** qua Google Docs Viewer (cho PDF từ GitHub Releases) hoặc iframe (local/article)
4. **Tải về** trực tiếp file PDF
5. AI sidebar (placeholder cho tính năng tương lai)

**[EN]**
1. **77 exam papers** from HCMC (2017-2026), auto-crawled from multiple sources
2. **Filter by subject**: Math, Literature, English, Physics, Chemistry
3. **View directly** via Google Docs Viewer or iframe
4. **Download** PDF files directly
5. AI sidebar (placeholder for future features)

**Cách hoạt động:** `exams_crawler.py` crawl → filter TPHCM + lớp 10 → resolve PDF → download → upload GitHub Release → generate `exams_data.js`. Frontend: `App.filterExams()` → `App.renderExamGrid()` → `App.openExamViewer()`.

---

### Backtest Module

**[VN]** Module validation chạy trong console (`Backtest.run()`):
- Dùng dữ liệu lịch sử `priorityScores` (NV1/NV2/NV3 thực tế từ ts10.hcm.edu.vn)
- 2 kịch bản: Train [2022,2023] → Predict 2024; Train [2022,2023,2024] → Predict 2025
- Metrics: MAE, RMSE, %<0.5, %<1.0, %<1.5
- Hiển thị top 5 trường sai lệch nhiều nhất

**[EN]** Validation module via console (`Backtest.run()`):
- Uses historical `priorityScores` (actual NV1/NV2/NV3 from ts10.hcm.edu.vn)
- 2 scenarios: Train→Predict 2024 and 2025
- Metrics: MAE, RMSE, accuracy bands

---

## 📁 Dữ liệu | Data

### data/schools.json
- 106 trường THPT công lập, 22 quận/huyện
- Điểm chuẩn NV1 4 năm (2022-2025)
- Priority scores (NV1/NV2/NV3) từ ts10.hcm.edu.vn

### data/exam_stats.json
- Số thí sinh & chỉ tiêu từng năm
- Phổ điểm mô phỏng (mean, std) cho Toán/Văn/Anh

### data/schools_tiered.json
- Output của K-Means clustering (tier + volatility + stability)

### Nguồn dữ liệu | Data Sources
- **Sở GD&ĐT TPHCM** (ts10.hcm.edu.vn) — điểm chuẩn chính thức
- **doctailieu.com, thapdien.com** — đối chiếu NV1/NV2/NV3
- **thcs.toanmath.com, langgo.edu.vn, ptnk.edu.vn** — đề thi

---

## ⚙ Pipeline tự động | Automation Pipeline

```bash
# 1. Thu thập điểm NV1/NV2/NV3 từ portal ts10
python scripts/collect_priority_scores.py

# 2. Sửa lỗi dữ liệu (đối chiếu nguồn chính thức)
python fix_schools.py

# 3. Phân nhóm trường bằng K-Means
python scripts/kmeans_tier.py

# 4. Sinh js/data.js từ JSON
python scripts/build_data.py

# 5. Crawl đề thi + upload GitHub Releases
python scripts/exams_crawler.py

# 6. (Tùy chọn) Migrate PDF local → GitHub Releases
python scripts/migrate_pdfs_to_release.py
```

---

## 🚀 Cài đặt & Chạy | Setup & Run

### Yêu cầu | Requirements
- Trình duyệt hiện đại (Chrome/Firefox/Edge)
- Python 3.8+ (cho data pipeline)
- GitHub CLI `gh` (cho exam crawler upload)

### Chạy web | Run web
```bash
# Mở trực tiếp index.html trong trình duyệt
# hoặc dùng live server:
npx serve .
```

### Chạy pipeline | Run pipeline
```bash
pip install -r scripts/requirements.txt
# (requests, numpy, scikit-learn)
python scripts/kmeans_tier.py
python scripts/build_data.py
```

---

## 📂 Cấu trúc thư mục | File Structure

```
├── index.html              # Trang chính (6 tabs)
├── css/style.css           # Toàn bộ CSS (1579 dòng, dark theme)
├── js/
│   ├── app.js              # Controller chính, tab navigation, event binding
│   ├── model.js            # Thuật toán Anchor & Adjust, prediction engine
│   ├── data.js             # [AUTO-GEN] Dữ liệu 106 trường + exam stats
│   ├── exams_data.js       # [AUTO-GEN] 77 đề thi metadata
│   ├── charts.js           # Chart.js wrapper (trend, gauge, distribution)
│   ├── backtest.js         # Module validation mô hình
│   ├── tabs/
│   │   ├── distribution.js # Tab 4: Phổ điểm
│   │   ├── optimize.js     # Tab 5: Tối ưu NV
│   │   └── exams.js        # Tab 6: Ngân hàng đề
│   └── vendor/
│       └── chart.umd.min.js # Chart.js v4
├── data/
│   ├── schools.json        # Dữ liệu gốc (source of truth)
│   ├── schools_tiered.json # Output K-Means clustering
│   └── exam_stats.json     # Thống kê kỳ thi
├── pdfs/                   # ~70 PDF đề thi (local cache, git-ignored)
├── scripts/
│   ├── kmeans_tier.py      # K-Means phân nhóm trường
│   ├── build_data.py       # Sinh js/data.js từ JSON
│   ├── exams_crawler.py    # Full automation crawler đề thi
│   ├── collect_priority_scores.py  # Thu thập NV1/2/3 từ ts10
│   ├── migrate_pdfs_to_release.py  # Upload PDF → GitHub Releases
│   └── requirements.txt
├── fix_schools.py          # Sửa lỗi dữ liệu từ nguồn chính thức
└── tests/
    ├── test_exams_crawler.py
    └── model.test.html
```

---

## ⚠️ Disclaimer | Tuyên bố miễn trừ

**[VN]** Kết quả dự đoán chỉ mang tính chất **tham khảo**. Điểm chuẩn thực tế phụ thuộc nhiều yếu tố khách quan không thể đo lường 100%. Nhãn khả thi được ước lượng từ hàm Logistic, **không đại diện cho xác suất đỗ thật**.

**[EN]** Predictions are for **reference only**. Actual cutoff scores depend on many objective factors. Feasibility labels use a Logistic function and **do not represent calibrated admission probabilities**.

---

## 📄 License

© 2026 — Mô hình dự đoán điểm chuẩn tuyển sinh lớp 10 TPHCM

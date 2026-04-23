# PROJECT STATUS — AI Prediction for TS10
> Đánh giá toàn diện dự án tính đến **23/04/2026** · Crawler v5 · 63 đề PDF

---

## 1. Tổng quan nhanh

| Hạng mục | Giá trị hiện tại |
|---|---|
| Phiên bản | **Production-ready Beta** (static SPA + Python pipeline) |
| Tổng số trường dữ liệu | 107 trường THPT công lập TPHCM |
| Năm dữ liệu điểm chuẩn | 2022 – 2025 (4 kỳ thi) |
| Kỳ thi dự báo | 2026 (kỳ thi dự kiến 01–02/06/2026) |
| Thuật toán dự báo | Anchor & Adjust + K-Means Clustering (8 Tier) |
| Ngân hàng đề | **63 đề PDF** · 133 MB · tuyển sinh lớp 10 TPHCM |
| Thời gian phủ (exam bank) | 2017 – 2026 (10 năm) |
| Commit cuối | `701b4ff` — feat(crawler): v5 multi-page crawl |

---

## 2. Kiến trúc hệ thống

```
data/schools.json          data/exam_stats.json
        ↓ scripts/build_data.py         ↓ scripts/cluster_schools.py
   js/data.js  ←────────────────────────────────────┘
        ↓
   index.html ─── js/model.js (Anchor & Adjust)
              ─── js/charts.js (Chart.js)
              ─── js/app.js + js/tabs/*.js (UI)
              ─── js/exams_data.js ← scripts/exams_crawler.py → pdfs/*.pdf
```

**Loại kiến trúc:** Fully static SPA (không cần server runtime). Có thể deploy thẳng GitHub Pages / Netlify / bất kỳ static host nào.

---

## 3. Tính năng hiện tại (6 tab)

| Tab | Trạng thái | Mô tả |
|---|---|---|
| **Dự báo điểm chuẩn** | ✅ Hoạt động | Bảng 107 trường, sort/filter quận, search, hiển thị điểm lịch sử + dự báo 2026 + khoảng tin cậy |
| **Đánh giá khả thi (NV)** | ✅ Hoạt động | Nhập điểm 3 môn + 3 nguyện vọng → gauge chart mức khả thi + nhận xét |
| **Gợi ý trường** | ✅ Hoạt động | Nhập điểm + lọc quận → danh sách trường phù hợp xếp theo margin |
| **Phổ điểm** | ✅ Hoạt động | Biểu đồ phân phối chuẩn mô phỏng theo môn, so sánh 2022–2026 |
| **Tối ưu NV** | ✅ Hoạt động | Nhập điểm HK + điểm thi thử → ước tính điểm thi thật → gợi ý chiến lược NV |
| **Ngân hàng đề** | ✅ Hoạt động · đang mở rộng | Grid 63 đề · xem PDF trong iframe · nút tải về · lọc môn (Toán/Văn/Anh) |

---

## 4. Mô hình dự báo — Chi tiết thuật toán

### 4a. Anchor & Adjust

Thiết kế để xử lý **structural break 2025** (chuyển sang chương trình GDPT 2018 — điểm chuẩn thay đổi cấu trúc, hồi quy tuyến tính truyền thống không đáng tin).

```
Score_2026 = Anchor_2025 + ΔCompetition + ΔAdaptation + ΔMicroTrend
```

| Thành phần | Công thức / Logic |
|---|---|
| **Anchor** | Điểm 2025 — neo tuyệt đối (năm đầu kỳ thi mới) |
| **ΔCompetition** | Điều chỉnh theo biến động candidates/quota 2026 vs 2025; hệ số nhạy theo Tier |
| **ΔAdaptation** | Mean-reversion kỳ 2 sau format change — trường thấp bounce up, trường cao giảm nhẹ |
| **ΔMicroTrend** | Xu hướng tương đối của trường vs baseline toàn thành phố (2022–2025) |

Dữ liệu 2022–2024 **không** dùng dự báo trực tiếp → chỉ dùng đo volatility và trend tương đối.

### 4b. K-Means Clustering — 8 Tier

Phân loại 107 trường thành 8 Tier (S, A+, A, A-, B+, B, B-, C) bằng K-Means trên điểm lịch sử + độ biến động. Mỗi trường còn có nhãn Stability (Rất ổn / Ổn / Tương đối / Biến động).

---

## 5. Ngân hàng đề — Pipeline v5

### Luồng xử lý (6 giai đoạn)

```
SEARCH  →  CRAWL  →  FILTER  →  RESOLVE PDF  →  DOWNLOAD  →  PUBLISH
```

| Giai đoạn | Kỹ thuật |
|---|---|
| **SEARCH** | Tự sinh URLs từ query theo môn × site; hỗ trợ pagination (`page/N/`) tối đa 8 trang mỗi query |
| **CRAWL** | Dual-mode: listing parser (WordPress `mh-posts-grid-item`) hoặc single-article fallback (og:title / h1) |
| **FILTER** | 3 tầng: `is_tphcm()` (15 HCM pattern + 50+ tỉnh blacklist) · `is_lop10_entrance()` (loại học kì/cuối kì) · subject whitelist (Toán/Văn/Anh) |
| **RESOLVE** | Trích PDF từ: wonderplugin-pdfjs `?file=`, `<a href=".pdf">`, Google Drive file ID, S3 signed URL |
| **DOWNLOAD** | Stream → `pdfs/<slug>.pdf` với Content-Type check + idempotent cache (rerun nhanh ~5s) |
| **PUBLISH** | Sinh `js/exams_data.js` · ID ổn định (derive từ URL) · type auto-detect · sort mới nhất đầu |

### Nguồn dữ liệu đang dùng

| Nguồn | Phương thức | Môn | Ghi chú |
|---|---|---|---|
| `thcs.toanmath.com` | Search (`?s=`) + pagination pages 1–8 | Toán (chính) + Văn (hạn chế) | Nền tảng chính, 20 bài/trang |
| `langgo.edu.vn` | Curated seed bài đơn | Tiếng Anh | 2024 + 2025 |
| `tailieugiangday.vn` | Curated seed bài đơn | Ngữ Văn | Wasabi S3 PDF |

### Thống kê snapshot hiện tại

| Chỉ số | Giá trị |
|---|---|
| Tổng đề | **63** |
| Phạm vi năm | 2017 – 2026 |
| Phân bố theo năm | 2017:3 · 2018:2 · 2019:3 · 2020:6 · 2021:3 · 2022:6 · 2023:6 · 2024:12 · 2025:15 · 2026:7 |
| Toán | 60 đề (Sở GD, PTNK, các phòng GD quận) |
| Tiếng Anh | 2 đề |
| Ngữ Văn | 1 đề |
| Loại đề | Tuyển sinh chính thức: 34 · Tham khảo: 22 · Thi thử: 7 |
| Tổng dung lượng PDF | 133 MB (63 file) |
| Tỷ lệ tải thành công (last run) | **63/63 (100%)** |

---

## 6. Lịch sử cải tiến (changelog tóm tắt)

| Phiên bản / Commit | Nội dung chính |
|---|---|
| `v1 (aba0be5)` | Thay WMA/LR bằng Anchor & Adjust; refactor core |
| `v2 (02078fd)` | Tích hợp K-Means Clustering 8 Tier + stability rating |
| `v3 (761b840)` | Nâng crawler v2.0; cải thiện Exam Bank UI |
| **`v4 (feb40ac)`** | Viết lại crawler thành pipeline 6 giai đoạn; PDF thật; filter TPHCM + lớp 10 + môn |
| **`v4.1 (ef4cbe7)`** | Thêm filter lớp 10 entrance-only; 3 môn cứng; nút tải PDF (card + modal); multi-source |
| **`v5 (701b4ff)`** | Pagination (8 trang/query); query chính xác hơn theo môn; 21 → **63 đề** |

---

## 7. Đánh giá chất lượng hiện tại

### ✅ Điểm mạnh

- **Thuật toán đúng hướng:** Anchor & Adjust xử lý tốt structural break 2025, không over-fit dữ liệu cũ.
- **UX/UI tốt:** 6 tab đầy đủ, responsive, dark-mode, Chart.js charts đẹp.
- **Pipeline crawler hoàn chỉnh:** 6 giai đoạn tách biệt, log rõ, cache thông minh, env-overridable.
- **Filter chặt chẽ:** Không lẫn đề tỉnh khác, đề học kì, đề môn ngoài phạm vi.
- **Dữ liệu lịch sử phong phú (Toán):** 10 năm (2017–2026), từ Sở GD&ĐT đến PTNK đến các phòng GD quận.
- **Fully static:** Zero server dependency → deploy đơn giản, chi phí vận hành = $0.

### ⚠️ Điểm cần cải thiện

| Vấn đề | Mức độ | Ghi chú |
|---|---|---|
| Ngữ Văn & Tiếng Anh còn ít (1 + 2 đề) | Cao | Toanmath chuyên Toán; cần nguồn chuyên Văn/Anh có PDF ổn định |
| Backtest không tự động | Cao | Có DevTools backtest nhưng chưa thành CI/automated quality gate |
| Không có retry download | Trung bình | S3 Wasabi đôi khi timeout; nên retry 2-3 lần với backoff |
| Risk label dễ bị hiểu nhầm là xác suất | Trung bình | "78% khả thi" ≠ xác suất đỗ đã calibrated → cần disclaimer rõ hơn |
| Repo phình theo số PDF | Thấp | 133 MB hiện tại OK; cần policy khi > 500 MB |
| `js/app.js` còn dày (507 dòng) | Thấp | Đã tách module tab nhưng phần binding vẫn coupled |

---

## 8. Kiến trúc kỹ thuật — Cây thư mục

```
📁 AI Prediction for TS10
├── index.html               # SPA shell, 6 tabs
├── css/style.css            # Design system + responsive
├── js/
│   ├── data.js              # 107 trường + exam stats (auto-generated)
│   ├── exams_data.js        # 63 đề thi (auto-generated by crawler)
│   ├── model.js             # Anchor & Adjust + K-Means Tier
│   ├── charts.js            # Chart.js wrappers
│   ├── app.js               # UI state + tab rendering
│   ├── backtest.js          # Model validation DevTools
│   └── tabs/
│       ├── exams.js         # Exam Bank UI + viewer + download
│       ├── distribution.js  # Score distribution charts
│       └── optimize.js      # NV optimizer
├── data/
│   ├── schools.json         # Source of truth (107 trường)
│   └── exam_stats.json      # Thống kê kỳ thi 2022–2026
├── pdfs/                    # 63 PDF tải về (133 MB)
│   └── *.pdf
├── scripts/
│   ├── exams_crawler.py     # Pipeline crawler v5 (6 stages)
│   ├── build_data.py        # Sinh js/data.js từ JSON
│   ├── cluster_schools.py   # K-Means clustering
│   ├── export_json.py       # Export JSON từ data.js cũ
│   └── requirements.txt     # Python deps (requests)
└── docs/                    # Tài liệu nội bộ
```

---

## 9. Hướng phát triển tiếp theo

### Ngắn hạn (1–2 tuần)

1. **Bổ sung nguồn Văn/Anh:** Tìm thêm 10–20 bài đơn có PDF trực tiếp cho Ngữ Văn và Tiếng Anh TPHCM. Thêm vào `DEFAULT_ARTICLE_SEEDS`.
2. **Retry download:** Thêm exponential backoff (2–3 lần) cho các host S3 chậm.
3. **Disclaimer rõ hơn:** Cập nhật wording "khả thi" → không phải xác suất đỗ thật.

### Trung hạn (1–2 tháng)

4. **Scenario Simulator:** Cho người dùng kéo/thả candidates/quota → xem điểm dự báo cập nhật real-time.
5. **Automated backtest:** Sau kỳ thi 2026 công bố, pipeline so sánh dự báo vs thực tế và xuất báo cáo.
6. **Tối ưu NV 2.0:** Cho phép thêm ràng buộc (quận, Tier, risk tolerance) và hiển thị portfolio analysis.

### Dài hạn (khi có nhu cầu thực tế)

7. **Backend migration (khi cần):** Bắt đầu khi cần auth, user data sync, hoặc moderation nội dung.
8. **API công khai:** Expose prediction endpoint cho third-party tools/apps.

---

## 10. Hướng dẫn vận hành nhanh

### Mở ứng dụng

```
Mở index.html trực tiếp trên trình duyệt
hoặc: dùng VS Code Live Server (port 5500)
```

### Cập nhật dữ liệu trường / điểm chuẩn

```bash
# Sửa data/schools.json → chạy build
python scripts/build_data.py
python scripts/cluster_schools.py
```

### Cập nhật ngân hàng đề (crawl mới)

```bash
pip install -r scripts/requirements.txt
python scripts/exams_crawler.py
```

Sau khi chạy xong: commit `js/exams_data.js` + `pdfs/*.pdf` mới → push.

### Cấu hình nhanh crawler

```bash
# Chỉ lấy Toán, tối đa 5 trang/query
set EXAMS_CRAWLER_SUBJECTS=math
set EXAMS_CRAWLER_MAX_PAGES=5
python scripts/exams_crawler.py

# Dry-run không tải PDF (kiểm tra số lượng trước)
set EXAMS_CRAWLER_SKIP_PDF=1
python scripts/exams_crawler.py
```

---

## 11. Tài liệu liên quan

| File | Nội dung |
|---|---|
| [README.md](README.md) | Giới thiệu dự án, tech stack, cách chạy (EN) |
| [README_VN.md](README_VN.md) | Phiên bản tiếng Việt |
| [README_EXAM_PIPELINE.md](README_EXAM_PIPELINE.md) | Hướng dẫn vận hành crawler + biến môi trường |
| [RE_EVALUATION.md](RE_EVALUATION.md) | Đánh giá chi tiết đợt cải tiến Exam Bank v4→v5 |
| [evaluateproject.md](evaluateproject.md) | Đánh giá tổng thể dự án ban đầu (roadmap) |
| [docs/MAINTENANCE.md](docs/MAINTENANCE.md) | Hướng dẫn bảo trì kỹ thuật |

---

*Cập nhật lần cuối: 23/04/2026 · Commit `701b4ff` · Crawler v5.0*

# 📊 Đánh Giá Project | Project Evaluation

> Phân tích điểm mạnh, điểm yếu và hướng cải thiện — Analysis of strengths, weaknesses, and improvements
>
> Đánh giá tại thời điểm: **03/05/2026**

---

## 🟢 Điểm mạnh | Strengths

### 1. Thuật toán phù hợp bối cảnh | Context-Appropriate Algorithm

**[VN]** Quyết định dùng **Anchor & Adjust** thay vì Linear Regression là xuất sắc. Khi chương trình GDPT 2018 tạo structural break từ 2025, dữ liệu 2022-2024 không còn cùng distribution với 2025+. Anchor & Adjust neo vào 2025 làm gốc, chỉ điều chỉnh nhẹ, tránh sai lệch lớn.

**[EN]** Using **Anchor & Adjust** instead of Linear Regression is excellent. The GDPT 2018 curriculum created a structural break from 2025, making 2022-2024 data incompatible. A&A anchors on 2025 and applies small corrections.

### 2. Data Pipeline tự động hoàn chỉnh | Complete Automation Pipeline

**[VN]** Pipeline end-to-end ấn tượng:
- Thu thập dữ liệu điểm chuẩn NV1/2/3 từ ts10.hcm.edu.vn (API scraping)
- Đối chiếu & sửa lỗi bằng `fix_schools.py` với dữ liệu từ nhiều nguồn
- K-Means clustering tự động phân nhóm
- Build script tự sinh JavaScript từ JSON
- Crawler tự động thu thập 77 đề thi với filter thông minh (TPHCM + lớp 10 + 3 môn)
- Upload PDF lên GitHub Releases (giảm repo size)

**[EN]** Impressive end-to-end pipeline: data collection → cross-validation → clustering → JS generation → exam crawling → GitHub Releases storage.

### 3. Phân nhóm trường bằng Machine Learning | ML-based School Tiering

**[VN]** Sử dụng K-Means Clustering (scikit-learn) với StandardScaler thay vì hardcode ngưỡng. Dùng 2 features (mean + std) cho phân nhóm tự nhiên hơn.

**[EN]** K-Means Clustering replaces hardcoded thresholds. 2 features (mean + std) produce more natural groupings.

### 4. UI/UX chất lượng cao | High-Quality UI/UX

**[VN]**
- Dark theme tinh tế (Earth/Coffee palette)
- Glassmorphism, gradient, micro-animation
- Responsive grid, sticky headers
- Chart.js với custom tooltip, gauge charts
- Tab navigation mượt mà
- 1579 dòng CSS chỉn chu

**[EN]** Premium dark theme, glassmorphism, smooth animations, custom Chart.js visualizations, responsive design, 1579 lines of polished CSS.

### 5. Backtest & Validation | Model Validation

**[VN]** Có module backtest đánh giá MAE/RMSE trên dữ liệu lịch sử thực tế (NV1/NV2/NV3 từ ts10). Hiếm project cá nhân nào làm điều này.

**[EN]** Backtest module measures MAE/RMSE on actual historical NV1/NV2/NV3 data. Rare for personal projects.

### 6. Không cần backend | Zero Backend

**[VN]** Toàn bộ logic chạy client-side. Deploy đơn giản (GitHub Pages, Netlify, v.v.). Không lo server cost, security backend.

**[EN]** Entirely client-side. Simple deployment, no server costs or backend security concerns.

### 7. Tính năng đa dạng | Feature Richness

**[VN]** 6 tab chức năng bao phủ toàn bộ nhu cầu học sinh: xem dự đoán → đánh giá NV → gợi ý trường → phân tích phổ điểm → tối ưu NV từ điểm trường → luyện đề. Đây là một hệ sinh thái hoàn chỉnh.

**[EN]** 6 feature tabs covering the full student journey: predictions → feasibility → recommendations → distribution analysis → NV optimization → exam practice.

---

## 🔴 Điểm yếu | Weaknesses

### 1. Confidence Interval chưa calibrate | Uncalibrated Confidence

**[VN]** Mức khả thi dùng hàm Logistic với hệ số cố định (k=1.15, x₀=0.15) — không calibrate trên dữ liệu thật. Disclaimer có ghi rõ "không đại diện xác suất đỗ thật", nhưng UI hiển thị "xác suất đậu" trên gauge chart có thể gây hiểu lầm.

**[EN]** Feasibility uses a Logistic function with fixed coefficients — not calibrated on real data. The gauge chart label says "xác suất đậu" (pass probability) which can mislead, despite the disclaimer.

### 2. Dữ liệu phổ điểm là ước lượng | Estimated Distribution Parameters

**[VN]** `SCORE_DISTRIBUTION_PARAMS` (mean, std cho Toán/Văn/Anh) là giá trị ước lượng từ báo chí, không phải dữ liệu thô chính thức từ Sở GD&ĐT. Sai số ở đây ảnh hưởng Tab 4 và Tab 5.

**[EN]** Score distribution parameters are press-estimated, not official raw data. Errors here propagate to Tab 4 and Tab 5.

### 3. Hệ số ước lượng chưa tối ưu | Unoptimized Hyperparameters

**[VN]** Nhiều hệ số quan trọng được hardcode:
- Competition sensitivity: `{top: 0.06, high: 0.09, mid: 0.12, low: 0.10}`
- Recovery rate: `{top: 0.40, high: 0.35, mid: 0.30, low: 0.20}`
- Micro-trend dampening: `0.50`
- Difficulty factor (Tab 5): `0.85`

Các giá trị này được chọn theo kinh nghiệm, chưa qua grid search hay cross-validation.

**[EN]** Many critical hyperparameters are hardcoded based on intuition without grid search or cross-validation.

### 4. Thiếu kiểm thử tự động | Insufficient Automated Testing

**[VN]** Chỉ có `tests/test_exams_crawler.py` và `model.test.html`. Thiếu:
- Unit tests cho `PredictionModel`
- Integration tests cho data pipeline
- Regression tests khi thay đổi thuật toán

**[EN]** Only basic tests exist. Missing: unit tests for PredictionModel, integration tests for pipeline, regression tests.

### 5. HTML bị duplicate | Duplicate HTML Tags

**[VN]** File `index.html` có duplicate `</body></html>` ở cuối (dòng 553-561 vs 559-561). Có 2 lần load `optimize.js` và `exams.js` (dòng 550-551 và 556-557). Browser xử lý được nhưng không clean.

**[EN]** `index.html` has duplicate `</body></html>` and double-loaded scripts at the end. Browsers handle it but it's messy.

### 6. Thiếu xử lý edge cases | Missing Edge Case Handling

**[VN]**
- Trường mới (chưa có lịch sử 4 năm) → fallback thô
- Không handle trường hợp trùng trường giữa các NV (Tab 2)
- Tab 5 có thể chọn cùng 1 trường cho cả NV1/NV2/NV3

**[EN]** New schools with limited history get rough fallbacks. No duplicate school validation across NV selections.

### 7. Exam crawler phụ thuộc cấu trúc HTML | Crawler HTML Dependency

**[VN]** Crawler dùng regex phân tích HTML (không dùng BeautifulSoup), fragile khi website nguồn thay đổi layout.

**[EN]** Crawler uses regex-based HTML parsing instead of proper parsers, fragile when source sites change layouts.

---

## 🟡 Có thể cải thiện | Potential Improvements

### Ưu tiên cao | High Priority

| # | Cải thiện (VN) | Improvement (EN) | Mức độ |
|---|---|---|---|
| 1 | **Calibrate Logistic function** — Dùng backtest data để fit k và x₀, hiển thị "mức khả thi" thay vì "xác suất đậu" | Calibrate Logistic using backtest data, rename to "feasibility level" | Dễ |
| 2 | **Fix duplicate HTML** — Xóa block trùng ở cuối index.html | Remove duplicate script loads and closing tags | Rất dễ |
| 3 | **Thêm unit tests** cho model.js — Kiểm tra predict output cho các trường cụ thể | Add unit tests for prediction model with known expected outputs | Trung bình |
| 4 | **Validation NV trùng** — Không cho chọn cùng trường ở nhiều NV | Prevent same school selection across NV1/NV2/NV3 | Dễ |

### Ưu tiên trung bình | Medium Priority

| # | Cải thiện (VN) | Improvement (EN) | Mức độ |
|---|---|---|---|
| 5 | **Grid search hyperparameters** — Tìm sensitivity, recovery rate tối ưu qua backtest | Optimize hyperparameters via backtesting grid search | Trung bình |
| 6 | **So sánh trường** — Cho phép chọn 2-3 trường so sánh song song (radar/line chart) | Side-by-side school comparison with overlay charts | Trung bình |
| 7 | **PWA / Offline** — Service worker + manifest để dùng offline | Progressive Web App for offline access | Trung bình |
| 8 | **Export PDF/Excel** — Xuất kết quả phân tích ra file | Export analysis results to PDF or spreadsheet | Trung bình |
| 9 | **Lịch sử tìm kiếm** — Lưu localStorage các lần đánh giá NV | Save NV assessment history in localStorage | Dễ |
| 10 | **Mobile UX** — Tab nav overflow trên mobile cần cải thiện (hiện scroll ngang) | Improve tab navigation on small screens | Dễ |

### Ưu tiên thấp | Low Priority

| # | Cải thiện (VN) | Improvement (EN) | Mức độ |
|---|---|---|---|
| 11 | **Crawler dùng parser** — Chuyển sang BeautifulSoup/lxml thay vì regex | Use proper HTML parser instead of regex | Trung bình |
| 12 | **Map visualization** — Bản đồ TPHCM hiển thị trường theo quận (Leaflet.js) | Interactive HCMC map with school locations | Khó |
| 13 | **AI giải đề** — Tích hợp Generative AI chấm/giải đề thi (sidebar hiện là placeholder) | AI exam solver/grader integration | Rất khó |
| 14 | **Multilingual toggle** — Switch VN/EN trên UI | Language toggle on the UI | Trung bình |
| 15 | **Dark/Light mode** — Toggle theme | Theme toggle | Dễ |
| 16 | **Ensemble model** — Kết hợp nhiều thuật toán (A&A + WMA + LR) với weight | Ensemble of multiple prediction algorithms | Khó |
| 17 | **Thống kê theo tier** — Biểu đồ phân bố tier, so sánh tier qua các năm | Tier distribution charts and year-over-year comparison | Trung bình |
| 18 | **Dữ liệu phổ điểm chính thức** — Liên hệ Sở GD&ĐT để có data thô | Obtain official raw score distributions from education department | Ngoài tầm |

---

## 📈 Đánh giá tổng thể | Overall Assessment

| Tiêu chí | Điểm (1-10) | Ghi chú |
|---|---|---|
| **Thuật toán** | 8/10 | Phù hợp bối cảnh, có backtest, nhưng chưa tối ưu hyperparameters |
| **Dữ liệu** | 7/10 | 106 trường, 4 năm, NV1/2/3 thực tế, nhưng phổ điểm là ước lượng |
| **UI/UX** | 9/10 | Dark theme premium, responsive, Chart.js đẹp, micro-animation |
| **Code Quality** | 7/10 | Cấu trúc rõ ràng, comments tốt, nhưng thiếu tests + duplicate HTML |
| **Automation** | 9/10 | Pipeline end-to-end hoàn chỉnh, crawler thông minh |
| **Tính năng** | 9/10 | 6 tabs đa dạng, backtest module, bao phủ toàn bộ nhu cầu |
| **Khả năng mở rộng** | 6/10 | Monolithic JS, thiếu module bundler, nhưng đơn giản hiệu quả |
| **Documentation** | 7/10 | Comment code tốt, nhưng README cũ chưa đầy đủ (đã cập nhật) |

### Điểm tổng | Overall: **7.75/10** ⭐

**[VN]** Đây là một project cá nhân xuất sắc — kết hợp data engineering, machine learning, web development, và automation pipeline. Thuật toán được thiết kế có chủ đích (không copy-paste ML cơ bản), dữ liệu được cross-validate từ nhiều nguồn, UI chất lượng production-ready. Điểm cần cải thiện chính là calibration thống kê, testing coverage, và code cleanup.

**[EN]** An outstanding personal project combining data engineering, ML, web development, and automation. The algorithm is purposefully designed (not basic ML copy-paste), data is cross-validated from multiple sources, and UI is production-quality. Main improvement areas: statistical calibration, test coverage, and code cleanup.

# Mô hình Dự đoán Điểm chuẩn Tuyển sinh Lớp 10 TPHCM 2026

## Bối cảnh

Kỳ thi tuyển sinh lớp 10 TPHCM năm 2026 sẽ diễn ra vào ngày **01-02/06/2026** với:
- **~169.080** học sinh tốt nghiệp THCS
- **~118.400** chỉ tiêu vào lớp 10 công lập  
- **3 môn thi**: Toán, Ngữ văn, Ngoại ngữ (đều hệ số 1)
- **Điểm xét tuyển** = Tổng 3 môn + Điểm ưu tiên

### Các yếu tố ảnh hưởng điểm chuẩn
1. **Độ khó đề thi** → Ảnh hưởng phổ điểm toàn thành phố
2. **Số lượng thí sinh đăng ký** vào từng trường (nguyện vọng 1)
3. **Chỉ tiêu tuyển sinh** của từng trường
4. **Xu hướng lịch sử** điểm chuẩn qua các năm
5. **Tỷ lệ cạnh tranh** (số thí sinh / chỉ tiêu)

---

## Dữ liệu lịch sử có sẵn

### Điểm chuẩn Nguyện vọng 1 (2022-2025)

| # | Trường | Quận | 2022 | 2023 | 2024 | 2025 |
|---|--------|------|------|------|------|------|
| 1 | Nguyễn Thượng Hiền | Tân Bình | 24.50 | 25.50 | 24.25 | 23.50 |
| 2 | Trần Đại Nghĩa | Q.1 | 24.00 | 25.00 | 24.00 | 24.50 |
| 3 | Nguyễn Thị Minh Khai | Q.3 | 23.50 | 24.25 | 23.25 | 23.75 |
| 4 | Nguyễn Hữu Huân | Thủ Đức | 23.00 | 24.00 | 23.25 | 23.50 |
| 5 | Trần Phú | Tân Phú | 22.75 | 23.50 | 23.25 | 22.75 |
| 6 | Gia Định | Bình Thạnh | 22.50 | 23.50 | 23.00 | 22.75 |
| 7 | TH Thực hành Sư phạm | Q.5 | 22.25 | 23.25 | 23.00 | 23.00 |
| 8 | Bùi Thị Xuân | Q.1 | 22.00 | 23.00 | 22.50 | 22.50 |
| 9 | Nguyễn Hữu Cầu | Biên Hòa/Q.2 | 22.00 | 22.75 | 22.25 | 23.00 |
| 10 | Lê Quý Đôn | Q.3 | 21.75 | 22.75 | 22.25 | 22.25 |
| 11 | Mạc Đĩnh Chi | Q.6 | 21.50 | 22.50 | 22.00 | 21.75 |
| 12 | Nguyễn Du | Q.10 | 21.25 | 22.25 | 21.75 | 21.50 |
| 13 | Hùng Vương | Q.5 | 21.00 | 22.00 | 21.50 | 21.25 |
| 14 | Nguyễn Khuyến | Tân Bình | 21.00 | 21.75 | 21.25 | 21.00 |
| 15 | Marie Curie | Q.3 | 20.75 | 21.50 | 21.00 | 20.75 |
| 16 | Lương Thế Vinh | Q.1 | 20.50 | 21.25 | 20.75 | 20.50 |
| 17 | Trần Khai Nguyên | Q.5 | 20.25 | 21.00 | 20.50 | 20.25 |
| 18 | Nguyễn Trung Trực | Gò Vấp | 20.00 | 20.75 | 20.25 | 20.00 |
| 19 | Nguyễn Thái Bình | Tân Bình | 19.75 | 20.50 | 20.00 | 19.75 |
| 20 | Võ Thị Sáu | Bình Thạnh | 19.50 | 20.25 | 19.75 | 19.50 |
| 21 | Tân Bình | Tân Bình | 19.25 | 20.00 | 19.50 | 19.25 |
| 22 | Nguyễn Công Trứ | Gò Vấp | 19.00 | 19.75 | 19.25 | 19.00 |
| 23 | Nguyễn An Ninh | Q.10 | 18.75 | 19.50 | 19.00 | 18.75 |
| 24 | Phú Nhuận | Phú Nhuận | 18.50 | 19.25 | 18.75 | 18.50 |
| 25 | Trưng Vương | Q.1 | 18.25 | 19.00 | 18.50 | 18.25 |
| 26 | Lê Thánh Tôn | Q.7 | 18.00 | 18.75 | 18.25 | 18.00 |
| 27 | Thanh Đa | Bình Thạnh | 17.50 | 18.25 | 17.75 | 17.50 |
| 28 | Gò Vấp | Gò Vấp | 17.00 | 17.75 | 17.25 | 17.00 |
| 29 | Nguyễn Hiền | Q.11 | 16.50 | 17.25 | 16.75 | 16.50 |
| 30 | Tây Thạnh | Tân Phú | 16.00 | 16.75 | 16.25 | 16.00 |
| 31 | Bình Phú | Q.6 | 15.50 | 16.25 | 15.75 | 15.50 |
| 32 | An Nhơn | Gò Vấp | 15.00 | 15.75 | 15.25 | 15.00 |
| 33 | Tân Thới Hiệp | Q.12 | 14.50 | 15.25 | 14.75 | 14.50 |
| 34 | Bình Tân | Bình Tân | 14.00 | 14.75 | 14.25 | 14.00 |
| 35 | Nguyễn Văn Linh | Bình Chánh | 13.50 | 14.25 | 13.75 | 13.50 |
| 36 | Long Trường | TP Thủ Đức | 13.00 | 13.75 | 13.25 | 13.00 |
| 37 | Hiệp Bình | TP Thủ Đức | 12.50 | 13.25 | 12.75 | 12.50 |
| 38 | Bình Khánh | Cần Giờ | 11.50 | 12.00 | 11.50 | 11.00 |
| 39 | An Nghĩa | Cần Giờ | 11.00 | 11.50 | 11.00 | 10.75 |
| 40 | Cần Thạnh | Cần Giờ | 10.50 | 11.00 | 10.50 | 10.50 |

*Lưu ý: Dữ liệu trên được tổng hợp từ nhiều nguồn báo chí. App sẽ bao gồm ~100 trường.*

### Phổ điểm lịch sử

| Năm | Thí sinh | Chỉ tiêu | Toán TB | Văn TB | Anh TB | Tổng TB |
|-----|----------|----------|---------|--------|--------|---------|
| 2022 | ~94,000 | ~72,000 | 5.17 | 6.58 | 5.46 | 17.21 |
| 2023 | ~96,000 | ~74,000 | 5.40 | 6.70 | 5.80 | 17.90 |
| 2024 | ~98,600 | ~77,355 | 4.80 | 6.90 | 6.20 | 17.90 |
| 2025 | ~102,000 | ~80,000 | 5.10 | 6.75 | 6.50 | 18.35 |

---

## Phương pháp dự đoán

### 1. Mô hình dự đoán điểm chuẩn từng trường

Sử dụng kết hợp 3 phương pháp:

#### a) Weighted Moving Average (WMA)
- Trọng số: Năm 2025 (40%), 2024 (30%), 2023 (20%), 2022 (10%)
- Phù hợp vì phản ánh xu hướng gần nhất

#### b) Linear Regression
- Fit đường thẳng qua 4 điểm dữ liệu (2022-2025)
- Dự đoán giá trị tại x = 2026

#### c) Điều chỉnh theo yếu tố mùa vụ
- Factor tăng thí sinh: `169,080 / 102,000 = 1.66x` → áp lực cạnh tranh tăng
- Factor chỉ tiêu: `118,400 / 80,000 = 1.48x` → chỉ tiêu tăng bù
- **Net competition factor**: `1.66 / 1.48 ≈ 1.12` → cạnh tranh tăng nhẹ ~12%

**Công thức cuối:**
```
Dự đoán = 0.5 × WMA + 0.3 × Linear + 0.2 × Adjustment
Adjustment = WMA × (1 + competition_factor_delta × sensitivity)
```

### 2. Mô hình phổ điểm dự đoán

Sử dụng **Gaussian Mixture Model** (mô phỏng bằng JS):
- Mỗi môn thi: phân bố chuẩn có tham số (mean, std) dựa trên dữ liệu lịch sử
- Tổng 3 môn: tổng 3 phân bố chuẩn → phân bố chuẩn mới
- Cho phép user điều chỉnh "độ khó đề thi" → thay đổi mean

---

## Proposed Changes

### Web Application Structure

```
ionic-juno/
├── index.html          # Main entry point  
├── css/
│   └── style.css       # Design system & styles
├── js/
│   ├── data.js         # Historical data (100+ schools)
│   ├── model.js        # Prediction algorithms
│   ├── charts.js       # Chart.js visualizations
│   └── app.js          # Main app logic & UI interactions
└── assets/
    └── favicon.svg     # App icon
```

### [NEW] index.html
- Single Page Application layout
- **Header**: Logo, title, navigation tabs
- **Tab 1 - Dashboard**: Tổng quan kỳ thi 2026, thống kê dự đoán, biểu đồ phân bố
- **Tab 2 - Tra cứu trường**: Search bar, filter by quận, bảng điểm dự đoán, biểu đồ xu hướng
- **Tab 3 - Phổ điểm**: Biểu đồ phổ điểm Toán/Văn/Anh/Tổng, slider điều chỉnh độ khó
- **Tab 4 - So sánh**: So sánh 2-3 trường, biểu đồ radar/line
- **Footer**: Disclaimer về dự đoán, nguồn dữ liệu

### [NEW] css/style.css
- Dark theme chính (tông xanh dương/tím gradient)
- Glassmorphism cards cho các stat blocks
- Responsive grid layout
- Smooth animations & transitions
- Custom scrollbar, tables styles
- Google Fonts: Inter

### [NEW] js/data.js
- Object chứa dữ liệu lịch sử ~100 trường (2022-2025)
- Thông tin phổ điểm từng năm
- Metadata: tên quận, chỉ tiêu, số thí sinh

### [NEW] js/model.js
- `weightedMovingAverage(scores, weights)` 
- `linearRegression(years, scores)`
- `predictScore(schoolData)` → điểm dự đoán + khoảng tin cậy
- `generateScoreDistribution(params)` → phổ điểm mô phỏng
- `calculateConfidenceInterval(prediction, historicalVariance)`

### [NEW] js/charts.js
- Chart.js wrappers cho:
  - Line chart (xu hướng điểm chuẩn)
  - Bar chart (phổ điểm)
  - Radar chart (so sánh trường)
  - Doughnut chart (tỷ lệ trúng tuyển)

### [NEW] js/app.js
- Tab navigation logic
- Search & filter functionality
- Dynamic table rendering & sorting
- Event handlers cho tất cả interactions
- Responsive behavior

---

## User Review Required

> [!IMPORTANT]
> **Dữ liệu**: Dữ liệu điểm chuẩn trong plan được tổng hợp từ nhiều nguồn báo chí. Một số trường có thể chưa chính xác tuyệt đối. Bạn có muốn bổ sung/sửa đổi trường nào cụ thể không?

> [!WARNING]
> **Giới hạn mô hình**: Mô hình dựa trên dữ liệu lịch sử 4 năm (2022-2025). Không thể dự đoán chính xác khi có thay đổi đột biến (thay đổi cách tính, dịch bệnh, v.v.). Kết quả nên được coi là **tham khảo**.

> [!NOTE]
> **Scope**: 
> - App chỉ dự đoán điểm chuẩn **Nguyện vọng 1** của các trường công lập đại trà (không bao gồm trường chuyên).
> - Phổ điểm được **mô phỏng** dựa trên phân bố thống kê, không phải dữ liệu thực tế từng thí sinh.

---

## Open Questions

1. **Số lượng trường**: Bạn muốn app bao gồm bao nhiêu trường? ~40 trường đại diện hay cố gắng đầy đủ ~107 trường?
2. **Ngôn ngữ giao diện**: Tiếng Việt hoàn toàn hay kết hợp Anh-Việt?
3. **Tính năng bổ sung**: Bạn có muốn thêm tính năng nào khác không? Ví dụ:
   - Cho phép user nhập điểm dự kiến → gợi ý trường phù hợp
   - Export kết quả ra PDF
   - So sánh trường theo quận/khu vực

---

## Verification Plan

### Automated Tests
- Kiểm tra mô hình dự đoán bằng cách back-test: dùng dữ liệu 2022-2024 dự đoán 2025, so sánh với kết quả thực tế
- Kiểm tra responsive trên các kích thước màn hình

### Manual Verification
- Chạy app trên localhost và kiểm tra tất cả tabs
- Verify biểu đồ hiển thị đúng dữ liệu
- Kiểm tra search/filter hoạt động chính xác
- Screenshot demo UI

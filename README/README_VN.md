# 🎓 Mô Hình Dự Đoán Điểm Chuẩn Tuyển Sinh Lớp 10 TPHCM 2026

*Đọc bằng ngôn ngữ khác: [English](README.md)*.

Dự án này là một ứng dụng Web tĩnh (Static Web App) giúp học sinh và phụ huynh tại Thành phố Hồ Chí Minh phân tích, định hướng và đưa ra các quyết định chọn trường cấp 3 an toàn, chính xác và bớt cảm tính hơn dựa trên cơ sở thống kê dữ liệu thật của 4 năm gần nhất (2022-2025).

Dự án hiện đã cập nhật danh sách đầy đủ **107 trường THPT công lập** tại TPHCM với điểm chuẩn chính thức mới nhất của năm 2025 (công bố 26/06/2025).

---

## Tính Năng & Trải Nghiệm (App Flow)

Ứng dụng được thiết kế dạng Single Page Application (SPA), phong cách "Kính mờ" (Glassmorphism) tone màu Cà Phê, giúp trải nghiệm mượt mà, chuyên nghiệp. Người dùng sẽ tương tác qua 6 Tab chức năng:

1. **📊 Dự Đoán Điểm Chuẩn:** Bảng tổng sắp 107 trường THPT với lịch sử điểm chuẩn, điểm dự đoán 2026, phân hạng sinh thái (Tier S, A, B, C), và độ tin cậy. Tích hợp biểu đồ xu hướng 4 năm cho từng trường (tương tác trực quan).
2. **🎯 Đánh Giá Khả Thi:** Học sinh nhập điểm giả định 3 môn và 3 trường nguyện vọng (NV). Hệ thống tính toán xác suất đậu từng nguyện vọng (áp dụng độ lệch chuẩn và penalty NV2, NV3) từ đó đưa ra lời khuyên "Rất an toàn" hay "Rủi ro".
3. **💡 Gợi Ý Nguyện Vọng:** Nhập tổng điểm và chọn quận mục tiêu. Ứng dụng quét database để gợi ý 3 "giỏ" trường: Vươn Cao - Vừa Sức - An Toàn ngay tại khu vực đó.
4. **📈 Phổ Điểm:** Dành cho việc nghiên cứu mặt bằng chung. Tab vẽ ra các đường cong hình chuông (Normal Distribution), so sánh độ khó của kì thi các năm.
5. **🧠 Tối Ưu NV:** Nhập điểm học kỳ 2, Trung bình cả năm tại trường cấp 2. Mô hình dùng "Ability Converter" chuyển đổi gắt gao x0.85 để ra điểm thực chiến, từ đó nhặt luôn cho bạn 3 trường tối ưu nhất làm NV1, NV2, NV3.
6. **📚 Ngân Hàng Đề Thi:** Nởi lưu trữ và đọc trực tiếp đề thi (Toán, Văn, Anh) tải về thông qua một Python Crawler `exams_crawler.py`. Nền tảng cho trợ lý ảo AI chấm điểm sau này.

---

## Kiến Trúc Thuật Toán Tích Hợp (Underneath the Hood)

Dự án vận hành dự đoán và phân loại hoàn toàn tự động bằng các thuật toán sau:

### 1. Mô Hình Dự Đoán Ensemble (Ensemble Prediction Model)
Khi tính toán điểm chuẩn 2026 cho 1 trường, hệ thống chạy 3 mô hình con và gộp lại với các trọng số chuẩn:
* **45% Weighted Moving Average (WMA):** Trung bình động có trọng số. Cấp trọng số giảm dần theo thời gian (2025=0.4, 2024=0.3, 2023=0.2, 2022=0.1).
* **35% Linear Regression (Hồi Quy Tuyến Tính):** Sử dụng Phương pháp bình phương tối thiểu để tìm đường giới hạn xu hướng dài hạn.
* **20% Cạnh Tranh Cục Bộ (Competition Effect):** Điều chỉnh điểm dựa trên biến động tỷ lệ chọi giữa tổng thí sinh và chỉ tiêu tuyển sinh cấp thành phố.

*Khoảng tin cậy (Confidence Interval):* Được thiết lập bất đối xứng (`-0.75 Điểm đến +0.50 Điểm` nhân với độ lệch chuẩn) để bảo vệ học sinh rớt bất chợt.

### 2. Mô Hình Rủi Ro Quy Chế (Penalized Probabilistic Model)
Áp dụng chặt chẽ quy chế thi của Sở GD&ĐT TP.HCM: rớt NV1 xét NV2 chịu thiệt thòi về độ ưu tiên. Thuật toán quy đổi độ khó này thành điểm: phạt `+0.75` cho NV2 và `+1.5` cho NV3 vào điểm chuẩn dự kiến để quyết định % khả thi.

### 3. Hệ Sinh Thái 8 Tiers (Ecosystem Tiering)
Toàn bộ 107 trường được ghim chặt vào hệ phân cấp 8 nấc (Từ S "Xuất sắc" >24đ đến C "Thấp" <12đ).

### 4. Thuật Toán Chuyển Đổi Năng Lực (Ability Converter)
Công thức mô phỏng "độ ngộp" từ đề thi trường sang đề Sở:
`Estimate = [(Điểm HK2 × 60%) + (Điểm TBCN × 40%)] × 0.85`

---

## Tự Động Hóa Dữ Liệu (Crawler Automation)

Dự án đi kèm một script lập trình sẵn bằng Python (`scripts/exams_crawler.py`) nhằm mục đích:
1. Quét kho dữ liệu PDF (nằm tại `data/raw_pdfs`).
2. Nhận dạng mẫu chuỗi thông tin (Môn học, Năm, Quận, Website nguồn) từ tên file thông qua biểu thức chính quy (Regex).
3. Đóng gói và xuất thành file CSDL `js/exams_data.js` để frontend tự động đọc và hiển thị.

## Cách Chạy (Deployment)
Code Front-End thuần Client-side (HTML/CSS/JS). Không áp dụng Node.js hay Database rời.
*   **Chạy Local:** Chạy trực tiếp qua Live Server trên VSCode, hoặc double-click `index.html`.
*   **Hosting:** Public trực tiếp lên nhánh `gh-pages` hoặc qua GitHub Pages ở branch `main`.

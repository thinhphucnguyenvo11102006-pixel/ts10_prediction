# Đánh Giá Chi Tiết Dự Án: TS10 Prediction (v2.0)

Tài liệu này cung cấp cái nhìn tổng quan kỹ thuật, đánh giá các thành phần cốt lõi và lộ trình phát triển cho ứng dụng dự đoán điểm chuẩn lớp 10 TPHCM.

---

## 1. Nguyên Lý Hoạt Động (Core Logic)

Ứng dụng vận hành dựa trên triết lý **"Dữ liệu dẫn dắt - Heuristic hiệu chỉnh"**. Điểm khác biệt lớn nhất là khả năng xử lý **Gãy cấu trúc (Structural Break)** năm 2025.

### Thuật toán Dự đoán: Anchor & Adjust (Mỏ neo & Điều chỉnh)
Thay vì sử dụng Hồi quy tuyến tính (Linear Regression) đơn thuần — vốn đã lỗi thời khi cấu trúc đề thi thay đổi hoàn toàn — mô hình sử dụng công thức:
`Score_2026 = Anchor_2025 + ΔCạnh_tranh + ΔThích_nghi + ΔXu_hướng_vi_mô`

*   **Anchor (Mỏ neo):** Lấy điểm chuẩn 2025 làm mốc chuẩn (năm đầu tiên của chương trình GDPT 2018).
*   **ΔCạnh tranh:** Tính toán dựa trên biến động tỷ lệ chọi (Thí sinh/Chỉ tiêu) giữa 2026 và 2025, có tính đến độ nhạy theo từng phân khúc trường (Tier).
*   **ΔThích nghi:** Mô phỏng sự phục hồi điểm số (Mean Reversion) trong năm thứ hai sau đổi mới, khi học sinh và giáo viên đã "bắt bài" được cấu trúc đề mới.
*   **ΔXu hướng vi mô:** Phân tích sự dịch chuyển vị thế tương đối của trường so với mặt bằng chung toàn thành phố qua 4 năm.
*   **Phân cụm tự động (AI Tiering):** Thay vì gán nhãn thủ công, hệ thống sử dụng thuật toán **K-Means Clustering** để chia 107 trường thành 8 nhóm (Tier) dựa trên sự kết hợp giữa điểm trung bình và độ biến động lịch sử.
*   **Chỉ số Ổn định (Stability Metrics):** Hệ thống đánh giá rủi ro dựa trên độ lệch chuẩn (Standard Deviation), giúp người dùng nhận diện các trường có biến động điểm mạnh (như *Nguyễn Thị Diệu* năm 2025).

### Mô hình Đánh giá Khả thi
*   Sử dụng **Hàm Logistic** để chuyển đổi biên độ (Margin) giữa điểm cá nhân và điểm dự báo thành điểm phần trăm rủi ro (1-99).
*   **Asymmetrical CI (Khoảng tin cậy bất đối xứng):** Thiết lập biên độ rộng hơn ở phía dưới và hẹp hơn ở phía trên (predicted -0.90σ đến +0.65σ) do điểm chuẩn thường có xu hướng "rớt" dễ hơn "tăng đột biến" vì hiệu ứng trần (ceiling effects).

---

## 2. Điểm Tốt (Strengths)

1.  **Thiết kế thẩm mỹ & Hiện đại (UX/UI):** Phong cách *Earth-tone Glassmorphism* với tông màu nâu cà phê/mocha tạo cảm giác chuyên nghiệp, không gây mỏi mắt và mang lại trải nghiệm cao cấp (Premium).
2.  **Xử lý bài toán đặc thù tốt:** Mô hình được thiết kế riêng để giải quyết sự thay đổi chương trình học năm 2025, giúp dự báo có độ tin cậy cao hơn các công cụ thống kê phổ thông.
3.  **Tính năng đầy đủ & Tập trung:** Cung cấp từ tra cứu đơn thuần đến tư vấn chiến lược (NV1-NV2-NV3) và trực quan hóa phổ điểm (Gaussian Distribution).
4.  **Hệ thống Tiering khoa học:** Tích hợp K-Means Clustering giúp việc phân loại trường mang tính khách quan, dựa trên dữ liệu phong độ thay vì cảm tính hay ngưỡng điểm cứng.
5.  **Cấu trúc dữ liệu sạch:** Dữ liệu được quản trị tập trung tại `data/schools.json` và đồng bộ qua script Python, giúp việc cập nhật hằng năm cực kỳ dễ dàng.
6.  **Hiệu năng vượt trội:** Là một SPA thuần (Static Web App), ứng dụng tải tức thì, không cần Server-side logic, đảm bảo tính riêng tư dữ liệu cho người dùng.

---

## 3. Điểm Cần Khắc Phục (Weaknesses)

1.  **Calibration Xác suất:** Con số phần trăm khả thi (ví dụ: 85%) hiện tại là một ước lượng logic; nó chưa được kiểm định (calibrated) dựa trên xác suất thống kê thực tế từ mẫu lớn dữ liệu lịch sử.
2.  **Ngân hàng đề thi (Exam Bank):** Hiện mới dừng lại ở mức giao diện bản mẫu (Demo UI); chưa có pipeline tự động hóa hoàn chỉnh để cập nhật link PDF và metadata đề thi thực tế.
3.  **Phụ thuộc CDN:** Việc tải `Chart.js` qua CDN khiến ứng dụng không thể hoạt động 100% offline nếu không có kết nối internet lần đầu.

---

## 4. Điểm Có Thể Cải Thiện (Future Improvements)

1.  **Tối ưu hóa PWA:** Thêm Manifest và Service Worker để biến ứng dụng thành PWA, cho phép cài đặt vào điện thoại và sử dụng mượt mà không cần browser shell.
3.  **Lưu trữ cục bộ (Local Persistence):** Sử dụng `localStorage` để lưu lại mức điểm và các lựa chọn của người dùng, giúp họ không phải nhập lại mỗi khi refresh trang.
4.  **Phân tích sâu theo Quận/Huyện:** Thêm bản đồ nhiệt (Heatmap) hoặc biểu đồ radar so sánh mức độ cạnh tranh giữa các khu vực trong thành phố.
5.  **Hoàn thiện Exam Bank:** Tích hợp script Python crawler để tự động cập nhật đề thi tham khảo từ các nguồn chính thống.

---

## 5. Cái Nhìn Tổng Quan (Overall Vision)

Tính đến thời điểm hiện tại, **TS10 Prediction** không chỉ là một công cụ tra cứu điểm mà đã trở thành một **Hệ thống Hỗ trợ Ra Quyết định (Decision Support System)** hoàn chỉnh. 

Dự án đã đạt được sự cân bằng giữa **Công nghệ dự báo** và **Nghệ thuật giao diện**. Tuy vẫn còn những điểm cần tinh chỉnh về mặt thống kê xác suất, nhưng đây hiện là một trong những giải pháp chuyển đổi số sâu sát và thực tiễn nhất cho học sinh lớp 9 tại TPHCM. Với lộ trình cải thiện về dữ liệu và tính năng offline, dự án hoàn toàn đủ khả năng triển khai rộng rãi cho công chúng.

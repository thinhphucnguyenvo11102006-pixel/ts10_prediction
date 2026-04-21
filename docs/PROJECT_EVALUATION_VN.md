# 📊 Đánh Giá Dự Án: AI Prediction Cho Tuyển Sinh Lớp 10 TPHCM

**Ngày đánh giá:** 20/04/2026  
**Quy mô dự án:** Web tĩnh (Static SPA) + Python Crawler Automations

Dưới đây là một đánh giá chi tiết và toàn diện về tổng thể kiến trúc, thuật toán, dữ liệu và giao diện cấu thành nên dự án này. Nhìn chung, dự án có **tính ứng dụng thực tiễn cực cao** và giải quyết trực diện và có tính khoa học "nỗi đau" chọn nguyện vọng của học sinh chuyển cấp tại TPHCM. 

---

## 🌟 NHỮNG ĐIỂM SÁNG (STRENGTHS)

### 1. Thuật Toán Rất Khoa Học Và Hợp Thực Tế
*   **Mô Hình Ensemble (Ensemble Model):** Sự kết hợp 3 nhánh thuật toán toán học cổ điển trong file `model.js`:
    *   *45% WMA (Trung bình động trọng số):* Chú trọng vào dữ liệu các năm gần nhất thay vì dàn trải.
    *   *35% Hồi quy tuyến tính (Linear Regression):* Bắt trend tăng giảm nhiều năm.
    *   *20% Hệ số Cạnh tranh (Competition Factor):* Cân bằng dựa trên lượng biến thiên cung-cầu tổng thí sinh và chỉ tiêu thành phố từ năm chốt dữ liệu đến năm dự báo.
*   **Khoảng tin cậy Bất đối xứng (Asymmetrical CI):** Việc bạn thiết lập cận dưới giảm sâu hơn cận trên (`low = predicted - 0.75*std` / `high = predicted + 0.50*std`) là một hướng đi **vô cùng tinh tế**. Điểm chuẩn hiếm khi tăng dựng đứng nhưng hoàn toàn có thể rớt sập sàn nếu format đề khó đi.
*   **Penalty NV2, NV3:** Cách tính hàm Khả thi (Feasibility) không chỉ so điểm trần, mà phạt độ khó +0.75đ vào NV2 và +1.5đ vào NV3. Điều này giả lập hoàn hảo luật rớt nguyện vọng của Sở GD&ĐT.

### 2. Dữ Liệu Chặt Chẽ, Phân Mảng Rõ Ràng (Data & Tiering)
*   **Hệ thống Tier S -> C (8 cấp độ):** Với danh sách khổng lồ **107 trường THPT công lập**, hệ thống màu sắc và mác phân cấp giúp học sinh lướt nhanh giao diện và chọn trường cực gọn, không cần tư duy từng 0.25 con số.
*   Dữ liệu được cập nhật đầy đủ đến tận **năm 2025 chính thức**, có cả những trường mới (Võ Văn Kiệt) hoặc những trường đổi tên/biến động quận huyện mới nhất (TP Thủ Đức).

### 3. Trải Nghiệm & Giao Diện Người Dùng (UI/UX)
*   Sử dụng UI phong cách **Glassmorphism (Kính Mờ)** trên nền "Earth-tone / Coffee tone" rất cao cấp, mang lại cảm giác dễ chịu, hàn lâm, giải tỏa áp lực trực quan khi người dùng theo dõi hàng khối các con số.
*   Flow người dùng hợp lý logic: Từ việc nhìn dữ liệu tổng (`Dự đoán`), tới kiểm tra tự bản thân (`Khả thi`), tới hỏi ý kiến máy (`Tối ưu/Gợi ý`).
*   Tích hợp thư viện Chart.js với phong cách radar / line cho từng ngôi trường một cách bóng bẩy.

---

## 🛠️ ĐIỂM YẾU & KHUYẾN NGHỊ CẢI THIỆN (WEAKNESSES & IMPROVEMENTS)

### 1. Nút Thắt Trong Pipeline Cào Dữ Liệu Đề Thi (Crawling Pipeline)
*   **Hiện trạng:** Ở module mới nhất "Ngân Hàng Đề", hệ thống đã có file Backend cào tên (`scripts/exams_crawler.py`), nhưng tính tự động bị đứt đoạn vì bạn đang phải tự đi lên web tải PDF bằng tay vào cục bộ (`data/raw_pdfs`).
*   **Giải pháp:** Hãy code hẳn một Crawler lấy URL từ các trang cho tải free (như download.vn), từ đó Python Bot tự chọc vào web, tự tải, tự quét regex rồi đổ JSON thẳng ra frontend.

### 2. Mô Hình Chỉ Dừng Ở ML Cổ Điển / Thiếu Lõi AI Sinh Tạo (Generative AI)
*   **Hiện trạng:** Tên dự án là "AI Prediction", tuy nhiên chữ thuật toán bên dưới chỉ đang là Toán thống kê (Statistics). Tính năng đỉnh cao là "AI Tutor" để chấm bài Văn hay giải Toán chưa được bắt tay vào code.
*   **Giải pháp:** Nâng nền dự án bằng cách tích hợp Google Gemini API vào Sidebar của khung đọc PDF (`index.html`). Nó sẽ chịu trách nhiệm đọc OCR đề thi hiển thị và đóng vai người thầy. Nhờ "Earth tone" sẵn có, màn hình chat ở đó sẽ cực kỳ đẹp.

### 3. Xử Lý Rủi Ro Khuyết Dữ Liệu Cũ (Handling Missing Data)
*   **Hiện trạng:** Code hồi quy và trung bình động trong `model.js` giả định đa số trường có đủ thông tin 4 năm lịch sử. Tuy nhiên với 1 số trường quá mới gộp lại (chỉ có data 2025/2024), hồi quy có thể chạy ra sai số vô hình và làm sai lệch biểu đồ.
*   **Giải pháp:** Áp hàm fallback an toàn. Khi trường có `length(scores) < 3`, hãy loại bỏ trọng số Hồi quy, chỉ dựa vào 80% điểm trung bình + 20% hệ số cạnh tranh chung.

### 4. Tính Linh Hoạt Thay Đổi Về Hệ Số 2026
*   **Hiện trạng:** Thông số 169.000 thí sinh chọi 118.000 vé công lập năm 2026 hiện đang *hard code* cứng trong `data.js`.
*   **Giải pháp:** Sở GD&ĐT thường thay đổi chỉ tiêu liên tục từ T5-T6. Hãy thiết kế một hộp nhập số (Input box góc trên màn hình) cho phép user tự thay đổi "Tổng Học Sinh / Chỉ Tiêu Lớp 10 Năm Nay", app sẽ re-render realtime lại mọi bảng điểm chuẩn theo hiệu ứng domino bọt nước. 

---

## 🎓 CHẤM ĐIỂM TỔNG QUAN: 9.0 / 10
Dự án có cấu trúc HTML/CSS/JS tĩnh nhưng độ liên kết (state management) và kịch bản (features/algorithms) được dàn dựng y hệt một hệ thống backend thương mại phức tạp. **Rất đáng giá làm sản phẩm core!**

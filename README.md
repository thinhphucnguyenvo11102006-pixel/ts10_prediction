# 🎓 Mô Hình Dự Đoán Điểm Chuẩn Tuyển Sinh Lớp 10 TPHCM 2026

Dự án này là một ứng dụng Web tĩnh (Static Web App) giúp học sinh và phụ huynh tại Thành phố Hồ Chí Minh phân tích, định hướng và đưa ra các quyết định chọn trường cấp 3 an toàn, chính xác và bớt cảm tính hơn dựa trên dữ liệu thật của 4 năm gần nhất (2022-2025).

---

## 🚀 Cách Thức Hoạt Động (App Flow)

Ứng dụng là một trang Single Page Application (SPA), nghĩa là chỉ cần tải đúng 1 lần và mọi thao tác chuyển trang/hiển thị biểu đồ đều mượt mà không cần load lại web. Người dùng sẽ tương tác thông qua 5 Tab chức năng tuần tự:

1. **Tab 1 - Khám Phá Data (Dự Đoán Điểm Chuẩn):** Bảng tổng sắp 114 trường cấp 3 với lịch sử điểm chuẩn, điểm dự đoán 2026, phân hạng (Tier), và độ tin cậy. (Có chức năng nhấp vào trường để xem biểu đồ đường đi của điểm).
2. **Tab 2 - Đánh Giá Khả Thi:** Nhập trực tiếp 3 nguyện vọng (NV) học sinh tính chọn, cùng điểm giả định. App tính toán cụ thể % đậu từng nguyện vọng và tư vấn chiến lược đang đi đúng hay sai.
3. **Tab 3 - Gợi Ý Hệ Sinh Thái Theo Quận:** Điền tổng điểm, chọn khu vực sống. App quét qua database để "bốc" ra các trường xung quanh khu vực đó sao cho phân bậc vừa vặn thành 3 giỏ: Vươn Cao - Vừa Sức - An Toàn.
4. **Tab 4 - Bức Tranh Phổ Điểm:** Dành cho phụ huynh thích nghiên cứu. Tab này vẽ ra các đường cong hình chuông, so sánh xu hướng khó/dễ của kì thi các năm để nhìn nhận "mặt bằng chung".
5. **Tab 5 - Tối Ưu Chiến Lược (Tối Ưu NV):** Dành cho học sinh chưa thi chuyển cấp. 
    * *Flow:* Nhập ngay điểm trên trường (HK2, TBCN) -> App sẽ chuyển đổi qua "điểm thi thực tế" -> Engine tư vấn sẽ nhặt luôn cho bạn 3 trường tối ưu nhất (NV1, NV2, NV3) kèm 10 lựa chọn sơ cua y chang mức điểm đó.

---

## 🧠 Các Thuật Toán Chi Tiết (Underneath the Hood)

Dự án này không phải một bảng tra cứu excel đơn thuần. Nó vận hành trên các quy luật thống kê. Dưới đây là kiến trúc thuật toán chi tiết. 

### 1. Mô Hình Dự Đoán Ensemble (Ensemble Prediction Model)
Nằm trong `model.js`, khi tính toán điểm chuẩn 2026 cho 1 trường, App luôn chạy 3 mô hình song song và gộp lại (Ensemble):

* **45% Weighted Moving Average (WMA):** Trung bình động có trọng số. Cấp trọng số giảm dần theo thời gian (2025 x 4, 2024 x 3, 2023 x 2, 2022 x 1). Lí do: Chuyện năm trước luôn phản ánh đúng nhất tình thế của năm sau, thay vì cào bằng với năm quá khứ xa.
* **35% Linear Regression (Hồi Quy Tuyến Tính):** Sử dụng `Least Squares Method` (Phương pháp bình phương tối thiểu) để tìm ra đường thẳng trend-line của trường qua 4 năm. Nó trả lời cho câu hỏi: "Trường này đang trên đà từ từ tụt dốc hay là năm sau sẽ tiếp tục lội ngược dòng lên điểm cao?".
* **20% Cạnh Tranh Cục Bộ (Competition Effect):** Phân tích biến động "sốc". Nếu một trường vừa giảm sâu điểm năm ngoái, năm nay tâm lý chung đám đông sẽ ùa vào nộp, gây tăng điểm ảo.

*Khoảng tin cậy (Confidence Interval):* Mô hình tính độ lệch chuẩn ($\sigma$) của điểm 4 năm qua. Các khoảng sai số đệm dao động trong ngưỡng `± 1.6 \sigma` để quét mọi rủi ro dao động từ 1.5 đến 2.5 điểm.

### 2. Mô Hình Rủi Ro Quy Chế (Penalized Probabilistic Model)
Áp dụng chặt chẽ quy chế tuyển sinh TP.HCM: Rớt NV1 xuống xét NV2 bị chịu thiệt `+ 0.5 điểm`, rớt tiếp NV3 thì điểm xét vớt thường cao hơn `+ 1.0` hoặc `+ 1.5`.

* Khi chạy Evaluate (Khả Thi), app tự thiết lập "Điểm Chuẩn Chống Lại Thí Sinh" trên từng nguyện vọng: `Effective Threshold = Predicted + (NV_Index * 0.75)`.
* Trả về xác suất %: `Diff >= 2.5 (95% - Rất An toàn), Diff >= 1.5 (85% - An Toàn), Diff >= -1.0 (30% - Rủi Ro)`

### 3. Thuật Toán Hệ Sinh Thái Trường (Ecosystem Tiering)
Thay vì thuật toán "Nearest Match" (Tìm số gần nhất), tôi tự động nhúng hệ sinh thái trường vào hệ phân cấp 8 nấc vĩnh viễn (Tier S, A+, A, A-, B+, B, B-, C).
* Khi học sinh đề nghị xin Gợi ý, trường được pick từ các Tier cụ thể để đảm bảo: **1 trường phải rớt xuống dưới năng lực 2.5+ điểm** thì mới được coi là Nguyện Vọng 3.

### 4. Normal Distribution Function (Hàm Mật Độ Phân Phối Chuẩn)
Dùng tại Tab 4 (Phổ Điểm). Để vẽ được đường cong phân bố, tôi đã xây dựng hàm `gaussian(x, mean, stdDev)`.
```javascript
const exponent = Math.exp(-Math.pow(x - mean, 2) / (2 * Math.pow(stdDev, 2)));
return (1 / (stdDev * Math.sqrt(2 * Math.PI))) * exponent;
```
Biểu diễn hình ảnh phân hóa học sinh rất sát với các mẫu dữ liệu khổng lồ ngoài đời thực.

### 5. Thuật Toán Chuyển Đổi Năng Lực (Ability Converter)
Ở Tab 5, làm sao biết 8.0 Toán lớp 9 thì thi rụng xuống còn mấy điểm?
Công thức: `Estimate = [(Điểm HK2 × 60%) + (Điểm TBCN × 40%)] × 0.85`
* Đặt 60% vào HK2 vì format đó giống thi tuyển 10 nhất.
* Cấp hệ số "Trừ hao Độ khó phòng thi" là **0.85**, vì thi tuyển 10 khắc nghiệt hơn kiểm tra ở trường rất nhiều. (Nếu điền đều 10 phẩy, điểm tối đa vớt ra được chỉ là 25.5 chứ không thể là 30).

---

## 🛠 Cách Chạy / Triển Khai (Deployment)
Code thuần Client-side (HTML/CSS/JS). Không Node.js, Không Database.
*   **Chạy Local:** Double-click file `index.html` hoặc dùng `Live Server` trong VSCode.
*   **Hoặc truy cập Live Link trên GitHub Pages:** `https://tên_của_bạn.github.io/ts10_prediction/`

*Đây là một dự án mở, cung cấp những góc nhìn công cụ số mạnh mẽ cho những mùa thi chuyển cấp.*

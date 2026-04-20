# TS10 Prediction

*Đọc bằng [English](README.md).*

`TS10 Prediction` là một ứng dụng web tĩnh hỗ trợ học sinh và phụ huynh tại TP.HCM tra cứu dữ liệu tuyển sinh lớp 10, ước lượng điểm chuẩn năm 2026, và tham khảo chiến lược chọn nguyện vọng.

Phiên bản hiện tại phù hợp nhất khi được mô tả là một **SPA tư vấn dựa trên dữ liệu** viết bằng HTML, CSS và JavaScript thuần. Ứng dụng kết hợp dữ liệu lịch sử, các công thức thống kê đơn giản, và biểu đồ trực quan để hỗ trợ so sánh trường, đánh giá mức độ khả thi, và gợi ý phương án nộp hồ sơ.

## Phạm Vi Hiện Tại

Ứng dụng hiện có 6 tab chính:

1. `Dự đoán điểm chuẩn`: xem lịch sử điểm chuẩn, điểm dự đoán 2026, xu hướng, và biểu đồ chi tiết cho từng trường.
2. `Đánh giá khả thi`: nhập điểm 3 môn và các nguyện vọng để nhận đánh giá rủi ro đậu/rớt.
3. `Gợi ý theo quận`: lọc danh sách trường theo quận/huyện và so sánh với tổng điểm đã nhập.
4. `Phổ điểm`: trực quan hóa phổ điểm lịch sử và dự đoán bằng các biểu đồ dạng phân phối chuẩn.
5. `Tối ưu nguyện vọng`: ước lượng điểm thi từ điểm HK2 và TBCN rồi đề xuất bộ 3 nguyện vọng tham khảo.
6. `Ngân hàng đề`: giao diện thư viện đề thi ở giai đoạn sớm, dùng dữ liệu được sinh ra từ script hỗ trợ.

## Công Nghệ Sử Dụng

- `HTML5`, `CSS3`, `Vanilla JavaScript`
- `Chart.js` tải qua CDN
- Python script cục bộ để sinh dữ liệu cho module ngân hàng đề

## Cấu Trúc Dự Án

- [index.html](index.html) - khung giao diện và bố cục các tab
- [css/style.css](css/style.css) - hệ thống giao diện và responsive layout
- [js/data.js](js/data.js) - dữ liệu tĩnh, metadata trường, tham số phổ điểm
- [js/model.js](js/model.js) - logic dự đoán và gợi ý
- [js/charts.js](js/charts.js) - lớp bọc cho Chart.js
- [js/app.js](js/app.js) - state UI, render, và xử lý tương tác
- [scripts/exams_crawler.py](scripts/exams_crawler.py) - script hỗ trợ sinh `js/exams_data.js`

## Cách Mô Hình Hoạt Động Ở Thời Điểm Hiện Tại

Lõi dự đoán hiện nay là heuristic thống kê, chưa phải mô hình machine learning đã huấn luyện.

- Trung bình động có trọng số ưu tiên các năm gần nhất.
- Hồi quy tuyến tính ước lượng xu hướng ngắn hạn từ dữ liệu lịch sử.
- Hệ số cạnh tranh đang dùng tỷ lệ thí sinh/chỉ tiêu ở cấp toàn thành phố.
- Phần đánh giá khả thi và gợi ý đang dựa trên các luật score margin, không phải xác suất đã hiệu chỉnh.

Điều này giúp ứng dụng hữu ích cho mục đích tham khảo và thảo luận chiến lược, nhưng nên được xem là **công cụ hỗ trợ quyết định**, không phải hệ thống dự báo chính thức.

## Trạng Thái Dữ Liệu

- Dữ liệu lịch sử hiện đang được lưu trực tiếp trong `js/data.js`.
- Dataset đang ship trong repo hiện có **107 trường**.
- Module ngân hàng đề vẫn đang ở giai đoạn sớm/demo, chưa phải pipeline thu thập dữ liệu tự động hoàn chỉnh.

## Cách Chạy Cục Bộ

Bạn có thể chạy project theo một trong hai cách:

1. Mở trực tiếp [index.html](index.html) trong trình duyệt.
2. Dùng static server cục bộ như VS Code Live Server để phát triển thuận tiện hơn.

## Giới Hạn Hiện Tại

- Ứng dụng đang phụ thuộc `Chart.js` qua CDN nên chưa hoàn toàn tự chứa để chạy offline tuyệt đối.
- Các con số “xác suất” hiện là mức phân loại rủi ro theo ngưỡng điểm, chưa phải xác suất thống kê đã được calibration.
- Tier của trường hiện được định nghĩa trong dữ liệu, chưa được sinh ra động bằng thuật toán phân cụm.
- Script crawler đề thi hiện chỉ quét file local và sinh metadata; chưa tự crawl nguồn ngoài.

## Tài Liệu Liên Quan

- [README.md](README.md) - bản tiếng Anh
- [README/REQUIRED_FIXES_VN.md](README/REQUIRED_FIXES_VN.md) - danh sách ưu tiên các hạng mục cần chỉnh sửa
- [README/PROJECT_EVALUATION_VN.md](README/PROJECT_EVALUATION_VN.md) - ghi chú đánh giá nội bộ

## Định Hướng Tiếp Theo

Project hiện đã đủ tốt để làm demo hoặc công cụ tham khảo có giao diện chỉn chu. Bước tiếp theo nên tập trung vào quản trị dữ liệu, kiểm định mô hình, đồng bộ lại tài liệu với code, và hoàn thiện pipeline ngân hàng đề để tăng độ tin cậy khi đưa ra public.

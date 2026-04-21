# Những Gì Cần Chỉnh Sửa

File này tổng hợp các hạng mục nên ưu tiên để nâng `TS10 Prediction` từ bản demo/tham khảo thành một sản phẩm đáng tin cậy hơn.

## Ưu Tiên Cao

1. Đồng bộ lại tài liệu với code thực tế.
   README, mô tả UI, và các claim về "AI", "xác suất", "tự động" cần phản ánh đúng implementation hiện tại.

2. Kiểm kê và chuẩn hóa dữ liệu trường.
   Cần xác nhận lại số trường thực tế, nguồn từng bản ghi, các trường thiếu dữ liệu, và các outlier trước khi tiếp tục mở rộng mô hình.

3. Thêm bước validation cho mô hình dự báo.
   Cần có backtest kiểu dự đoán 2025 từ dữ liệu các năm trước để đo sai số và biết mô hình hiện đang tốt đến đâu.

4. Đổi cách biểu đạt "xác suất đậu".
   Nếu chưa có calibration thống kê, nên dùng các nhãn như `mức độ khả thi` hoặc `mức rủi ro` thay vì thể hiện như xác suất chính xác.

5. Tách dữ liệu khỏi `js/data.js`.
   Nên chuyển sang JSON hoặc CSV có schema rõ ràng để dễ cập nhật, kiểm tra, và tái sử dụng.

## Ưu Tiên Trung Bình

6. Refactor `app.js` thành các khối render nhỏ hơn.
   Hiện file đang xử lý quá nhiều template string lớn, khiến việc bảo trì và kiểm thử khó hơn về lâu dài.

7. Chuẩn hóa cách sinh `tier`.
   Hoặc viết thuật toán sinh tier từ dữ liệu, hoặc ghi rõ trong tài liệu rằng tier đang là nhãn gán tay.

8. Hoàn thiện module ngân hàng đề.
   Cần crawl thật, quản lý metadata tốt hơn, tránh chỉ dừng ở dữ liệu demo hoặc file local scan.

9. Đóng gói dependency để chạy offline đúng nghĩa.
   Nếu muốn giữ claim offline, nên localize `Chart.js` thay vì chỉ dùng CDN.

10. Bổ sung test cho logic cốt lõi.
    Nên có test cho WMA, hồi quy, range dự đoán, penalty NV, và công thức ước lượng điểm đầu vào.

## Ưu Tiên Thấp Nhưng Nên Làm

11. Tăng khả năng giải thích kết quả cho người dùng.
    Ví dụ: hiển thị rõ vì sao một trường được gợi ý, vì sao một nguyện vọng bị xếp vào nhóm rủi ro.

12. Làm rõ trạng thái từng module trong UI.
    Những phần còn beta/demo như `Ngân hàng đề` hoặc `AI tutor` nên có badge trạng thái riêng để tránh kỳ vọng sai.

13. Chuẩn hóa quy trình cập nhật dữ liệu hằng năm.
    Nên có checklist cập nhật cho năm mới: chỉ tiêu, số thí sinh, cutoff chính thức, nguồn dẫn, và kiểm tra lại mô hình.

## Kết Quả Mong Muốn

Khi hoàn thành các hạng mục trên, project sẽ:

- minh bạch hơn với người dùng,
- dễ bảo trì hơn với người phát triển,
- đáng tin hơn về mặt dữ liệu,
- và sẵn sàng hơn để public như một công cụ tham khảo nghiêm túc.

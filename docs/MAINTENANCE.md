# Maintenance Checklist - TS10 Prediction

Tài liệu này hướng dẫn cách bảo trì, cập nhật số liệu hằng năm để ứng dụng tiếp tục hoạt động dự đoán chính xác cho các lứa học sinh tiếp theo.

## Lịch trình Cập nhật Hằng Năm

### Tháng 3-4: Chuẩn bị cho kỳ thi mới
1. **Dữ liệu tổng quan:** Cập nhật file `data/exam_stats.json` với số liệu do Sở GD&ĐT công bố:
   - Tổng số thí sinh dự thi (candidates).
   - Tổng chỉ tiêu tuyển sinh công lập (quota).
2. **Kiểm tra Backtest:**
   - Mở Console trình duyệt, chạy `Backtest.run()`.
   - Xem sai số MAE. Nếu MAE > 1.5, cần xem xét điều chỉnh hệ số hồi quy trong `js/model.js`.
3. **Cân chỉnh hệ số rủi ro (Nâng cao):**
   - Vào `js/model.js` hàm logistic: `100 / (1 + Math.exp(-1.15 * (margin - 0.15)))`.
   - Nếu đề năm nay đổi cấu trúc (tăng độ khó/dễ đột biến), có thể chỉnh `offset` `0.15` để dời phổ xác suất.

### Tháng 6-7: Cập nhật dữ liệu thực tế sau thi
1. **Dữ liệu điểm chuẩn:** Cập nhật file `data/schools.json`.
   - Điền đầy đủ điểm chuẩn NV1 của năm vừa thi.
   - Sửa `source_confidence` của năm đó thành `official`.
2. **Dữ liệu phổ điểm:** Cập nhật tham số phổ điểm `data/exam_stats.json` dựa vào báo cáo của Sở (Mean và Std).
3. **Chạy Build Script:**
   - Chạy lệnh `python scripts/build_data.py` để sinh ra file `js/data.js` mới kèm Tier tự động được tính lại.
   - Kiểm tra xem danh sách Tier S, A, B, C có phân bổ đồng đều không.

## Kiểm tra chung tính vẹn toàn
- [ ] Tổng số trường khớp với danh sách công bố của Sở GD&ĐT TPHCM (Không thiếu cơ sở 2, không sai tên).
- [ ] ID của trường luôn là số nguyên tăng dần duy nhất. Việc chèn trường mới vào giữa cần script re-index (`scripts/reindex.py` nếu có).
- [ ] Tracking và thông báo lỗi hiển thị minh bạch. Check `console.error` trên browser devtools.

# Project Evaluation - AI Prediction for TS10

## 1) Executive Summary

Dự án đang ở trạng thái **functional beta mạnh**: trải nghiệm người dùng tốt, core prediction hoạt động ổn, và đã có nền tảng dữ liệu/pipeline để tiếp tục mở rộng.

Hiện tại phù hợp cho mục tiêu:
- Hỗ trợ ra quyết định cho học sinh/phụ huynh.
- Thử nghiệm nhanh các cải tiến thuật toán.
- Xây tiếp Exam Bank theo hướng sản phẩm thực tế.

Chưa sẵn sàng cho mục tiêu:
- Vận hành quy mô lớn đa tài khoản ngay lập tức.
- Cam kết mức độ chính xác kiểu production-grade có SLA.

## 2) Current Architecture and Flow

### Architecture
- Frontend static SPA: `index.html` + `js/*.js` + `css/*`.
- Data pipeline: `data/*.json` -> `scripts/*.py` -> `js/data.js`.
- Prediction chạy client-side trong `js/model.js`.
- Exam Bank hiện ở mức beta với dữ liệu và crawler/script hỗ trợ.

### Runtime flow
- `App.init()` load dữ liệu -> chạy dự báo -> render tabs/charts -> bind actions.
- Tính năng đã tách module cho các tab mới (`js/tabs/*`), nhưng phần logic ở `js/app.js` vẫn còn khá dày.

## 3) What Is Working Well

- Thuật toán đã đi đúng hướng với bối cảnh structural break (không còn phụ thuộc hoàn toàn vào linear regression).
- UX/UI rõ ràng, dễ dùng, đáp ứng đúng nhu cầu người dùng mục tiêu.
- Bộ tính năng đủ rộng: dự báo, feasibility, recommendation, distribution, optimize, exam bank.
- Có script dữ liệu và tài liệu vận hành, thuận lợi cho bảo trì theo mùa tuyển sinh.

## 4) Key Gaps To Improve

### High Priority
- **Model validation chưa tự động hóa**: có backtest trong DevTools nhưng chưa thành quality gate định kỳ.
- **Risk communication**: điểm khả thi dạng % dễ bị hiểu nhầm là xác suất đã calibrated.
- **Data quality guardrails**: cần validate schema/range/missing trước khi build output.
- **Observability**: chưa có hệ thống theo dõi drift/sai số/lỗi dữ liệu nhất quán.

### Medium Priority
- Refactor tiếp `js/app.js` theo module để giảm coupling.
- Chuẩn hóa môi trường Python (`requirements.txt` hoặc `pyproject.toml`).
- Nâng mức logging cho scripts xử lý dữ liệu.

### Low Priority
- Lưu trạng thái người dùng cục bộ (local persistence).
- Bổ sung dashboard "model health" trong UI.

## 5) New Features With High Product Value

### A. Scenario Simulator (High)
- Cho người dùng điều chỉnh giả định cạnh tranh (candidates/quota) và xem tác động ngay lên điểm dự báo.
- Giá trị: tăng khả năng ra quyết định trong điều kiện bất định.

### B. Portfolio NV Optimizer 2.0 (High)
- Tối ưu NV theo chiến lược: an toàn/cân bằng/tham vọng.
- Cho phép thêm ràng buộc theo quận, khoảng điểm, mức rủi ro.

### C. Explainability Panel (Medium)
- Giải thích decomposition dự báo: anchor, trend, competition adjustment, confidence.
- Giá trị: tăng niềm tin và giảm cảm giác "black box".

### D. Exam Bank Productionization (High)
- Hoàn thiện metadata chuẩn, ingest pipeline, và quy trình update nội dung ổn định.
- Đây là mốc quan trọng trước khi chuyển kiến trúc.

## 6) Migration Readiness: Static -> Hybrid/Backend

## Verdict
Dự án **đủ ổn để bắt đầu planning migration**, nhưng nên theo chiến lược "feature-driven migration", không chuyển kiến trúc ồ ạt.

## Recommended sequence
1. Hoàn thiện Exam Bank ở mức production-ready nhẹ.
2. Nâng backtest manual thành validation có artifact theo phiên bản dữ liệu/model.
3. Sau đó mới triển khai backend cho auth + user data + exam content lifecycle.

## Trigger to migrate
Bắt đầu migration khi có 1-2 nhu cầu sau:
- Cần đăng nhập và đồng bộ dữ liệu người dùng đa thiết bị.
- Cần moderation/workflow nội dung Exam Bank theo vai trò.
- Cần ingest tự động và giám sát vận hành ổn định.
- Cần phân tích usage/model health ở mức hệ thống.

## 7) Suggested 3-Sprint Plan

### Sprint 1 (Stability)
- Data validation gates.
- Backtest reporting baseline.
- Wording/risk communication cleanup.

### Sprint 2 (Maintainability)
- Refactor module hóa `app.js`.
- Chuẩn hóa tooling Python và docs vận hành.

### Sprint 3 (Growth)
- Scenario Simulator.
- Portfolio NV Optimizer 2.0.
- Hoàn thiện Exam Bank pipeline mức production-lite.

## 8) Final Assessment

Dự án đang ở vị trí rất tốt để chuyển từ "công cụ dự báo tĩnh chất lượng cao" sang "nền tảng hỗ trợ tuyển sinh có khả năng mở rộng". Cách đi an toàn nhất là hoàn tất Exam Bank + quality gates trước, rồi nâng cấp kiến trúc theo nhu cầu thật thay vì over-engineer sớm.

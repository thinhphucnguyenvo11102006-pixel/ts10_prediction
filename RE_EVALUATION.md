# Re-evaluation — Ngân hàng đề & Crawler (đợt chỉnh sửa v4)

Tài liệu này **đánh giá lại** các thay đổi đã triển khai cho: pipeline crawler, dữ liệu `exams_data.js`, thư mục `pdfs/`, và UI tab Exam Bank (nút tải PDF, bộ lọc môn).

**Phạm vi đánh giá:** so với trạng thái trước đợt chỉnh sửa (beta: gán sai `district: TPHCM`, `pdfUrl` trỏ trang HTML, không lọc đề học kì, một nguồn chính).

---

## 1) Mục tiêu yêu cầu vs kết quả

| Yêu cầu | Trước | Sau | Ghi chú |
|---------|--------|-----|---------|
| Chỉ đề **TPHCM** | Gán cứng TPHCM dù tiêu đề tỉnh khác | Lọc `is_tphcm()` + blacklist tỉnh | Đạt — giảm false positive địa phương. |
| Chỉ **tuyển sinh / thi vào lớp 10** | Không phân biệt học kì / cuối kì | `is_lop10_entrance()` + blacklist pattern học kì | Đạt — loại đề cuối kì, kiểm tra định kì. |
| Chỉ **Toán, Văn, Anh** | Nhiều môn + nút lọc Vật/Hóa | Crawler chỉ nhận 3 môn; UI bỏ nút môn thừa | Đạt — phạm vi rõ. |
| **PDF thật**, không nhúng trang web | `pdfUrl` = URL bài viết `.html` | Resolve PDF + lưu `pdfs/*.pdf`, `pdfUrl` tương đối | Đạt — iframe và download dùng cùng file. |
| **Nút tải về** | Chỉ xem trong iframe | Nút modal + nút trên card + `download` attribute | Đạt — UX rõ ràng hơn. |
| **Nhiều web** | Chủ yếu một category URL | toanmath search + tailieudieuky + seed LangGo / TLGD | **Một phần** — Văn vẫn ít nguồn ổn định so Toán/Anh (xem mục 4). |

---

## 2) Đánh giá định lượng (snapshot sau chạy pipeline)

Các con số dưới đây phản ánh **một lần** chạy crawler thành công trên môi trường dev (có thể thay đổi theo thời điểm nguồn web cập nhật).

| Chỉ số | Giá trị |
|--------|----------|
| Tổng ứng viên sau crawl (thô) | ~80–82 |
| Giữ sau filter (TPHCM + lớp 10 + 3 môn) | ~21 |
| Loại: ngoài HCM | ~22 |
| Loại: không phải tuyển sinh 10 | ~38–39 |
| Đề xuất bản ghi cuối (`exams_data.js`) | 21 |
| Phân bố môn (tham chiếu) | Toán ~18, Anh ~2, Văn ~1 |
| Dung lượng PDF trong repo | ~76 MB (21 file) |
| ID duy nhất | Có — derive từ URL bài gốc |

**Nhận xét:** tỷ lệ loại cao (~75% ứng viên thô) là **hợp lý** nếu mục tiêu là chất lượng và đúng phạm vi; trade-off là cần thêm nguồn/seed để tăng số lượng Văn/Anh mà vẫn giữ filter chặt.

---

## 3) Đánh giá chất lượng kỹ thuật

### Điểm mạnh

- **Pipeline rõ ràng** (search → publish), dễ debug từng bước log.
- **Tách filter địa lý / filter loại kỳ thi / filter môn** — dễ tinh chỉnh regex mà không đụng phần tải file.
- **Id ổn định** theo URL — merge lần chạy sau không làm “nhảy” id, lượt tải/xem nhất quán hơn timestamp-id.
- **Hỗ trợ embed pdfjs** (`?file=` percent-encoded) — cần cho một số host (VD: Wasabi qua TLGD).
- **UI download** không phụ thuộc extension trình duyệt ngoài hành vi chuẩn của thẻ `<a download>`.

### Rủi ro & hạn chế

| Rủi ro | Mức độ | Giảm thiểu đề xuất |
|--------|--------|---------------------|
| Regex/HTML thay đổi layout site | Trung bình | Thêm test nhỏ hoặc snapshot HTML mẫu; giữ seed URL đã kiểm tay. |
| Signed URL / timeout S3 | Trung bình | Tăng timeout (đã nâng 30s/90s); có thể retry 2–3 lần. |
| Google Drive consent page | Cao với link `uc?export=download` | Tránh seed Drive “confirm”; ưu tiên PDF trực tiếp hoặc host ổn định. |
| `tailieudieuky.com/?s=` không trả article grid | Đã quan sát | Giữ seed bài đơn hoặc tìm URL category cố định nếu có. |
| Bản quyền phân phối PDF | Pháp lý / uy tín | Ghi rõ nguồn `sourceUrl` (đã có); cân nhắc disclaimer trong UI. |

### Độ tin cậy filter môn

- Thứ tự regex ưu tiên **Anh → Văn → Toán** giảm nhầm khi tiêu đề dài.
- Tiêu đề chỉ “tuyển sinh lớp 10” mà **không** ghi môn có thể bị gán Toán mặc định ở tầng publish fallback — **rủi ro thấp** nếu nguồn luôn ghi “Toán/Văn/Anh” trong title (đang là case chính).

---

## 4) Đánh giá sản phẩm (UX)

| Hạng mục | Điểm (1–5) | Ghi chú |
|----------|------------|---------|
| Đúng phạm vi đề (HCM + lớp 10) | 5 | Filter chặt, giảm “rác” học kì. |
| Đa dạng môn | 3 | Toán dồi dào; Anh/Văn phụ thuộc seed — cần bổ sung nguồn. |
| Tải / xem PDF | 5 | Local PDF + download + iframe. |
| Khả năng bảo trì | 4 | Env vars tốt; nên thêm CI chạy crawler dry-run định kỳ (optional). |

---

## 5) Khuyến nghị bước tiếp (ưu tiên)

1. **Bổ sung 5–10 seed Văn TPHCM** (bài đơn, PDF ổn định) — tác động lớn nhất tới độ đầy đủ.
2. **Retry download** (exponential backoff) cho host S3 chậm.
3. **Cập nhật README.md** phần “Limitations” cũ (đã lỗi thời so với crawler hiện tại) — đồng bộ với `README_EXAM_PIPELINE.md`.
4. (Tuỳ chọn) **Giới hạn kích thước PDF** commit để repo không phình quá nhanh.

---

## 6) Kết luận

Đợt chỉnh sửa **đạt mục tiêu cốt lõi**: đúng địa bàn, đúng loại kỳ thi lớp 10, đúng ba môn ở tầng crawler/UI, PDF thực sự phục vụ xem và tải, pipeline có thể mở rộng bằng env/seed. Điểm cần cải tiếp tiếp theo chủ yếu là **độ phủ Văn/Anh** và **khả năng chống chịu** khi layout nguồn thay đổi.

**Phiên bản tham chiếu:** crawler banner `v4.0`, commit có thể tra trên `main` kèm message `feat(exams): lop-10-entrance-only filter, 3 subjects, download button, multi-source`.

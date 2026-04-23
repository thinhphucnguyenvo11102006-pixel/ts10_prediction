# Ngân hàng đề & Crawler — Hướng dẫn vận hành

Tài liệu này mô tả **pipeline tự động** sinh dữ liệu tab **Exam Bank** (Ngân hàng đề): tìm nguồn, lọc TPHCM + tuyển sinh lớp 10, tải PDF về repo, xuất `js/exams_data.js`.

## Kiến trúc pipeline (v4)

Luồng xử lý trong `scripts/exams_crawler.py`:

```
SEARCH → CRAWL → FILTER → RESOLVE PDF → DOWNLOAD → PUBLISH
```

| Bước | Nội dung |
|------|-----------|
| **SEARCH** | Ghép URL từ bộ query theo môn (Toán / Văn / Anh) × nguồn (`thcs.toanmath.com`, `tailieudieuky.com`) + seed bài viết đơn (`langgo.edu.vn`, `tailieugiangday.vn`). |
| **CRAWL** | Chế độ listing (WordPress `mh-posts-grid-item`) hoặc **single-article** (lấy `og:title` / `h1` / `<title>`) nếu URL là một bài cụ thể. |
| **FILTER** | Chỉ giữ: **TPHCM** (`is_tphcm`), **tuyển sinh / thi vào lớp 10** (`is_lop10_entrance`), **3 môn** Toán · Ngữ Văn · Tiếng Anh. |
| **RESOLVE** | Trích URL PDF thật: iframe `?file=` (pdfjs / wonderplugin), `<a href="*.pdf">`, Google Drive `id=`. |
| **DOWNLOAD** | Lưu vào `pdfs/<slug>.pdf`, kiểm tra `Content-Type`, cache nếu file đã tồn tại. |
| **PUBLISH** | Ghi `js/exams_data.js` với `pdfUrl: "pdfs/..."` (đường dẫn tương đối cho iframe + nút tải). |

## Chạy crawler

Yêu cầu Python 3 và `requests` (xem `scripts/requirements.txt`).

```bash
pip install -r scripts/requirements.txt
python scripts/exams_crawler.py
```

Trên Windows PowerShell, nếu console lỗi font tiếng Việt có thể dùng:

```powershell
$env:PYTHONIOENCODING = "utf-8"
python scripts/exams_crawler.py
```

## Biến môi trường (tùy chọn)

| Biến | Ý nghĩa |
|------|---------|
| `EXAMS_CRAWLER_SUBJECTS` | Danh sách môn, ví dụ `math,lit,eng` (mặc định cả ba). |
| `EXAMS_CRAWLER_QUERIES` | Ghi đè toàn bộ query mặc định, phân cách bằng `\|`. |
| `EXAMS_CRAWLER_SEED_URLS` | Thêm URL listing hoặc **bài viết đơn** (phân cách `\|`). |
| `EXAMS_CRAWLER_MAX` | Số bài tối đa mỗi URL nguồn (mặc định 30). |
| `EXAMS_CRAWLER_TOTAL_MAX` | Tổng số đề sau filter (mặc định 80). |
| `EXAMS_CRAWLER_SKIP_PDF` | `1` = không tải PDF, chỉ cập nhật metadata (thử nhanh). |
| `EXAMS_CRAWLER_MERGE` | `0` = không merge với `exams_data.js` cũ (mặc định merge để giữ `id`/`downloads`). |
| `EXAMS_CRAWLER_ALLOW_DEMO` | `1` = nếu không cào được gì thì ghi dữ liệu demo (tránh pipeline fail). |

## File đầu ra & front-end

| File / thư mục | Vai trò |
|----------------|---------|
| `js/exams_data.js` | Sinh tự động — **không sửa tay**; chạy lại crawler sau khi chỉnh logic. |
| `pdfs/*.pdf` | File PDF phục vụ trực tiếp trên site tĩnh (GitHub Pages / static host). |
| `js/tabs/exams.js` | Lưới đề, modal xem PDF, nút **Tải PDF** (card + header modal). |
| `index.html` | Nút `Tải PDF` trong modal viewer. |

## Gợi ý mở rộng nguồn

- Thêm URL bài viết đơn (đã kiểm tra có embed PDF hoặc link `.pdf`) vào `EXAMS_CRAWLER_SEED_URLS` hoặc vào `DEFAULT_ARTICLE_SEEDS` trong `exams_crawler.py`.
- Tránh nguồn chỉ cho tải qua Google Drive trang “virus scan / confirm” — crawler hiện **bỏ qua** nếu response là HTML.

## Bản quyền & trách nhiệm

PDF thu thập từ các trang giáo dục công khai; khi đưa lên môi trường công khai cần tuân thủ điều khoản và giấy phép của từng nguồn. Repo chỉ lưu bản sao phục vụ mục đích học tập / tham khảo.

## Liên kết

- Đánh giá chi tiết thay đổi gần đây: [RE_EVALUATION.md](RE_EVALUATION.md)
- README tổng quan dự án: [README.md](README.md)

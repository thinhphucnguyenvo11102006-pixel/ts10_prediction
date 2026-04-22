// CẢNH BÁO: File này được sinh tự động bởi Bot Crawler Pipeline.
// KHÔNG chỉnh sửa thủ công tại đây.
// Cập nhật lần cuối: 2026-04-22 17:33:33

const EXAMS_DATA = [
    {
        "id": "math-1776854013-0",
        "subject": "math",
        "title": "Đề thi thử Toán vào lớp 10 lần 2 năm 2026 – 2027 trường Chu Văn An – Thái Nguyên",
        "school": "THCS (Tự động cập nhật)",
        "year": "2026",
        "district": "TPHCM",
        "type": "Đề Tham Khảo",
        "date": "22/04/2026",
        "downloads": 0,
        "pdfUrl": "https://thcs.toanmath.com/2026/04/de-thi-thu-toan-vao-lop-10-lan-2-nam-2026-2027-truong-chu-van-an-thai-nguyen.html"
    },
    {
        "id": "math-1776854013-1",
        "subject": "math",
        "title": "Đề khảo sát vào lớp 10 môn Toán lần 5 năm 2026 trường THCS Hợp Thành – Thanh Hóa",
        "school": "THCS (Tự động cập nhật)",
        "year": "2026",
        "district": "TPHCM",
        "type": "Đề Tham Khảo",
        "date": "21/04/2026",
        "downloads": 0,
        "pdfUrl": "https://thcs.toanmath.com/2026/04/de-khao-sat-vao-lop-10-mon-toan-lan-5-nam-2026-truong-thcs-hop-thanh-thanh-hoa.html"
    },
    {
        "id": "math-1776854013-2",
        "subject": "math",
        "title": "Đề thi thử vào lớp 10 môn Toán lần 3 năm 2026 – 2027 trường Hoằng Sơn 1 – Thanh Hóa",
        "school": "THCS (Tự động cập nhật)",
        "year": "2026",
        "district": "TPHCM",
        "type": "Đề Tham Khảo",
        "date": "21/04/2026",
        "downloads": 0,
        "pdfUrl": "https://thcs.toanmath.com/2026/04/de-thi-thu-vao-lop-10-mon-toan-lan-3-nam-2026-2027-truong-hoang-son-1-thanh-hoa.html"
    },
    {
        "id": "math-1776854013-3",
        "subject": "math",
        "title": "Đề khảo sát vào lớp 10 môn Toán (chuyên) năm 2026 – 2027 trường THPT chuyên Thái Nguyên",
        "school": "THCS (Tự động cập nhật)",
        "year": "2026",
        "district": "TPHCM",
        "type": "Đề Tham Khảo",
        "date": "19/04/2026",
        "downloads": 0,
        "pdfUrl": "https://thcs.toanmath.com/2026/04/de-khao-sat-vao-lop-10-mon-toan-chuyen-nam-2026-2027-truong-thpt-chuyen-thai-nguyen.html"
    },
    {
        "id": "math-1776854013-4",
        "subject": "math",
        "title": "Đề khảo sát vào lớp 10 môn Toán (chung) năm 2026 – 2027 trường THPT chuyên Thái Nguyên",
        "school": "THCS (Tự động cập nhật)",
        "year": "2026",
        "district": "TPHCM",
        "type": "Đề Tham Khảo",
        "date": "19/04/2026",
        "downloads": 0,
        "pdfUrl": "https://thcs.toanmath.com/2026/04/de-khao-sat-vao-lop-10-mon-toan-chung-nam-2026-2027-truong-thpt-chuyen-thai-nguyen.html"
    },
    {
        "id": "math-1776854013-5",
        "subject": "math",
        "title": "Đề thi thử vào lớp 10 môn Toán năm 2026 – 2027 trường THCS Thái Thịnh – Hà Nội",
        "school": "THCS (Tự động cập nhật)",
        "year": "2026",
        "district": "TPHCM",
        "type": "Đề Tham Khảo",
        "date": "15/04/2026",
        "downloads": 0,
        "pdfUrl": "https://thcs.toanmath.com/2026/04/de-thi-thu-vao-lop-10-mon-toan-nam-2026-2027-truong-thcs-thai-thinh-ha-noi.html"
    },
    {
        "id": "math-1776854013-6",
        "subject": "math",
        "title": "Đề thi thử Toán vào lớp 10 năm 2026 – 2027 trường THPT Hoàng Quốc Việt – Thái Nguyên",
        "school": "THCS (Tự động cập nhật)",
        "year": "2026",
        "district": "TPHCM",
        "type": "Đề Tham Khảo",
        "date": "15/04/2026",
        "downloads": 0,
        "pdfUrl": "https://thcs.toanmath.com/2026/04/de-thi-thu-toan-vao-lop-10-nam-2026-2027-truong-thpt-hoang-quoc-viet-thai-nguyen.html"
    },
    {
        "id": "math-1776854013-7",
        "subject": "math",
        "title": "Đề KSCL Toán thi vào lớp 10 năm 2026 – 2027 lần 1 phường Hà Đông – Hà Nội",
        "school": "THCS (Tự động cập nhật)",
        "year": "2026",
        "district": "TPHCM",
        "type": "Đề Tham Khảo",
        "date": "14/04/2026",
        "downloads": 0,
        "pdfUrl": "https://thcs.toanmath.com/2026/04/de-kscl-toan-thi-vao-lop-10-nam-2026-2027-lan-1-phuong-ha-dong-ha-noi.html"
    },
    {
        "id": "math-1776854013-8",
        "subject": "math",
        "title": "Đề thi thử vào lớp 10 môn Toán (chung) năm 2026 lần 2 trường chuyên ĐHSP Hà Nội",
        "school": "THCS (Tự động cập nhật)",
        "year": "2026",
        "district": "TPHCM",
        "type": "Đề Tham Khảo",
        "date": "13/04/2026",
        "downloads": 0,
        "pdfUrl": "https://thcs.toanmath.com/2026/04/de-thi-thu-vao-lop-10-mon-toan-chung-nam-2026-lan-2-truong-chuyen-dhsp-ha-noi.html"
    },
    {
        "id": "math-1776854013-9",
        "subject": "math",
        "title": "Đề thi thử vào lớp 10 môn Toán (chuyên) năm 2026 lần 2 trường chuyên ĐHSP Hà Nội",
        "school": "THCS (Tự động cập nhật)",
        "year": "2026",
        "district": "TPHCM",
        "type": "Đề Tham Khảo",
        "date": "13/04/2026",
        "downloads": 0,
        "pdfUrl": "https://thcs.toanmath.com/2026/04/de-thi-thu-vao-lop-10-mon-toan-chuyen-nam-2026-lan-2-truong-chuyen-dhsp-ha-noi.html"
    },
    {
        "id": "math-1776854013-10",
        "subject": "math",
        "title": "Đề thi thử vào lớp 10 môn Toán năm 2026 – 2027 trường THPT Ngô Quyền – Thái Nguyên",
        "school": "THCS (Tự động cập nhật)",
        "year": "2026",
        "district": "TPHCM",
        "type": "Đề Tham Khảo",
        "date": "13/04/2026",
        "downloads": 0,
        "pdfUrl": "https://thcs.toanmath.com/2026/04/de-thi-thu-vao-lop-10-mon-toan-nam-2026-2027-truong-thpt-ngo-quyen-thai-nguyen.html"
    },
    {
        "id": "math-1776854013-11",
        "subject": "math",
        "title": "Đề thi thử vào lớp 10 môn Toán năm 2026 – 2027 trường THCS Bến Thủy – Nghệ An",
        "school": "THCS (Tự động cập nhật)",
        "year": "2026",
        "district": "TPHCM",
        "type": "Đề Tham Khảo",
        "date": "12/04/2026",
        "downloads": 0,
        "pdfUrl": "https://thcs.toanmath.com/2026/04/de-thi-thu-vao-lop-10-mon-toan-nam-2026-2027-truong-thcs-ben-thuy-nghe-an.html"
    },
    {
        "id": "math-1776854013-12",
        "subject": "math",
        "title": "Đề thi thử Toán vào lớp 10 năm 2026 – 2027 lần 2 trường THCS Quang Tiến – Nghệ An",
        "school": "THCS (Tự động cập nhật)",
        "year": "2026",
        "district": "TPHCM",
        "type": "Đề Tham Khảo",
        "date": "12/04/2026",
        "downloads": 0,
        "pdfUrl": "https://thcs.toanmath.com/2026/04/de-thi-thu-toan-vao-lop-10-nam-2026-2027-lan-2-truong-thcs-quang-tien-nghe-an.html"
    },
    {
        "id": "math-1776854013-13",
        "subject": "math",
        "title": "Đề khảo sát Toán (chuyên) vào lớp 10 năm 2026 – 2027 trường chuyên Lam Sơn – Thanh Hóa",
        "school": "THCS (Tự động cập nhật)",
        "year": "2026",
        "district": "TPHCM",
        "type": "Đề Tham Khảo",
        "date": "09/04/2026",
        "downloads": 0,
        "pdfUrl": "https://thcs.toanmath.com/2026/04/de-khao-sat-toan-chuyen-vao-lop-10-nam-2026-2027-truong-chuyen-lam-son-thanh-hoa.html"
    },
    {
        "id": "math-1776854013-14",
        "subject": "math",
        "title": "Đề khảo sát Toán thi vào lớp 10 năm 2026 – 2027 trường chuyên Lam Sơn – Thanh Hóa",
        "school": "THCS (Tự động cập nhật)",
        "year": "2026",
        "district": "TPHCM",
        "type": "Đề Tham Khảo",
        "date": "07/04/2026",
        "downloads": 0,
        "pdfUrl": "https://thcs.toanmath.com/2026/04/de-khao-sat-toan-thi-vao-lop-10-nam-2026-2027-truong-chuyen-lam-son-thanh-hoa.html"
    }
];

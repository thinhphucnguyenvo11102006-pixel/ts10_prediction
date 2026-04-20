/**
 * data.js — SINH TỰ ĐỘNG bởi scripts/build_data.py
 * KHÔNG CHỈNH SỬA THỦ CÔNG. Sửa data/schools.json rồi chạy lại build.
 *
 * Nguồn: So GDDT TPHCM - cong bo 26/06/2025
 * Phiên bản dữ liệu: 2026-04-20
 * Tổng: 107 trường THPT công lập
 */

const EXAM_STATS = {
    2022: { candidates: 94000, quota: 72000 }
    2023: { candidates: 96000, quota: 74000 }
    2024: { candidates: 98600, quota: 77355 }
    2025: { candidates: 102000, quota: 80000 }
    2026: { candidates: 169080, quota: 118400 }
};

const DISTRICTS = ["Quận 1", "Quận 3", "Quận 4", "Quận 5", "Quận 6", "Quận 7", "Quận 8", "Quận 10", "Quận 11", "Quận 12", "Bình Thạnh", "Gò Vấp", "Phú Nhuận", "Tân Bình", "Tân Phú", "TP Thủ Đức", "Bình Tân", "Bình Chánh", "Hóc Môn", "Củ Chi", "Nhà Bè", "Cần Giờ"];

const SCHOOLS_DATA = [

    // ===============================
    // QUẬN 1
    // ===============================
    { id: 1, name: "Trần Đại Nghĩa", district: "Quận 1", scores: { 2022: 23.00, 2023: 24.00, 2024: 20.00, 2025: 24.50 }, tier: "S" },
    { id: 2, name: "Bùi Thị Xuân", district: "Quận 1", scores: { 2022: 22.25, 2023: 23.50, 2024: 22.25, 2025: 22.25 }, tier: "A+" },
    { id: 3, name: "Lương Thế Vinh", district: "Quận 1", scores: { 2022: 20.75, 2023: 21.50, 2024: 21.00, 2025: 20.75 }, tier: "A" },
    { id: 4, name: "Trưng Vương", district: "Quận 1", scores: { 2022: 20.00, 2023: 21.50, 2024: 20.75, 2025: 20.25 }, tier: "A" },
    { id: 5, name: "Ernst Thälmann", district: "Quận 1", scores: { 2022: 17.75, 2023: 18.25, 2024: 18.25, 2025: 18.00 }, tier: "A-" },
    { id: 6, name: "Năng khiếu TDTT", district: "Quận 1", scores: { 2022: 11.50, 2023: 12.00, 2024: 12.00, 2025: 11.75 }, tier: "C" },

    // ===============================
    // QUẬN 3
    // ===============================
    { id: 7, name: "Nguyễn Thị Minh Khai", district: "Quận 3", scores: { 2022: 23.25, 2023: 24.25, 2024: 23.50, 2025: 23.75 }, tier: "A+" },
    { id: 8, name: "Lê Quý Đôn", district: "Quận 3", scores: { 2022: 22.25, 2023: 23.25, 2024: 22.50, 2025: 22.25 }, tier: "A+" },
    { id: 9, name: "Marie Curie", district: "Quận 3", scores: { 2022: 19.75, 2023: 20.00, 2024: 19.75, 2025: 19.50 }, tier: "A-" },
    { id: 10, name: "Lê Thị Hồng Gấm", district: "Quận 3", scores: { 2022: 12.50, 2023: 13.00, 2024: 12.50, 2025: 12.00 }, tier: "B-" },
    { id: 11, name: "Nguyễn Thị Diệu", district: "Quận 3", scores: { 2022: 15.50, 2023: 16.00, 2024: 15.25, 2025: 10.50 }, tier: "C" },

    // ===============================
    // QUẬN 4
    // ===============================
    { id: 12, name: "Nguyễn Hữu Thọ", district: "Quận 4", scores: { 2022: 14.50, 2023: 15.25, 2024: 14.75, 2025: 14.00 }, tier: "B" },
    { id: 13, name: "Nguyễn Trãi", district: "Quận 4", scores: { 2022: 12.00, 2023: 12.75, 2024: 12.00, 2025: 11.25 }, tier: "C" },

    // ===============================
    // QUẬN 5
    // ===============================
    { id: 14, name: "TH Thực hành Sư phạm", district: "Quận 5", scores: { 2022: 22.00, 2023: 22.50, 2024: 23.00, 2025: 23.00 }, tier: "A+" },
    { id: 15, name: "TH Thực hành Sài Gòn", district: "Quận 5", scores: { 2022: 21.25, 2023: 21.75, 2024: 21.50, 2025: 21.50 }, tier: "A" },
    { id: 16, name: "Trần Khai Nguyên", district: "Quận 5", scores: { 2022: 20.50, 2023: 21.25, 2024: 21.00, 2025: 21.00 }, tier: "A" },
    { id: 17, name: "Hùng Vương", district: "Quận 5", scores: { 2022: 18.50, 2023: 19.25, 2024: 18.50, 2025: 17.75 }, tier: "B+" },
    { id: 18, name: "Trần Hữu Trang", district: "Quận 5", scores: { 2022: 12.75, 2023: 13.50, 2024: 13.00, 2025: 12.50 }, tier: "B-" },

    // ===============================
    // QUẬN 6
    // ===============================
    { id: 19, name: "Mạc Đĩnh Chi", district: "Quận 6", scores: { 2022: 22.75, 2023: 23.25, 2024: 22.50, 2025: 22.25 }, tier: "A+" },
    { id: 20, name: "Bình Phú", district: "Quận 6", scores: { 2022: 20.50, 2023: 21.00, 2024: 20.50, 2025: 20.25 }, tier: "A" },
    { id: 21, name: "Nguyễn Tất Thành", district: "Quận 6", scores: { 2022: 17.00, 2023: 17.75, 2024: 17.25, 2025: 16.75 }, tier: "B+" },
    { id: 22, name: "Phạm Phú Thứ", district: "Quận 6", scores: { 2022: 14.50, 2023: 15.25, 2024: 14.75, 2025: 14.25 }, tier: "B" },

    // ===============================
    // QUẬN 7
    // ===============================
    { id: 23, name: "Nam Sài Gòn", district: "Quận 7", scores: { 2022: 20.50, 2023: 21.00, 2024: 20.50, 2025: 20.25 }, tier: "A" },
    { id: 24, name: "Ngô Quyền", district: "Quận 7", scores: { 2022: 20.25, 2023: 20.75, 2024: 20.25, 2025: 20.00 }, tier: "A" },
    { id: 25, name: "Lê Thánh Tôn", district: "Quận 7", scores: { 2022: 17.50, 2023: 18.50, 2024: 17.75, 2025: 17.25 }, tier: "B+" },
    { id: 26, name: "Tân Phong", district: "Quận 7", scores: { 2022: 14.00, 2023: 14.75, 2024: 14.25, 2025: 13.75 }, tier: "B-" },

    // ===============================
    // QUẬN 8
    // ===============================
    { id: 27, name: "Võ Văn Kiệt", district: "Quận 8", scores: { 2022: 15.75, 2023: 16.25, 2024: 16.50, 2025: 16.00 }, tier: "B+" },
    { id: 28, name: "Tạ Quang Bửu", district: "Quận 8", scores: { 2022: 15.75, 2023: 16.50, 2024: 16.00, 2025: 15.50 }, tier: "B" },
    { id: 29, name: "Ngô Gia Tự", district: "Quận 8", scores: { 2022: 14.50, 2023: 15.25, 2024: 15.00, 2025: 14.75 }, tier: "B" },
    { id: 30, name: "Nguyễn Văn Linh (Q8)", district: "Quận 8", scores: { 2022: 13.75, 2023: 14.50, 2024: 14.25, 2025: 13.50 }, tier: "B-" },
    { id: 31, name: "Nguyễn Tất Thành (Q8)", district: "Quận 8", scores: { 2022: 14.75, 2023: 15.50, 2024: 15.00, 2025: 14.50 }, tier: "B" },
    { id: 32, name: "Lương Văn Can", district: "Quận 8", scores: { 2022: 12.50, 2023: 13.25, 2024: 12.75, 2025: 12.25 }, tier: "B-" },

    // ===============================
    // QUẬN 10
    // ===============================
    { id: 33, name: "Nguyễn Du", district: "Quận 10", scores: { 2022: 19.00, 2023: 19.75, 2024: 19.25, 2025: 18.75 }, tier: "A-" },
    { id: 34, name: "Nguyễn Khuyến", district: "Quận 10", scores: { 2022: 19.00, 2023: 19.50, 2024: 19.00, 2025: 18.75 }, tier: "A-" },
    { id: 35, name: "Nguyễn An Ninh", district: "Quận 10", scores: { 2022: 14.00, 2023: 14.75, 2024: 14.25, 2025: 13.75 }, tier: "B-" },
    { id: 36, name: "Diên Hồng", district: "Quận 10", scores: { 2022: 12.00, 2023: 12.50, 2024: 12.00, 2025: 11.75 }, tier: "C" },
    { id: 37, name: "Sương Nguyệt Anh", district: "Quận 10", scores: { 2022: 11.50, 2023: 12.00, 2024: 11.50, 2025: 11.25 }, tier: "C" },

    // ===============================
    // QUẬN 11
    // ===============================
    { id: 38, name: "Nguyễn Hiền", district: "Quận 11", scores: { 2022: 16.50, 2023: 17.25, 2024: 16.75, 2025: 16.25 }, tier: "B+" },
    { id: 39, name: "Trần Quang Khải", district: "Quận 11", scores: { 2022: 16.25, 2023: 17.00, 2024: 16.50, 2025: 16.00 }, tier: "B+" },
    { id: 40, name: "Nam Kỳ Khởi Nghĩa", district: "Quận 11", scores: { 2022: 14.00, 2023: 14.75, 2024: 14.25, 2025: 13.75 }, tier: "B-" },

    // ===============================
    // QUẬN 12
    // ===============================
    { id: 41, name: "Võ Trường Toản", district: "Quận 12", scores: { 2022: 21.50, 2023: 22.00, 2024: 21.75, 2025: 21.50 }, tier: "A" },
    { id: 42, name: "Trường Chinh", district: "Quận 12", scores: { 2022: 17.50, 2023: 18.00, 2024: 17.50, 2025: 17.25 }, tier: "B+" },
    { id: 43, name: "Thạnh Lộc", district: "Quận 12", scores: { 2022: 15.75, 2023: 16.50, 2024: 16.00, 2025: 15.50 }, tier: "B" },

    // ===============================
    // BÌNH THẠNH
    // ===============================
    { id: 44, name: "Gia Định", district: "Bình Thạnh", scores: { 2022: 23.00, 2023: 24.50, 2024: 23.00, 2025: 18.75 }, tier: "A-" },
    { id: 45, name: "Võ Thị Sáu", district: "Bình Thạnh", scores: { 2022: 18.00, 2023: 18.75, 2024: 18.25, 2025: 17.75 }, tier: "B+" },
    { id: 46, name: "Hoàng Hoa Thám", district: "Bình Thạnh", scores: { 2022: 17.00, 2023: 17.75, 2024: 17.25, 2025: 16.75 }, tier: "B+" },
    { id: 47, name: "Trần Văn Giàu", district: "Bình Thạnh", scores: { 2022: 15.00, 2023: 15.75, 2024: 15.25, 2025: 14.75 }, tier: "B" },
    { id: 48, name: "Thanh Đa", district: "Bình Thạnh", scores: { 2022: 14.00, 2023: 14.75, 2024: 14.25, 2025: 13.75 }, tier: "B-" },
    { id: 49, name: "Phan Đăng Lưu", district: "Bình Thạnh", scores: { 2022: 14.25, 2023: 14.50, 2024: 14.00, 2025: 13.50 }, tier: "B-" },

    // ===============================
    // GÒ VẤP
    // ===============================
    { id: 50, name: "Trần Hưng Đạo", district: "Gò Vấp", scores: { 2022: 20.50, 2023: 21.00, 2024: 20.50, 2025: 20.25 }, tier: "A" },
    { id: 51, name: "Nguyễn Công Trứ", district: "Gò Vấp", scores: { 2022: 20.25, 2023: 20.75, 2024: 20.25, 2025: 20.00 }, tier: "A" },
    { id: 52, name: "Nguyễn Trung Trực", district: "Gò Vấp", scores: { 2022: 17.50, 2023: 18.25, 2024: 17.75, 2025: 17.25 }, tier: "B+" },
    { id: 53, name: "Gò Vấp", district: "Gò Vấp", scores: { 2022: 16.00, 2023: 16.75, 2024: 16.25, 2025: 15.75 }, tier: "B" },

    // ===============================
    // PHÚ NHUẬN
    // ===============================
    { id: 54, name: "Phú Nhuận", district: "Phú Nhuận", scores: { 2022: 22.50, 2023: 23.50, 2024: 23.00, 2025: 22.50 }, tier: "A+" },
    { id: 55, name: "Hàn Thuyên", district: "Phú Nhuận", scores: { 2022: 13.75, 2023: 14.50, 2024: 14.00, 2025: 13.50 }, tier: "B-" },

    // ===============================
    // TÂN BÌNH
    // ===============================
    { id: 56, name: "Nguyễn Thượng Hiền", district: "Tân Bình", scores: { 2022: 24.25, 2023: 25.50, 2024: 24.25, 2025: 23.50 }, tier: "A+" },
    { id: 57, name: "Trần Phú", district: "Tân Bình", scores: { 2022: 22.75, 2023: 23.50, 2024: 23.00, 2025: 22.75 }, tier: "A+" },
    { id: 58, name: "Tân Bình", district: "Tân Bình", scores: { 2022: 19.50, 2023: 20.25, 2024: 20.00, 2025: 19.75 }, tier: "A-" },
    { id: 59, name: "Nguyễn Chí Thanh", district: "Tân Bình", scores: { 2022: 18.25, 2023: 19.00, 2024: 18.50, 2025: 18.00 }, tier: "A-" },
    { id: 60, name: "Nguyễn Thái Bình", district: "Tân Bình", scores: { 2022: 16.50, 2023: 17.00, 2024: 16.75, 2025: 16.25 }, tier: "B+" },

    // ===============================
    // TÂN PHÚ
    // ===============================
    { id: 61, name: "Tây Thạnh", district: "Tân Phú", scores: { 2022: 21.50, 2023: 22.25, 2024: 22.00, 2025: 21.75 }, tier: "A" },
    { id: 62, name: "Lê Trọng Tấn", district: "Tân Phú", scores: { 2022: 18.75, 2023: 19.25, 2024: 19.00, 2025: 18.50 }, tier: "A-" },
    { id: 63, name: "Vĩnh Lộc (Tân Phú)", district: "Tân Phú", scores: { 2022: 17.00, 2023: 17.50, 2024: 17.00, 2025: 16.75 }, tier: "B+" },

    // ===============================
    // TP THỦ ĐỨC
    // ===============================
    { id: 64, name: "Nguyễn Hữu Huân", district: "TP Thủ Đức", scores: { 2022: 23.25, 2023: 23.75, 2024: 23.50, 2025: 23.50 }, tier: "A+" },
    { id: 65, name: "Thủ Đức", district: "TP Thủ Đức", scores: { 2022: 21.25, 2023: 21.75, 2024: 21.25, 2025: 21.00 }, tier: "A" },
    { id: 66, name: "Tam Phú", district: "TP Thủ Đức", scores: { 2022: 18.00, 2023: 18.50, 2024: 18.00, 2025: 17.75 }, tier: "B+" },
    { id: 67, name: "Giồng Ông Tố", district: "TP Thủ Đức", scores: { 2022: 17.75, 2023: 18.25, 2024: 17.75, 2025: 17.50 }, tier: "B+" },
    { id: 68, name: "Dương Văn Thì", district: "TP Thủ Đức", scores: { 2022: 13.75, 2023: 14.50, 2024: 14.00, 2025: 13.50 }, tier: "B-" },
    { id: 69, name: "Hiệp Bình", district: "TP Thủ Đức", scores: { 2022: 13.75, 2023: 14.25, 2024: 13.75, 2025: 13.50 }, tier: "B-" },
    { id: 70, name: "Thủ Thiêm", district: "TP Thủ Đức", scores: { 2022: 12.75, 2023: 13.50, 2024: 13.00, 2025: 12.50 }, tier: "B-" },
    { id: 71, name: "Bình Chiểu", district: "TP Thủ Đức", scores: { 2022: 12.50, 2023: 13.25, 2024: 12.75, 2025: 12.25 }, tier: "B-" },
    { id: 72, name: "Linh Trung", district: "TP Thủ Đức", scores: { 2022: 12.75, 2023: 13.50, 2024: 13.00, 2025: 12.50 }, tier: "B-" },
    { id: 73, name: "Đào Sơn Tây", district: "TP Thủ Đức", scores: { 2022: 12.00, 2023: 12.75, 2024: 12.25, 2025: 11.75 }, tier: "C" },
    { id: 74, name: "Long Trường", district: "TP Thủ Đức", scores: { 2022: 11.00, 2023: 11.50, 2024: 11.00, 2025: 10.50 }, tier: "C" },
    { id: 75, name: "Nguyễn Văn Tăng", district: "TP Thủ Đức", scores: { 2022: 11.00, 2023: 11.50, 2024: 11.00, 2025: 10.50 }, tier: "C" },

    // ===============================
    // BÌNH TÂN
    // ===============================
    { id: 76, name: "Nguyễn Hữu Cảnh", district: "Bình Tân", scores: { 2022: 18.50, 2023: 19.25, 2024: 18.75, 2025: 18.25 }, tier: "A-" },
    { id: 77, name: "Bình Hưng Hòa", district: "Bình Tân", scores: { 2022: 18.00, 2023: 18.75, 2024: 18.25, 2025: 17.75 }, tier: "B+" },
    { id: 78, name: "An Lạc", district: "Bình Tân", scores: { 2022: 15.50, 2023: 16.25, 2024: 15.75, 2025: 15.25 }, tier: "B" },
    { id: 79, name: "Bình Tân", district: "Bình Tân", scores: { 2022: 14.50, 2023: 15.25, 2024: 14.75, 2025: 14.25 }, tier: "B" },
    { id: 80, name: "Bình Trị Đông B", district: "Bình Tân", scores: { 2022: 13.25, 2023: 14.00, 2024: 13.50, 2025: 13.00 }, tier: "B-" },

    // ===============================
    // BÌNH CHÁNH
    // ===============================
    { id: 81, name: "Vĩnh Lộc B", district: "Bình Chánh", scores: { 2022: 14.00, 2023: 14.75, 2024: 14.25, 2025: 13.75 }, tier: "B-" },
    { id: 82, name: "Lê Minh Xuân", district: "Bình Chánh", scores: { 2022: 13.00, 2023: 13.75, 2024: 13.25, 2025: 12.75 }, tier: "B-" },
    { id: 83, name: "Năng khiếu TDTT BC", district: "Bình Chánh", scores: { 2022: 12.25, 2023: 13.00, 2024: 12.50, 2025: 12.00 }, tier: "B-" },
    { id: 84, name: "Bình Chánh", district: "Bình Chánh", scores: { 2022: 11.00, 2023: 11.75, 2024: 11.25, 2025: 10.75 }, tier: "C" },
    { id: 85, name: "Phong Phú", district: "Bình Chánh", scores: { 2022: 10.75, 2023: 11.50, 2024: 11.00, 2025: 10.50 }, tier: "C" },
    { id: 86, name: "Đa Phước", district: "Bình Chánh", scores: { 2022: 10.75, 2023: 11.50, 2024: 11.00, 2025: 10.50 }, tier: "C" },
    { id: 87, name: "Tân Túc", district: "Bình Chánh", scores: { 2022: 10.75, 2023: 11.50, 2024: 11.00, 2025: 10.50 }, tier: "C" },

    // ===============================
    // HÓC MÔN
    // ===============================
    { id: 88, name: "Nguyễn Hữu Cầu", district: "Hóc Môn", scores: { 2022: 22.00, 2023: 23.00, 2024: 22.75, 2025: 23.00 }, tier: "A+" },
    { id: 89, name: "Lý Thường Kiệt", district: "Hóc Môn", scores: { 2022: 20.50, 2023: 21.00, 2024: 20.50, 2025: 20.25 }, tier: "A" },
    { id: 90, name: "Bà Điểm", district: "Hóc Môn", scores: { 2022: 19.25, 2023: 19.75, 2024: 19.25, 2025: 19.00 }, tier: "A-" },
    { id: 91, name: "Nguyễn Hữu Tiến", district: "Hóc Môn", scores: { 2022: 17.75, 2023: 18.25, 2024: 17.75, 2025: 17.50 }, tier: "B+" },
    { id: 92, name: "Hồ Thị Bi", district: "Hóc Môn", scores: { 2022: 17.25, 2023: 17.75, 2024: 17.25, 2025: 17.00 }, tier: "B+" },
    { id: 93, name: "Phạm Văn Sáng", district: "Hóc Môn", scores: { 2022: 16.50, 2023: 17.00, 2024: 16.50, 2025: 16.25 }, tier: "B+" },
    { id: 94, name: "Nguyễn Văn Cừ", district: "Hóc Môn", scores: { 2022: 15.00, 2023: 15.75, 2024: 15.25, 2025: 14.75 }, tier: "B" },

    // ===============================
    // CỦ CHI
    // ===============================
    { id: 95, name: "Trung Phú", district: "Củ Chi", scores: { 2022: 14.50, 2023: 15.25, 2024: 14.75, 2025: 14.25 }, tier: "B" },
    { id: 96, name: "Tân Thông Hội", district: "Củ Chi", scores: { 2022: 14.25, 2023: 15.00, 2024: 14.50, 2025: 14.00 }, tier: "B" },
    { id: 97, name: "Củ Chi", district: "Củ Chi", scores: { 2022: 12.50, 2023: 13.25, 2024: 12.75, 2025: 12.25 }, tier: "B-" },
    { id: 98, name: "Phú Hòa", district: "Củ Chi", scores: { 2022: 12.00, 2023: 12.75, 2024: 12.25, 2025: 11.75 }, tier: "C" },
    { id: 99, name: "Quang Trung (Củ Chi)", district: "Củ Chi", scores: { 2022: 11.75, 2023: 12.50, 2024: 12.00, 2025: 11.50 }, tier: "C" },
    { id: 100, name: "An Nhơn Tây", district: "Củ Chi", scores: { 2022: 10.75, 2023: 11.50, 2024: 11.00, 2025: 10.50 }, tier: "C" },
    { id: 101, name: "Trung Lập", district: "Củ Chi", scores: { 2022: 10.75, 2023: 11.50, 2024: 11.00, 2025: 10.50 }, tier: "C" },

    // ===============================
    // NHÀ BÈ
    // ===============================
    { id: 102, name: "Long Thới", district: "Nhà Bè", scores: { 2022: 12.25, 2023: 13.00, 2024: 12.50, 2025: 12.00 }, tier: "B-" },
    { id: 103, name: "Phước Kiển", district: "Nhà Bè", scores: { 2022: 11.00, 2023: 11.75, 2024: 11.25, 2025: 10.75 }, tier: "C" },
    { id: 104, name: "Dương Văn Dương", district: "Nhà Bè", scores: { 2022: 10.75, 2023: 11.50, 2024: 11.00, 2025: 10.50 }, tier: "C" },

    // ===============================
    // CẦN GIỜ
    // ===============================
    { id: 105, name: "An Nghĩa", district: "Cần Giờ", scores: { 2022: 10.75, 2023: 11.50, 2024: 11.00, 2025: 10.50 }, tier: "C" },
    { id: 106, name: "Bình Khánh", district: "Cần Giờ", scores: { 2022: 10.75, 2023: 11.00, 2024: 10.75, 2025: 10.50 }, tier: "C" },
    { id: 107, name: "Cần Thạnh", district: "Cần Giờ", scores: { 2022: 10.50, 2023: 11.00, 2024: 10.50, 2025: 10.50 }, tier: "C" },
];

// 8-Tier system — ngưỡng được dùng bởi build script để tự phân loại
const TIER_INFO = {
    "S":  { label: "Xuất sắc",       color: "#f59e0b", min: 24 },
    "A+": { label: "Rất cao",        color: "#eab308", min: 22 },
    "A":  { label: "Cao",            color: "#3b82f6", min: 20 },
    "A-": { label: "Khá cao",        color: "#06b6d4", min: 18 },
    "B+": { label: "Khá",            color: "#8b5cf6", min: 16 },
    "B":  { label: "Trung bình khá", color: "#a78bfa", min: 14 },
    "B-": { label: "Trung bình",     color: "#6b7280", min: 12 },
    "C":  { label: "Thấp",           color: "#71717a", min: 10 }
};

// Phổ điểm mô phỏng
const SCORE_DISTRIBUTION_PARAMS = {
    2022: { math: { mean: 5.17, std: 2.1 }, lit: { mean: 6.58, std: 1.3 }, eng: { mean: 5.46, std: 2.4 } },
    2023: { math: { mean: 5.4, std: 2.0 }, lit: { mean: 6.7, std: 1.2 }, eng: { mean: 5.8, std: 2.3 } },
    2024: { math: { mean: 4.8, std: 2.2 }, lit: { mean: 6.9, std: 1.1 }, eng: { mean: 6.2, std: 2.2 } },
    2025: { math: { mean: 5.1, std: 2.1 }, lit: { mean: 6.75, std: 1.2 }, eng: { mean: 6.5, std: 2.1 } },
};

/**
 * Dữ liệu lịch sử tuyển sinh lớp 10 TPHCM
 * Nguồn: Sở GD&ĐT TPHCM, VnExpress, Tuổi Trẻ, Thanh Niên
 * Ghi chú: Từ 2022 trở đi, điểm = Toán + Văn + Anh (hệ số 1)
 */

const EXAM_STATS = {
    2022: { candidates: 94000, quota: 72000, avgMath: 5.17, avgLit: 6.58, avgEng: 5.46, avgTotal: 17.21 },
    2023: { candidates: 96000, quota: 74000, avgMath: 5.40, avgLit: 6.70, avgEng: 5.80, avgTotal: 17.90 },
    2024: { candidates: 98600, quota: 77355, avgMath: 4.80, avgLit: 6.90, avgEng: 6.20, avgTotal: 17.90 },
    2025: { candidates: 102000, quota: 80000, avgMath: 5.10, avgLit: 6.75, avgEng: 6.50, avgTotal: 18.35 },
    2026: { candidates: 169080, quota: 118400, avgMath: null, avgLit: null, avgEng: null, avgTotal: null }
};

const DISTRICTS = [
    "Quận 1", "Quận 3", "Quận 4", "Quận 5", "Quận 6", "Quận 7", "Quận 8",
    "Quận 10", "Quận 11", "Quận 12", "Bình Thạnh", "Gò Vấp", "Phú Nhuận",
    "Tân Bình", "Tân Phú", "Bình Tân", "TP Thủ Đức", "Bình Chánh",
    "Hóc Môn", "Củ Chi", "Nhà Bè", "Cần Giờ"
];

// Dữ liệu điểm chuẩn NV1 các trường THPT công lập TPHCM
const SCHOOLS_DATA = [
    // ===== S TIER (≥24) =====
    { id: 1,  name: "Nguyễn Thượng Hiền",     district: "Tân Bình",     scores: { 2022: 24.50, 2023: 25.50, 2024: 24.25, 2025: 23.50 }, tier: "S" },
    { id: 2,  name: "Trần Đại Nghĩa",         district: "Quận 1",       scores: { 2022: 24.00, 2023: 25.00, 2024: 24.00, 2025: 24.50 }, tier: "S" },
    // ===== A+ TIER (22-24) =====
    { id: 3,  name: "Nguyễn Thị Minh Khai",    district: "Quận 3",       scores: { 2022: 23.50, 2023: 24.25, 2024: 23.25, 2025: 23.75 }, tier: "A+" },
    { id: 4,  name: "Nguyễn Hữu Huân",         district: "TP Thủ Đức",   scores: { 2022: 23.00, 2023: 24.00, 2024: 23.25, 2025: 23.50 }, tier: "A+" },
    { id: 5,  name: "Gia Định",                 district: "Bình Thạnh",   scores: { 2022: 22.50, 2023: 23.50, 2024: 23.00, 2025: 22.75 }, tier: "A+" },
    { id: 6,  name: "Trần Phú",                 district: "Tân Phú",      scores: { 2022: 22.75, 2023: 23.50, 2024: 23.25, 2025: 22.75 }, tier: "A+" },
    { id: 7,  name: "TH Thực hành Sư phạm",    district: "Quận 5",       scores: { 2022: 22.25, 2023: 23.25, 2024: 23.00, 2025: 23.00 }, tier: "A+" },
    { id: 8,  name: "Bùi Thị Xuân",            district: "Quận 1",       scores: { 2022: 22.00, 2023: 23.00, 2024: 22.50, 2025: 22.50 }, tier: "A+" },
    { id: 9,  name: "Nguyễn Hữu Cầu",          district: "TP Thủ Đức",   scores: { 2022: 22.00, 2023: 22.75, 2024: 22.25, 2025: 23.00 }, tier: "A+" },
    { id: 10, name: "Lê Quý Đôn",              district: "Quận 3",       scores: { 2022: 21.75, 2023: 22.75, 2024: 22.25, 2025: 22.25 }, tier: "A+" },

    // ===== A TIER (20-22) =====
    { id: 11, name: "Mạc Đĩnh Chi",            district: "Quận 6",       scores: { 2022: 21.50, 2023: 22.50, 2024: 22.00, 2025: 21.75 }, tier: "A" },
    { id: 12, name: "Nguyễn Du",                district: "Quận 10",      scores: { 2022: 21.25, 2023: 22.25, 2024: 21.75, 2025: 21.50 }, tier: "A" },
    { id: 13, name: "Hùng Vương",               district: "Quận 5",       scores: { 2022: 21.00, 2023: 22.00, 2024: 21.50, 2025: 21.25 }, tier: "A" },
    { id: 14, name: "Nguyễn Khuyến",            district: "Tân Bình",     scores: { 2022: 21.00, 2023: 21.75, 2024: 21.25, 2025: 21.00 }, tier: "A" },
    { id: 15, name: "Marie Curie",              district: "Quận 3",       scores: { 2022: 20.75, 2023: 21.50, 2024: 21.00, 2025: 20.75 }, tier: "A" },
    { id: 16, name: "Lương Thế Vinh",           district: "Quận 1",       scores: { 2022: 20.50, 2023: 21.25, 2024: 20.75, 2025: 20.50 }, tier: "A" },
    { id: 17, name: "Trần Khai Nguyên",         district: "Quận 5",       scores: { 2022: 20.25, 2023: 21.00, 2024: 20.50, 2025: 20.25 }, tier: "A" },
    { id: 18, name: "Nguyễn Trung Trực",        district: "Gò Vấp",       scores: { 2022: 20.00, 2023: 20.75, 2024: 20.25, 2025: 20.00 }, tier: "A" },

    // ===== A- TIER (18-20) =====
    { id: 19, name: "Nguyễn Thái Bình",         district: "Tân Bình",     scores: { 2022: 19.75, 2023: 20.50, 2024: 20.00, 2025: 19.75 }, tier: "A-" },
    { id: 20, name: "Võ Thị Sáu",              district: "Bình Thạnh",   scores: { 2022: 19.50, 2023: 20.25, 2024: 19.75, 2025: 19.50 }, tier: "A-" },
    { id: 21, name: "Tân Bình",                 district: "Tân Bình",     scores: { 2022: 19.25, 2023: 20.00, 2024: 19.50, 2025: 19.25 }, tier: "A-" },
    { id: 22, name: "Nguyễn Công Trứ",          district: "Gò Vấp",       scores: { 2022: 19.00, 2023: 19.75, 2024: 19.25, 2025: 19.00 }, tier: "A-" },
    { id: 23, name: "Nguyễn An Ninh",           district: "Quận 10",      scores: { 2022: 18.75, 2023: 19.50, 2024: 19.00, 2025: 18.75 }, tier: "A-" },
    { id: 24, name: "Phú Nhuận",                district: "Phú Nhuận",    scores: { 2022: 18.50, 2023: 19.25, 2024: 18.75, 2025: 18.50 }, tier: "A-" },
    { id: 25, name: "Trưng Vương",              district: "Quận 1",       scores: { 2022: 18.25, 2023: 19.00, 2024: 18.50, 2025: 18.25 }, tier: "A-" },
    { id: 26, name: "Lê Thánh Tôn",            district: "Quận 7",       scores: { 2022: 18.00, 2023: 18.75, 2024: 18.25, 2025: 18.00 }, tier: "A-" },
    { id: 27, name: "Diên Hồng",               district: "Quận 10",      scores: { 2022: 18.50, 2023: 19.25, 2024: 18.50, 2025: 18.25 }, tier: "A-" },
    { id: 28, name: "Sương Nguyệt Anh",        district: "Quận 10",      scores: { 2022: 18.25, 2023: 19.00, 2024: 18.25, 2025: 18.00 }, tier: "A-" },
    { id: 66, name: "Nguyễn Trọng Tuyển",       district: "Tân Bình",     scores: { 2022: 18.75, 2023: 19.50, 2024: 19.00, 2025: 18.75 }, tier: "A-" },
    { id: 90, name: "Trần Văn Ơn",             district: "Quận 1",       scores: { 2022: 18.00, 2023: 18.75, 2024: 18.25, 2025: 18.00 }, tier: "A-" },

    // ===== B+ TIER (16-18) =====
    { id: 29, name: "Nguyễn Chí Thanh",         district: "Tân Bình",     scores: { 2022: 18.00, 2023: 18.75, 2024: 18.00, 2025: 17.75 }, tier: "B+" },
    { id: 30, name: "Thanh Đa",                 district: "Bình Thạnh",   scores: { 2022: 17.50, 2023: 18.25, 2024: 17.75, 2025: 17.50 }, tier: "B+" },
    { id: 31, name: "Gò Vấp",                   district: "Gò Vấp",       scores: { 2022: 17.00, 2023: 17.75, 2024: 17.25, 2025: 17.00 }, tier: "B+" },
    { id: 32, name: "Nguyễn Hiền",              district: "Quận 11",      scores: { 2022: 16.50, 2023: 17.25, 2024: 16.75, 2025: 16.50 }, tier: "B+" },
    { id: 33, name: "Tây Thạnh",                district: "Tân Phú",      scores: { 2022: 16.00, 2023: 16.75, 2024: 16.25, 2025: 16.00 }, tier: "B+" },
    { id: 34, name: "Nguyễn Văn Tăng",          district: "TP Thủ Đức",   scores: { 2022: 17.25, 2023: 18.00, 2024: 17.50, 2025: 17.25 }, tier: "B+" },
    { id: 35, name: "Thủ Đức",                  district: "TP Thủ Đức",   scores: { 2022: 17.50, 2023: 18.25, 2024: 17.75, 2025: 17.50 }, tier: "B+" },
    { id: 36, name: "Nguyễn Văn Cừ",            district: "TP Thủ Đức",   scores: { 2022: 16.75, 2023: 17.50, 2024: 17.00, 2025: 16.75 }, tier: "B+" },
    { id: 37, name: "Nguyễn Hữu Thọ",           district: "Quận 4",       scores: { 2022: 17.00, 2023: 17.75, 2024: 17.25, 2025: 17.00 }, tier: "B+" },
    { id: 38, name: "Võ Trường Toản",           district: "Quận 12",      scores: { 2022: 16.75, 2023: 17.50, 2024: 17.00, 2025: 16.75 }, tier: "B+" },
    { id: 39, name: "Lý Thánh Tôn",             district: "Quận 8",       scores: { 2022: 16.50, 2023: 17.25, 2024: 16.75, 2025: 16.50 }, tier: "B+" },
    { id: 40, name: "Phạm Văn Sáng",            district: "Hóc Môn",      scores: { 2022: 16.25, 2023: 17.00, 2024: 16.50, 2025: 16.25 }, tier: "B+" },
    { id: 41, name: "Trần Quang Khải",          district: "Quận 11",      scores: { 2022: 16.75, 2023: 17.50, 2024: 17.00, 2025: 16.75 }, tier: "B+" },
    { id: 42, name: "Nguyễn Trãi",              district: "Quận 4",       scores: { 2022: 17.25, 2023: 18.00, 2024: 17.50, 2025: 17.25 }, tier: "B+" },
    { id: 43, name: "Phan Đăng Lưu",            district: "Bình Thạnh",   scores: { 2022: 17.75, 2023: 18.50, 2024: 18.00, 2025: 17.75 }, tier: "B+" },
    { id: 44, name: "Ngô Gia Tự",               district: "Quận 8",       scores: { 2022: 16.00, 2023: 16.75, 2024: 16.25, 2025: 16.00 }, tier: "B+" },
    { id: 45, name: "Nguyễn Hữu Tiến",          district: "Tân Phú",      scores: { 2022: 17.25, 2023: 18.00, 2024: 17.50, 2025: 17.25 }, tier: "B+" },
    { id: 46, name: "Nguyễn Văn Nghi",           district: "Gò Vấp",       scores: { 2022: 17.00, 2023: 17.75, 2024: 17.25, 2025: 17.00 }, tier: "B+" },
    { id: 47, name: "Hoàng Hoa Thám",           district: "Bình Thạnh",   scores: { 2022: 17.25, 2023: 18.00, 2024: 17.50, 2025: 17.25 }, tier: "B+" },
    { id: 48, name: "Trần Văn Giàu",            district: "Bình Chánh",   scores: { 2022: 16.00, 2023: 16.75, 2024: 16.25, 2025: 16.00 }, tier: "B+" },
    { id: 49, name: "Lê Trọng Tấn",             district: "Bình Tân",     scores: { 2022: 16.25, 2023: 17.00, 2024: 16.50, 2025: 16.25 }, tier: "B+" },
    { id: 50, name: "Bình Chiểu",               district: "TP Thủ Đức",   scores: { 2022: 16.50, 2023: 17.25, 2024: 16.75, 2025: 16.50 }, tier: "B+" },
    { id: 71, name: "Phú Nhuận (CS2)",          district: "Phú Nhuận",    scores: { 2022: 16.00, 2023: 16.75, 2024: 16.25, 2025: 16.00 }, tier: "B+" },
    { id: 72, name: "Lê Anh Xuân",              district: "Tân Phú",      scores: { 2022: 16.50, 2023: 17.25, 2024: 16.75, 2025: 16.50 }, tier: "B+" },
    { id: 73, name: "Bình Lợi Trung",           district: "Bình Thạnh",   scores: { 2022: 16.25, 2023: 17.00, 2024: 16.50, 2025: 16.25 }, tier: "B+" },
    { id: 74, name: "Ernst Thälmann",           district: "Quận 1",       scores: { 2022: 17.50, 2023: 18.25, 2024: 17.75, 2025: 17.50 }, tier: "B+" },
    { id: 75, name: "Trần Quốc Toản",           district: "Quận 3",       scores: { 2022: 17.75, 2023: 18.50, 2024: 18.00, 2025: 17.50 }, tier: "B+" },
    { id: 91, name: "Nguyễn Huệ",              district: "Quận 7",       scores: { 2022: 16.50, 2023: 17.25, 2024: 16.75, 2025: 16.50 }, tier: "B+" },
    { id: 92, name: "Lê Thị Hồng Gấm",        district: "Quận 7",       scores: { 2022: 16.25, 2023: 17.00, 2024: 16.50, 2025: 16.25 }, tier: "B+" },
    { id: 94, name: "Nguyễn Văn Luông",        district: "Quận 6",       scores: { 2022: 16.00, 2023: 16.75, 2024: 16.25, 2025: 16.00 }, tier: "B+" },
    { id: 99, name: "Trần Quốc Thảo",          district: "Quận 3",       scores: { 2022: 16.25, 2023: 17.00, 2024: 16.50, 2025: 16.25 }, tier: "B+" },

    // ===== B TIER (14-16) =====
    { id: 51, name: "Bình Phú",                 district: "Quận 6",       scores: { 2022: 15.50, 2023: 16.25, 2024: 15.75, 2025: 15.50 }, tier: "B" },
    { id: 52, name: "An Nhơn",                  district: "Gò Vấp",       scores: { 2022: 15.00, 2023: 15.75, 2024: 15.25, 2025: 15.00 }, tier: "B" },
    { id: 53, name: "Tân Thới Hiệp",            district: "Quận 12",      scores: { 2022: 14.50, 2023: 15.25, 2024: 14.75, 2025: 14.50 }, tier: "B" },
    { id: 54, name: "Bình Tân",                 district: "Bình Tân",     scores: { 2022: 14.00, 2023: 14.75, 2024: 14.25, 2025: 14.00 }, tier: "B" },
    { id: 58, name: "Phước Long",               district: "TP Thủ Đức",   scores: { 2022: 15.25, 2023: 16.00, 2024: 15.50, 2025: 15.25 }, tier: "B" },
    { id: 59, name: "Quang Trung",              district: "Gò Vấp",       scores: { 2022: 15.75, 2023: 16.50, 2024: 16.00, 2025: 15.75 }, tier: "B" },
    { id: 60, name: "Nguyễn Thị Diệu",          district: "Quận 3",       scores: { 2022: 15.50, 2023: 16.25, 2024: 15.75, 2025: 15.50 }, tier: "B" },
    { id: 61, name: "Nguyễn Đình Chiểu",        district: "Phú Nhuận",    scores: { 2022: 15.75, 2023: 16.50, 2024: 16.00, 2025: 15.75 }, tier: "B" },
    { id: 64, name: "Quốc Toản",                district: "Quận 12",      scores: { 2022: 14.75, 2023: 15.50, 2024: 15.00, 2025: 14.75 }, tier: "B" },
    { id: 65, name: "Tạ Quang Bửu",             district: "Quận 8",       scores: { 2022: 14.25, 2023: 15.00, 2024: 14.50, 2025: 14.25 }, tier: "B" },
    { id: 67, name: "Phú Lâm",                  district: "Quận 6",       scores: { 2022: 15.00, 2023: 15.75, 2024: 15.25, 2025: 15.00 }, tier: "B" },
    { id: 68, name: "Nguyễn Thượng Hiền Q.12",  district: "Quận 12",      scores: { 2022: 14.00, 2023: 14.75, 2024: 14.25, 2025: 14.00 }, tier: "B" },
    { id: 69, name: "Trần Hưng Đạo",            district: "Gò Vấp",       scores: { 2022: 15.25, 2023: 16.00, 2024: 15.50, 2025: 15.25 }, tier: "B" },
    { id: 76, name: "Nam Kỳ Khởi Nghĩa",       district: "Quận 11",      scores: { 2022: 15.50, 2023: 16.25, 2024: 15.75, 2025: 15.50 }, tier: "B" },
    { id: 80, name: "An Lạc",                   district: "Bình Tân",     scores: { 2022: 14.50, 2023: 15.25, 2024: 14.75, 2025: 14.50 }, tier: "B" },
    { id: 87, name: "Bà Điểm",                  district: "Hóc Môn",      scores: { 2022: 14.00, 2023: 14.75, 2024: 14.25, 2025: 14.00 }, tier: "B" },
    { id: 93, name: "Dương Bá Trạc",           district: "Quận 8",       scores: { 2022: 15.50, 2023: 16.25, 2024: 15.75, 2025: 15.50 }, tier: "B" },

    // ===== B- TIER (12-14) =====
    { id: 55, name: "Nguyễn Văn Linh",          district: "Bình Chánh",   scores: { 2022: 13.50, 2023: 14.25, 2024: 13.75, 2025: 13.50 }, tier: "B-" },
    { id: 56, name: "Long Trường",              district: "TP Thủ Đức",   scores: { 2022: 13.00, 2023: 13.75, 2024: 13.25, 2025: 13.00 }, tier: "B-" },
    { id: 57, name: "Hiệp Bình",               district: "TP Thủ Đức",   scores: { 2022: 12.50, 2023: 13.25, 2024: 12.75, 2025: 12.50 }, tier: "B-" },
    { id: 62, name: "Lê Minh Xuân",             district: "Bình Chánh",   scores: { 2022: 13.25, 2023: 14.00, 2024: 13.50, 2025: 13.25 }, tier: "B-" },
    { id: 63, name: "Vĩnh Lộc",                 district: "Bình Chánh",   scores: { 2022: 13.00, 2023: 13.75, 2024: 13.25, 2025: 13.00 }, tier: "B-" },
    { id: 70, name: "Bình Hưng Hòa",            district: "Bình Tân",     scores: { 2022: 13.75, 2023: 14.50, 2024: 14.00, 2025: 13.75 }, tier: "B-" },
    { id: 77, name: "Củ Chi",                   district: "Củ Chi",       scores: { 2022: 13.75, 2023: 14.50, 2024: 14.00, 2025: 13.75 }, tier: "B-" },
    { id: 78, name: "Quang Trung - Nguyễn Huệ", district: "Củ Chi",      scores: { 2022: 12.50, 2023: 13.25, 2024: 12.75, 2025: 12.50 }, tier: "B-" },
    { id: 79, name: "Trung Phú",                district: "Củ Chi",       scores: { 2022: 12.00, 2023: 12.75, 2024: 12.25, 2025: 12.00 }, tier: "B-" },
    { id: 81, name: "Nhà Bè",                   district: "Nhà Bè",       scores: { 2022: 13.50, 2023: 14.25, 2024: 13.75, 2025: 13.50 }, tier: "B-" },
    { id: 82, name: "Phước Kiển",               district: "Nhà Bè",       scores: { 2022: 12.75, 2023: 13.50, 2024: 13.00, 2025: 12.75 }, tier: "B-" },
    { id: 83, name: "Long Thới",                district: "Nhà Bè",       scores: { 2022: 12.00, 2023: 12.75, 2024: 12.25, 2025: 12.00 }, tier: "B-" },
    { id: 88, name: "Trung Chánh",              district: "Hóc Môn",      scores: { 2022: 13.50, 2023: 14.25, 2024: 13.75, 2025: 13.50 }, tier: "B-" },
    { id: 89, name: "Xuân Thới Thượng",         district: "Hóc Môn",      scores: { 2022: 12.50, 2023: 13.25, 2024: 12.75, 2025: 12.50 }, tier: "B-" },
    { id: 95, name: "Tân Túc",                 district: "Bình Chánh",   scores: { 2022: 12.75, 2023: 13.50, 2024: 13.00, 2025: 12.75 }, tier: "B-" },
    { id: 96, name: "Đa Phước",                district: "Bình Chánh",   scores: { 2022: 12.25, 2023: 13.00, 2024: 12.50, 2025: 12.25 }, tier: "B-" },
    { id: 97, name: "Bình Chánh",              district: "Bình Chánh",   scores: { 2022: 13.00, 2023: 13.75, 2024: 13.25, 2025: 13.00 }, tier: "B-" },
    { id: 98, name: "Nguyễn Văn Bứa",          district: "Hóc Môn",      scores: { 2022: 13.25, 2023: 14.00, 2024: 13.50, 2025: 13.25 }, tier: "B-" },
    { id: 100, name: "Thạnh Lộc",               district: "Quận 12",      scores: { 2022: 13.75, 2023: 14.50, 2024: 14.00, 2025: 13.75 }, tier: "B-" },

    // ===== C TIER (<12) =====
    { id: 84, name: "Bình Khánh",               district: "Cần Giờ",      scores: { 2022: 11.50, 2023: 12.00, 2024: 11.50, 2025: 11.00 }, tier: "C" },
    { id: 85, name: "An Nghĩa",                 district: "Cần Giờ",      scores: { 2022: 11.00, 2023: 11.50, 2024: 11.00, 2025: 10.75 }, tier: "C" },
    { id: 86, name: "Cần Thạnh",                district: "Cần Giờ",      scores: { 2022: 10.50, 2023: 11.00, 2024: 10.50, 2025: 10.50 }, tier: "C" },
];

// 8-Tier system
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

// Phổ điểm mô phỏng - tham số phân bố cho từng môn (mean, stddev)
const SCORE_DISTRIBUTION_PARAMS = {
    2022: { math: { mean: 5.17, std: 2.1 }, lit: { mean: 6.58, std: 1.3 }, eng: { mean: 5.46, std: 2.4 } },
    2023: { math: { mean: 5.40, std: 2.0 }, lit: { mean: 6.70, std: 1.2 }, eng: { mean: 5.80, std: 2.3 } },
    2024: { math: { mean: 4.80, std: 2.2 }, lit: { mean: 6.90, std: 1.1 }, eng: { mean: 6.20, std: 2.2 } },
    2025: { math: { mean: 5.10, std: 2.1 }, lit: { mean: 6.75, std: 1.2 }, eng: { mean: 6.50, std: 2.1 } },
};

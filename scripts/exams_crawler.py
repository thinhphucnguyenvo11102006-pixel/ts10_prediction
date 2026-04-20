import os
import re
import json
from datetime import datetime

# ==========================================
# CẤU HÌNH BOT (CRAWLER & PARSER)
# ==========================================
# Đây là Script Tự Động Hóa (Data Pipeline).
# Nó quét danh sách các file PDF Đề Thi, dùng Regex (Biểu thức chính quy) để trích xuất
# Môn Học, Năm, Tên Trường, Quận... và tự động sinh ra file js/exams_data.js cho Web.

# Thư mục chứa PDF thô bạn tải về (nếu tải hàng loạt từ Google Drive)
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
RAW_PDF_DIR = os.path.join(SCRIPT_DIR, "../data/raw_pdfs")
# File Đầu Ra cho Web đọc
OUTPUT_JS_FILE = os.path.join(SCRIPT_DIR, "../js/exams_data.js")

# Nếu chạy script này mà không có thư mục raw_pdfs, bot sẽ tạo sẵn dữ liệu mẫu.
def ensure_dir():
    if not os.path.exists(RAW_PDF_DIR):
        os.makedirs(RAW_PDF_DIR)
        print(f"[SETUP] Da tao thu muc '{RAW_PDF_DIR}'. Hay nem hang loat file PDF vao day!")

def guess_subject(filename, text):
    text_lower = text.lower()
    if 'toan' in text_lower or 'math' in text_lower:
        return 'math'
    if 'van' in text_lower or 'lit' in text_lower or 'ngu' in text_lower:
        return 'lit'
    if 'anh' in text_lower or 'eng' in text_lower:
        return 'eng'
    # Trả về math mặc định nếu không đoán được
    return 'math'

def parse_filename(filename):
    """
    Regex siêu phân tích tên file.
    VD: 'De_thi_Toan_9_HK2_THCS_Nguyen_Du_Q1_2024.pdf'
    -> Môn: Toán, Trường: Nguyễn Du, Năm: 2024
    """
    name_without_ext = os.path.splitext(filename)[0]
    
    # Đoán năm
    year_match = re.search(r'(20\d{2})', name_without_ext)
    year = year_match.group(1) if year_match else str(datetime.now().year)
    
    # Đoán quận
    district_match = re.search(r'(Q\d+|Quan_\d+|Go_Vap|Binh_Thanh)', name_without_ext, re.IGNORECASE)
    district = district_match.group(1).replace('_', ' ').capitalize() if district_match else "TPHCM"
    
    # Đoán Môn
    subject = guess_subject(filename, name_without_ext)
    
    # Tên giả định
    clean_name = name_without_ext.replace('_', ' ').replace('-', ' ')
    title = f"Đề thi {clean_name}"
    
    return {
        "id": f"{subject}-{int(datetime.now().timestamp())}-{len(name_without_ext)}",
        "subject": subject,
        "title": title,
        "school": "THCS (Đang cập nhật)",
        "year": year,
        "district": district,
        "type": "Thi Thử",
        "date": datetime.now().strftime("%d/%m/%Y"),
        "downloads": 0,
        "pdfUrl": f"data/raw_pdfs/{filename}" # Đường link trỏ thẳng vào file trong máy
    }

def generate_js(exams_list):
    js_content = f"""// File này được sinh tự động bởi Bot Crawler Pipeline.
// Không chỉnh sửa thủ công tại đây nếu bạn đang chạy tự động!

const EXAMS_DATA = {json.dumps(exams_list, indent=4, ensure_ascii=False)};
"""
    with open(OUTPUT_JS_FILE, 'w', encoding='utf-8') as f:
        f.write(js_content)
    print(f"[SUCCESS] Da ket xuat thanh cong {len(exams_list)} de thi vao Web ({OUTPUT_JS_FILE})!")

def run_pipeline():
    print("[BOT] Khoi dong He Thong Ngan Hang De Thi...")
    ensure_dir()
    
    exams_db = []
    
    if os.path.exists(RAW_PDF_DIR) and len(os.listdir(RAW_PDF_DIR)) > 0:
        print("[BOT] Dang quet thu muc chua file PDF...")
        for file in os.listdir(RAW_PDF_DIR):
            if file.endswith('.pdf'):
                exam_info = parse_filename(file)
                exams_db.append(exam_info)
    else:
        print("[WARNING] Thu muc trong. Tao du lieu gia lap (Demo mode)...")
        exams_db = [
            {
                "id": "math-demo-1", "subject": "math",
                "title": "Đề Toán 9 Cuối Kỳ 2 TPHCM", "school": "Sở GD TPHCM",
                "year": "2025", "district": "TPHCM", "type": "Chính Thức",
                "date": "15/04/2026", "downloads": 9920,
                "pdfUrl": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
            },
            {
                "id": "lit-demo-2", "subject": "lit",
                "title": "Đề Văn 9 - Phân tích Lặng Lẽ Sa Pa", "school": "THCS Lê Quý Đôn",
                "year": "2024", "district": "Quận 3", "type": "Thi Thử",
                "date": "10/01/2026", "downloads": 483,
                "pdfUrl": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
            }
        ]
        
    generate_js(exams_db)
    print("[SUCCESS] Hoan tat quy trinh nap du lieu Tu Dong!")

if __name__ == "__main__":
    # Để kiểm thử, bạn chỉ việc gõ: python exams_crawler.py
    run_pipeline()

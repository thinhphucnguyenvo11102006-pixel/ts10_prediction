import json
import os
import re
import sys
import time
import unicodedata
from datetime import datetime
from html.parser import HTMLParser

import requests

try:
    from bs4 import BeautifulSoup  # type: ignore
except ImportError:
    BeautifulSoup = None

# Ensure UTF-8 output for Windows console
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# --- CONFIGURATION & CONSTANTS ---
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_JS_FILE = os.path.normpath(os.path.join(SCRIPT_DIR, "../js/exams_data.js"))
DEFAULT_TARGET_URL = "https://example-exam-website.com/category/de-thi-vao-lop-10"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    )
}

SUBJECT_MAP = {
    "math": [r"\btoan\b", r"\bmath\b", r"\bmathematics\b"],
    "lit": [r"\bvan\b", r"\bngu van\b", r"\bliterature\b", r"\bnguvan\b"],
    "eng": [r"\btieng anh\b", r"\benglish\b", r"\banh\b"],
    "phys": [r"\bly\b", r"\bvật lý\b", r"\bphysics\b"],
    "chem": [r"\bhoa\b", r"\bhóa học\b", r"\bchemistry\b"],
    "bio": [r"\bsinh\b", r"\bsinh học\b", r"\bbiology\b"],
    "hist": [r"\bsu\b", r"\blịch sử\b", r"\bhistory\b"],
    "geog": [r"\bdia\b", r"\bđịa lý\b", r"\bgeography\b"],
}

# --- HELPERS ---

def log(msg, level="INFO"):
    icons = {"INFO": "🔍", "SUCCESS": "✅", "WARNING": "⚠️", "ERROR": "❌", "BOT": "🤖"}
    icon = icons.get(level, "🔹")
    print(f"{icon} [{level}] {msg}")

def _normalize_text(text):
    if not text:
        return ""
    normalized = unicodedata.normalize("NFKD", text)
    without_marks = "".join(ch for ch in normalized if not unicodedata.combining(ch))
    return without_marks.lower()

def guess_subject_from_title(title):
    title_lower = _normalize_text(title)
    for subject, patterns in SUBJECT_MAP.items():
        for pattern in patterns:
            if re.search(pattern, title_lower):
                return subject
    return "math"  # Default

def extract_date_from_text(text):
    """Attempt to find a date in dd/mm/yyyy format."""
    match = re.search(r"(\d{1,2}/\d{1,2}/\d{4})", text)
    if match:
        return match.group(1)
    return None

def _build_soup(html):
    if BeautifulSoup is not None:
        return BeautifulSoup(html, "html.parser")
    return _SimpleSoup(html)

# --- CORE LOGIC ---

def _extract_exam(article, index):
    # Toanmath uses h3 for titles
    title_tag = article.find("h3", class_="mh-posts-grid-title") or article.find("h2", class_="entry-title")
    if not title_tag:
        return None

    link_tag = title_tag.find("a")
    title = title_tag.text.strip()
    detail_url = link_tag["href"] if link_tag and link_tag.attrs.get("href") else "#"

    subject = guess_subject_from_title(title)
    
    # Try to find date in dedicated meta tag or text
    date_tag = article.find(class_="mh-meta-date") or article.find(class_="entry-date")
    found_date = extract_date_from_text(date_tag.text if date_tag else article.text)
    
    if not found_date:
        found_date = datetime.now().strftime("%d/%m/%Y")

    return {
        "id": f"{subject}-{int(time.time())}-{index}",
        "subject": subject,
        "title": title,
        "school": "THCS (Tự động cập nhật)",
        "year": str(datetime.now().year),
        "district": "TPHCM",
        "type": "Đề Tham Khảo",
        "date": found_date,
        "downloads": 0,
        "pdfUrl": detail_url,
    }

def crawl_target_website(target_url, max_items=15):
    log(f"Đang kết nối tới: {target_url} ...", "BOT")
    exams_db = []

    try:
        response = requests.get(target_url, headers=HEADERS, timeout=10)
        response.raise_for_status()
        soup = _build_soup(response.text)

        # Try different possible container classes
        articles = (
            soup.find_all("article", class_="mh-posts-grid-item") or 
            soup.find_all("article", class_="mh-posts-list-item") or
            soup.find_all("article", class_="post-item")
        )
        if not articles:
            log("Không tìm thấy bài viết nào. Hãy kiểm tra lại class HTML.", "WARNING")

        for index, article in enumerate(articles[:max_items]):
            exam = _extract_exam(article, index)
            if exam:
                exams_db.append(exam)
                log(f"Lấy thành công: {exam['title'][:50]}...", "SUCCESS")

    except Exception as e:
        log(f"Không thể cào dữ liệu từ {target_url}: {e}", "ERROR")

    return exams_db

def generate_js(exams_list):
    output_dir = os.path.dirname(OUTPUT_JS_FILE)
    if output_dir:
        os.makedirs(output_dir, exist_ok=True)

    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    js_content = f"""// CẢNH BÁO: File này được sinh tự động bởi Bot Crawler Pipeline.
// KHÔNG chỉnh sửa thủ công tại đây.
// Cập nhật lần cuối: {timestamp}

const EXAMS_DATA = {json.dumps(exams_list, indent=4, ensure_ascii=False)};
"""
    with open(OUTPUT_JS_FILE, "w", encoding="utf-8") as f:
        f.write(js_content)

    log(f"Đã xuất thành công {len(exams_list)} đề thi vào file {OUTPUT_JS_FILE}!", "SUCCESS")

def run_pipeline():
    print("\n" + "="*45)
    print("🚀  HỆ THỐNG CRAWLER NGÂN HÀNG ĐỀ v2.0")
    print("="*45)

    target_url = os.environ.get("EXAMS_CRAWLER_URL", DEFAULT_TARGET_URL)
    allow_demo = os.environ.get("EXAMS_CRAWLER_ALLOW_DEMO", "").strip().lower() in {"1", "true", "yes", "on"}

    exams_data = crawl_target_website(target_url)

    if not exams_data:
        if not allow_demo:
            log("Crawler không lấy được dữ liệu và Demo mode đang TẮT. Dừng pipeline.", "ERROR")
            raise SystemExit(1)

        log("Đang nạp dữ liệu Demo (Fallback mode) do cào thất bại...", "INFO")
        exams_data = _build_demo_data()

    generate_js(exams_data)
    log("Hoàn tất quy trình Pipeline Data!", "SUCCESS")

def _build_demo_data():
    now = datetime.now().strftime("%d/%m/%Y")
    return [
        {
            "id": f"math-fallback-{int(time.time())}",
            "subject": "math",
            "title": "Đề Toán 9 Demo - Mạng lỗi/Chưa cấu hình URL",
            "school": "Hệ thống dự phòng",
            "year": "2026",
            "district": "Hệ thống",
            "type": "Chính Thức",
            "date": now,
            "downloads": 99,
            "pdfUrl": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        }
    ]

# --- INTERNAL HTML PARSER FALLBACK ---
# This part is kept for environments without BeautifulSoup

class _SimpleNode:
    def __init__(self, tag, attrs=None):
        self.tag = tag
        self.attrs = dict(attrs or [])
        self.children = []
        self._direct_text = []

    def __getitem__(self, key):
        return self.attrs[key]

    @property
    def text(self):
        parts = ["".join(self._direct_text)]
        for child in self.children:
            parts.append(child.text)
        return "".join(parts)

    def find_all(self, tag=None, class_=None):
        found = []
        for child in self.children:
            # Check if tag matches
            tag_match = (tag is None or child.tag == tag)
            
            # Check if class matches (supporting multiple classes in HTML)
            class_match = True
            if class_ is not None:
                html_classes = child.attrs.get("class", "").split()
                class_match = (class_ in html_classes)
            
            if tag_match and class_match:
                found.append(child)
            
            # Recursive search
            found.extend(child.find_all(tag, class_))
        return found

    def find(self, tag=None, class_=None):
        matches = self.find_all(tag, class_)
        return matches[0] if matches else None

class _SimpleSoup(HTMLParser):
    def __init__(self, html, *args, **kwargs):
        super().__init__()
        self._root = _SimpleNode("root")
        self._stack = [self._root]
        self.feed(html)

    def handle_starttag(self, tag, attrs):
        node = _SimpleNode(tag, attrs)
        self._stack[-1].children.append(node)
        self._stack.append(node)

    def handle_endtag(self, tag):
        for idx in range(len(self._stack) - 1, 0, -1):
            if self._stack[idx].tag == tag:
                del self._stack[idx:]
                break

    def handle_data(self, data):
        if data:
            self._stack[-1]._direct_text.append(data)

    def find_all(self, tag, class_=None):
        return self._root.find_all(tag, class_)

if __name__ == "__main__":
    run_pipeline()

"""
exams_crawler.py — Ngân hàng đề TPHCM · Full Automation Pipeline

    SEARCH  →  CRAWL  →  FILTER (TPHCM)  →  RESOLVE PDF  →  DOWNLOAD  →  PUBLISH

Stage 1 (SEARCH)   : Duyệt các listing URL (mặc định = query HCM trên toanmath)
Stage 2 (CRAWL)    : Parse bài viết → {title, detail_url, date}
Stage 3 (FILTER)   : Chỉ giữ lại đề TPHCM (từ khoá HCM + blacklist tỉnh khác)
Stage 4 (RESOLVE)  : Truy cập trang chi tiết → trích xuất URL file PDF thật
Stage 5 (DOWNLOAD) : Tải PDF về thư mục ./pdfs/<slug>.pdf (có cache)
Stage 6 (PUBLISH)  : Sinh js/exams_data.js với pdfUrl = "pdfs/<slug>.pdf"

Chạy:
    python scripts/exams_crawler.py

Biến môi trường (tuỳ chọn):
    EXAMS_CRAWLER_QUERIES     Danh sách truy vấn HCM, phân cách bởi "|"
    EXAMS_CRAWLER_SEED_URLS   Danh sách listing URL, phân cách bởi "|"
    EXAMS_CRAWLER_MAX         Giới hạn đề mỗi nguồn (mặc định 30)
    EXAMS_CRAWLER_TOTAL_MAX   Tổng đề tối đa (mặc định 60)
    EXAMS_CRAWLER_SKIP_PDF    "1" để bỏ qua bước tải PDF (test nhanh)
    EXAMS_CRAWLER_ALLOW_DEMO  "1" để cho phép fallback demo khi cào rỗng
    EXAMS_CRAWLER_MERGE       "0" để ghi đè thay vì merge dữ liệu cũ (mặc định 1)
"""

from __future__ import annotations

import json
import os
import re
import sys
import time
import unicodedata
from dataclasses import dataclass, field
from datetime import datetime
from html import unescape
from typing import Iterable, Optional
from urllib.parse import quote_plus, urljoin, urlparse

import requests

# ---------------------------------------------------------------------------
# Console setup (Windows UTF-8 safety)
# ---------------------------------------------------------------------------
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# ---------------------------------------------------------------------------
# Paths & constants
# ---------------------------------------------------------------------------
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.normpath(os.path.join(SCRIPT_DIR, ".."))
OUTPUT_JS = os.path.join(ROOT_DIR, "js", "exams_data.js")
PDF_DIR = os.path.join(ROOT_DIR, "pdfs")
PDF_WEB_PREFIX = "pdfs"  # relative path used by web front-end (iframe src)

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    )
}

REQUEST_TIMEOUT = 20
DOWNLOAD_TIMEOUT = 60

# Environment defaults
DEFAULT_QUERIES = [
    "tuyển sinh lớp 10 TPHCM",
    "đề thi vào 10 TP HCM",
    "đề thi thử vào 10 Hồ Chí Minh",
    "đề khảo sát lớp 10 Sài Gòn",
]
DEFAULT_SEED_URLS: list[str] = []  # by default we use the query-based search


# ---------------------------------------------------------------------------
# Subject & district classifiers
# ---------------------------------------------------------------------------
SUBJECT_PATTERNS = {
    "math":  [r"\btoan\b", r"\bmath\b", r"\bmathematics\b"],
    "lit":   [r"\bvan\b", r"\bngu\s*van\b", r"\bliterature\b"],
    "eng":   [r"\btieng\s*anh\b", r"\benglish\b"],
    "phys":  [r"\bvat\s*ly\b", r"\bphysics\b"],
    "chem":  [r"\bhoa(?:\s*hoc)?\b", r"\bchemistry\b"],
    "bio":   [r"\bsinh(?:\s*hoc)?\b", r"\bbiology\b"],
    "hist":  [r"\blich\s*su\b", r"\bhistory\b"],
    "geog":  [r"\bdia(?:\s*ly)?\b", r"\bgeography\b"],
}

# Positive signals — something is definitely a TPHCM exam
HCM_PATTERNS = [
    r"\btphcm\b",
    r"\btp\.?\s*hcm\b",
    r"\btp\.?\s*h(?:o|ồ)\s*ch(?:i|í)\s*minh\b",
    r"\bh(?:o|ồ)\s*ch(?:i|í)\s*minh\b",
    r"\bsai\s*gon\b",
    r"\bsài\s*gòn\b",
    # HCM districts (must be explicit to avoid matching "Quận Hà Đông - Hà Nội")
    r"\b(?:qu(?:a|ậ)n)\s*(?:1|2|3|4|5|6|7|8|9|10|11|12)\b(?![^.]*h(?:à|a)\s*n(?:ộ|o)i)",
    r"\bg(?:o|ò)\s*v(?:a|ấ)p\b",
    r"\bb(?:i|ì)nh\s*th(?:a|ạ)nh\b",
    r"\bt(?:a|â)n\s*b(?:i|ì)nh\b",
    r"\bt(?:a|â)n\s*ph(?:u|ú)\b",
    r"\bph(?:u|ú)\s*nhu(?:a|ậ)n\b",
    r"\bb(?:i|ì)nh\s*t(?:a|â)n\b",
    r"\bth(?:u|ủ)\s*(?:đ|d)(?:u|ứ)c\b",
    r"\bh(?:o|ó)c\s*m(?:o|ô)n\b",
    r"\bnh(?:a|à)\s*b(?:e|è)\b",
    r"\bc(?:a|ầ)n\s*gi(?:o|ờ)\b",
    r"\bc(?:u|ủ)\s*chi\b",
    r"\bb(?:i|ì)nh\s*ch(?:a|á)nh\b",
]

# Negative signals — explicit non-HCM provinces that appear in toanmath titles
NON_HCM_PROVINCES = [
    "thai nguyen", "thanh hoa", "ha noi", "nghe an", "hai phong", "da nang",
    "nam dinh", "bac ninh", "hai duong", "quang ninh", "hung yen", "phu tho",
    "lao cai", "yen bai", "tuyen quang", "bac giang", "lang son", "cao bang",
    "bac kan", "thai binh", "ninh binh", "ha nam", "vinh phuc", "lam dong",
    "da lat", "hue", "thua thien hue", "quang tri", "quang binh", "ha tinh",
    "binh dinh", "phu yen", "khanh hoa", "ninh thuan", "binh thuan",
    "dong nai", "binh duong", "vung tau", "ba ria", "tay ninh", "long an",
    "tien giang", "ben tre", "vinh long", "tra vinh", "can tho", "hau giang",
    "soc trang", "bac lieu", "ca mau", "an giang", "kien giang", "dong thap",
    "quang nam", "quang ngai", "kon tum", "gia lai", "dak lak", "dak nong",
    "son la", "dien bien", "lai chau", "hoa binh", "ha giang",
]


# ---------------------------------------------------------------------------
# Data model
# ---------------------------------------------------------------------------
@dataclass
class Candidate:
    title: str
    detail_url: str
    date: Optional[str] = None  # "dd/mm/yyyy"
    source: str = ""
    # Enriched after resolve/download
    pdf_url: Optional[str] = None         # absolute remote URL
    pdf_local: Optional[str] = None       # relative path for web (pdfs/xxx.pdf)
    subject: str = "math"
    district: str = "TPHCM"


# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
def log(msg: str, level: str = "INFO") -> None:
    icons = {
        "INFO": "[i]", "OK": "[+]", "WARN": "[!]",
        "ERR": "[x]", "STEP": "==>", "SKIP": "[-]",
    }
    print(f"{icons.get(level, '•')} {msg}")


# ---------------------------------------------------------------------------
# Text helpers
# ---------------------------------------------------------------------------
def _strip_accents(text: str) -> str:
    if not text:
        return ""
    # NFKD doesn't decompose đ/Đ — map manually before normalization
    text = text.replace("đ", "d").replace("Đ", "D")
    normalized = unicodedata.normalize("NFKD", text)
    return "".join(ch for ch in normalized if not unicodedata.combining(ch)).lower()


def _slugify(text: str, max_len: int = 80) -> str:
    s = _strip_accents(text)
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s[:max_len] or f"exam-{int(time.time())}"


def guess_subject(title: str) -> str:
    norm = _strip_accents(title)
    for subject, patterns in SUBJECT_PATTERNS.items():
        if any(re.search(p, norm) for p in patterns):
            return subject
    return "math"


def is_tphcm(title: str, extra_text: str = "") -> bool:
    """Strict TPHCM classifier. Positive signal must fire AND no other province."""
    blob = _strip_accents(f"{title}\n{extra_text}")

    if any(re.search(p, blob) for p in HCM_PATTERNS):
        # HCM signal present → also ensure no other province explicitly mentioned
        for province in NON_HCM_PROVINCES:
            if re.search(rf"\b{re.escape(province)}\b", blob):
                return False
        return True
    return False


def extract_date(text: str) -> Optional[str]:
    m = re.search(r"(\d{1,2})/(\d{1,2})/(\d{4})", text or "")
    if m:
        return f"{int(m.group(1)):02d}/{int(m.group(2)):02d}/{m.group(3)}"
    return None


# ---------------------------------------------------------------------------
# HTTP helpers
# ---------------------------------------------------------------------------
_session: Optional[requests.Session] = None


def _http() -> requests.Session:
    global _session
    if _session is None:
        s = requests.Session()
        s.headers.update(HEADERS)
        _session = s
    return _session


def _fetch(url: str, timeout: int = REQUEST_TIMEOUT) -> Optional[str]:
    try:
        r = _http().get(url, timeout=timeout, allow_redirects=True)
        r.raise_for_status()
        # Let requests pick encoding from HTTP headers; fallback to apparent
        if not r.encoding or r.encoding.lower() == "iso-8859-1":
            r.encoding = r.apparent_encoding or "utf-8"
        return r.text
    except Exception as e:
        log(f"Fetch failed [{url}]: {e}", "WARN")
        return None


# ---------------------------------------------------------------------------
# STAGE 1 — SEARCH
# ---------------------------------------------------------------------------
def _build_toanmath_search_url(query: str) -> str:
    return f"https://thcs.toanmath.com/?s={quote_plus(query)}"


def search_sources() -> list[str]:
    queries_env = os.environ.get("EXAMS_CRAWLER_QUERIES", "").strip()
    seed_env = os.environ.get("EXAMS_CRAWLER_SEED_URLS", "").strip()

    queries = (
        [q.strip() for q in queries_env.split("|") if q.strip()]
        if queries_env else DEFAULT_QUERIES
    )
    seeds = (
        [u.strip() for u in seed_env.split("|") if u.strip()]
        if seed_env else list(DEFAULT_SEED_URLS)
    )

    urls = [_build_toanmath_search_url(q) for q in queries] + seeds
    # Dedupe while preserving order
    seen: set[str] = set()
    out: list[str] = []
    for u in urls:
        if u not in seen:
            seen.add(u)
            out.append(u)
    return out


# ---------------------------------------------------------------------------
# STAGE 2 — CRAWL (regex-based, no bs4 dependency)
# ---------------------------------------------------------------------------
_ARTICLE_RE = re.compile(
    r'<article[^>]*class="[^"]*mh-posts-(?:grid|list)-item[^"]*"[^>]*>(.*?)</article>',
    re.I | re.S,
)

_TITLE_RE = re.compile(
    r'<h[23][^>]*class="[^"]*(?:mh-posts-(?:grid|list)-title|entry-title)[^"]*"[^>]*>\s*'
    r'<a[^>]*href="([^"]+)"[^>]*>(.*?)</a>',
    re.I | re.S,
)

_DATE_RE = re.compile(
    r'<(?:span|time|li)[^>]*class="[^"]*(?:mh-meta-date|entry-date|post-date)[^"]*"[^>]*>(.*?)</(?:span|time|li)>',
    re.I | re.S,
)


def _clean_text(html_fragment: str) -> str:
    return unescape(re.sub(r"<[^>]+>", "", html_fragment or "")).strip()


def extract_candidates(listing_url: str, max_items: int) -> list[Candidate]:
    html = _fetch(listing_url)
    if not html:
        return []

    articles = _ARTICLE_RE.findall(html)
    if not articles:
        log(f"Không tìm thấy <article> nào ở {listing_url}", "WARN")
        return []

    out: list[Candidate] = []
    for art in articles[:max_items]:
        tm = _TITLE_RE.search(art)
        if not tm:
            continue
        href = unescape(tm.group(1)).strip()
        title = _clean_text(tm.group(2))
        if not title or not href.startswith("http"):
            continue

        # Date
        dm = _DATE_RE.search(art)
        date = extract_date(_clean_text(dm.group(1)) if dm else "") or extract_date(_clean_text(art))

        out.append(Candidate(
            title=title,
            detail_url=href,
            date=date,
            source=urlparse(listing_url).netloc,
        ))
    return out


# ---------------------------------------------------------------------------
# STAGE 4 — RESOLVE PDF URL
# ---------------------------------------------------------------------------
_IFRAME_SRC_RE = re.compile(r'<iframe[^>]*src="([^"]+)"', re.I)
_ANCHOR_PDF_RE = re.compile(r'href="([^"]+\.pdf[^"]*)"', re.I)
_DRIVE_ID_RE = re.compile(r'drive\.google\.com/(?:file/d/|uc\?[^"]*id=|open\?[^"]*id=)([a-zA-Z0-9_\-]{20,})')


def resolve_pdf_url(detail_url: str) -> Optional[str]:
    html = _fetch(detail_url)
    if not html:
        return None

    # (a) Toanmath wonderplugin-pdf-embed pattern:
    #     <iframe src=".../viewer.html?...&file=https://.../file.pdf">
    for src in _IFRAME_SRC_RE.findall(html):
        src = unescape(src)
        m = re.search(r"[?&]file=([^&]+\.pdf[^&]*)", src, re.I)
        if m:
            return unescape(m.group(1))
        # Direct PDF in iframe src
        if re.search(r"\.pdf(\?|$)", src, re.I):
            return urljoin(detail_url, src)
        # Google Drive preview
        gdm = _DRIVE_ID_RE.search(src)
        if gdm:
            return f"https://drive.google.com/uc?export=download&id={gdm.group(1)}"

    # (b) Direct <a href="...pdf">
    for href in _ANCHOR_PDF_RE.findall(html):
        return urljoin(detail_url, unescape(href))

    # (c) Any Google Drive link in page body
    gdm = _DRIVE_ID_RE.search(html)
    if gdm:
        return f"https://drive.google.com/uc?export=download&id={gdm.group(1)}"

    return None


# ---------------------------------------------------------------------------
# STAGE 5 — DOWNLOAD
# ---------------------------------------------------------------------------
def download_pdf(pdf_url: str, dest_path: str) -> bool:
    if os.path.exists(dest_path) and os.path.getsize(dest_path) > 1024:
        return True  # cached

    os.makedirs(os.path.dirname(dest_path), exist_ok=True)
    tmp_path = dest_path + ".part"
    try:
        with _http().get(pdf_url, timeout=DOWNLOAD_TIMEOUT, stream=True, allow_redirects=True) as r:
            r.raise_for_status()
            ctype = r.headers.get("Content-Type", "").lower()
            # Sanity check: refuse to save HTML as PDF
            if "html" in ctype and "pdf" not in ctype:
                log(f"Bỏ qua (Content-Type={ctype}): {pdf_url}", "SKIP")
                return False
            with open(tmp_path, "wb") as f:
                for chunk in r.iter_content(chunk_size=64 * 1024):
                    if chunk:
                        f.write(chunk)
        if os.path.getsize(tmp_path) < 1024:
            os.remove(tmp_path)
            return False
        os.replace(tmp_path, dest_path)
        return True
    except Exception as e:
        log(f"Tải PDF lỗi [{pdf_url}]: {e}", "WARN")
        if os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except OSError:
                pass
        return False


# ---------------------------------------------------------------------------
# STAGE 6 — PUBLISH
# ---------------------------------------------------------------------------
def _load_existing_exams() -> dict[str, dict]:
    """Load previous exams_data.js (if any) to preserve ids, downloads."""
    if not os.path.exists(OUTPUT_JS):
        return {}
    try:
        with open(OUTPUT_JS, "r", encoding="utf-8") as f:
            src = f.read()
        m = re.search(r"const\s+EXAMS_DATA\s*=\s*(\[.*?\]);", src, re.S)
        if not m:
            return {}
        data = json.loads(m.group(1))
        # Index by detail URL or pdf URL to allow cache-hit on rerun
        idx: dict[str, dict] = {}
        for ex in data:
            key = ex.get("sourceUrl") or ex.get("pdfUrl")
            if key:
                idx[key] = ex
        return idx
    except Exception as e:
        log(f"Không đọc được exams_data.js cũ: {e}", "WARN")
        return {}


def _id_from_url(detail_url: str) -> str:
    """Stable, unique id derived from the article URL path."""
    path = urlparse(detail_url).path.rstrip("/")
    base = os.path.basename(path).removesuffix(".html").removesuffix(".htm")
    return _slugify(base, 80) or _slugify(path, 80)


def build_exam_entry(cand: Candidate, existing: dict[str, dict]) -> dict:
    prev = existing.get(cand.detail_url) or {}
    subject = cand.subject or guess_subject(cand.title)
    date = cand.date or prev.get("date") or datetime.now().strftime("%d/%m/%Y")

    # Determine type label from title
    title_low = cand.title.lower()
    if "thử" in title_low:
        exam_type = "Đề Thi Thử"
    elif "khảo sát" in title_low:
        exam_type = "Đề Khảo Sát"
    elif "tuyển sinh" in title_low or "chính thức" in title_low:
        exam_type = "Tuyển Sinh Chính Thức"
    else:
        exam_type = prev.get("type") or "Đề Tham Khảo"

    pdf_ref = cand.pdf_local or prev.get("pdfUrl") or cand.pdf_url or cand.detail_url

    stable_id = f"{subject}-{_id_from_url(cand.detail_url)}"

    return {
        "id": stable_id,
        "subject": subject,
        "title": cand.title,
        "school": prev.get("school") or "THCS (Tự động cập nhật)",
        "year": str(datetime.now().year),
        "district": "TPHCM",
        "type": exam_type,
        "date": date,
        "downloads": prev.get("downloads", 0),
        "pdfUrl": pdf_ref,
        "sourceUrl": cand.detail_url,
    }


def publish(exams: list[dict]) -> None:
    os.makedirs(os.path.dirname(OUTPUT_JS), exist_ok=True)
    stamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    body = json.dumps(exams, indent=4, ensure_ascii=False)
    content = (
        "// CẢNH BÁO: File này được sinh tự động bởi Bot Crawler Pipeline.\n"
        "// KHÔNG chỉnh sửa thủ công tại đây.\n"
        f"// Cập nhật lần cuối: {stamp}\n"
        f"// Tổng số đề TPHCM: {len(exams)}\n\n"
        f"const EXAMS_DATA = {body};\n"
    )
    with open(OUTPUT_JS, "w", encoding="utf-8") as f:
        f.write(content)
    log(f"Đã ghi {len(exams)} đề TPHCM vào {os.path.relpath(OUTPUT_JS, ROOT_DIR)}", "OK")


# ---------------------------------------------------------------------------
# PIPELINE ORCHESTRATION
# ---------------------------------------------------------------------------
def run_pipeline() -> None:
    print("=" * 56)
    print("   HỆ THỐNG CRAWLER NGÂN HÀNG ĐỀ TPHCM  v3.0")
    print("=" * 56)

    max_per_source = int(os.environ.get("EXAMS_CRAWLER_MAX", "30"))
    total_max = int(os.environ.get("EXAMS_CRAWLER_TOTAL_MAX", "60"))
    skip_pdf = os.environ.get("EXAMS_CRAWLER_SKIP_PDF", "").lower() in {"1", "true", "yes"}
    allow_demo = os.environ.get("EXAMS_CRAWLER_ALLOW_DEMO", "").lower() in {"1", "true", "yes"}
    merge_old = os.environ.get("EXAMS_CRAWLER_MERGE", "1").lower() not in {"0", "false", "no"}

    existing = _load_existing_exams() if merge_old else {}

    # ------ STAGE 1 — SEARCH
    log("STAGE 1 · SEARCH — xác định nguồn dữ liệu", "STEP")
    sources = search_sources()
    for u in sources:
        log(f"  · {u}", "INFO")

    # ------ STAGE 2 — CRAWL
    log("STAGE 2 · CRAWL — lấy danh sách bài viết", "STEP")
    raw: list[Candidate] = []
    seen_urls: set[str] = set()
    for src in sources:
        for c in extract_candidates(src, max_per_source):
            if c.detail_url in seen_urls:
                continue
            seen_urls.add(c.detail_url)
            raw.append(c)
    log(f"  Tổng ứng viên thô: {len(raw)}", "INFO")

    # ------ STAGE 3 — FILTER (TPHCM)
    log("STAGE 3 · FILTER — chỉ giữ đề TPHCM", "STEP")
    hcm: list[Candidate] = []
    rejected = 0
    for c in raw:
        if is_tphcm(c.title):
            hcm.append(c)
        else:
            rejected += 1
    log(f"  Giữ lại: {len(hcm)} | Loại: {rejected}", "INFO")

    if not hcm:
        if allow_demo:
            log("Không có đề HCM → nạp dữ liệu demo (ALLOW_DEMO=1)", "WARN")
            publish(_build_demo())
            return
        log("Pipeline không lấy được đề TPHCM nào. Dừng.", "ERR")
        raise SystemExit(2)

    hcm = hcm[:total_max]

    # ------ STAGE 4+5 — RESOLVE & DOWNLOAD
    log(f"STAGE 4+5 · RESOLVE + DOWNLOAD PDF ({len(hcm)} đề)", "STEP")
    os.makedirs(PDF_DIR, exist_ok=True)
    published: list[dict] = []
    for i, c in enumerate(hcm, 1):
        c.subject = guess_subject(c.title)
        prefix = f"[{i}/{len(hcm)}]"

        if skip_pdf:
            log(f"{prefix} SKIP_PDF=1 · giữ nguyên link: {c.title[:60]}", "SKIP")
            published.append(build_exam_entry(c, existing))
            continue

        # Cache hit? If local PDF already exists for this detail URL
        prev = existing.get(c.detail_url)
        if prev and prev.get("pdfUrl", "").startswith(f"{PDF_WEB_PREFIX}/"):
            local_abs = os.path.join(ROOT_DIR, prev["pdfUrl"])
            if os.path.exists(local_abs) and os.path.getsize(local_abs) > 1024:
                c.pdf_local = prev["pdfUrl"]
                log(f"{prefix} Cache hit · {os.path.basename(local_abs)}", "OK")
                published.append(build_exam_entry(c, existing))
                continue

        pdf_url = resolve_pdf_url(c.detail_url)
        if not pdf_url:
            log(f"{prefix} Không tìm thấy PDF, bỏ qua: {c.title[:60]}", "SKIP")
            continue
        c.pdf_url = pdf_url

        slug = _slugify(c.title)
        local_name = f"{slug}.pdf"
        local_abs = os.path.join(PDF_DIR, local_name)
        if download_pdf(pdf_url, local_abs):
            c.pdf_local = f"{PDF_WEB_PREFIX}/{local_name}"
            log(f"{prefix} OK · {local_name} ({os.path.getsize(local_abs) // 1024} KB)", "OK")
            published.append(build_exam_entry(c, existing))
        else:
            log(f"{prefix} Download thất bại, bỏ qua.", "WARN")

    # ------ STAGE 6 — PUBLISH
    log("STAGE 6 · PUBLISH — sinh js/exams_data.js", "STEP")
    if not published:
        if allow_demo:
            publish(_build_demo())
            return
        log("Không có đề nào sẵn sàng publish.", "ERR")
        raise SystemExit(3)

    # Sort: newest date first
    def _date_key(e: dict) -> str:
        d = e.get("date", "01/01/1970")
        parts = d.split("/")
        if len(parts) == 3:
            return f"{parts[2]}{int(parts[1]):02d}{int(parts[0]):02d}"
        return "00000000"

    published.sort(key=_date_key, reverse=True)
    publish(published)
    log("Pipeline hoàn tất!", "OK")


# ---------------------------------------------------------------------------
# Demo fallback
# ---------------------------------------------------------------------------
def _build_demo() -> list[dict]:
    now = datetime.now().strftime("%d/%m/%Y")
    return [{
        "id": "math-demo-fallback",
        "subject": "math",
        "title": "Đề Toán TPHCM Demo — pipeline chưa có dữ liệu",
        "school": "Hệ thống dự phòng",
        "year": str(datetime.now().year),
        "district": "TPHCM",
        "type": "Đề Tham Khảo",
        "date": now,
        "downloads": 0,
        "pdfUrl": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        "sourceUrl": "",
    }]


# ---------------------------------------------------------------------------
if __name__ == "__main__":
    run_pipeline()

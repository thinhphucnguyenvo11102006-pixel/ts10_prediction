"""
exams_crawler.py — Ngân hàng đề TPHCM · Full Automation Pipeline (v4)

    SEARCH → CRAWL → FILTER (TPHCM + lớp 10 + 3 môn) → RESOLVE PDF → DOWNLOAD → PUBLISH

Phạm vi dữ liệu:
    - Chỉ lấy đề TUYỂN SINH vào LỚP 10 (loại bỏ đề học kì / cuối kì / kiểm tra).
    - Chỉ 3 môn: Toán, Ngữ Văn, Tiếng Anh.
    - Chỉ khu vực TPHCM.

Nguồn dữ liệu mặc định (có thể mở rộng qua biến môi trường):
    · thcs.toanmath.com   (Toán — search `?s=...`)
    · langgo.edu.vn       (Tiếng Anh — curated article seeds)
    · tailieudieuky.com   (Văn + Anh — search `?s=...`)
    · tailieugiangday.vn  (Văn — curated seeds)

Chạy:
    python scripts/exams_crawler.py

Biến môi trường (tuỳ chọn):
    EXAMS_CRAWLER_QUERIES     Danh sách truy vấn (pipe-sep) — ghi đè toàn bộ query mặc định
    EXAMS_CRAWLER_SEED_URLS   URL listing / article thêm (pipe-sep)
    EXAMS_CRAWLER_SUBJECTS    Danh sách môn học (mặc định math,lit,eng)
    EXAMS_CRAWLER_MAX         Giới hạn đề mỗi nguồn (mặc định 30)
    EXAMS_CRAWLER_TOTAL_MAX   Tổng đề tối đa (mặc định 80)
    EXAMS_CRAWLER_SKIP_PDF    "1" → bỏ bước tải PDF (test nhanh)
    EXAMS_CRAWLER_ALLOW_DEMO  "1" → fallback demo khi cào rỗng
    EXAMS_CRAWLER_MERGE       "0" → ghi đè thay vì merge dữ liệu cũ (mặc định 1)
    EXAMS_CRAWLER_MAX_PAGES   Số trang tối đa mỗi listing URL (mặc định 8)
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
from urllib.parse import quote_plus, unquote, urljoin, urlparse

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

REQUEST_TIMEOUT = 30
DOWNLOAD_TIMEOUT = 90

# Maximum extra pages to follow per listing URL (page 1 is always fetched)
MAX_PAGES_PER_SOURCE = int(os.environ.get("EXAMS_CRAWLER_MAX_PAGES", "8"))

# ---------------------------------------------------------------------------
# Environment defaults — per-subject sources
# ---------------------------------------------------------------------------
# Subject whitelist (fixed scope: Toán, Văn, Anh)
ALLOWED_SUBJECTS = {"math", "lit", "eng"}

# Per-subject listing URL templates (%q% is replaced with URL-encoded query).
# Each template will be fetched for every query, plus up to MAX_PAGES_PER_SOURCE
# additional pages (page/2/, page/3/, ...).
SUBJECT_SOURCES: dict[str, list[tuple[str, str]]] = {
    "math": [
        ("https://thcs.toanmath.com/?s=%q%", "math"),
    ],
    "lit": [
        ("https://thcs.toanmath.com/?s=%q%", "lit"),
    ],
    "eng": [
        ("https://thcs.toanmath.com/?s=%q%", "eng"),
    ],
}

# High-precision per-subject queries (verified to produce article grids on thcs.toanmath.com).
# Listed in decreasing precision order — most targeted first.
DEFAULT_SUBJECT_QUERIES: dict[str, list[str]] = {
    "math": [
        # Cực kỳ chính xác — chỉ ra đề tuyển sinh 10 TPHCM môn Toán
        "TP HCM Toán tuyển sinh",
        "Toán tuyển sinh lớp 10 TP HCM",
        "Hồ Chí Minh",           # broad sweep for remaining HCM exams
        "TP HCM",
    ],
    "lit": [
        # Toanmath có Văn khi search "Ngữ Văn tuyển sinh TP HCM" → 20 bài đúng
        "Ngữ Văn tuyển sinh TP HCM",
        "Văn vào lớp 10 TP HCM",
        "Ngữ Văn tuyển sinh Hồ Chí Minh",
    ],
    "eng": [
        "Tiếng Anh tuyển sinh TP HCM",
        "Tiếng Anh vào lớp 10 TP HCM",
        "Tiếng Anh Hồ Chí Minh tuyển sinh lớp 10",
    ],
}

# Curated single-article seeds — each is treated as one exam entry.
# Only include URLs whose page titles clearly state TPHCM + lớp 10 entrance + subject.
DEFAULT_ARTICLE_SEEDS: list[str] = [
    # ── Tiếng Anh ────────────────────────────────────────────────────────────
    # LangGo: chính thức Sở GD&ĐT TPHCM + đề tham khảo (PDF trực tiếp trong page)
    "https://langgo.edu.vn/de-thi-tieng-anh-vao-10-tphcm-2025",
    "https://langgo.edu.vn/de-tieng-anh-tuyen-sinh-vao-lop-10-tphcm-2024",

    # ── Ngữ Văn ──────────────────────────────────────────────────────────────
    # Tài liệu Giảng Dạy: đề thi thử Văn TP HCM 2024-2025 (PDF Wasabi S3)
    "https://tailieugiangday.vn/item/de-thi-thu-vao-10-mon-ngu-van-tp-ho-chi-minh-nam-hoc-2024-2025/42932",
]


# ---------------------------------------------------------------------------
# Subject classifier (only 3 môn được giữ lại)
# ---------------------------------------------------------------------------
SUBJECT_PATTERNS = {
    "eng":   [r"\btieng\s*anh\b", r"\banh\s*van\b", r"\benglish\b"],
    "lit":   [r"\bngu\s*van\b", r"\bvan\s*hoc\b", r"\bmon\s*van\b", r"\bliterature\b"],
    "math":  [r"\btoan\b", r"\bmath\b", r"\bmathematics\b"],
}

# ---------------------------------------------------------------------------
# Lớp 10 entrance-exam detector
# ---------------------------------------------------------------------------
# Positive signals — title must explicitly mention "vào lớp 10" / "tuyển sinh"
_LOP10_POS_PATTERNS = [
    r"\bvao\s*lop\s*10\b",
    r"\bvao\s*10\b",
    r"\btuyen\s*sinh\s*(?:vao\s*)?(?:lop\s*)?10\b",
    r"\bthi\s*vao\s*(?:lop\s*)?10\b",
    r"\bon\s*thi\s*(?:vao\s*)?(?:lop\s*)?10\b",
    r"\bon\s*tap\s*tuyen\s*sinh\s*(?:lop\s*)?10\b",
    r"\bkhao\s*sat\s*(?:vao\s*)?(?:lop\s*)?10\b",
]

# Negative signals — within-semester / in-grade exams must be rejected
_NON_ENTRANCE_PATTERNS = [
    r"\bhoc\s*ki\b",          # học kì
    r"\bcuoi\s*ki\b",         # cuối kì
    r"\bgiua\s*ki\b",         # giữa kì
    r"\bhoc\s*ky\b",          # học kỳ (diacritic variant)
    r"\bkiem\s*tra\s*(?:cuoi|giua|dinh\s*ki)\b",
    r"\b(?:de\s*)?nghi\s*cuoi\s*ki\b",
    r"\btham\s*khao\s*hoc\s*ki\b",
    r"\bon\s*tap\s*hoc\s*ki\b",
    r"\bkhao\s*sat\s*chat\s*luong\s*(?:dau|giua|cuoi)\s*nam\b",
]

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


def guess_subject(title: str) -> Optional[str]:
    """Return 'math' | 'lit' | 'eng' or None if the title is not one of the 3 target subjects."""
    norm = _strip_accents(title)
    # Order matters: check eng/lit first so "Toán" inside an English title doesn't mis-classify
    for subject in ("eng", "lit", "math"):
        for pattern in SUBJECT_PATTERNS[subject]:
            if re.search(pattern, norm):
                return subject
    return None


def is_lop10_entrance(title: str) -> bool:
    """True only if the title is an entrance exam for grade 10 (reject semester tests)."""
    norm = _strip_accents(title)
    if any(re.search(p, norm) for p in _NON_ENTRANCE_PATTERNS):
        return False
    return any(re.search(p, norm) for p in _LOP10_POS_PATTERNS)


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
def _fill_query(template: str, query: str) -> str:
    """Replace %q% placeholder with URL-encoded query."""
    return template.replace("%q%", quote_plus(query))


def _paginate(base_url: str, max_pages: int) -> list[str]:
    """Generate page URLs for a WordPress-style search listing.

    Page 1  → base_url  (e.g. https://thcs.toanmath.com/?s=foo)
    Page N  → insert /page/N/ before the query string
              https://thcs.toanmath.com/page/N/?s=foo
    """
    if max_pages <= 1:
        return [base_url]

    parsed = urlparse(base_url)
    # Build base path without trailing slash
    path = parsed.path.rstrip("/")
    qs = f"?{parsed.query}" if parsed.query else ""
    base_no_qs = f"{parsed.scheme}://{parsed.netloc}{path}"

    pages = [base_url]  # page 1
    for n in range(2, max_pages + 1):
        pages.append(f"{base_no_qs}/page/{n}/{qs}")
    return pages


def search_sources(subjects: Iterable[str]) -> list[str]:
    """Build the ordered list of URLs to crawl (listing + single-article seeds)."""
    subjects = [s for s in subjects if s in ALLOWED_SUBJECTS]
    queries_env = os.environ.get("EXAMS_CRAWLER_QUERIES", "").strip()
    seed_env = os.environ.get("EXAMS_CRAWLER_SEED_URLS", "").strip()

    extra_queries = [q.strip() for q in queries_env.split("|") if q.strip()] if queries_env else []
    extra_seeds = [u.strip() for u in seed_env.split("|") if u.strip()] if seed_env else []

    urls: list[str] = []

    # Per-subject search URLs (with pagination)
    for subject in subjects:
        queries = extra_queries or DEFAULT_SUBJECT_QUERIES.get(subject, [])
        for (tmpl, _hint) in SUBJECT_SOURCES.get(subject, []):
            for q in queries:
                base = _fill_query(tmpl, q)
                urls.extend(_paginate(base, MAX_PAGES_PER_SOURCE))

    # Curated single-article seeds + env seeds (no pagination)
    urls.extend(DEFAULT_ARTICLE_SEEDS)
    urls.extend(extra_seeds)

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


_PAGE_TITLE_RE = re.compile(r"<title[^>]*>(.*?)</title>", re.I | re.S)
_OG_TITLE_RE = re.compile(r'<meta[^>]+property="og:title"[^>]+content="([^"]+)"', re.I)
_H1_RE = re.compile(r'<h1[^>]*>(.*?)</h1>', re.I | re.S)


def _extract_page_title(html: str) -> Optional[str]:
    for pat in (_OG_TITLE_RE, _H1_RE, _PAGE_TITLE_RE):
        m = pat.search(html)
        if m:
            title = _clean_text(m.group(1))
            # Strip common site-name suffixes  " - THCS.TOANMATH.com" / "| LangGo"
            title = re.split(
                r"\s*[-|–]\s*(?:thcs\.toanmath|toanmath|langgo|tailieudieuky)",
                title, maxsplit=1, flags=re.I,
            )[0].strip()
            if title:
                return title
    return None


def extract_candidates(listing_url: str, max_items: int) -> list[Candidate]:
    html = _fetch(listing_url)
    if not html:
        return []

    host = urlparse(listing_url).netloc

    # --- Listing mode (multiple <article> cards) ---
    articles = _ARTICLE_RE.findall(html)
    if articles:
        out: list[Candidate] = []
        for art in articles[:max_items]:
            tm = _TITLE_RE.search(art)
            if not tm:
                continue
            href = unescape(tm.group(1)).strip()
            title = _clean_text(tm.group(2))
            if not title or not href.startswith("http"):
                continue
            dm = _DATE_RE.search(art)
            date = extract_date(_clean_text(dm.group(1)) if dm else "") or extract_date(_clean_text(art))
            out.append(Candidate(
                title=title, detail_url=href, date=date, source=host,
            ))
        return out

    # --- Single-article fallback mode ---
    # Heuristic: the URL does NOT look like a search/listing page.
    parsed = urlparse(listing_url)
    is_search_like = ("?s=" in listing_url or "/search" in parsed.path or "/tim-kiem" in parsed.path
                      or "/category/" in parsed.path or "/tag/" in parsed.path)
    if is_search_like:
        log(f"Không tìm thấy bài viết ở listing: {listing_url}", "WARN")
        return []

    title = _extract_page_title(html)
    if not title:
        log(f"Không trích xuất được tiêu đề: {listing_url}", "WARN")
        return []

    date = extract_date(html[:10000]) or None
    return [Candidate(title=title, detail_url=listing_url, date=date, source=host)]


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

    # (a) PDFjs-viewer embed pattern (toanmath wonderplugin, tailieugiangday, etc.):
    #     <iframe src=".../viewer.html?...&file=https%3A%2F%2F.../file.pdf">
    for src in _IFRAME_SRC_RE.findall(html):
        src = unescape(src)
        m = re.search(r"[?&]file=([^&]+(?:\.pdf|%2Fpreview%2F)[^&]*)", src, re.I)
        if m:
            # Decode both HTML entities and URL percent-encoding
            return unquote(m.group(1))
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
    subject = cand.subject or guess_subject(cand.title) or "math"
    date = cand.date or prev.get("date") or datetime.now().strftime("%d/%m/%Y")

    # Determine type label from title (order matters — check specific before generic)
    title_low = cand.title.lower()
    if "thử" in title_low:
        exam_type = "Đề Thi Thử"
    elif "tham khảo" in title_low or "ôn thi" in title_low or "ôn tập" in title_low:
        exam_type = "Đề Tham Khảo"
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
    print("   HỆ THỐNG CRAWLER NGÂN HÀNG ĐỀ TPHCM  v5.0")
    print("=" * 56)

    max_per_source = int(os.environ.get("EXAMS_CRAWLER_MAX", "30"))
    total_max = int(os.environ.get("EXAMS_CRAWLER_TOTAL_MAX", "150"))
    skip_pdf = os.environ.get("EXAMS_CRAWLER_SKIP_PDF", "").lower() in {"1", "true", "yes"}
    allow_demo = os.environ.get("EXAMS_CRAWLER_ALLOW_DEMO", "").lower() in {"1", "true", "yes"}
    merge_old = os.environ.get("EXAMS_CRAWLER_MERGE", "1").lower() not in {"0", "false", "no"}

    subjects_env = os.environ.get("EXAMS_CRAWLER_SUBJECTS", "").strip()
    subjects = (
        [s.strip() for s in subjects_env.split(",") if s.strip() in ALLOWED_SUBJECTS]
        if subjects_env else sorted(ALLOWED_SUBJECTS)
    )

    existing = _load_existing_exams() if merge_old else {}

    # ------ STAGE 1 — SEARCH
    log("STAGE 1 · SEARCH — xác định nguồn dữ liệu", "STEP")
    log(f"  Phạm vi: TPHCM · lớp 10 tuyển sinh · môn = {','.join(subjects)} · max_pages={MAX_PAGES_PER_SOURCE}", "INFO")
    sources = search_sources(subjects)
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

    # ------ STAGE 3 — FILTER (TPHCM + Lớp 10 tuyển sinh + 3 môn)
    log("STAGE 3 · FILTER — TPHCM · lớp 10 · Toán/Văn/Anh", "STEP")
    hcm: list[Candidate] = []
    rej_district = rej_entrance = rej_subject = 0
    for c in raw:
        if not is_tphcm(c.title):
            rej_district += 1
            continue
        if not is_lop10_entrance(c.title):
            rej_entrance += 1
            continue
        subj = guess_subject(c.title)
        if subj is None or subj not in subjects:
            rej_subject += 1
            continue
        c.subject = subj
        hcm.append(c)
    log(f"  Giữ lại: {len(hcm)} | Loại: {rej_district} (ngoài HCM) "
        f"+ {rej_entrance} (không phải tuyển sinh 10) "
        f"+ {rej_subject} (môn khác)", "INFO")

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

"""
migrate_pdfs_to_release.py — Chuyển PDF từ local sang GitHub Releases

Workflow:
  1. Tạo GitHub Release tag "exam-bank-pdfs"
  2. Upload toàn bộ PDF trong pdfs/ lên release assets
  3. Cập nhật exams_data.js: pdfUrl trỏ đến GitHub Release URL
  4. In báo cáo kết quả

Yêu cầu: GitHub CLI (gh) đã đăng nhập.

Chạy:
    python scripts/migrate_pdfs_to_release.py
"""

from __future__ import annotations

import json
import os
import re
import subprocess
import sys
import time

# ---------------------------------------------------------------------------
# Console setup (Windows UTF-8 safety)
# ---------------------------------------------------------------------------
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.normpath(os.path.join(SCRIPT_DIR, ".."))
PDF_DIR = os.path.join(ROOT_DIR, "pdfs")
EXAMS_DATA_JS = os.path.join(ROOT_DIR, "js", "exams_data.js")

# GitHub Release config
RELEASE_TAG = "exam-bank-pdfs"
RELEASE_TITLE = "📚 Ngân hàng đề thi PDF - Exam Bank Assets"
RELEASE_NOTES = (
    "Thư mục lưu trữ file PDF cho Ngân hàng đề thi TS10 TPHCM.\n\n"
    "File này được quản lý tự động bởi crawler pipeline.\n"
    "**Không xóa release này** - frontend tham chiếu trực tiếp đến các assets."
)

# Will be populated after we detect the repo
REPO_OWNER = ""
REPO_NAME = ""


def log(msg: str, level: str = "INFO") -> None:
    icons = {
        "INFO": "[i]", "OK": "[+]", "WARN": "[!]",
        "ERR": "[x]", "STEP": "==>", "SKIP": "[-]",
    }
    print(f"{icons.get(level, '•')} {msg}")


def run_gh(*args: str, check: bool = True) -> subprocess.CompletedProcess:
    """Run a gh CLI command and return the result."""
    cmd = ["gh"] + list(args)
    result = subprocess.run(
        cmd, capture_output=True, text=True, encoding="utf-8",
        cwd=ROOT_DIR,
    )
    if check and result.returncode != 0:
        log(f"gh command failed: {' '.join(cmd)}", "ERR")
        log(f"  stderr: {result.stderr.strip()}", "ERR")
        if "not logged in" in result.stderr.lower():
            log("Hãy chạy: gh auth login", "ERR")
            sys.exit(1)
    return result


def detect_repo() -> tuple[str, str]:
    """Detect owner/repo from git remote."""
    result = run_gh("repo", "view", "--json", "owner,name", check=False)
    if result.returncode == 0:
        data = json.loads(result.stdout)
        return data["owner"]["login"], data["name"]
    
    # Fallback: parse from git remote
    try:
        r = subprocess.run(
            ["git", "remote", "get-url", "origin"],
            capture_output=True, text=True, cwd=ROOT_DIR,
        )
        url = r.stdout.strip()
        # https://github.com/owner/repo.git
        m = re.search(r"github\.com[/:]([^/]+)/([^/.]+)", url)
        if m:
            return m.group(1), m.group(2)
    except Exception:
        pass
    
    log("Không xác định được repo GitHub!", "ERR")
    sys.exit(1)


def get_existing_release_assets() -> dict[str, str]:
    """Get existing assets in the release (if it exists). Returns {filename: download_url}."""
    result = run_gh(
        "release", "view", RELEASE_TAG,
        "--json", "assets",
        check=False,
    )
    if result.returncode != 0:
        return {}
    
    data = json.loads(result.stdout)
    assets = {}
    for asset in data.get("assets", []):
        assets[asset["name"]] = asset["url"]
    return assets


def create_or_get_release() -> bool:
    """Create the release if it doesn't exist. Returns True if created, False if already exists."""
    # Check if release exists
    result = run_gh("release", "view", RELEASE_TAG, check=False)
    if result.returncode == 0:
        log(f"Release '{RELEASE_TAG}' đã tồn tại, sẽ upload thêm assets.", "INFO")
        return False
    
    # Create new release
    log(f"Tạo release '{RELEASE_TAG}'...", "INFO")
    run_gh(
        "release", "create", RELEASE_TAG,
        "--title", RELEASE_TITLE,
        "--notes", RELEASE_NOTES,
        "--latest=false",  # Don't mark as latest release
    )
    log(f"Release '{RELEASE_TAG}' đã được tạo!", "OK")
    return True


def upload_pdfs() -> dict[str, str]:
    """Upload all PDFs to the release. Returns {filename: download_url}."""
    pdf_files = sorted([
        f for f in os.listdir(PDF_DIR)
        if f.lower().endswith(".pdf") and os.path.getsize(os.path.join(PDF_DIR, f)) > 1024
    ])
    
    if not pdf_files:
        log("Không có file PDF nào trong pdfs/!", "ERR")
        sys.exit(1)
    
    total = len(pdf_files)
    total_size_mb = sum(
        os.path.getsize(os.path.join(PDF_DIR, f)) for f in pdf_files
    ) / (1024 * 1024)
    
    log(f"Chuẩn bị upload {total} file PDF ({total_size_mb:.1f} MB)...", "STEP")
    
    # Get existing assets to skip already-uploaded files
    existing = get_existing_release_assets()
    
    uploaded: dict[str, str] = {}
    skipped = 0
    failed = 0
    
    for i, filename in enumerate(pdf_files, 1):
        filepath = os.path.join(PDF_DIR, filename)
        size_kb = os.path.getsize(filepath) // 1024
        prefix = f"[{i}/{total}]"
        
        # Skip if already uploaded
        if filename in existing:
            log(f"{prefix} Đã có sẵn · {filename}", "SKIP")
            # Build the download URL
            download_url = f"https://github.com/{REPO_OWNER}/{REPO_NAME}/releases/download/{RELEASE_TAG}/{filename}"
            uploaded[filename] = download_url
            skipped += 1
            continue
        
        log(f"{prefix} Uploading · {filename} ({size_kb} KB)...", "INFO")
        
        result = run_gh(
            "release", "upload", RELEASE_TAG,
            filepath,
            "--clobber",  # Overwrite if exists
            check=False,
        )
        
        if result.returncode == 0:
            download_url = f"https://github.com/{REPO_OWNER}/{REPO_NAME}/releases/download/{RELEASE_TAG}/{filename}"
            uploaded[filename] = download_url
            log(f"{prefix} OK · {filename}", "OK")
        else:
            log(f"{prefix} FAILED · {filename}: {result.stderr.strip()}", "ERR")
            failed += 1
        
        # Small delay to avoid rate limiting
        if i % 5 == 0:
            time.sleep(1)
    
    log(f"Upload hoàn tất: {len(uploaded)} OK, {skipped} skipped, {failed} failed", "OK")
    return uploaded


def update_exams_data(uploaded_urls: dict[str, str]) -> int:
    """Update exams_data.js to point pdfUrl to GitHub Release URLs.
    Returns count of updated entries."""
    
    if not os.path.exists(EXAMS_DATA_JS):
        log("Không tìm thấy exams_data.js!", "ERR")
        return 0
    
    with open(EXAMS_DATA_JS, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Parse the EXAMS_DATA array
    m = re.search(r"const\s+EXAMS_DATA\s*=\s*(\[.*?\]);", content, re.S)
    if not m:
        log("Không parse được EXAMS_DATA!", "ERR")
        return 0
    
    exams = json.loads(m.group(1))
    updated_count = 0
    
    for exam in exams:
        pdf_url = exam.get("pdfUrl", "")
        # Only update local PDF references (pdfs/xxx.pdf)
        if pdf_url.startswith("pdfs/"):
            filename = pdf_url.replace("pdfs/", "", 1)
            if filename in uploaded_urls:
                exam["pdfUrl"] = uploaded_urls[filename]
                updated_count += 1
    
    # Rebuild the file
    header_match = re.match(r"(.*?)const\s+EXAMS_DATA\s*=\s*", content, re.S)
    header = header_match.group(1) if header_match else ""
    
    from datetime import datetime
    stamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    new_content = (
        "// CẢNH BÁO: File này được sinh tự động bởi Bot Crawler Pipeline.\n"
        "// KHÔNG chỉnh sửa thủ công tại đây.\n"
        f"// Cập nhật lần cuối: {stamp}\n"
        f"// Tổng số đề TPHCM: {len(exams)}\n"
        f"// PDF Storage: GitHub Releases ({RELEASE_TAG})\n\n"
        f"const EXAMS_DATA = {json.dumps(exams, indent=4, ensure_ascii=False)};\n"
    )
    
    with open(EXAMS_DATA_JS, "w", encoding="utf-8") as f:
        f.write(new_content)
    
    log(f"Đã cập nhật {updated_count}/{len(exams)} entries trong exams_data.js", "OK")
    return updated_count


def print_report(uploaded: dict[str, str], updated_count: int) -> None:
    """Print a summary report."""
    print("\n" + "=" * 56)
    print("   📊 BÁO CÁO MIGRATION")
    print("=" * 56)
    print(f"  Release tag:     {RELEASE_TAG}")
    print(f"  Repo:            {REPO_OWNER}/{REPO_NAME}")
    print(f"  PDF uploaded:    {len(uploaded)}")
    print(f"  Data updated:    {updated_count} entries")
    print(f"  Release URL:     https://github.com/{REPO_OWNER}/{REPO_NAME}/releases/tag/{RELEASE_TAG}")
    print()
    print("  📋 Bước tiếp theo:")
    print("    1. Thêm pdfs/*.pdf vào .gitignore")
    print("    2. Xóa PDFs khỏi Git tracking: git rm -r --cached pdfs/")
    print("    3. Commit & push thay đổi")
    print("    4. (Tùy chọn) Dọn Git history với git filter-repo")
    print("=" * 56)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main() -> None:
    print("=" * 56)
    print("   🚀 MIGRATION: PDF → GitHub Releases")
    print("=" * 56)
    
    global REPO_OWNER, REPO_NAME
    
    # Step 1: Detect repo
    log("Xác định repo GitHub...", "STEP")
    REPO_OWNER, REPO_NAME = detect_repo()
    log(f"Repo: {REPO_OWNER}/{REPO_NAME}", "OK")
    
    # Step 2: Create or get release
    log("Kiểm tra / tạo GitHub Release...", "STEP")
    create_or_get_release()
    
    # Step 3: Upload PDFs
    uploaded = upload_pdfs()
    
    if not uploaded:
        log("Không upload được file nào!", "ERR")
        sys.exit(1)
    
    # Step 4: Update exams_data.js
    log("Cập nhật exams_data.js...", "STEP")
    updated_count = update_exams_data(uploaded)
    
    # Step 5: Report
    print_report(uploaded, updated_count)


if __name__ == "__main__":
    main()

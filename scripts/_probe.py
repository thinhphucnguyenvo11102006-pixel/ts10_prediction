"""Round 5: tìm seed bài đơn cho Văn/Anh TPHCM từ nhiều nguồn."""
import re, requests, sys
from urllib.parse import quote_plus

sys.stdout.reconfigure(encoding="utf-8")

HDR = {
    "User-Agent": ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                   "AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36"),
    "Accept-Language": "vi,en;q=0.9",
}
requests.packages.urllib3.disable_warnings()


def find_pdfs(url, timeout=25):
    try:
        r = requests.get(url, headers=HDR, timeout=timeout, verify=False, allow_redirects=True)
        t = r.text
        # Direct PDF hrefs
        pdfs = set()
        for m in re.finditer(r'["\']([^"\']*\.pdf[^"\']*)["\']', t):
            p = m.group(1)
            if "http" in p or p.startswith("/"):
                pdfs.add(p[:200])
        # Iframe with file=
        for m in re.finditer(r'src="([^"]+[?&]file=([^"&]+))"', t, re.I):
            raw = requests.compat.unquote(m.group(2))
            if ".pdf" in raw:
                pdfs.add(raw[:200])
        # og:title
        og = re.search(r'property="og:title"\s+content="([^"]+)"', t)
        title = og.group(1)[:100] if og else "?"
        print(f"  [{r.status_code}] {url[:90]}")
        print(f"   title={title}")
        print(f"   pdfs={len(pdfs)}")
        for p in list(pdfs)[:3]:
            print(f"     * {p[:170]}")
        return r.status_code == 200 and len(pdfs) > 0
    except Exception as e:
        print(f"  ERR {url}: {e}")
        return False


print("═══ LANGGO — thêm các trang Anh 2023 / tham khảo 2026 ═══════════════════")
for url in [
    "https://langgo.edu.vn/de-thi-tieng-anh-vao-10-tphcm-2023",
    "https://langgo.edu.vn/de-thi-tieng-anh-vao-10-tphcm-2022",
    "https://langgo.edu.vn/de-tham-khao-tieng-anh-vao-10-tphcm-2026",
    "https://langgo.edu.vn/de-tham-khao-tieng-anh-vao-10-tphcm-2025",
    "https://langgo.edu.vn/de-tham-khao-tieng-anh-vao-10-tphcm-2024",
    "https://langgo.edu.vn/giai-de-tham-khao-tieng-anh-vao-10-tphcm-2025",
]:
    find_pdfs(url, timeout=15)

print()
print("═══ ZIM.VN — Anh TPHCM ══════════════════════════════════════════════════")
for url in [
    "https://zim.vn/giai-de-tham-khao-tieng-anh-vao-10-nam-2025-tphcm",
    "https://zim.vn/de-thi-tieng-anh-vao-lop-10-tphcm-2024",
    "https://zim.vn/de-thi-tieng-anh-vao-lop-10-tphcm-2025",
]:
    find_pdfs(url, timeout=15)

print()
print("═══ TAILIEUGIANGDAY — Văn HCM (thêm) ═══════════════════════════════════")
for url in [
    "https://tailieugiangday.vn/item/de-thi-tuyen-sinh-lop-10-mon-van-2025-2026-de-tu-luan-van-9-vao-10-day-du-the-loai/44506",
    "https://tailieugiangday.vn/item/de-thi-tuyen-sinh-lop-10-ngu-van-tp-ho-chi-minh-2025-2026/44666",
    "https://tailieugiangday.vn/item/de-cuong-on-tap-van-9-tuyen-sinh-10-tphcm-2025/43100",
    "https://tailieugiangday.vn/item/de-thi-ngu-van-vao-lop-10-tphcm-2025/46000",
]:
    find_pdfs(url, timeout=30)

print()
print("═══ THCS.TOANMATH — check Văn trên toanmath (Ngữ Văn/Văn/Literature) ═══")
for q in ["Ngữ Văn tuyển sinh TP HCM", "Văn vào lớp 10 TP HCM", "Literature HCM"]:
    url = "https://thcs.toanmath.com/?s=" + quote_plus(q)
    r = requests.get(url, headers=HDR, timeout=15, verify=False)
    arts = re.findall(r'<article[^>]*class="[^"]*mh-posts-grid-item[^"]*"', r.text)
    print(f"  q={q!r}  arts={len(arts)}")

print()
print("═══ PTNK / Sở GDDT — official PDF trực tiếp ════════════════════════════")
for url in [
    "https://ptnk.edu.vn/tin-tuc/tuyen-sinh",
    "https://ptnk.edu.vn/tuyen-sinh/",
]:
    find_pdfs(url, timeout=15)

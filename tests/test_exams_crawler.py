import importlib.util
import os
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MODULE_PATH = ROOT / "scripts" / "exams_crawler.py"


def load_module():
    spec = importlib.util.spec_from_file_location("exams_crawler", MODULE_PATH)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class FakeResponse:
    def __init__(self, text):
        self.text = text

    def raise_for_status(self):
        return None


class ExamsCrawlerTests(unittest.TestCase):
    def setUp(self):
        self.module = load_module()
        self._old_output = self.module.OUTPUT_JS_FILE
        self.module.OUTPUT_JS_FILE = os.path.join(tempfile.gettempdir(), "exams_data_test.js")

    def tearDown(self):
        self.module.OUTPUT_JS_FILE = self._old_output
        try:
            Path(self.module.OUTPUT_JS_FILE).unlink()
        except OSError:
            pass

    def test_guess_subject_from_title(self):
        self.assertEqual(self.module.guess_subject_from_title("Đề Toán 9 học kỳ 2"), "math")
        self.assertEqual(self.module.guess_subject_from_title("Đề Văn 9 nghị luận xã hội"), "lit")
        self.assertEqual(self.module.guess_subject_from_title("English practice test grade 9"), "eng")
        self.assertEqual(self.module.guess_subject_from_title("Lịch sử 9"), "math")

    def test_crawl_and_generate_js(self):
        html = """
        <html><body>
          <article class="post-item"><h2 class="entry-title"><a href="https://example.org/m1">Đề Toán 9 học kỳ 2</a></h2></article>
          <article class="post-item"><h2 class="entry-title"><a href="https://example.org/l1">Đề Văn 9 nghị luận xã hội</a></h2></article>
          <article class="post-item"><h2 class="entry-title"><a href="https://example.org/e1">English practice test grade 9</a></h2></article>
        </body></html>
        """

        self.module.requests.get = lambda *args, **kwargs: FakeResponse(html)

        exams = self.module.crawl_target_website("https://test.local/category/exams")
        self.assertEqual(len(exams), 3)
        self.assertEqual(exams[0]["subject"], "math")
        self.assertEqual(exams[1]["subject"], "lit")
        self.assertEqual(exams[2]["subject"], "eng")
        self.assertEqual(exams[0]["pdfUrl"], "https://example.org/m1")

        self.module.generate_js(exams)
        output = Path(self.module.OUTPUT_JS_FILE)
        self.assertTrue(output.exists())
        contents = output.read_text(encoding="utf-8")
        self.assertIn("const EXAMS_DATA =", contents)
        self.assertIn("Đề Văn 9 nghị luận xã hội", contents)


if __name__ == "__main__":
    unittest.main()

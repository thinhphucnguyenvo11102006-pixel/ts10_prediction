# 🎯 AI Prediction for TS10: TPHCM Grade 10 Admission System

[![Status](https://img.shields.io/badge/Status-Production--Ready%20Beta-success.svg)]()
[![Algorithm](https://img.shields.io/badge/Algorithm-Anchor%20%26%20Adjust-blue.svg)]()
[![Cluster](https://img.shields.io/badge/Tiering-K--Means%20Clustering-orange.svg)]()
[![Crawler](https://img.shields.io/badge/Pipeline-Crawler%20v5.0-red.svg)]()

> **AI Prediction for TS10** is a comprehensive, data-driven platform designed to navigate the complexities of the Grade 10 Admission process in Ho Chi Minh City. By combining historical data analysis with modern AI clustering and a custom "Anchor & Adjust" forecasting model, the system provides students and parents with high-precision admission insights.

---

## 🌟 Key Features

1.  **📊 Smart Admission Prediction**: Real-time forecasting for 107 public high schools in TPHCM, featuring confidence intervals and historical trend analysis.
2.  **🎯 Feasibility Assessment (NV)**: Interactive gauge charts that evaluate the safety of 3 school choices based on simulated mock exam scores.
3.  **💡 School Recommender**: Intelligent suggestions filtered by district, tier, and safety margin.
4.  **📈 Score Distribution**: Visualization of score bell curves (2022-2026) to understand city-wide competition trends.
5.  **⚡ Choice Optimizer**: Strategic tool that estimates real exam performance from school grades and recommends the most optimal NV1-NV2-NV3 portfolio.
6.  **📚 Exam Bank (v5)**: A repository of **63+ curated exam papers** (Math, English, Literature) with a fully automated Python crawling pipeline and integrated PDF viewer.

---

## 🧠 Core Methodology

### 1. Anchor & Adjust Algorithm
The system is specifically designed to handle the **2025 Structural Break** (transition to the 2018 General Education Program). Traditional linear regression models are no longer sufficient. Our model uses:
*   **Anchor**: The 2025 score as the primary baseline.
*   **Adjustments**: Dynamic factors including quota/candidate shifts, mean-reversion (adaptation), and relative school micro-trends.

### 2. K-Means School Tiering
Schools are automatically classified into **8 Tiers (S to C)** using K-Means clustering on multi-year admission data and volatility metrics. This ensures a data-driven understanding of school prestige and competitiveness.

---

## 🛠️ Technical Architecture

*   **Frontend**: Pure HTML5, CSS3 (Glassmorphism), Vanilla JavaScript.
*   **Data Visualization**: [Chart.js](https://www.chartjs.org/).
*   **Data Pipeline**: Python 3.x (BeautifulSoup, Requests, Scikit-learn for K-Means).
*   **Hosting**: Fully static SPA — zero server dependency.

### Project Structure
```text
├── index.html            # Main SPA Shell
├── js/                   # Prediction logic & UI modules
├── scripts/              # Python data & crawler pipeline
├── data/                 # Source JSON (Schools & Stats)
└── pdfs/                 # Exam Bank repository (133MB+)
```

---

## 🚀 Getting Started

### Quick Start
Simply open `index.html` in any modern web browser. For the best experience, use a local server like **VS Code Live Server**.

### Data Update Pipeline
To update school data or crawl new exam papers:
1.  **Install dependencies**: `pip install -r scripts/requirements.txt`
2.  **Update School Data**: Run `python scripts/build_data.py`
3.  **Run Clustering**: Run `python scripts/cluster_schools.py`
4.  **Update Exam Bank**: Run `python scripts/exams_crawler.py`

---

## 📝 Project Evaluation (April 2026)
For a detailed technical audit and current system performance, please refer to:
👉 **[RE_EVALUATION.md](./RE_EVALUATION.md)**

---

## 🇻🇳 Phiên bản Tiếng Việt (Vietnamese Summary)

Dự án **AI Prediction for TS10** là hệ thống hỗ trợ tuyển sinh lớp 10 TPHCM sử dụng trí tuệ nhân tạo.
*   **Thuật toán**: Anchor & Adjust xử lý biến động format đề 2025.
*   **Tính năng**: Dự báo điểm chuẩn, đánh giá nguyện vọng, gợi ý trường, phổ điểm mô phỏng và ngân hàng đề thi với 63+ đề PDF.
*   **Công nghệ**: Web tĩnh hoàn toàn, pipeline dữ liệu Python mạnh mẽ.

---

*Last Updated: April 24, 2026 | Version 5.0 Stable Beta*

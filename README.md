# TS10 Prediction

*Read this in [Vietnamese / Tiếng Việt](README_VN.md).*

`TS10 Prediction` is a static web application for exploring Ho Chi Minh City grade 10 admission cutoff data and generating decision-support suggestions for 2026 applications.

The current version is best described as a **data-driven advisory SPA** built with vanilla HTML, CSS, and JavaScript. It combines historical cutoff data, simple statistical heuristics, and chart-based visualizations to help students and parents compare schools, estimate feasibility, and explore application strategies.

## Current Scope

The app currently includes 6 main tabs:

1. `Predicted Cutoffs`: browse historical cutoff scores, predicted 2026 scores, trend, and stability metrics for each school.
2. `Feasibility Review`: enter 3 subject scores and selected choices to get a risk-oriented admission assessment.
3. `District Recommendations`: filter schools by district and compare them against an entered total score.
4. `Score Distribution`: visualize historical and projected score distributions using normal-distribution-style charts.
5. `Choice Optimization`: estimate entrance-exam performance from semester and year-end scores, then suggest a 3-choice strategy.
6. `Exam Bank`: an early-stage exam library UI backed by generated data.

## Tech Stack

- `HTML5`, `CSS3`, `Vanilla JavaScript`
- `Chart.js` via CDN
- Optional local Python helpers for data processing (`cluster_schools.py`) and exam data (`build_data.py`).

## Project Structure

- [index.html](index.html) - application shell and tab layout
- [css/style.css](css/style.css) - visual system and responsive styling
- [js/data.js](js/data.js) - static datasets, school metadata, and distribution parameters
- [js/model.js](js/model.js) - prediction and recommendation heuristics
- [js/charts.js](js/charts.js) - Chart.js wrappers
- [js/app.js](js/app.js) - UI state, rendering, and interactions
- [scripts/cluster_schools.py](scripts/cluster_schools.py) - AI-driven school clustering and stability analysis
- [scripts/build_data.py](scripts/build_data.py) - main data build pipeline
- [scripts/exams_crawler.py](scripts/exams_crawler.py) - local helper script for generating `js/exams_data.js`

## How The Prediction Works Today

The prediction engine uses an **Anchor & Adjust** heuristic specifically designed to handle the **structural break** in the 2025 exam (new GDPT 2018 curriculum). Traditional linear regression and weighted moving averages are unreliable when the exam format changes fundamentally, so the model takes a different approach:

```
Score_2026 = Anchor_2025 + ΔCompetition + ΔAdaptation + ΔMicroTrend
```

| Component | Description |
|---|---|
| **Anchor** | The 2025 cutoff score is used as the primary anchor (first year of the new exam regime). |
| **ΔCompetition** | Adjusts for changes in the candidate/quota ratio between 2026 and 2025, with tier-dependent sensitivity. |
| **ΔAdaptation** | Models the expected mean-reversion (bounce-back) in the second year after a format change, as students and teachers adapt. |
| **ΔMicroTrend** | Captures subtle shifts in a school's relative ranking versus the city-wide baseline. |
| **Stability (AI)** | Schools are grouped into 8 Tiers using **K-Means Clustering** based on historical performance and volatility. |

Historical data (2022–2024) is **not** used for direct score prediction. It is only used to measure historical volatility (for confidence intervals) and relative ranking trends.

This makes the app useful for exploration and strategy discussion, but it should be treated as a **decision-support tool**, not an authoritative forecast engine.

## Data Status

- Historical school and exam stats are currently stored directly in `js/data.js`.
- The repository currently contains **107 schools** in the shipped dataset.
- The exam-bank module is still in an early/demo state and does not yet represent a full automated collection pipeline.

## Running Locally

You can run the project in either of these ways:

1. Open [index.html](index.html) directly in a browser.
2. Use a local static server such as VS Code Live Server for a smoother development workflow.

## Limitations

- The app depends on a CDN-loaded `Chart.js`, so it is not fully self-contained offline.
- Probability outputs are bucketed risk labels derived from score margins, not calibrated statistical probabilities.
- The exam crawler currently scans local files and generates metadata; it does not yet crawl external sources autonomously.

## Documentation

- [README_VN.md](README_VN.md) - Vietnamese version
- [docs/REQUIRED_FIXES_VN.md](docs/REQUIRED_FIXES_VN.md) - prioritized list of improvements and fixes
- [docs/evaluation.md](docs/evaluation.md) - detailed project evaluation and roadmap
- [docs/PROJECT_EVALUATION_VN.md](docs/PROJECT_EVALUATION_VN.md) - internal evaluation notes
- [docs/MAINTENANCE.md](docs/MAINTENANCE.md) - technical maintenance guide

## Goal

The project already works well as a polished educational/demo product. The next step is to improve dataset governance, model validation, documentation accuracy, and the exam-bank pipeline so it can become a more trustworthy public-facing tool.

# 🎓 AI Prediction Model for TPHCM Grade 10 Admission 2026

*Read this in other languages: [Vietnamese / Tiếng Việt](README_VN.md)*.

This project is a **Static Web Application** designed to help 9th-grade students and their parents in Ho Chi Minh City (TPHCM) digitally analyze, strategize, and make data-driven decisions regarding high school admissions. Replacing raw Excel spreadsheets and intuitive guesses, this tool relies on a historical dataset (2022-2025) and statistical models to predict future admission cutoffs for 114 public high schools in 2026.

---

## 🚀 Application Flow & Features

The application is built on a Single Page Application (SPA) architecture, ensuring seamless transitions across 5 core analytical tabs:

1. **Tab 1 - Data Discovery (Predicted Cutoffs):** A comprehensive table listing 114 high schools, their 4-year historical cutoffs, dynamically predicted 2026 cutoffs, and performance Tiers. You can click on any school to view its historical trend chart.
2. **Tab 2 - Feasibility Evaluation:** Users input their hypothetical exam scores and select their 3 desired schools (Aspirations 1, 2, and 3). The engine calculates the exact probability of admission for each choice and provides personalized strategic advice.
3. **Tab 3 - District Ecosystem Suggestion:** Enter a target score and a preferred district. The app filters all nearby schools and categorizes them into three safety buckets: *Stretch (Reach), Match, and Safe*.
4. **Tab 4 - Statistical Score Distribution:** Aimed at researchers and parents, this tab generates Gaussian (Bell curve) distributions comparing the exam difficulty and score density of past years against the 2026 projection.
5. **Tab 5 - Strategy Optimization:** For students who haven't taken the exam yet. Enter current 9th-grade school scores (Semester 2 & Year-End). The app mathematically converts these to realistic exam estimates, then autonomously recommends the 3 most optimal aspirations (NV1, NV2, NV3) alongside 10 viable alternative schools.

---

## 🧠 Underlying Algorithms & Mathematical Models

This application leverages rigorous statistical logic rather than simple averaging. Here is the architecture underneath:

### 1. Ensemble Prediction Model
Found in `model.js`, the core cutoff prediction for 2026 runs three calculations in parallel to form an ensemble:
*   **45% Weighted Moving Average (WMA):** Grants higher mathematical weight to recent years (2025 × 4, 2024 × 3, etc.). Recent admission tendencies reflect the current educational climate far better than ancient data.
*   **35% Linear Regression:** Uses the *Least Squares Method* across 4 data points to extract a directional trend-line slope. This answers whether a school's popularity is organically growing or declining over time.
*   **20% Local Competition Effect:** Captures "shock" adjustments. If a school dropped severely the previous year, crowd psychology usually causes a surge in the subsequent year.

*Confidence Interval:* To guarantee realism, standard deviation ($\sigma$) is utilized. However, noticing that exam scores drop much more easily than they rise (due to exam difficulty asymmetrical capping), the application uses an asymmetrical confidence interval: **-0.75 to +0.50 multipliers**.

### 2. Penalized Probabilistic Risk Model
Closely follows the admission rules established by the TPHCM Department of Education. Failing Aspiration 1 (NV1) drops the student into Aspiration 2 (NV2), which acts as a heavy penalty.
*   The model calculates an `Effective Threshold = Predicted Cutoff + (Index * 0.75)`.
*   Winning probabilities are calculated based on the margin over the threshold: `Margin >= +2.5 (95% Safety), Margin >= +1.5 (85%), Margin >= -1.0 (30% Risk)`.

### 3. Ability Converter (Difficulty Coefficient)
For Tab 5's strategy generator, how do we know what an "8.0 Math" in school translates to on the actual rigorous entrance exam?
*   `Estimate = [(Sem2 × 60%) + (YearEnd × 40%)] × 0.85`
*   The **0.85 coefficient** acts as a strict "reality penalty" since high school entrance exams are significantly harder than local middle school tests.

### 4. Normal Distribution (Gaussian Function)
Applied in Tab 4 to visualize score densities:
`P(x) = (1 / (σ * √(2π))) * e^(-(x-μ)² / 2σ²)`

### 5. Ecosystem Tiering Algorithm
All 114 schools are automatically clustered into 8 permanent Tiers (S, A+, A, A-, B+, B, B-, C) based on their 4-year cutoff stability, preventing the recommendation engine from blindly picking "closest match" without considering institutional reputation margins.

---

## 🎨 UI/UX: Earthtone Glassmorphism
The platform applies a highly modern, dark **Coffee/Mocha** aesthetic (`#1a100c` background) using CSS Glassmorphism logic (`rgba(255,255,255,0.03)` overlays). This prevents eye-strain during intense data-reading sessions while maintaining a premium, enterprise-grade feel.

## 🛠 Deployment & Tech Stack
*   **Architecture:** 100% Vanilla JavaScript, HTML5, CSS3.
*   **Dependencies:** None (Only Chart.js loaded via CDN).
*   **Operation:** Since it operates entirely Client-Side, there's zero backend maintenance cost. It runs instantly on any modern browser offline or natively through GitHub Pages.

---
*Developed with ❤️ as a digital solution for exam season.*

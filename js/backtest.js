/**
 * backtest.js - Validation mo hinh du doan (v2 — Anchor & Adjust)
 *
 * Backtest moi: dung luon PredictionModel nhung override YEARS & TARGET_YEAR
 * de du doan 2025 tu data 2022-2024.
 *
 * Chay: mo console trinh duyet, go Backtest.run()
 *
 * LUU Y: Vi thuat toan Anchor & Adjust neo vao nam cuoi (2024 trong backtest),
 * va 2024 khong phai la "structural break" nhu 2025, nen backtest nay
 * cho thay do chinh xac cua thanh phan Competition + MicroTrend, KHONG
 * phan anh hieu ung Adaptation (chi co khi doi form thi).
 */
const Backtest = {
    median(values) {
        if (!values.length) return 0;
        const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0
            ? (sorted[mid - 1] + sorted[mid]) / 2
            : sorted[mid];
    },

    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    },

    getSchoolTier(score) {
        if (score == null) return "mid";
        if (score >= 22)  return "top";
        if (score >= 18)  return "high";
        if (score >= 14)  return "mid";
        return "low";
    },

    run() {
        const TRAIN_YEARS = [2022, 2023, 2024];
        const TARGET = 2025;

        // ── System baseline ──
        const baselineSeries = {};
        for (const year of TRAIN_YEARS) {
            const values = SCHOOLS_DATA
                .map(school => school.scores?.[year])
                .filter(value => value != null);
            baselineSeries[year] = values.length ? this.median(values) : null;
        }

        // Anchor = system median 2024 (nam cuoi trong training)
        const systemAnchor = baselineSeries[2024];

        // Competition giua 2024→2025
        const examStats = (globalThis.EXAM_STATS ?? EXAM_STATS);
        const ratio2024 = examStats[2024].candidates / examStats[2024].quota;
        const ratio2025 = examStats[2025].candidates / examStats[2025].quota;
        const compFactor = (ratio2025 / ratio2024 - 1);
        const systemCompAdj = systemAnchor * compFactor * 0.10;

        const systemPred = systemAnchor + systemCompAdj;

        // ── Per-school prediction ──
        const results = [];
        let totalAbsError = 0;
        let totalSqError = 0;
        let count = 0;

        for (const school of SCHOOLS_DATA) {
            const actual = school.scores[TARGET];
            if (actual == null) continue;

            const scores = school.scores;
            const schoolAnchor = scores[2024] ?? scores[2023] ?? scores[2022];
            if (schoolAnchor == null) continue;

            const tier = this.getSchoolTier(schoolAnchor);

            // Competition adj (school-level)
            const sensitivity = { top: 0.06, high: 0.09, mid: 0.12, low: 0.10 };
            const compAdj = schoolAnchor * compFactor * (sensitivity[tier] ?? 0.10);

            // MicroTrend (relative ranking)
            const relSeries = {};
            for (const year of TRAIN_YEARS) {
                const s = scores[year];
                const b = baselineSeries[year];
                if (s != null && b != null) relSeries[year] = s - b;
            }
            const relYears = TRAIN_YEARS.filter(y => relSeries[y] != null);
            let microTrend = 0;
            if (relYears.length >= 2) {
                const deltas = [];
                for (let i = 1; i < relYears.length; i++) {
                    deltas.push(relSeries[relYears[i]] - relSeries[relYears[i - 1]]);
                }
                const rawTrend = this.median(deltas);
                const dampening = Math.min(1, relYears.length / 3) * 0.50;
                microTrend = this.clamp(rawTrend * dampening, -0.50, 0.50);
            }

            // No adaptation in backtest (2024 is not a structural break year)
            const predicted = schoolAnchor + compAdj + microTrend;
            const rounded = Math.round(predicted * 4) / 4;
            const error = rounded - actual;
            const absError = Math.abs(error);

            totalAbsError += absError;
            totalSqError += error * error;
            count++;

            results.push({
                name: school.name,
                district: school.district,
                tier,
                actual,
                predicted: rounded,
                error: Math.round(error * 100) / 100,
                absError: Math.round(absError * 100) / 100
            });
        }

        const mae = totalAbsError / count;
        const rmse = Math.sqrt(totalSqError / count);

        results.sort((a, b) => b.absError - a.absError);

        console.log("===========================================");
        console.log("  BACKTEST v2: Anchor & Adjust");
        console.log("  Train: 2022-2024 → Predict: 2025");
        console.log("  (No Adaptation — 2024 is NOT a break year)");
        console.log("===========================================");
        console.log(`  So truong danh gia: ${count}`);
        console.log(`  MAE: ${mae.toFixed(3)} diem`);
        console.log(`  RMSE: ${rmse.toFixed(3)} diem`);
        console.log(`  Sai so < 0.5d: ${results.filter(r => r.absError < 0.5).length}/${count} (${(results.filter(r => r.absError < 0.5).length / count * 100).toFixed(1)}%)`);
        console.log(`  Sai so < 1.0d: ${results.filter(r => r.absError < 1.0).length}/${count} (${(results.filter(r => r.absError < 1.0).length / count * 100).toFixed(1)}%)`);
        console.log(`  Sai so < 1.5d: ${results.filter(r => r.absError < 1.5).length}/${count} (${(results.filter(r => r.absError < 1.5).length / count * 100).toFixed(1)}%)`);
        console.log("-------------------------------------------");
        console.log("  Top 10 sai so lon nhat:");
        results.slice(0, 10).forEach((r, i) => {
            console.log(`  ${i + 1}. ${r.name} [${r.tier}] (${r.district}): Thuc te ${r.actual} | Du doan ${r.predicted} | Sai ${r.error > 0 ? "+" : ""}${r.error}`);
        });
        console.log("===========================================");

        return { mae, rmse, count, results };
    }
};

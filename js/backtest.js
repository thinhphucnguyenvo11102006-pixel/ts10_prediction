/**
 * backtest.js — Validation mô hình dự đoán
 * Dùng data 2022-2024 để dự đoán 2025, so sánh với 2025 thực tế.
 * Chạy: mở console trình duyệt, gõ Backtest.run()
 */
const Backtest = {
    /**
     * Chạy backtest: dự đoán 2025 từ data 2022-2024
     */
    run() {
        const TRAIN_YEARS = [2022, 2023, 2024];
        const TARGET = 2025;
        const WMA_WEIGHTS = [0.20, 0.35, 0.45]; // 3-year weights

        const results = [];
        let totalAbsError = 0;
        let totalSqError = 0;
        let count = 0;

        for (const school of SCHOOLS_DATA) {
            const scores = school.scores;
            const actual = scores[TARGET];
            if (actual == null) continue;

            // WMA prediction
            let wmaSum = 0, wmaWeightSum = 0;
            for (let i = 0; i < TRAIN_YEARS.length; i++) {
                const s = scores[TRAIN_YEARS[i]];
                if (s != null) {
                    wmaSum += s * WMA_WEIGHTS[i];
                    wmaWeightSum += WMA_WEIGHTS[i];
                }
            }
            const wma = wmaWeightSum > 0 ? wmaSum / wmaWeightSum : null;
            if (wma == null) continue;

            // Linear regression prediction
            const points = TRAIN_YEARS
                .filter(y => scores[y] != null)
                .map(y => ({ x: y, y: scores[y] }));

            let lrPred = wma;
            if (points.length >= 2) {
                const n = points.length;
                let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
                for (const p of points) {
                    sumX += p.x; sumY += p.y;
                    sumXY += p.x * p.y; sumX2 += p.x * p.x;
                }
                const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
                const intercept = (sumY - slope * sumX) / n;
                lrPred = slope * TARGET + intercept;
            }

            // Ensemble (no competition factor for historical backtest)
            const predicted = 0.55 * wma + 0.45 * lrPred;
            const rounded = Math.round(predicted * 4) / 4;

            const error = rounded - actual;
            const absError = Math.abs(error);

            totalAbsError += absError;
            totalSqError += error * error;
            count++;

            results.push({
                name: school.name,
                district: school.district,
                actual,
                predicted: rounded,
                error: Math.round(error * 100) / 100,
                absError: Math.round(absError * 100) / 100
            });
        }

        const mae = totalAbsError / count;
        const rmse = Math.sqrt(totalSqError / count);

        // Sort by absolute error descending (worst predictions first)
        results.sort((a, b) => b.absError - a.absError);

        // Print summary
        console.log('═══════════════════════════════════════════');
        console.log('  BACKTEST: Dự đoán 2025 từ data 2022-2024');
        console.log('═══════════════════════════════════════════');
        console.log(`  Số trường đánh giá: ${count}`);
        console.log(`  MAE (Sai số trung bình): ${mae.toFixed(3)} điểm`);
        console.log(`  RMSE (Căn sai số bình phương): ${rmse.toFixed(3)} điểm`);
        console.log(`  Sai số < 0.5đ: ${results.filter(r => r.absError < 0.5).length}/${count} (${(results.filter(r => r.absError < 0.5).length / count * 100).toFixed(1)}%)`);
        console.log(`  Sai số < 1.0đ: ${results.filter(r => r.absError < 1.0).length}/${count} (${(results.filter(r => r.absError < 1.0).length / count * 100).toFixed(1)}%)`);
        console.log(`  Sai số < 1.5đ: ${results.filter(r => r.absError < 1.5).length}/${count} (${(results.filter(r => r.absError < 1.5).length / count * 100).toFixed(1)}%)`);
        console.log('───────────────────────────────────────────');
        console.log('  Top 10 sai số lớn nhất:');
        results.slice(0, 10).forEach((r, i) => {
            console.log(`  ${i + 1}. ${r.name} (${r.district}): Thực tế ${r.actual} | Dự đoán ${r.predicted} | Sai ${r.error > 0 ? '+' : ''}${r.error}`);
        });
        console.log('═══════════════════════════════════════════');

        return { mae, rmse, count, results };
    }
};

/**
 * model.js - Mô hình dự đoán điểm chuẩn tuyển sinh lớp 10 TPHCM
 */

const PredictionModel = {
    YEARS: [2022, 2023, 2024, 2025],
    TARGET_YEAR: 2026,
    WMA_WEIGHTS: [0.10, 0.20, 0.30, 0.40], // oldest → newest

    /**
     * Weighted Moving Average
     */
    weightedMovingAverage(scores) {
        let sum = 0, weightSum = 0;
        const years = this.YEARS;
        for (let i = 0; i < years.length; i++) {
            const s = scores[years[i]];
            if (s != null) {
                sum += s * this.WMA_WEIGHTS[i];
                weightSum += this.WMA_WEIGHTS[i];
            }
        }
        return weightSum > 0 ? sum / weightSum : null;
    },

    /**
     * Simple Linear Regression
     * Returns: { slope, intercept, predict(x) }
     */
    linearRegression(scores) {
        const points = [];
        for (const y of this.YEARS) {
            if (scores[y] != null) points.push({ x: y, y: scores[y] });
        }
        if (points.length < 2) return null;

        const n = points.length;
        let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
        for (const p of points) {
            sumX += p.x;
            sumY += p.y;
            sumXY += p.x * p.y;
            sumX2 += p.x * p.x;
        }
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        return {
            slope,
            intercept,
            predict: (x) => slope * x + intercept
        };
    },

    /**
     * Calculate competition factor for 2026
     */
    getCompetitionFactor() {
        const stats2025 = EXAM_STATS[2025];
        const stats2026 = EXAM_STATS[2026];
        const ratio2025 = stats2025.candidates / stats2025.quota;
        const ratio2026 = stats2026.candidates / stats2026.quota;
        return (ratio2026 / ratio2025 - 1); // % change in competition
    },

    /**
     * Historical variance for confidence interval
     */
    historicalVariance(scores) {
        const vals = this.YEARS.map(y => scores[y]).filter(v => v != null);
        if (vals.length < 2) return 1;
        const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
        const variance = vals.reduce((s, v) => s + (v - mean) ** 2, 0) / (vals.length - 1);
        return Math.sqrt(variance);
    },

    /**
     * Predict score for a single school
     * Returns: { predicted, low, high, confidence, trend }
     */
    predictSchool(school) {
        const scores = school.scores;

        // Method 1: WMA
        const wma = this.weightedMovingAverage(scores);

        // Method 2: Linear Regression
        const lr = this.linearRegression(scores);
        const lrPred = lr ? lr.predict(this.TARGET_YEAR) : wma;

        // Method 3: Competition adjustment
        const compFactor = this.getCompetitionFactor();
        const sensitivity = 0.15; // How much competition affects score
        const adjusted = wma * (1 + compFactor * sensitivity);

        // Method 3: Trend Bonus
        let trendBonus = 0;
        if (lr && lr.slope > 0.2) { 
            // Nếu xu hướng tăng rõ rệt (> 0.2 điểm/năm)
            trendBonus = 0.5; // Cộng nhẹ nửa điểm
        } else if (lr && lr.slope < -0.2) {
            // Nếu xu hướng giảm
            trendBonus = -0.5;
        }

        // Dự đoán cuối cùng hoàn toàn dựa vào WMA + Cạnh tranh + Trend Bonus
        const predicted = 0.70 * wma + 0.30 * adjusted + trendBonus;

        // Asymmetrical confidence interval (Scores drop easier than they rise)
        // We ensure a minimum buffer using max(1.0, std) to guarantee at least -0.75 / +0.5
        const std = this.historicalVariance(scores);
        const effectiveStd = Math.max(1.0, std);
        const low = predicted - 0.75 * effectiveStd;
        const high = predicted + 0.50 * effectiveStd;

        // Trend (positive = increasing, negative = decreasing)
        const trend = lr ? lr.slope : 0;

        // Confidence level (based on historical consistency)
        const maxScore = 30;
        const consistency = 1 - (std / maxScore) * 5;
        const confidence = Math.max(0.4, Math.min(0.95, consistency));

        return {
            predicted: Math.round(predicted * 4) / 4, // Round to 0.25
            low: Math.round(low * 4) / 4,
            high: Math.round(high * 4) / 4,
            confidence: Math.round(confidence * 100),
            trend: Math.round(trend * 100) / 100,
            wma: Math.round(wma * 100) / 100,
            linear: Math.round(lrPred * 100) / 100,
        };
    },

    /**
     * Predict all schools
     */
    predictAll() {
        return SCHOOLS_DATA.map(school => ({
            ...school,
            prediction: this.predictSchool(school)
        }));
    },

    /**
     * Evaluate feasibility of a student's choices
     * @param {number} totalScore - Student's total score (3 subjects)
     * @param {Array} choices - Array of { schoolId, priority } (NV1, NV2, NV3)
     * @returns feasibility analysis
     */
    evaluateChoices(totalScore, choices) {
        const results = [];

        for (let i = 0; i < choices.length; i++) {
            const choice = choices[i];
            const school = SCHOOLS_DATA.find(s => s.id === choice.schoolId);
            if (!school) continue;

            const pred = this.predictSchool(school);
            const nvPenalty = i * 0.75; // NV2 +0.75, NV3 +1.5 effective threshold
            const effectiveThreshold = pred.predicted + nvPenalty;

            const margin = totalScore - effectiveThreshold;
            let feasibilityScore, status, statusLabel;

            // Tính điểm khả thi bằng hàm Logistic (tham khảo) 
            // KHÔNG PHẢI LÀ XÁC SUẤT ĐÃ CALIBRATE THEO THỐNG KÊ (Uncalibrated Probability)
            const rawProb = 100 / (1 + Math.exp(-1.15 * (margin - 0.15)));
            feasibilityScore = Math.max(1, Math.min(99, Math.round(rawProb))); // Cắt nghẽn 1-99

            if (margin >= 2.0) {
                status = "safe";
                statusLabel = "Rất an toàn";
            } else if (margin >= 1.0) {
                status = "safe";
                statusLabel = "An toàn";
            } else if (margin >= 0.25) {
                status = "possible";
                statusLabel = "Khả thi";
            } else if (margin >= -0.5) {
                status = "risky";
                statusLabel = "May rủi";
            } else if (margin >= -1.5) {
                status = "risky";
                statusLabel = "Rủi ro";
            } else if (margin >= -3.0) {
                status = "danger";
                statusLabel = "Rất khó";
            } else {
                status = "danger";
                statusLabel = "Gần như không thể";
            }

            results.push({
                nv: i + 1,
                school,
                prediction: pred,
                effectiveThreshold,
                margin: Math.round(margin * 100) / 100,
                feasibilityScore,
                status,
                statusLabel,
                nvPenalty
            });
        }

        // Overall assessment
        const anyPass = results.some(r => r.feasibilityScore >= 50);
        const bestChance = Math.max(...results.map(r => r.feasibilityScore));

        return {
            choices: results,
            totalScore,
            overallStatus: anyPass ? "possible" : "danger",
            bestChance,
            recommendation: this.generateRecommendation(totalScore, results)
        };
    },

    /**
     * Generate recommendation text
     */
    generateRecommendation(totalScore, results) {
        const msgs = [];
        const bestNv = results.reduce((best, r) => r.feasibilityScore > best.feasibilityScore ? r : best, results[0]);

        if (bestNv.feasibilityScore >= 85) {
            msgs.push(`✅ Lựa chọn NV${bestNv.nv} (${bestNv.school.name}) rất an toàn.`);
        } else if (bestNv.feasibilityScore >= 50) {
            msgs.push(`⚠️ Mức khả thi tốt nhất là NV${bestNv.nv} (${bestNv.school.name}) - ${bestNv.feasibilityScore}/100.`);
        } else {
            msgs.push(`❌ Cả 3 nguyện vọng đều có rủi ro cao. Nên xem xét lại.`);
        }

        const allDanger = results.every(r => r.status === "danger");
        if (allDanger) {
            msgs.push(`💡 Với ${totalScore} điểm, nên chọn trường có điểm chuẩn dự kiến ≤ ${(totalScore - 1).toFixed(1)}.`);
        }

        return msgs;
    },

    /**
     * Recommend schools by district based on student's score
     * @param {number} totalScore
     * @param {string} district - Target district
     * @returns recommended schools sorted by match
     */
    recommendByDistrict(totalScore, district) {
        const predictions = this.predictAll();
        const filtered = district === "all"
            ? predictions
            : predictions.filter(s => s.district === district);

        return filtered.map(s => {
            const margin = totalScore - s.prediction.predicted;
            let matchLevel, matchLabel;

            if (margin >= 2.5) {
                matchLevel = 5;
                matchLabel = "Rất an toàn";
            } else if (margin >= 1.5) {
                matchLevel = 4;
                matchLabel = "An toàn";
            } else if (margin >= 0.5) {
                matchLevel = 3;
                matchLabel = "Khả thi";
            } else if (margin >= -0.25) {
                matchLevel = 2;
                matchLabel = "May rủi";
            } else if (margin >= -1.0) {
                matchLevel = 1;
                matchLabel = "Rủi ro";
            } else {
                matchLevel = 0;
                matchLabel = "Khó đậu";
            }

            return {
                ...s,
                margin: Math.round(margin * 100) / 100,
                matchLevel,
                matchLabel
            };
        }).sort((a, b) => {
            // Sort: matchLevel 3-4 first (good matches), then by predicted score desc
            const aScore = a.matchLevel >= 3 && a.matchLevel <= 4 ? 100 + a.prediction.predicted : a.matchLevel * 10;
            const bScore = b.matchLevel >= 3 && b.matchLevel <= 4 ? 100 + b.prediction.predicted : b.matchLevel * 10;
            return bScore - aScore;
        });
    },

    /**
     * Generate simulated score distribution using normal distribution
     */
    generateDistribution(mean, std, count = 1000) {
        const data = [];
        for (let i = 0; i < count; i++) {
            // Box-Muller transform
            const u1 = Math.random();
            const u2 = Math.random();
            const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
            let score = mean + z * std;
            score = Math.max(0, Math.min(10, score));
            data.push(Math.round(score * 4) / 4);
        }
        return data;
    },

    /**
     * Create histogram from score data
     */
    createHistogram(scores, binSize = 0.5) {
        const bins = {};
        for (let s = 0; s <= 10; s += binSize) {
            const key = s.toFixed(1);
            bins[key] = 0;
        }
        for (const s of scores) {
            const key = (Math.floor(s / binSize) * binSize).toFixed(1);
            if (bins[key] !== undefined) bins[key]++;
        }
        return bins;
    },

    /**
     * Predict 2026 score distribution based on historical trends
     */
    predict2026Distribution() {
        const params = SCORE_DISTRIBUTION_PARAMS;
        // Predict 2026 params using linear trends from 2022-2025
        const predictParam = (subject, param) => {
            const years = [2022, 2023, 2024, 2025];
            const vals = years.map(y => params[y][subject][param]);
            const lr = this.linearRegression(
                Object.fromEntries(years.map((y, i) => [y, vals[i]]))
            );
            return lr ? lr.predict(2026) : vals[vals.length - 1];
        };

        return {
            math: {
                mean: Math.round(predictParam('math', 'mean') * 100) / 100,
                std: Math.round(predictParam('math', 'std') * 100) / 100
            },
            lit: {
                mean: Math.round(predictParam('lit', 'mean') * 100) / 100,
                std: Math.round(predictParam('lit', 'std') * 100) / 100
            },
            eng: {
                mean: Math.round(predictParam('eng', 'mean') * 100) / 100,
                std: Math.round(predictParam('eng', 'std') * 100) / 100
            }
        };
    }
};

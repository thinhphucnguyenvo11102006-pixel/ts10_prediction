/**
 * model.js - Mo hinh du doan diem chuan tuyen sinh lop 10 TPHCM
 *
 * ======================================================================
 * THUAT TOAN: ANCHOR & ADJUST  (v2 — post Structural-Break 2025)
 * ======================================================================
 *
 * Linear Regression va WMA truyen thong tro nen vo nghia khi cau truc de
 * thi thay doi hoan toan tu nam 2025 (chuong trinh GDPT 2018).
 * Du lieu 2022-2024 thuoc "regime cu", khong cung mat bang voi 2025+.
 *
 * Thuat toan moi:
 *   Score_2026_i = Anchor_2025_i
 *                + ΔCompetition    (bien dong ty le choi)
 *                + ΔAdaptation     (hieu ung phuc hoi nam thu 2 sau doi form)
 *                + ΔMicroTrend     (xu huong ranking cua truong)
 *
 * Du lieu cu (2022-2024) chi dung de:
 *   - Do do on dinh lich su (historical volatility) → CI band
 *   - Uoc luong diem neo khi thieu data 2025
 * ======================================================================
 */

const PredictionModel = {
    YEARS: [2022, 2023, 2024, 2025],
    TARGET_YEAR: 2026,
    BREAK_YEAR: 2025,
    NV_PRIORITY_PENALTIES: {
        1: 0,
        2: 0.75,
        3: 1.5
    },

    // ──────────────────────────────────────────────
    //  UTILITIES
    // ──────────────────────────────────────────────

    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    },

    median(values) {
        if (!values.length) return 0;
        const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        if (sorted.length % 2 === 0) {
            return (sorted[mid - 1] + sorted[mid]) / 2;
        }
        return sorted[mid];
    },

    getAvailableYears(scores) {
        return this.YEARS.filter(y => scores[y] != null);
    },

    getNvPenalty(priority) {
        return this.NV_PRIORITY_PENALTIES[priority] ?? 0;
    },

    /**
     * Tính median gap giữa scores và priorityScores trên toàn hệ thống.
     * Dùng làm fallback khi trường không có dữ liệu priorityScores.
     */
    getSystemPriorityGaps() {
        if (this._cachedSystemGaps) return this._cachedSystemGaps;
        const schools = this.getSchoolsData();
        const gaps = { nv1: [], nv2: [], nv3: [] };
        for (const school of schools) {
            const ps = school.priorityScores;
            if (!ps) continue;
            for (const year of this.YEARS) {
                const score = school.scores[year];
                const pv = ps[year];
                if (score == null || !pv) continue;
                if (pv.nv1 != null) gaps.nv1.push(pv.nv1 - score);
                if (pv.nv2 != null) gaps.nv2.push(pv.nv2 - score);
                if (pv.nv3 != null) gaps.nv3.push(pv.nv3 - score);
            }
        }
        this._cachedSystemGaps = {
            nv1: this.median(gaps.nv1),
            nv2: this.median(gaps.nv2),
            nv3: this.median(gaps.nv3)
        };
        return this._cachedSystemGaps;
    },

    /**
     * Xây dựng ngưỡng NV1/NV2/NV3 bằng cách neo trực tiếp vào
     * dữ liệu priorityScores lịch sử thay vì penalty cố định.
     *
     * Chiến lược:
     *   1. Tìm năm gần nhất có priorityScores cho trường.
     *   2. Tính shift = basePredicted - scores[anchorYear].
     *   3. NVx_2026 = priorityScores[anchorYear].nvx + shift.
     *   4. Fallback: dùng system-wide median gap nếu thiếu data.
     */
    buildPriorityThresholds(school, basePredicted, baseLow, baseHigh, baseAnchor) {
        const roundQuarter = (value) => Math.round(value * 4) / 4;
        const ps = school.priorityScores;

        // Tìm năm anchor gần nhất có priority data
        const anchorYear = [2025, 2024, 2023, 2022].find(y => ps?.[y]?.nv1 != null);

        if (anchorYear && ps[anchorYear]) {
            const anchorPs = ps[anchorYear];
            const anchorBaseScore = school.scores[anchorYear] ?? baseAnchor;
            // Shift = mức thay đổi dự báo so với năm anchor
            const shift = this.clamp(basePredicted - anchorBaseScore, -3.0, 3.0);
            const ciLow = basePredicted - baseLow;
            const ciHigh = baseHigh - basePredicted;

            const makePriority = (key, priority) => {
                const anchorVal = anchorPs[key];
                if (anchorVal == null) {
                    const fallbackGaps = this.getSystemPriorityGaps();
                    const gap = fallbackGaps[key] ?? this.getNvPenalty(priority);
                    const pred = roundQuarter(this.clamp(basePredicted + gap, 0, 30));
                    return { priority, penalty: gap, predicted: pred, low: roundQuarter(pred - ciLow), high: roundQuarter(pred + ciHigh) };
                }
                const predicted = roundQuarter(this.clamp(anchorVal + shift, 0, 30));
                return {
                    priority,
                    penalty: roundQuarter(anchorVal - anchorBaseScore),
                    predicted,
                    low: roundQuarter(this.clamp(predicted - ciLow, 0, 30)),
                    high: roundQuarter(this.clamp(predicted + ciHigh, 0, 30))
                };
            };

            return { nv1: makePriority('nv1', 1), nv2: makePriority('nv2', 2), nv3: makePriority('nv3', 3) };
        }

        // Fallback: dùng system-wide median gaps
        const sysGaps = this.getSystemPriorityGaps();
        const makeFallback = (key, priority) => {
            const gap = sysGaps[key] ?? this.getNvPenalty(priority);
            const pred = roundQuarter(this.clamp(basePredicted + gap, 0, 30));
            return { priority, penalty: gap, predicted: pred, low: roundQuarter(this.clamp(baseLow + gap, 0, 30)), high: roundQuarter(this.clamp(baseHigh + gap, 0, 30)) };
        };
        return { nv1: makeFallback('nv1', 1), nv2: makeFallback('nv2', 2), nv3: makeFallback('nv3', 3) };
    },

    getSchoolsData() {
        return globalThis.SCHOOLS_DATA ?? SCHOOLS_DATA;
    },

    getExamStats() {
        return globalThis.EXAM_STATS ?? EXAM_STATS;
    },

    // ──────────────────────────────────────────────
    //  TIER CLASSIFICATION  (nội bộ thuật toán)
    // ──────────────────────────────────────────────

    /**
     * Phan loai tier dua tren diem 2025 (hoac diem gan nhat).
     * Tier anh huong den he so Adaptation va Ceiling effect.
     *
     * Returns: "top" | "high" | "mid" | "low"
     */
    getSchoolTier(score) {
        if (score == null) return "mid"; // fallback
        if (score >= 22)  return "top";   // Truong dau vao rat cao
        if (score >= 18)  return "high";  // Truong kha - cao
        if (score >= 14)  return "mid";   // Truong trung binh kha
        return "low";                     // Truong thap
    },

    // ──────────────────────────────────────────────
    //  COMPETITION FACTOR
    // ──────────────────────────────────────────────

    /**
     * Ty le bien dong giua ty le choi nam 2026 vs 2025.
     * Duong = canh tranh tang → diem tang.
     * Am   = canh tranh giam → diem giam.
     *
     * Returns: số thực (ví dụ: +0.03 = tăng 3%)
     */
    getCompetitionFactor() {
        const examStats = this.getExamStats();
        const stats2025 = examStats[2025];
        const stats2026 = examStats[2026];
        const ratio2025 = stats2025.candidates / stats2025.quota;
        const ratio2026 = stats2026.candidates / stats2026.quota;
        return (ratio2026 / ratio2025 - 1);
    },

    /**
     * Diem dieu chinh do canh tranh, phu thuoc tier:
     * - Truong top: it nhay (hoc sinh gioi van du & ceiling effect)
     * - Truong mid/low: nhay hon
     */
    getCompetitionAdjustment(anchor, tier) {
        const rawFactor = this.getCompetitionFactor();

        // He so nhay cam theo tier
        const sensitivity = {
            top:  0.06,
            high: 0.09,
            mid:  0.12,
            low:  0.10
        };

        return anchor * rawFactor * (sensitivity[tier] ?? 0.10);
    },

    // ──────────────────────────────────────────────
    //  ADAPTATION FACTOR  (Mean Reversion sau Structural Break)
    // ──────────────────────────────────────────────

    /**
     * Nam dau tien doi form (2025): diem thuong "shock" giam.
     * Nam thu 2 (2026): giao vien & hoc sinh da quen → diem phuc hoi (mean reversion).
     *
     * Adaptation = phan tram "bounce-back" tu muc do sut giam 2024→2025,
     * dieu chinh theo tier:
     *   - Truong top:  phuc hoi manh (hoc sinh gioi thich nghi nhanh, ceiling co gioi han)
     *   - Truong high: phuc hoi kha
     *   - Truong mid:  phuc hoi trung binh (dan hoi cao nhat)
     *   - Truong low:  phuc hoi yeu (hoc sinh gap kho khan hon khi doi form)
     */
    getAdaptationFactor(scores, tier) {
        const s2024 = scores[2024];
        const s2025 = scores[2025];

        // Neu thieu data, khong co adaptation
        if (s2024 == null || s2025 == null) return 0;

        const drop = s2024 - s2025; // Duong = diem giam tu 2024→2025

        // Neu diem 2025 tang hoac giu nguyen → khong can bounce-back
        if (drop <= 0) return 0;

        // Phan tram phuc hoi theo tier
        const recoveryRate = {
            top:  0.40,  // Phuc hoi ~40% phan sut giam
            high: 0.35,
            mid:  0.30,
            low:  0.20
        };

        const rate = recoveryRate[tier] ?? 0.30;

        // Cap toi da de tranh phuc hoi qua muc
        return this.clamp(drop * rate, 0, 1.5);
    },

    // ──────────────────────────────────────────────
    //  MICRO-TREND (xu huong ranking tuong doi)
    // ──────────────────────────────────────────────

    /**
     * Tinh xu huong "ranking" cua truong so voi mat bang chung
     * bang cach xem chuoi diem tuong doi (score - system_median),
     * roi lay median cua cac delta lien tiep.
     *
     * Day la "micro-trend" nhe, chi co nhiem vu phan biet truong dang
     * len (vi du: dau tu manh) vs truong dang xuong (vi du: mat hoc sinh gioi).
     */
    getMicroTrend(scores) {
        const baselineSeries = this.getSystemBaselineSeries();
        const relativeSeries = {};

        for (const year of this.YEARS) {
            const score = scores[year];
            const baseline = baselineSeries[year];
            if (score != null && baseline != null) {
                relativeSeries[year] = score - baseline;
            }
        }

        const years = this.YEARS.filter(y => relativeSeries[y] != null);
        if (years.length < 2) return 0;

        const deltas = [];
        for (let i = 1; i < years.length; i++) {
            deltas.push(relativeSeries[years[i]] - relativeSeries[years[i - 1]]);
        }

        const trend = this.median(deltas);

        // Giam dampening khi chi co it data points
        const dampening = Math.min(1, years.length / 4) * 0.50;
        return this.clamp(trend * dampening, -0.50, 0.50);
    },

    // ──────────────────────────────────────────────
    //  SYSTEM BASELINE
    // ──────────────────────────────────────────────

    getSystemBaselineSeries() {
        const baseline = {};
        const schools = this.getSchoolsData();
        for (const year of this.YEARS) {
            const values = schools
                .map(school => school.scores?.[year])
                .filter(value => value != null);
            baseline[year] = values.length ? this.median(values) : null;
        }
        return baseline;
    },

    /**
     * Du bao system baseline 2026.
     * Anchor = median diem cua TOAN BO he thong nam 2025.
     * + Competition adjustment (he thong)
     * + System-level adaptation
     */
    predictSystemBaseline() {
        const baselineSeries = this.getSystemBaselineSeries();

        // Anchor = system median 2025
        const anchor = baselineSeries[2025]
            ?? baselineSeries[2024]
            ?? this.median(Object.values(baselineSeries).filter(v => v != null));

        // System-level adaptation: median muc do sut giam 2024→2025
        const s2024 = baselineSeries[2024];
        const s2025 = baselineSeries[2025];
        let systemAdaptation = 0;
        if (s2024 != null && s2025 != null && s2024 > s2025) {
            systemAdaptation = (s2024 - s2025) * 0.30; // Phuc hoi 30% muc sut system
        }

        // Competition adjustment (system-level)
        const rawFactor = this.getCompetitionFactor();
        const competitionAdj = anchor * rawFactor * 0.10;

        const predicted = anchor + systemAdaptation + competitionAdj;

        return {
            predicted,
            anchor,
            adaptation: systemAdaptation,
            competition: competitionAdj
        };
    },

    // ──────────────────────────────────────────────
    //  HISTORICAL VOLATILITY (chi dung cho CI band)
    // ──────────────────────────────────────────────

    /**
     * Do luong do bien dong lich su cua diem so.
     * Du lieu cu (2022-2024) van co vai tro o day: cho biet truong do co
     * on dinh khong. Truong cang bien dong → khoang du bao cang rong.
     */
    historicalVolatility(scores) {
        const vals = this.YEARS.map(y => scores[y]).filter(v => v != null);
        if (vals.length < 2) return 1.5; // Default rong khi thieu data

        const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
        const variance = vals.reduce((s, v) => s + (v - mean) ** 2, 0) / (vals.length - 1);
        return Math.sqrt(variance);
    },

    /**
     * Relative volatility: do do bien dong cua vi the truong so voi he thong.
     * On dinh hon raw volatility vi loai bo bien dong he thong.
     */
    relativeVolatility(scores) {
        const baselineSeries = this.getSystemBaselineSeries();
        const relativeVals = [];

        for (const year of this.YEARS) {
            const s = scores[year];
            const b = baselineSeries[year];
            if (s != null && b != null) relativeVals.push(s - b);
        }

        if (relativeVals.length < 2) return 1.0;

        const mean = relativeVals.reduce((a, b) => a + b, 0) / relativeVals.length;
        const variance = relativeVals.reduce((s, v) => s + (v - mean) ** 2, 0) / (relativeVals.length - 1);
        return Math.sqrt(variance);
    },

    // ──────────────────────────────────────────────
    //  FALLBACK: Uoc luong diem 2025 khi thieu data
    // ──────────────────────────────────────────────

    /**
     * Khi truong khong co diem 2025, uoc luong tu data cu tru di
     * "do sut giam chung cua he thong nam 2025".
     */
    estimateScore2025(scores) {
        const baselineSeries = this.getSystemBaselineSeries();
        const systemDrop = (baselineSeries[2024] ?? 0) - (baselineSeries[2025] ?? 0);

        // Lay diem gan nhat
        const latestYear = [2024, 2023, 2022].find(y => scores[y] != null);
        if (latestYear == null) return null;

        return scores[latestYear] - systemDrop;
    },

    // ──────────────────────────────────────────────
    //  CORE: PREDICT SCHOOL
    // ──────────────────────────────────────────────

    /**
     * Du doan diem chuan 2026 cho mot truong.
     *
     * CONG THUC LOI:
     *   Score_2026 = Anchor_2025
     *              + ΔCompetition
     *              + ΔAdaptation
     *              + ΔMicroTrend
     *
     * Returns: { predicted, low, high, confidence, trend, anchor, baseline }
     */
    predictSchool(school) {
        const scores = school.scores;
        const years = this.getAvailableYears(scores);

        if (!years.length) {
            return {
                predicted: null,
                low: null,
                high: null,
                confidence: 40,
                trend: 0,
                wma: null,
                linear: null,
                anchor: null,
                baseline: null
            };
        }

        // ── 1. SYSTEM BASELINE ──
        const systemForecast = this.predictSystemBaseline();

        // ── 2. ANCHOR (mỏ neo) ──
        // Ưu tiên dùng điểm 2025. Nếu thiếu, ước lượng.
        let schoolAnchor = scores[2025];
        let anchorEstimated = false;

        if (schoolAnchor == null) {
            schoolAnchor = this.estimateScore2025(scores);
            anchorEstimated = true;
        }

        if (schoolAnchor == null) {
            // Không có cách nào ước lượng → fallback thô
            schoolAnchor = scores[years[years.length - 1]];
        }

        // ── 3. TIER ──
        const tier = this.getSchoolTier(schoolAnchor);

        // ── 4. COMPETITION ──
        const competitionAdj = this.getCompetitionAdjustment(schoolAnchor, tier);

        // ── 5. ADAPTATION ──
        const adaptationAdj = this.getAdaptationFactor(scores, tier);

        // ── 6. MICRO-TREND ──
        const microTrend = this.getMicroTrend(scores);

        // ── 7. TỔNG HỢP ──
        let predicted = schoolAnchor + competitionAdj + adaptationAdj + microTrend;

        // ── 8. SANITY CHECK ──
        // Diem khong the vuot qua 30 (tong toi da 3 mon * 10)
        // va khong the nho hon 0
        predicted = this.clamp(predicted, 0, 30);

        // ── 9. CONFIDENCE INTERVAL ──
        const rawStd = this.historicalVolatility(scores);
        const relStd = this.relativeVolatility(scores);

        // Ket hop raw va relative volatility
        const effectiveStd = Math.max(
            0.50,
            Math.sqrt(rawStd ** 2 * 0.40 + relStd ** 2 * 0.60)
        );

        // Mo rong CI khi anchor la uoc luong (khong co 2025 thuc te)
        const uncertaintyMultiplier = anchorEstimated ? 1.6 : 1.0;

        const low  = predicted - 0.90 * effectiveStd * uncertaintyMultiplier;
        const high = predicted + 0.65 * effectiveStd * uncertaintyMultiplier;

        // ── 10. CONFIDENCE SCORE ──
        const yearsFactor = years.length / this.YEARS.length;
        const has2025 = scores[2025] != null ? 0.30 : 0; // Bonus neu co 2025
        const consistency = 1 - Math.min(1, relStd / 2.5);

        const confidence = this.clamp(
            0.30 + 0.20 * yearsFactor + has2025 + 0.20 * consistency,
            0.30,
            0.95
        );

        const roundedPredicted = Math.round(predicted * 4) / 4;
        const roundedLow = Math.round(low * 4) / 4;
        const roundedHigh = Math.round(high * 4) / 4;

        return {
            predicted: roundedPredicted,
            low:       roundedLow,
            high:      roundedHigh,
            confidence: Math.round(confidence * 100),
            trend:     Math.round(microTrend * 100) / 100,
            // Retained for backward-compat with UI (but no longer primary)
            wma:       null,
            linear:    null,
            anchor:    Math.round(schoolAnchor * 100) / 100,
            baseline:  Math.round(systemForecast.predicted * 100) / 100,
            priorities: this.buildPriorityThresholds(school, roundedPredicted, roundedLow, roundedHigh, schoolAnchor)
        };
    },

    /**
     * Predict all schools
     */
    predictAll() {
        return this.getSchoolsData().map(school => ({
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
            const school = this.getSchoolsData().find(s => s.id === choice.schoolId);
            if (!school) continue;

            const pred = this.predictSchool(school);
            const priority = i + 1;
            const nvPenalty = this.getNvPenalty(priority);
            const effectiveThreshold = pred.priorities?.[`nv${priority}`]?.predicted ?? (pred.predicted + nvPenalty);

            const margin = totalScore - effectiveThreshold;
            let feasibilityScore, status, statusLabel;

            // Tinh diem kha thi bang ham Logistic (tham khao)
            // KHONG PHAI LA XAC SUAT DA CALIBRATE THEO THONG KE
            const rawProb = 100 / (1 + Math.exp(-1.15 * (margin - 0.15)));
            feasibilityScore = Math.max(1, Math.min(99, Math.round(rawProb)));

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
            msgs.push(`Lựa chọn NV${bestNv.nv} (${bestNv.school.name}) rất an toàn.`);
        } else if (bestNv.feasibilityScore >= 50) {
            msgs.push(`Mức khả thi tốt nhất là NV${bestNv.nv} (${bestNv.school.name}) - ${bestNv.feasibilityScore}/100.`);
        } else {
            msgs.push(`Cả 3 nguyện vọng đều có rủi ro cao. Nên xem xét lại.`);
        }

        const allDanger = results.every(r => r.status === "danger");
        if (allDanger) {
            msgs.push(`Với ${totalScore} điểm, nên chọn trường có điểm chuẩn dự kiến <= ${(totalScore - 1).toFixed(1)}.`);
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
     * Predict 2026 score distribution.
     * Van dung phuong phap Anchor & Adjust cho tung subject parameter.
     */
    predict2026Distribution() {
        const params = SCORE_DISTRIBUTION_PARAMS;

        const predictParam = (subject, param) => {
            const years = [2022, 2023, 2024, 2025];
            const vals = years.map(y => params[y][subject][param]);

            // Anchor = gia tri 2025
            const anchor = vals[3]; // index 3 = 2025

            // Micro delta: xu huong nhe tu 2024→2025
            const delta2425 = vals[3] - vals[2];

            // Adaptation nhe: neu param giam tu 2024→2025, phuc hoi 25%
            const adaptation = delta2425 < 0 ? Math.abs(delta2425) * 0.25 : 0;

            // Damped extrapolation
            const dampedDelta = delta2425 * 0.30;

            return anchor + dampedDelta + adaptation;
        };

        return {
            math: {
                mean: Math.round(predictParam("math", "mean") * 100) / 100,
                std: Math.round(predictParam("math", "std") * 100) / 100
            },
            lit: {
                mean: Math.round(predictParam("lit", "mean") * 100) / 100,
                std: Math.round(predictParam("lit", "std") * 100) / 100
            },
            eng: {
                mean: Math.round(predictParam("eng", "mean") * 100) / 100,
                std: Math.round(predictParam("eng", "std") * 100) / 100
            }
        };
    }
};

/**
 * backtest.js - Validation mo hinh du doan cho NV1 / NV2 / NV3
 *
 * Chay trong console:
 *   Backtest.run()
 *
 * Backtest su dung du lieu lich su `priorityScores` da crawl tu portal ts10
 * de danh gia:
 * - NV1 base prediction
 * - cong thuc penalty co dinh cho NV2 / NV3
 */
const Backtest = {
    NV_PRIORITY_PENALTIES: {
        nv1: 0,
        nv2: 0.75,
        nv3: 1.5
    },

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

    roundQuarter(value) {
        return Math.round(value * 4) / 4;
    },

    getSchoolTier(score) {
        if (score == null) return "mid";
        if (score >= 22) return "top";
        if (score >= 18) return "high";
        if (score >= 14) return "mid";
        return "low";
    },

    getActualPriorityScores(school, year) {
        const actual = school.priorityScores?.[year];
        if (!actual) return null;
        if (actual.nv1 == null && actual.nv2 == null && actual.nv3 == null) return null;
        return actual;
    },

    getSystemBaselineSeries(trainYears) {
        const baselineSeries = {};
        for (const year of trainYears) {
            const values = SCHOOLS_DATA
                .map(school => school.scores?.[year])
                .filter(value => value != null);
            baselineSeries[year] = values.length ? this.median(values) : null;
        }
        return baselineSeries;
    },

    predictBaseScore(school, trainYears, targetYear) {
        const scores = school.scores;
        const baselineSeries = this.getSystemBaselineSeries(trainYears);
        const anchorYear = trainYears[trainYears.length - 1];
        const previousYear = trainYears[trainYears.length - 2];

        const schoolAnchor = scores[anchorYear] ?? scores[previousYear] ?? scores[trainYears[0]];
        if (schoolAnchor == null) return null;

        const tier = this.getSchoolTier(schoolAnchor);
        const examStats = globalThis.EXAM_STATS ?? EXAM_STATS;
        const ratioAnchor = examStats[anchorYear].candidates / examStats[anchorYear].quota;
        const ratioTarget = examStats[targetYear].candidates / examStats[targetYear].quota;
        const compFactor = ratioAnchor === 0 ? 0 : (ratioTarget / ratioAnchor - 1);

        const sensitivity = { top: 0.06, high: 0.09, mid: 0.12, low: 0.10 };
        const compAdj = schoolAnchor * compFactor * (sensitivity[tier] ?? 0.10);

        const relativeSeries = {};
        for (const year of trainYears) {
            const score = scores[year];
            const baseline = baselineSeries[year];
            if (score != null && baseline != null) {
                relativeSeries[year] = score - baseline;
            }
        }

        const relYears = trainYears.filter(year => relativeSeries[year] != null);
        let microTrend = 0;
        if (relYears.length >= 2) {
            const deltas = [];
            for (let i = 1; i < relYears.length; i++) {
                deltas.push(relativeSeries[relYears[i]] - relativeSeries[relYears[i - 1]]);
            }
            const rawTrend = this.median(deltas);
            const dampening = Math.min(1, relYears.length / 3) * 0.50;
            microTrend = this.clamp(rawTrend * dampening, -0.50, 0.50);
        }

        return this.roundQuarter(this.clamp(schoolAnchor + compAdj + microTrend, 0, 30));
    },

    createMetricBucket() {
        return {
            count: 0,
            absErrorSum: 0,
            sqErrorSum: 0,
            under05: 0,
            under10: 0,
            under15: 0
        };
    },

    pushMetric(bucket, predicted, actual) {
        const error = predicted - actual;
        const absError = Math.abs(error);
        bucket.count += 1;
        bucket.absErrorSum += absError;
        bucket.sqErrorSum += error * error;
        if (absError < 0.5) bucket.under05 += 1;
        if (absError < 1.0) bucket.under10 += 1;
        if (absError < 1.5) bucket.under15 += 1;
        return {
            predicted,
            actual,
            error: Math.round(error * 100) / 100,
            absError: Math.round(absError * 100) / 100
        };
    },

    summarizeBucket(bucket) {
        if (!bucket.count) {
            return {
                count: 0,
                mae: null,
                rmse: null,
                under05: 0,
                under10: 0,
                under15: 0
            };
        }

        return {
            count: bucket.count,
            mae: bucket.absErrorSum / bucket.count,
            rmse: Math.sqrt(bucket.sqErrorSum / bucket.count),
            under05: bucket.under05 / bucket.count,
            under10: bucket.under10 / bucket.count,
            under15: bucket.under15 / bucket.count
        };
    },

    evaluateYear(targetYear, trainYears) {
        const buckets = {
            nv1: this.createMetricBucket(),
            nv2: this.createMetricBucket(),
            nv3: this.createMetricBucket(),
            overall: this.createMetricBucket()
        };
        const results = [];

        for (const school of SCHOOLS_DATA) {
            const actualPriorities = this.getActualPriorityScores(school, targetYear);
            if (!actualPriorities) continue;

            const predictedBase = this.predictBaseScore(school, trainYears, targetYear);
            if (predictedBase == null) continue;

            const row = {
                name: school.name,
                district: school.district,
                priorities: {}
            };

            for (const [priorityKey, penalty] of Object.entries(this.NV_PRIORITY_PENALTIES)) {
                const actual = actualPriorities[priorityKey];
                if (actual == null) continue;

                const predicted = this.roundQuarter(predictedBase + penalty);
                const metric = this.pushMetric(buckets[priorityKey], predicted, actual);
                this.pushMetric(buckets.overall, predicted, actual);
                row.priorities[priorityKey] = metric;
            }

            if (Object.keys(row.priorities).length) {
                const absErrors = Object.values(row.priorities).map(item => item.absError);
                row.maxAbsError = Math.max(...absErrors);
                results.push(row);
            }
        }

        results.sort((a, b) => b.maxAbsError - a.maxAbsError);

        return {
            targetYear,
            trainYears,
            summary: {
                nv1: this.summarizeBucket(buckets.nv1),
                nv2: this.summarizeBucket(buckets.nv2),
                nv3: this.summarizeBucket(buckets.nv3),
                overall: this.summarizeBucket(buckets.overall)
            },
            results
        };
    },

    formatPercent(value) {
        return value == null ? "-" : `${(value * 100).toFixed(1)}%`;
    },

    logSummaryBlock(label, summary) {
        console.log(
            `  ${label}: count ${summary.count} | MAE ${summary.mae?.toFixed(3) ?? "-"} | ` +
            `RMSE ${summary.rmse?.toFixed(3) ?? "-"} | <0.5 ${this.formatPercent(summary.under05)} | ` +
            `<1.0 ${this.formatPercent(summary.under10)} | <1.5 ${this.formatPercent(summary.under15)}`
        );
    },

    run() {
        const scenarios = [
            { targetYear: 2024, trainYears: [2022, 2023] },
            { targetYear: 2025, trainYears: [2022, 2023, 2024] }
        ];

        const evaluations = scenarios.map(({ targetYear, trainYears }) =>
            this.evaluateYear(targetYear, trainYears)
        );

        console.log("===========================================");
        console.log("  BACKTEST: NV1 / NV2 / NV3");
        console.log("  Actual priorities from ts10.hcm.edu.vn");
        console.log("===========================================");

        for (const evaluation of evaluations) {
            console.log(
                `Year ${evaluation.targetYear} | Train ${evaluation.trainYears.join(", ")}`
            );
            this.logSummaryBlock("NV1", evaluation.summary.nv1);
            this.logSummaryBlock("NV2", evaluation.summary.nv2);
            this.logSummaryBlock("NV3", evaluation.summary.nv3);
            this.logSummaryBlock("ALL", evaluation.summary.overall);
            console.log("  Top 5 largest errors:");
            evaluation.results.slice(0, 5).forEach((row, index) => {
                const detail = Object.entries(row.priorities)
                    .map(([priority, info]) =>
                        `${priority.toUpperCase()} ${info.predicted}/${info.actual} (${info.error > 0 ? "+" : ""}${info.error})`
                    )
                    .join(" | ");
                console.log(`  ${index + 1}. ${row.name} (${row.district}) -> ${detail}`);
            });
            console.log("-------------------------------------------");
        }

        return {
            evaluations,
            latest: evaluations[evaluations.length - 1]
        };
    }
};

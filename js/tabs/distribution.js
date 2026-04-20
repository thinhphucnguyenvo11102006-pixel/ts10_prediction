/**
 * distribution.js - Tách logic hiển thị phổ điểm (Tab 4)
 */

Object.assign(App, {
    // ========================
    // TAB 4: SCORE DISTRIBUTION
    // ========================
    renderTab4_Distribution() {
        const params = SCORE_DISTRIBUTION_PARAMS;
        const pred2026 = PredictionModel.predict2026Distribution();
        const years = [2022, 2023, 2024, 2025];

        // 1. Render insight cards
        this.renderDistInsightCards(params, pred2026);

        // 2. Grouped bar chart data
        const barData = years.map(y => ({
            year: y,
            math: params[y].math.mean,
            lit: params[y].lit.mean,
            eng: params[y].eng.mean,
            total: params[y].math.mean + params[y].lit.mean + params[y].eng.mean,
        }));
        barData.push({
            year: 2026,
            math: pred2026.math.mean,
            lit: pred2026.lit.mean,
            eng: pred2026.eng.mean,
            total: pred2026.math.mean + pred2026.lit.mean + pred2026.eng.mean,
            isPredicted: true,
        });
        Charts.createMeanComparisonChart('distMeanChart', barData);

        // 3. Distribution overlay: ONLY 2025 vs 2026
        const p25 = params[2025];
        const mathPair = [
            { year: 2025, mean: p25.math.mean, std: p25.math.std },
            { year: 2026, mean: pred2026.math.mean, std: pred2026.math.std, isPredicted: true },
        ];
        const litPair = [
            { year: 2025, mean: p25.lit.mean, std: p25.lit.std },
            { year: 2026, mean: pred2026.lit.mean, std: pred2026.lit.std, isPredicted: true },
        ];
        const engPair = [
            { year: 2025, mean: p25.eng.mean, std: p25.eng.std },
            { year: 2026, mean: pred2026.eng.mean, std: pred2026.eng.std, isPredicted: true },
        ];
        const totalMean25 = p25.math.mean + p25.lit.mean + p25.eng.mean;
        const totalStd25 = Math.sqrt(p25.math.std ** 2 + p25.lit.std ** 2 + p25.eng.std ** 2);
        const totalMean26 = pred2026.math.mean + pred2026.lit.mean + pred2026.eng.mean;
        const totalStd26 = Math.sqrt(pred2026.math.std ** 2 + pred2026.lit.std ** 2 + pred2026.eng.std ** 2);
        const totalPair = [
            { year: 2025, mean: totalMean25, std: totalStd25 },
            { year: 2026, mean: totalMean26, std: totalStd26, isPredicted: true },
        ];

        Charts.createDistributionOverlayChart('distChartMath', mathPair, 'Toán', 0, 10, 0.2);
        Charts.createDistributionOverlayChart('distChartLit', litPair, 'Ngữ Văn', 0, 10, 0.2);
        Charts.createDistributionOverlayChart('distChartEng', engPair, 'Ngoại Ngữ', 0, 10, 0.2);
        Charts.createDistributionOverlayChart('distChartTotal', totalPair, 'Tổng 3 Môn', 0, 30, 0.5);

        // 4. Stats table
        const allMathData = years.map(y => ({ year: y, mean: params[y].math.mean, std: params[y].math.std }));
        allMathData.push({ year: 2026, mean: pred2026.math.mean, std: pred2026.math.std, isPredicted: true });
        const allLitData = years.map(y => ({ year: y, mean: params[y].lit.mean, std: params[y].lit.std }));
        allLitData.push({ year: 2026, mean: pred2026.lit.mean, std: pred2026.lit.std, isPredicted: true });
        const allEngData = years.map(y => ({ year: y, mean: params[y].eng.mean, std: params[y].eng.std }));
        allEngData.push({ year: 2026, mean: pred2026.eng.mean, std: pred2026.eng.std, isPredicted: true });
        const allTotalData = years.map(y => ({
            year: y,
            mean: params[y].math.mean + params[y].lit.mean + params[y].eng.mean,
            std: Math.sqrt(params[y].math.std ** 2 + params[y].lit.std ** 2 + params[y].eng.std ** 2)
        }));
        allTotalData.push({ year: 2026, mean: totalMean26, std: totalStd26, isPredicted: true });

        this.renderDistParamsTable(allMathData, allLitData, allEngData, allTotalData);
    },

    renderDistInsightCards(params, pred2026) {
        const container = document.getElementById('distInsightCards');
        if (!container) return;

        const subjects = [
            { key: 'math', icon: '', label: 'Toán', color: '#6366f1' },
            { key: 'lit', icon: '', label: 'Ngữ Văn', color: '#10b981' },
            { key: 'eng', icon: '', label: 'Ngoại Ngữ', color: '#f59e0b' },
        ];

        // Add total
        const total2025 = params[2025].math.mean + params[2025].lit.mean + params[2025].eng.mean;
        const total2026 = pred2026.math.mean + pred2026.lit.mean + pred2026.eng.mean;

        const cards = subjects.map(s => {
            const val2025 = params[2025][s.key].mean;
            const val2026 = pred2026[s.key].mean;
            const delta = val2026 - val2025;
            const arrow = delta > 0.05 ? '↗' : delta < -0.05 ? '↘' : '→';
            const arrowColor = delta > 0.05 ? 'var(--success)' : delta < -0.05 ? 'var(--danger)' : 'var(--text-muted)';

            return `
                <div class="stat-card">
                    <div class="stat-label">${s.icon} ${s.label}</div>
                    <div class="stat-value" style="font-size:1.4rem;background:none;-webkit-text-fill-color:${s.color};color:${s.color}">
                        ${val2025.toFixed(2)} <span style="color:${arrowColor};font-size:1.2rem">${arrow}</span> ${val2026.toFixed(2)}
                    </div>
                    <div class="stat-detail" style="color:${arrowColor}">
                        ${delta >= 0 ? '+' : ''}${delta.toFixed(2)} điểm so với 2025
                    </div>
                </div>
            `;
        });

        // Total card
        const totalDelta = total2026 - total2025;
        const totalArrow = totalDelta > 0.1 ? '↗' : totalDelta < -0.1 ? '↘' : '→';
        const totalColor = totalDelta > 0.1 ? 'var(--success)' : totalDelta < -0.1 ? 'var(--danger)' : 'var(--text-muted)';
        cards.push(`
            <div class="stat-card">
                <div class="stat-label">📊 Tổng 3 môn</div>
                <div class="stat-value accent" style="font-size:1.4rem">
                    ${total2025.toFixed(2)} <span style="color:${totalColor};font-size:1.2rem">${totalArrow}</span> ${total2026.toFixed(2)}
                </div>
                <div class="stat-detail" style="color:${totalColor}">
                    ${totalDelta >= 0 ? '+' : ''}${totalDelta.toFixed(2)} điểm so với 2025
                </div>
            </div>
        `);

        container.innerHTML = cards.join('');
    },

    renderDistParamsTable(mathData, litData, engData, totalData) {
        const tbody = document.getElementById('distParamsBody');
        if (!tbody) return;

        tbody.innerHTML = mathData.map((m, i) => {
            const l = litData[i];
            const e = engData[i];
            const t = totalData[i];
            const yearLabel = m.isPredicted ? `${m.year} <span style="color:var(--accent);font-size:0.75rem">(DK)</span>` : m.year;
            const rowStyle = m.isPredicted ? 'style="background:rgba(239,68,68,0.06)"' : '';

            return `
                <tr ${rowStyle}>
                    <td><strong>${yearLabel}</strong></td>
                    <td>${m.mean.toFixed(2)}</td>
                    <td style="color:var(--text-muted)">${m.std.toFixed(2)}</td>
                    <td>${l.mean.toFixed(2)}</td>
                    <td style="color:var(--text-muted)">${l.std.toFixed(2)}</td>
                    <td>${e.mean.toFixed(2)}</td>
                    <td style="color:var(--text-muted)">${e.std.toFixed(2)}</td>
                    <td class="score-predicted">${t.mean.toFixed(2)}</td>
                    <td style="color:var(--text-muted)">${t.std.toFixed(2)}</td>
                </tr>
            `;
        }).join('');
    }
});

/**
 * charts.js - Chart.js wrapper functions
 */

const Charts = {
    instances: {},

    colors: {
        primary: '#6366f1',
        primaryLight: 'rgba(99, 102, 241, 0.15)',
        secondary: '#06b6d4',
        secondaryLight: 'rgba(6, 182, 212, 0.15)',
        accent: '#f59e0b',
        accentLight: 'rgba(245, 158, 11, 0.15)',
        success: '#10b981',
        successLight: 'rgba(16, 185, 129, 0.15)',
        danger: '#ef4444',
        dangerLight: 'rgba(239, 68, 68, 0.15)',
        warning: '#f59e0b',
        grid: 'rgba(255,255,255,0.06)',
        text: 'rgba(255,255,255,0.7)',
        textBright: 'rgba(255,255,255,0.9)',
    },

    defaultOptions() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: this.colors.text,
                        font: { family: "'Inter', sans-serif", size: 12 },
                        padding: 16,
                        usePointStyle: true,
                        pointStyleWidth: 12,
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    titleColor: '#fff',
                    bodyColor: 'rgba(255,255,255,0.8)',
                    borderColor: 'rgba(99, 102, 241, 0.3)',
                    borderWidth: 1,
                    cornerRadius: 8,
                    padding: 12,
                    titleFont: { family: "'Inter', sans-serif", weight: '600' },
                    bodyFont: { family: "'Inter', sans-serif" },
                }
            },
            scales: {
                x: {
                    grid: { color: this.colors.grid },
                    ticks: { color: this.colors.text, font: { family: "'Inter', sans-serif", size: 11 } }
                },
                y: {
                    grid: { color: this.colors.grid },
                    ticks: { color: this.colors.text, font: { family: "'Inter', sans-serif", size: 11 } }
                }
            }
        };
    },

    destroy(id) {
        if (this.instances[id]) {
            this.instances[id].destroy();
            delete this.instances[id];
        }
    },

    /**
     * School trend line chart (historical + prediction)
     */
    createTrendChart(canvasId, school, prediction) {
        this.destroy(canvasId);
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        const years = [2022, 2023, 2024, 2025, 2026];
        const historicalData = years.slice(0, 4).map(y => school.scores[y]);
        const fullData = [...historicalData, prediction.predicted];

        this.instances[canvasId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: years.map(String),
                datasets: [
                    {
                        label: 'Điểm chuẩn thực tế',
                        data: [...historicalData, null],
                        borderColor: this.colors.primary,
                        backgroundColor: this.colors.primaryLight,
                        borderWidth: 2.5,
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        pointBackgroundColor: this.colors.primary,
                        tension: 0.3,
                        fill: true,
                    },
                    {
                        label: 'Dự đoán 2026',
                        data: [null, null, null, historicalData[3], prediction.predicted],
                        borderColor: this.colors.accent,
                        backgroundColor: this.colors.accentLight,
                        borderWidth: 2.5,
                        borderDash: [8, 4],
                        pointRadius: [0, 0, 0, 0, 7],
                        pointHoverRadius: [0, 0, 0, 0, 9],
                        pointBackgroundColor: this.colors.accent,
                        pointStyle: 'star',
                        tension: 0.3,
                        fill: true,
                    },
                    {
                        label: 'Khoảng dự đoán',
                        data: [null, null, null, null, prediction.high],
                        borderColor: 'transparent',
                        pointRadius: 0,
                        fill: false,
                    },
                    {
                        label: '',
                        data: [null, null, null, null, prediction.low],
                        borderColor: 'transparent',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        pointRadius: 0,
                        fill: '-1',
                        showLine: false,
                    }
                ]
            },
            options: {
                ...this.defaultOptions(),
                plugins: {
                    ...this.defaultOptions().plugins,
                    legend: {
                        ...this.defaultOptions().plugins.legend,
                        labels: {
                            ...this.defaultOptions().plugins.legend.labels,
                            filter: (item) => item.text !== ''
                        }
                    },
                    tooltip: {
                        ...this.defaultOptions().plugins.tooltip,
                        callbacks: {
                            label: (ctx) => {
                                if (ctx.datasetIndex <= 1 && ctx.raw != null) {
                                    return `${ctx.dataset.label}: ${ctx.raw.toFixed(2)} điểm`;
                                }
                                return null;
                            }
                        }
                    }
                },
                scales: {
                    ...this.defaultOptions().scales,
                    y: {
                        ...this.defaultOptions().scales.y,
                        title: { display: true, text: 'Điểm chuẩn', color: this.colors.text },
                    }
                }
            }
        });
    },

    /**
     * Feasibility gauge chart
     */
    createGaugeChart(canvasId, probability, status) {
        this.destroy(canvasId);
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        const statusColors = {
            safe: this.colors.success,
            possible: this.colors.accent,
            risky: this.colors.warning,
            danger: this.colors.danger
        };
        const color = statusColors[status] || this.colors.primary;
        const remaining = 100 - probability;

        this.instances[canvasId] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Khả thi', 'Rủi ro'],
                datasets: [{
                    data: [probability, remaining],
                    backgroundColor: [color, 'rgba(255,255,255,0.05)'],
                    borderWidth: 0,
                    cutout: '78%',
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false },
                },
                rotation: -90,
                circumference: 180,
            },
            plugins: [{
                id: 'centerText',
                afterDraw(chart) {
                    const { ctx, chartArea } = chart;
                    const centerX = (chartArea.left + chartArea.right) / 2;
                    const centerY = chartArea.bottom - 10;
                    ctx.save();
                    ctx.textAlign = 'center';
                    ctx.fillStyle = color;
                    ctx.font = "bold 28px 'Inter', sans-serif";
                    ctx.fillText(`${probability}%`, centerX, centerY - 8);
                    ctx.fillStyle = 'rgba(255,255,255,0.5)';
                    ctx.font = "12px 'Inter', sans-serif";
                    ctx.fillText('xác suất đậu', centerX, centerY + 12);
                    ctx.restore();
                }
            }]
        });
    },

    /**
     * Score distribution bar chart
     */
    createDistributionChart(canvasId, histogramData, label, color) {
        this.destroy(canvasId);
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        const labels = Object.keys(histogramData);
        const values = Object.values(histogramData);

        this.instances[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: label || 'Số thí sinh',
                    data: values,
                    backgroundColor: color || this.colors.primary,
                    borderColor: 'transparent',
                    borderRadius: 3,
                    barPercentage: 0.85,
                }]
            },
            options: {
                ...this.defaultOptions(),
                plugins: {
                    ...this.defaultOptions().plugins,
                    legend: { display: false },
                },
                scales: {
                    ...this.defaultOptions().scales,
                    x: {
                        ...this.defaultOptions().scales.x,
                        title: { display: true, text: 'Điểm', color: this.colors.text },
                    },
                    y: {
                        ...this.defaultOptions().scales.y,
                        title: { display: true, text: 'Số lượng', color: this.colors.text },
                        beginAtZero: true,
                    }
                }
            }
        });
    },

    /**
     * Comparison radar chart
     */
    createComparisonChart(canvasId, schools) {
        this.destroy(canvasId);
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        const datasets = schools.map((s, i) => {
            const colors = [this.colors.primary, this.colors.secondary, this.colors.accent];
            const lightColors = [this.colors.primaryLight, this.colors.secondaryLight, this.colors.accentLight];
            return {
                label: s.name,
                data: [
                    s.scores[2022],
                    s.scores[2023],
                    s.scores[2024],
                    s.scores[2025],
                    s.prediction ? s.prediction.predicted : 0
                ],
                borderColor: colors[i % 3],
                backgroundColor: lightColors[i % 3],
                borderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
                tension: 0.3,
                fill: true,
            };
        });

        this.instances[canvasId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['2022', '2023', '2024', '2025', '2026*'],
                datasets
            },
            options: {
                ...this.defaultOptions(),
                scales: {
                    ...this.defaultOptions().scales,
                    y: {
                        ...this.defaultOptions().scales.y,
                        title: { display: true, text: 'Điểm chuẩn', color: this.colors.text },
                    }
                }
            }
        });
    },

    /**
     * Overview stats bar chart
     */
    createOverviewChart(canvasId, predictions) {
        this.destroy(canvasId);
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        // Group by tier
        const tierKeys = Object.keys(TIER_INFO);
        const tiers = {};
        tierKeys.forEach(t => { tiers[t] = 0; });
        predictions.forEach(s => { if (tiers[s.tier] !== undefined) tiers[s.tier]++; });

        this.instances[canvasId] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(tiers).map(t => `${TIER_INFO[t].label} (${t})`),
                datasets: [{
                    data: Object.values(tiers),
                    backgroundColor: Object.keys(tiers).map(t => TIER_INFO[t].color),
                    borderWidth: 0,
                    spacing: 3,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: this.colors.text,
                            font: { family: "'Inter', sans-serif", size: 12 },
                            padding: 12,
                            usePointStyle: true,
                        }
                    },
                    tooltip: this.defaultOptions().plugins.tooltip,
                }
            }
        });
    },

    /**
     * Normal distribution PDF
     */
    normalPDF(x, mean, std) {
        const coeff = 1 / (std * Math.sqrt(2 * Math.PI));
        const exponent = -((x - mean) ** 2) / (2 * std ** 2);
        return coeff * Math.exp(exponent);
    },

    /**
     * Clean 2-curve distribution chart (2025 vs 2026)
     */
    createDistributionOverlayChart(canvasId, yearsData, subjectLabel, xMin = 0, xMax = 10, step = 0.2) {
        this.destroy(canvasId);
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        const xPoints = [];
        for (let x = xMin; x <= xMax; x += step) {
            xPoints.push(Math.round(x * 100) / 100);
        }
        const labels = xPoints.map(x => x.toFixed(1));

        const styles = [
            { border: '#10b981', bg: 'rgba(16, 185, 129, 0.18)', width: 2.5, dash: [] },
            { border: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)', width: 2.5, dash: [6, 3] },
        ];

        const datasets = yearsData.map((yd, i) => {
            const style = styles[i] || styles[0];
            const yPoints = xPoints.map(x => this.normalPDF(x, yd.mean, yd.std));
            return {
                label: yd.isPredicted ? `2026 (dự đoán) — TB: ${yd.mean.toFixed(2)}` : `2025 — TB: ${yd.mean.toFixed(2)}`,
                data: yPoints,
                borderColor: style.border,
                backgroundColor: style.bg,
                borderWidth: style.width,
                borderDash: style.dash,
                pointRadius: 0,
                pointHoverRadius: 3,
                tension: 0.4,
                fill: true,
            };
        });

        this.instances[canvasId] = new Chart(ctx, {
            type: 'line',
            data: { labels, datasets },
            options: {
                ...this.defaultOptions(),
                interaction: { mode: 'index', intersect: false },
                plugins: {
                    ...this.defaultOptions().plugins,
                    legend: { ...this.defaultOptions().plugins.legend, position: 'top' },
                    tooltip: {
                        ...this.defaultOptions().plugins.tooltip,
                        callbacks: {
                            title: (items) => `Điểm: ${items[0].label}`,
                            label: (ctx) => `${ctx.dataset.label.split('—')[0].trim()}: ${(ctx.raw * 100).toFixed(1)}%`
                        }
                    }
                },
                scales: {
                    ...this.defaultOptions().scales,
                    x: {
                        ...this.defaultOptions().scales.x,
                        title: { display: true, text: `Điểm ${subjectLabel}`, color: this.colors.text },
                        ticks: {
                            ...this.defaultOptions().scales.x.ticks,
                            maxTicksLimit: 12,
                            callback: function (value, index) {
                                const v = parseFloat(this.getLabelForValue(index));
                                return v % 1 === 0 ? v.toFixed(0) : '';
                            }
                        }
                    },
                    y: {
                        ...this.defaultOptions().scales.y,
                        title: { display: true, text: 'Mật độ', color: this.colors.text },
                        beginAtZero: true,
                        ticks: { ...this.defaultOptions().scales.y.ticks, callback: (v) => (v * 100).toFixed(0) + '%' }
                    }
                }
            }
        });
    },

    /**
     * Grouped bar chart — mean scores across years
     */
    createMeanComparisonChart(canvasId, allData) {
        this.destroy(canvasId);
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        const years = allData.map(d => d.isPredicted ? `${d.year}*` : `${d.year}`);

        const datasets = [
            {
                label: '📐 Toán',
                data: allData.map(d => d.math),
                backgroundColor: 'rgba(99, 102, 241, 0.75)',
                borderColor: '#6366f1',
                borderWidth: 1,
                borderRadius: 6,
            },
            {
                label: '📝 Ngữ Văn',
                data: allData.map(d => d.lit),
                backgroundColor: 'rgba(16, 185, 129, 0.75)',
                borderColor: '#10b981',
                borderWidth: 1,
                borderRadius: 6,
            },
            {
                label: '🌐 Ngoại Ngữ',
                data: allData.map(d => d.eng),
                backgroundColor: 'rgba(245, 158, 11, 0.75)',
                borderColor: '#f59e0b',
                borderWidth: 1,
                borderRadius: 6,
            },
            {
                label: '📊 Tổng ÷ 3',
                data: allData.map(d => d.total / 3),
                backgroundColor: 'rgba(239, 68, 68, 0.6)',
                borderColor: '#ef4444',
                borderWidth: 2,
                type: 'line',
                pointRadius: 6,
                pointHoverRadius: 8,
                pointBackgroundColor: '#ef4444',
                tension: 0.3,
                fill: false,
                order: 0,
            }
        ];

        this.instances[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: { labels: years, datasets },
            options: {
                ...this.defaultOptions(),
                interaction: { mode: 'index', intersect: false },
                plugins: {
                    ...this.defaultOptions().plugins,
                    legend: { ...this.defaultOptions().plugins.legend, position: 'top' },
                    tooltip: {
                        ...this.defaultOptions().plugins.tooltip,
                        callbacks: { label: (ctx) => `${ctx.dataset.label}: ${ctx.raw.toFixed(2)} điểm` }
                    }
                },
                scales: {
                    ...this.defaultOptions().scales,
                    x: {
                        ...this.defaultOptions().scales.x,
                        title: { display: true, text: 'Năm thi', color: this.colors.text },
                    },
                    y: {
                        ...this.defaultOptions().scales.y,
                        title: { display: true, text: 'Điểm trung bình', color: this.colors.text },
                        beginAtZero: false,
                        min: 3,
                        max: 8,
                        ticks: { ...this.defaultOptions().scales.y.ticks, stepSize: 0.5 }
                    }
                }
            }
        });
    }
};

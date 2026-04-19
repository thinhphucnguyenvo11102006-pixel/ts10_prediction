/**
 * app.js - Main application logic
 */

const App = {
    predictions: [],
    currentTab: 'predict',
    sortColumn: 'predicted',
    sortDirection: 'desc',
    searchQuery: '',
    districtFilter: 'all',
    selectedSchool: null,

    distributionRendered: false,

    init() {
        // Generate predictions
        this.predictions = PredictionModel.predictAll();

        // Render
        this.renderStats();
        this.renderTab1_Predictions();
        this.renderTab2_SchoolSelects();
        this.renderTab3_DistrictSelect();

        // Event listeners
        this.bindEvents();

        // Show default tab
        this.switchTab('predict');

        console.log('🎓 App initialized with', this.predictions.length, 'schools');
    },

    // ========================
    // TAB NAVIGATION
    // ========================
    bindEvents() {
        // Tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });

        // Search
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.toLowerCase();
                this.renderPredictionTable();
            });
        }

        // District filter (Tab 1)
        const districtSelect = document.getElementById('districtFilter');
        if (districtSelect) {
            districtSelect.addEventListener('change', (e) => {
                this.districtFilter = e.target.value;
                this.renderPredictionTable();
            });
        }

        // Feasibility form
        const evalBtn = document.getElementById('evaluateBtn');
        if (evalBtn) {
            evalBtn.addEventListener('click', () => this.evaluateFeasibility());
        }

        // Recommend form
        const recommendBtn = document.getElementById('recommendBtn');
        if (recommendBtn) {
            recommendBtn.addEventListener('click', () => this.showRecommendations());
        }

        // Score inputs auto-calc
        ['scoreMath', 'scoreLit', 'scoreEng'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('input', () => this.updateTotalScore());
            }
        });

        // Recommend score inputs auto calc
        ['recScoreMath', 'recScoreLit', 'recScoreEng'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('input', () => this.updateRecTotalScore());
            }
        });

        // Tab 5: Optimize NV
        const optBtn = document.getElementById('btnOptimize');
        if (optBtn) {
            optBtn.addEventListener('click', () => this.renderTab5_Optimize());
        }

        // Tab 5: Live score estimation
        ['opt-hk2-math', 'opt-hk2-lit', 'opt-hk2-eng', 'opt-tb-math', 'opt-tb-lit', 'opt-tb-eng'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('input', () => this.updateOptEstimate());
            }
        });
    },

    switchTab(tabId) {
        this.currentTab = tabId;
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabId);
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `tab-${tabId}`);
        });

        // Lazy-render distribution charts on first visit
        if (tabId === 'distribution' && !this.distributionRendered) {
            this.distributionRendered = true;
            setTimeout(() => this.renderTab4_Distribution(), 50);
        }
    },

    // ========================
    // HEADER STATS
    // ========================
    renderStats() {
        const stats2026 = EXAM_STATS[2026];
        const preds = this.predictions.map(s => s.prediction.predicted);
        const avgPred = preds.reduce((a, b) => a + b, 0) / preds.length;
        const maxPred = Math.max(...preds);
        const minPred = Math.min(...preds);

        document.getElementById('statCandidates').textContent = stats2026.candidates.toLocaleString('vi-VN');
        document.getElementById('statQuota').textContent = stats2026.quota.toLocaleString('vi-VN');
        document.getElementById('statAvgPred').textContent = avgPred.toFixed(1);
        document.getElementById('statRange').textContent = `${minPred.toFixed(1)} - ${maxPred.toFixed(1)}`;
    },

    // ========================
    // TAB 1: PREDICTIONS TABLE
    // ========================
    renderTab1_Predictions() {
        this.renderPredictionTable();
    },

    renderPredictionTable() {
        let data = [...this.predictions];

        // Filter by search
        if (this.searchQuery) {
            data = data.filter(s =>
                s.name.toLowerCase().includes(this.searchQuery) ||
                s.district.toLowerCase().includes(this.searchQuery)
            );
        }

        // Filter by district
        if (this.districtFilter !== 'all') {
            data = data.filter(s => s.district === this.districtFilter);
        }

        // Sort
        data.sort((a, b) => {
            let va, vb;
            switch (this.sortColumn) {
                case 'name': va = a.name; vb = b.name; break;
                case 'district': va = a.district; vb = b.district; break;
                case '2022': va = a.scores[2022]; vb = b.scores[2022]; break;
                case '2023': va = a.scores[2023]; vb = b.scores[2023]; break;
                case '2024': va = a.scores[2024]; vb = b.scores[2024]; break;
                case '2025': va = a.scores[2025]; vb = b.scores[2025]; break;
                case 'predicted': va = a.prediction.predicted; vb = b.prediction.predicted; break;
                case 'trend': va = a.prediction.trend; vb = b.prediction.trend; break;
                case 'confidence': va = a.prediction.confidence; vb = b.prediction.confidence; break;
                default: va = a.prediction.predicted; vb = b.prediction.predicted;
            }
            if (typeof va === 'string') {
                return this.sortDirection === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
            }
            return this.sortDirection === 'asc' ? va - vb : vb - va;
        });

        const tbody = document.getElementById('predictionTableBody');
        if (!tbody) return;

        tbody.innerHTML = data.map((s, idx) => {
            const p = s.prediction;
            const trendIcon = p.trend > 0.05 ? '↗' : p.trend < -0.05 ? '↘' : '→';
            const trendClass = p.trend > 0.05 ? 'trend-up' : p.trend < -0.05 ? 'trend-down' : 'trend-flat';

            return `
                <tr data-school-id="${s.id}" onclick="App.showSchoolDetail(${s.id})">
                    <td>${idx + 1}</td>
                    <td><span class="tier-badge tier-${s.tier}">${s.tier}</span></td>
                    <td><strong>${s.name}</strong></td>
                    <td>${s.district}</td>
                    <td class="score-cell">${s.scores[2022]?.toFixed(2) || '-'}</td>
                    <td class="score-cell">${s.scores[2023]?.toFixed(2) || '-'}</td>
                    <td class="score-cell">${s.scores[2024]?.toFixed(2) || '-'}</td>
                    <td class="score-cell">${s.scores[2025]?.toFixed(2) || '-'}</td>
                    <td class="score-cell score-predicted">${p.predicted.toFixed(2)}</td>
                    <td class="score-cell" style="color:var(--text-muted);font-size:0.78rem">${p.low.toFixed(1)} - ${p.high.toFixed(1)}</td>
                    <td class="${trendClass}">${trendIcon} ${Math.abs(p.trend).toFixed(2)}</td>
                    <td>${p.confidence}%</td>
                </tr>
            `;
        }).join('');

        // Update count
        const countEl = document.getElementById('schoolCount');
        if (countEl) countEl.textContent = data.length;

        // Bind sort headers
        document.querySelectorAll('.data-table th[data-sort]').forEach(th => {
            th.onclick = () => {
                const col = th.dataset.sort;
                if (this.sortColumn === col) {
                    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
                } else {
                    this.sortColumn = col;
                    this.sortDirection = 'desc';
                }
                // Update header classes
                document.querySelectorAll('.data-table th').forEach(h => {
                    h.classList.remove('sorted-asc', 'sorted-desc');
                });
                th.classList.add(this.sortDirection === 'asc' ? 'sorted-asc' : 'sorted-desc');
                this.renderPredictionTable();
            };
        });
    },

    showSchoolDetail(schoolId) {
        const school = this.predictions.find(s => s.id === schoolId);
        if (!school) return;

        this.selectedSchool = school;
        const detail = document.getElementById('schoolDetail');
        if (!detail) return;

        detail.classList.add('active');
        document.getElementById('detailSchoolName').textContent = school.name;
        document.getElementById('detailDistrict').textContent = school.district;
        document.getElementById('detailTier').textContent = `Tier ${school.tier} - ${TIER_INFO[school.tier].label}`;
        document.getElementById('detailPredicted').textContent = school.prediction.predicted.toFixed(2);
        document.getElementById('detailRange').textContent = `${school.prediction.low.toFixed(2)} - ${school.prediction.high.toFixed(2)}`;
        document.getElementById('detailConfidence').textContent = `${school.prediction.confidence}%`;

        // Create trend chart
        Charts.createTrendChart('detailChart', school, school.prediction);

        // Scroll to detail
        detail.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },

    closeSchoolDetail() {
        const detail = document.getElementById('schoolDetail');
        if (detail) detail.classList.remove('active');
        this.selectedSchool = null;
    },

    // ========================
    // TAB 2: FEASIBILITY
    // ========================
    renderTab2_SchoolSelects() {
        const sorted = [...SCHOOLS_DATA].sort((a, b) => a.name.localeCompare(b.name, 'vi'));
        const options = sorted.map(s =>
            `<option value="${s.id}">${s.name} (${s.district})</option>`
        ).join('');

        ['nv1Select', 'nv2Select', 'nv3Select'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.innerHTML = `<option value="">-- Chọn trường --</option>` + options;
            }
        });
    },

    updateTotalScore() {
        const math = parseFloat(document.getElementById('scoreMath')?.value) || 0;
        const lit = parseFloat(document.getElementById('scoreLit')?.value) || 0;
        const eng = parseFloat(document.getElementById('scoreEng')?.value) || 0;
        const total = math + lit + eng;
        const el = document.getElementById('totalScore');
        if (el) el.textContent = total.toFixed(2);
    },

    updateRecTotalScore() {
        const math = parseFloat(document.getElementById('recScoreMath')?.value) || 0;
        const lit = parseFloat(document.getElementById('recScoreLit')?.value) || 0;
        const eng = parseFloat(document.getElementById('recScoreEng')?.value) || 0;
        const total = math + lit + eng;
        const el = document.getElementById('recTotalScore');
        if (el) el.textContent = total.toFixed(2);
    },

    evaluateFeasibility() {
        const math = parseFloat(document.getElementById('scoreMath')?.value);
        const lit = parseFloat(document.getElementById('scoreLit')?.value);
        const eng = parseFloat(document.getElementById('scoreEng')?.value);

        if (isNaN(math) || isNaN(lit) || isNaN(eng)) {
            alert('Vui lòng nhập đầy đủ điểm 3 môn!');
            return;
        }

        const totalScore = math + lit + eng;
        const choices = [];
        for (let i = 1; i <= 3; i++) {
            const select = document.getElementById(`nv${i}Select`);
            if (select && select.value) {
                choices.push({ schoolId: parseInt(select.value), priority: i });
            }
        }

        if (choices.length === 0) {
            alert('Vui lòng chọn ít nhất 1 nguyện vọng!');
            return;
        }

        const result = PredictionModel.evaluateChoices(totalScore, choices);
        this.renderFeasibilityResults(result);
    },

    renderFeasibilityResults(result) {
        const container = document.getElementById('feasibilityResults');
        if (!container) return;

        container.innerHTML = '';

        // Result cards
        const cardsHtml = result.choices.map((c, i) => `
            <div class="result-card ${c.status}">
                <div class="nv-label">Nguyện vọng ${c.nv}</div>
                <div class="nv-school-name">${c.school.name}</div>
                <span class="status-badge ${c.status}">${c.statusLabel}</span>

                <div class="gauge-container">
                    <canvas id="gauge-${i}"></canvas>
                </div>

                <div class="nv-stats">
                    <div class="nv-stat-item">
                        <span class="nv-stat-label">Điểm bạn</span>
                        <span class="nv-stat-value" style="color:var(--secondary)">${result.totalScore.toFixed(2)}</span>
                    </div>
                    <div class="nv-stat-item">
                        <span class="nv-stat-label">Điểm chuẩn DK</span>
                        <span class="nv-stat-value" style="color:var(--accent)">${c.prediction.predicted.toFixed(2)}</span>
                    </div>
                    <div class="nv-stat-item">
                        <span class="nv-stat-label">Ngưỡng hiệu quả</span>
                        <span class="nv-stat-value" style="color:var(--text-secondary)">${c.effectiveThreshold.toFixed(2)}</span>
                    </div>
                    <div class="nv-stat-item">
                        <span class="nv-stat-label">Chênh lệch</span>
                        <span class="nv-stat-value" style="color:${c.margin >= 0 ? 'var(--success)' : 'var(--danger)'}">
                            ${c.margin >= 0 ? '+' : ''}${c.margin.toFixed(2)}
                        </span>
                    </div>
                </div>
                ${c.nvPenalty > 0 ? `<div style="font-size:0.75rem;color:var(--text-muted);margin-top:8px">⚠ NV${c.nv}: ngưỡng tăng thêm +${c.nvPenalty.toFixed(1)} so với NV1</div>` : ''}
            </div>
        `).join('');

        // Recommendation
        const recHtml = `
            <div class="recommendation-box">
                <div class="card-title"><span class="icon">💡</span> Nhận xét & Gợi ý</div>
                ${result.recommendation.map(r => `<p>${r}</p>`).join('')}
                <p style="margin-top:8px;color:var(--text-muted);font-size:0.8rem">
                    📊 Cơ hội tốt nhất: <strong style="color:var(--accent)">${result.bestChance}%</strong>
                </p>
            </div>
        `;

        container.innerHTML = `
            <div class="result-cards">${cardsHtml}</div>
            ${recHtml}
        `;

        // Create gauge charts
        result.choices.forEach((c, i) => {
            setTimeout(() => {
                Charts.createGaugeChart(`gauge-${i}`, c.probability, c.status);
            }, 100);
        });

        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },

    // ========================
    // TAB 3: RECOMMENDATIONS
    // ========================
    renderTab3_DistrictSelect() {
        const select = document.getElementById('recDistrictSelect');
        if (!select) return;

        select.innerHTML = `<option value="all">🏙 Tất cả quận/huyện</option>` +
            DISTRICTS.map(d => `<option value="${d}">${d}</option>`).join('');
    },

    showRecommendations() {
        const math = parseFloat(document.getElementById('recScoreMath')?.value);
        const lit = parseFloat(document.getElementById('recScoreLit')?.value);
        const eng = parseFloat(document.getElementById('recScoreEng')?.value);
        const district = document.getElementById('recDistrictSelect')?.value || 'all';

        if (isNaN(math) || isNaN(lit) || isNaN(eng)) {
            alert('Vui lòng nhập đầy đủ điểm 3 môn!');
            return;
        }

        const totalScore = math + lit + eng;
        const recommendations = PredictionModel.recommendByDistrict(totalScore, district);
        this.renderRecommendationResults(recommendations, totalScore, district);
    },

    renderRecommendationResults(schools, totalScore, district) {
        const container = document.getElementById('recommendResults');
        if (!container) return;

        const districtLabel = district === 'all' ? 'Tất cả quận/huyện' : district;
        const goodMatches = schools.filter(s => s.matchLevel >= 3);
        const okMatches = schools.filter(s => s.matchLevel === 2);

        container.innerHTML = `
            <div class="card" style="margin-bottom:16px">
                <div class="card-title"><span class="icon"></span> Kết quả gợi ý - ${districtLabel}</div>
                <div class="stats-row" style="margin:0">
                    <div class="stat-card">
                        <div class="stat-label">Điểm của bạn</div>
                        <div class="stat-value">${totalScore.toFixed(1)}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Trường khả thi</div>
                        <div class="stat-value accent">${goodMatches.length}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Trường may rủi</div>
                        <div class="stat-value" style="background:linear-gradient(135deg,#f59e0b,#ef4444);-webkit-background-clip:text;-webkit-text-fill-color:transparent">${okMatches.length}</div>
                    </div>
                </div>
            </div>

            <div class="table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Tier</th>
                            <th>Trường</th>
                            <th>Quận</th>
                            <th>Điểm chuẩn DK 2026</th>
                            <th>Chênh lệch</th>
                            <th>Đánh giá</th>
                            <th>Mức phù hợp</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${schools.map((s, i) => `
                            <tr>
                                <td>${i + 1}</td>
                                <td><span class="tier-badge tier-${s.tier}">${s.tier}</span></td>
                                <td><strong>${s.name}</strong></td>
                                <td>${s.district}</td>
                                <td class="score-cell score-predicted">${s.prediction.predicted.toFixed(2)}</td>
                                <td style="color:${s.margin >= 0 ? 'var(--success)' : 'var(--danger)'}">
                                    ${s.margin >= 0 ? '+' : ''}${s.margin.toFixed(2)}
                                </td>
                                <td><span class="status-badge ${s.matchLevel >= 4 ? 'safe' : s.matchLevel >= 3 ? 'possible' : s.matchLevel >= 2 ? 'risky' : 'danger'}">${s.matchLabel}</span></td>
                                <td>
                                    <div class="match-bar" style="width:100px">
                                        <div class="match-bar-fill level-${s.matchLevel}"></div>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            ${schools.length === 0 ? `
                <div class="empty-state">
                    <div class="icon">🔍</div>
                    <p>Không tìm thấy trường nào tại ${districtLabel}</p>
                </div>
            ` : ''}
        `;

        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },

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
    },

    // ========================
    // TAB 5: OPTIMIZE NV
    // ========================

    /**
     * Estimate entrance exam score from school performance.
     * Logic:
     *   - Semester 2 exam is harder, closer to entrance exam difficulty → weight 60%
     *   - Year-end GPA reflects consistency → weight 40%
     *   - Entrance exam is typically 12-18% harder than school exams
     *   - Adjustment factor: 0.85 (conservative)
     */
    estimateEntranceScore(hk2, tb) {
        const DIFFICULTY_FACTOR = 0.85; // Entrance exam harder than school
        const HK2_WEIGHT = 0.6;
        const TB_WEIGHT = 0.4;
        const estimated = (hk2 * HK2_WEIGHT + tb * TB_WEIGHT) * DIFFICULTY_FACTOR;
        return Math.round(estimated * 100) / 100;
    },

    updateOptEstimate() {
        const hk2Math = parseFloat(document.getElementById('opt-hk2-math')?.value) || 0;
        const hk2Lit = parseFloat(document.getElementById('opt-hk2-lit')?.value) || 0;
        const hk2Eng = parseFloat(document.getElementById('opt-hk2-eng')?.value) || 0;
        const tbMath = parseFloat(document.getElementById('opt-tb-math')?.value) || 0;
        const tbLit = parseFloat(document.getElementById('opt-tb-lit')?.value) || 0;
        const tbEng = parseFloat(document.getElementById('opt-tb-eng')?.value) || 0;

        const estMath = this.estimateEntranceScore(hk2Math, tbMath);
        const estLit = this.estimateEntranceScore(hk2Lit, tbLit);
        const estEng = this.estimateEntranceScore(hk2Eng, tbEng);
        const total = estMath + estLit + estEng;

        const el = document.getElementById('optEstScore');
        const detailEl = document.getElementById('optEstScoreDetail');
        if (el && detailEl) {
            if (hk2Math || hk2Lit || hk2Eng) {
                el.innerText = total.toFixed(2);
                detailEl.innerHTML = `Toán <strong>${estMath.toFixed(1)}</strong> + Văn <strong>${estLit.toFixed(1)}</strong> + Anh <strong>${estEng.toFixed(1)}</strong> (sau khi quy đổi)`;
                detailEl.style.display = 'block';
            } else {
                el.innerText = '0.00';
                detailEl.style.display = 'none';
            }
        }
    },

    renderTab5_Optimize() {
        const hk2Math = parseFloat(document.getElementById('opt-hk2-math')?.value);
        const hk2Lit = parseFloat(document.getElementById('opt-hk2-lit')?.value);
        const hk2Eng = parseFloat(document.getElementById('opt-hk2-eng')?.value);
        const tbMath = parseFloat(document.getElementById('opt-tb-math')?.value);
        const tbLit = parseFloat(document.getElementById('opt-tb-lit')?.value);
        const tbEng = parseFloat(document.getElementById('opt-tb-eng')?.value);

        if ([hk2Math, hk2Lit, hk2Eng, tbMath, tbLit, tbEng].some(isNaN)) {
            alert('Vui l\u00f2ng nh\u1eadp \u0111\u1ea7y \u0111\u1ee7 6 \u00f4 \u0111i\u1ec3m.');
            return;
        }

        const estMath = this.estimateEntranceScore(hk2Math, tbMath);
        const estLit = this.estimateEntranceScore(hk2Lit, tbLit);
        const estEng = this.estimateEntranceScore(hk2Eng, tbEng);
        const estTotal = estMath + estLit + estEng;

        // Confidence range: ±2.0 points (widened for real exam volatility)
        const estHigh = Math.min(estTotal + 2.0, 30);
        const estLow = Math.max(estTotal - 2.0, 0);

        // Sort predictions by predicted score
        const sorted = [...this.predictions].sort((a, b) => b.prediction.predicted - a.prediction.predicted);

        // Find optimal NVs with realistic gaps
        // NV1: Reach — highest school within estTotal+1.0 (stretch but not impossible)
        // NV2: Match — school ~1.5 below estTotal (comfortable with NV2 +0.75 penalty)
        // NV3: Safe — school ~2.5 below estTotal (guarantee with NV3 +1.5 penalty)

        const nv1Candidates = sorted.filter(s => s.prediction.predicted <= estHigh && s.prediction.predicted > estTotal - 0.5);
        const nv2Candidates = sorted.filter(s => s.prediction.predicted <= estTotal - 0.75 && s.prediction.predicted > estTotal - 2.5);
        const nv3Candidates = sorted.filter(s => s.prediction.predicted <= estTotal - 2.5); // Must survive NV3 penalty

        const nv1 = nv1Candidates[0] || sorted.find(s => s.prediction.predicted <= estTotal) || sorted[sorted.length - 1];

        // NV2: pick the best match not equal to NV1, with 1.5 point gap
        let nv2 = nv2Candidates.find(s => s.id !== nv1.id);
        if (!nv2) nv2 = sorted.find(s => s.id !== nv1.id && s.prediction.predicted <= estTotal - 0.75) || sorted[sorted.length - 2];

        // NV3: safe pick, ensure 2.5+ gap to absorb NV3 penalty
        let nv3 = nv3Candidates.find(s => s.id !== nv1.id && s.id !== nv2.id);
        if (!nv3) nv3 = sorted.find(s => s.id !== nv1.id && s.id !== nv2.id && s.prediction.predicted <= estTotal - 2.0) || sorted[sorted.length - 3];

        const container = document.getElementById('optimizeResults');
        if (!container) return;

        const renderNVCard = (nv, label, desc, emoji, score, penalty = 0) => {
            const margin = estTotal - score - penalty;
            const prob = margin > 2.5 ? 95 : margin > 1.5 ? 85 : margin > 0.5 ? 65 : margin > -0.25 ? 45 : margin > -1.0 ? 30 : 15;
            const probColor = prob >= 80 ? 'var(--success)' : prob >= 45 ? 'var(--accent)' : 'var(--danger)';
            const tierInfo = TIER_INFO[nv.tier] || {};

            return `
                <div class="card" style="margin-bottom:12px;border-left:4px solid ${tierInfo.color || '#6366f1'}">
                    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
                        <div>
                            <div style="font-size:0.8rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">
                                ${emoji} ${label}
                            </div>
                            <div style="font-size:1.2rem;font-weight:700;color:var(--text-primary)">
                                ${nv.name}
                                <span class="tier-badge tier-${nv.tier}" style="margin-left:8px">${nv.tier}</span>
                            </div>
                            <div style="font-size:0.85rem;color:var(--text-secondary);margin-top:4px">
                                ${nv.district} — ${desc}
                            </div>
                        </div>
                        <div style="text-align:right">
                            <div style="font-size:0.78rem;color:var(--text-muted)">${penalty > 0 ? `\u0110i\u1ec3m chu\u1ea9n + ${penalty.toFixed(1)} (ph\u1ea1t NV)` : '\u0110i\u1ec3m chu\u1ea9n DK 2026'}</div>
                            <div style="font-size:1.6rem;font-weight:700;color:${tierInfo.color || '#fff'}">${(score + penalty).toFixed(2)}</div>
                            <div style="font-size:0.82rem;margin-top:4px">
                                X\u00e1c su\u1ea5t: <strong style="color:${probColor}">${prob}%</strong>
                            </div>
                        </div>
                    </div>
                    <div style="margin-top:10px;background:rgba(255,255,255,0.05);border-radius:8px;height:8px;overflow:hidden">
                        <div style="height:100%;width:${prob}%;background:${probColor};border-radius:8px;transition:width 0.5s"></div>
                    </div>
                </div>
            `;
        };

        container.innerHTML = `
            <div class="card" style="margin-top:16px;margin-bottom:16px">
                <div class="card-title"><span class="icon">\ud83c\udfaf</span> K\u1ebft Qu\u1ea3 \u01afc L\u01b0\u1ee3ng</div>
                <div class="stats-row" style="margin:0">
                    <div class="stat-card">
                        <div class="stat-label">\ud83d\udcd0 To\u00e1n (\u01b0\u1edbc)</div>
                        <div class="stat-value" style="font-size:1.5rem;color:#6366f1;background:none;-webkit-text-fill-color:#6366f1">${estMath.toFixed(2)}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">\ud83d\udcd6 V\u0103n (\u01b0\u1edbc)</div>
                        <div class="stat-value" style="font-size:1.5rem;color:#10b981;background:none;-webkit-text-fill-color:#10b981">${estLit.toFixed(2)}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">\ud83c\udf10 Anh (\u01b0\u1edbc)</div>
                        <div class="stat-value" style="font-size:1.5rem;color:#f59e0b;background:none;-webkit-text-fill-color:#f59e0b">${estEng.toFixed(2)}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">\ud83c\udfaf T\u1ed5ng \u01b0\u1edbc t\u00ednh</div>
                        <div class="stat-value accent" style="font-size:1.5rem">${estTotal.toFixed(2)}</div>
                        <div class="stat-detail">Kho\u1ea3ng: ${estLow.toFixed(1)} - ${estHigh.toFixed(1)}</div>
                    </div>
                </div>
                <p style="color:var(--text-muted);font-size:0.8rem;margin-top:10px;text-align:center">
                    C\u00f4ng th\u1ee9c: (\u0110i\u1ec3m HK2 \u00d7 60% + TBCN \u00d7 40%) \u00d7 0.85 (h\u1ec7 s\u1ed1 kh\u00f3 \u0111\u1ed9 thi v\u00e0o 10)
                </p>
            </div>

            <div class="card" style="margin-bottom:12px">
                <div class="card-title"><span class="icon">\ud83e\udde0</span> 3 Nguy\u1ec7n V\u1ecdng T\u1ed1i \u01afu</div>
                <p style="color:var(--text-secondary);font-size:0.85rem;margin-bottom:16px">
                    NV1 = v\u01b0\u01a1n cao (stretch), NV2 = v\u1eeba s\u1ee9c (match), NV3 = an to\u00e0n (safe). \u0110i\u1ec3m NV2 c\u1ed9ng 0.75, NV3 c\u1ed9ng 1.5 theo quy ch\u1ebf.
                </p>
            </div>

            ${renderNVCard(nv1, 'NGUY\u1ec6N V\u1eccNG 1 \u2014 V\u01af\u01a0N CAO', 'C\u01a1 h\u1ed9i v\u01b0\u01a1n t\u1edbi tr\u01b0\u1eddng t\u1ed1t h\u01a1n n\u1ebfu l\u00e0m b\u00e0i xu\u1ea5t s\u1eafc', '\ud83d\ude80', nv1.prediction.predicted, 0)}
            ${renderNVCard(nv2, 'NGUY\u1ec6N V\u1eccNG 2 \u2014 V\u1eeeA S\u1ee8C', 'Ph\u00f9 h\u1ee3p v\u1edbi n\u0103ng l\u1ef1c hi\u1ec7n t\u1ea1i', '\ud83c\udfaf', nv2.prediction.predicted, 0.75)}
            ${renderNVCard(nv3, 'NGUY\u1ec6N V\u1eccNG 3 \u2014 AN TO\u00c0N', '\u0110\u1ea3m b\u1ea3o c\u00f3 su\u1ea5t c\u00f4ng l\u1eadp', '\ud83d\udee1\ufe0f', nv3.prediction.predicted, 1.5)}

            <div class="card" style="margin-top:12px">
                <div class="card-title"><span class="icon">\ud83d\udcca</span> Tr\u01b0\u1eddng Thay Th\u1ebf Kh\u00e1c</div>
                <p style="color:var(--text-secondary);font-size:0.85rem;margin-bottom:12px">C\u00e1c tr\u01b0\u1eddng kh\u00e1c ph\u00f9 h\u1ee3p v\u1edbi \u0111i\u1ec3m c\u1ee7a b\u1ea1n:</p>
                <div class="table-wrapper">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Tier</th>
                                <th>Tr\u01b0\u1eddng</th>
                                <th>Qu\u1eadn</th>
                                <th>\u0110C DK 2026</th>
                                <th>Ch\u00eanh l\u1ec7ch</th>
                                <th>Ph\u00f9 h\u1ee3p</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${sorted.filter(s => s.prediction.predicted <= estHigh + 0.5 && s.prediction.predicted >= estLow - 2.5 && s.id !== nv1.id && s.id !== nv2.id && s.id !== nv3.id)
                .slice(0, 10)
                .map(s => {
                    const diff = estTotal - s.prediction.predicted;
                    const level = diff > 2.5 ? 'R\u1ea5t an to\u00e0n' : diff > 1.5 ? 'An to\u00e0n' : diff > 0.5 ? 'Kh\u1ea3 thi' : diff > -0.25 ? 'Th\u1eed s\u1ee9c' : 'Kh\u00f3';
                    const levelColor = diff > 2.5 ? 'var(--success)' : diff > 1.5 ? '#10b981' : diff > 0.5 ? 'var(--accent)' : diff > -0.25 ? '#f59e0b' : 'var(--danger)';
                    return `
                                    <tr>
                                        <td><span class="tier-badge tier-${s.tier}">${s.tier}</span></td>
                                        <td><strong>${s.name}</strong></td>
                                        <td>${s.district}</td>
                                        <td class="score-predicted">${s.prediction.predicted.toFixed(2)}</td>
                                        <td style="color:${diff >= 0 ? 'var(--success)' : 'var(--danger)'}">${diff >= 0 ? '+' : ''}${diff.toFixed(2)}</td>
                                        <td style="color:${levelColor};font-weight:600">${level}</td>
                                    </tr>
                                `;
                }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => App.init());

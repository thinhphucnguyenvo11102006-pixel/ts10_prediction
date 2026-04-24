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
        this.filterExams('all'); // Pre-render all exams for first view

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
                case 'nv1': va = a.prediction.priorities.nv1.predicted; vb = b.prediction.priorities.nv1.predicted; break;
                case 'nv2': va = a.prediction.priorities.nv2.predicted; vb = b.prediction.priorities.nv2.predicted; break;
                case 'nv3': va = a.prediction.priorities.nv3.predicted; vb = b.prediction.priorities.nv3.predicted; break;
                case 'stability': va = a.stability; vb = b.stability; break;
                case 'trend': va = a.prediction.trend; vb = b.prediction.trend; break;
                case 'confidence': va = a.prediction.confidence; vb = b.prediction.confidence; break;
                default: va = a.prediction.priorities.nv1.predicted; vb = b.prediction.priorities.nv1.predicted;
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
                    <td><span class="stability-tag" data-stability="${s.stability}">${s.stability}</span></td>
                    <td><strong>${s.name}</strong></td>
                    <td>${s.district}</td>
                    <td class="score-cell">${s.scores[2022]?.toFixed(2) || '-'}</td>
                    <td class="score-cell">${s.scores[2023]?.toFixed(2) || '-'}</td>
                    <td class="score-cell">${s.scores[2024]?.toFixed(2) || '-'}</td>
                    <td class="score-cell">${s.scores[2025]?.toFixed(2) || '-'}</td>
                    <td class="score-cell score-predicted">${p.priorities.nv1.predicted.toFixed(2)}</td>
                    <td class="score-cell">${p.priorities.nv2.predicted.toFixed(2)}</td>
                    <td class="score-cell">${p.priorities.nv3.predicted.toFixed(2)}</td>
                    <td class="score-cell" style="color:var(--text-muted);font-size:0.78rem">${p.priorities.nv1.low.toFixed(1)} - ${p.priorities.nv1.high.toFixed(1)}</td>
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
        
        // Add stability to detail header if exists
        const tierEl = document.getElementById('detailTier');
        tierEl.innerHTML += ` | <span class="stability-tag" data-stability="${school.stability}">${school.stability}</span>`;

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
                    📊 Mức khả thi cao nhất: <strong style="color:var(--accent)">${result.bestChance}/100</strong>
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
                Charts.createGaugeChart(`gauge-${i}`, c.feasibilityScore, c.status);
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
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => App.init());

/**
 * optimize.js - Tách logic Tối ưu nguyện vọng (Tab 5)
 */

Object.assign(App, {
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
            alert('Vui lòng nhập đầy đủ 6 ô điểm.');
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
            const prob = 100 / (1 + Math.exp(-1.15 * (margin - 0.15)));
            const feasibilityScore = Math.max(1, Math.min(99, Math.round(prob)));
            const probColor = feasibilityScore >= 80 ? 'var(--success)' : feasibilityScore >= 45 ? 'var(--accent)' : 'var(--danger)';
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
                            <div style="font-size:0.78rem;color:var(--text-muted)">${penalty > 0 ? `Điểm chuẩn + ${penalty.toFixed(1)} (phạt NV)` : 'Điểm chuẩn DK 2026'}</div>
                            <div style="font-size:1.6rem;font-weight:700;color:${tierInfo.color || '#fff'}">${(score + penalty).toFixed(2)}</div>
                            <div style="font-size:0.82rem;margin-top:4px">
                                Mức khả thi: <strong style="color:${probColor}">${feasibilityScore}/100</strong>
                            </div>
                        </div>
                    </div>
                    <div style="margin-top:10px;background:rgba(255,255,255,0.05);border-radius:8px;height:8px;overflow:hidden">
                        <div style="height:100%;width:${feasibilityScore}%;background:${probColor};border-radius:8px;transition:width 0.5s"></div>
                    </div>
                </div>
            `;
        };

        container.innerHTML = `
            <div class="card" style="margin-top:16px;margin-bottom:16px">
                <div class="card-title"><span class="icon">🎯</span> Kết Quả Ước Lượng</div>
                <div class="stats-row" style="margin:0">
                    <div class="stat-card">
                        <div class="stat-label">📐 Toán (ước)</div>
                        <div class="stat-value" style="font-size:1.5rem;color:#6366f1;background:none;-webkit-text-fill-color:#6366f1">${estMath.toFixed(2)}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">📖 Văn (ước)</div>
                        <div class="stat-value" style="font-size:1.5rem;color:#10b981;background:none;-webkit-text-fill-color:#10b981">${estLit.toFixed(2)}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">🌐 Anh (ước)</div>
                        <div class="stat-value" style="font-size:1.5rem;color:#f59e0b;background:none;-webkit-text-fill-color:#f59e0b">${estEng.toFixed(2)}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">🎯 Tổng ước tính</div>
                        <div class="stat-value accent" style="font-size:1.5rem">${estTotal.toFixed(2)}</div>
                        <div class="stat-detail">Khoảng: ${estLow.toFixed(1)} - ${estHigh.toFixed(1)}</div>
                    </div>
                </div>
                <p style="color:var(--text-muted);font-size:0.8rem;margin-top:10px;text-align:center">
                    Công thức: (Điểm HK2 × 60% + TBCN × 40%) × 0.85 (hệ số khó độ thi vào 10)
                </p>
            </div>

            <div class="card" style="margin-bottom:12px">
                <div class="card-title"><span class="icon">🧠</span> 3 Nguyện Vọng Tối Ưu</div>
                <p style="color:var(--text-secondary);font-size:0.85rem;margin-bottom:16px">
                    NV1 = vươn cao (stretch), NV2 = vừa sức (match), NV3 = an toàn (safe). Điểm NV2 cộng 0.75, NV3 cộng 1.5 theo quy chế.
                </p>
            </div>

            ${renderNVCard(nv1, 'NGUYỆN VỌNG 1 — VƯƠN CAO', 'Cơ hội vươn tới trường tốt hơn nếu làm bài xuất sắc', '🚀', nv1.prediction.predicted, 0)}
            ${renderNVCard(nv2, 'NGUYỆN VỌNG 2 — VỪA SỨC', 'Phù hợp với năng lực hiện tại', '🎯', nv2.prediction.predicted, 0.75)}
            ${renderNVCard(nv3, 'NGUYỆN VỌNG 3 — AN TOÀN', 'Đảm bảo có suất công lập', '🛡️', nv3.prediction.predicted, 1.5)}

            <div class="card" style="margin-top:12px">
                <div class="card-title"><span class="icon">📊</span> Trường Thay Thế Khác</div>
                <p style="color:var(--text-secondary);font-size:0.85rem;margin-bottom:12px">Các trường khác phù hợp với điểm của bạn:</p>
                <div class="table-wrapper">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Tier</th>
                                <th>Trường</th>
                                <th>Quận</th>
                                <th>ĐC DK 2026</th>
                                <th>Chênh lệch</th>
                                <th>Phù hợp</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${sorted.filter(s => s.prediction.predicted <= estHigh + 0.5 && s.prediction.predicted >= estLow - 2.5 && s.id !== nv1.id && s.id !== nv2.id && s.id !== nv3.id)
                .slice(0, 10)
                .map(s => {
                    const diff = estTotal - s.prediction.predicted;
                    const level = diff > 2.5 ? 'Rất an toàn' : diff > 1.5 ? 'An toàn' : diff > 0.5 ? 'Khả thi' : diff > -0.25 ? 'Thử sức' : 'Khó';
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
    }
});

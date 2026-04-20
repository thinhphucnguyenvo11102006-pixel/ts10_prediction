/**
 * exams.js - Tách logic Ngân hàng đề thi (Tab 6)
 */

Object.assign(App, {
    // ========================
    // TAB 6: EXAM BANK
    // ========================
    filterExams(subject, btnElement) {
        // Update active class on buttons if provided
        if (btnElement) {
            document.querySelectorAll('.subject-filters .btn').forEach(b => b.classList.remove('active'));
            btnElement.classList.add('active');
        } else {
            // Fallback for initial load
            const defaultBtn = document.querySelector(`.subject-filters .btn[data-subject="${subject}"]`);
            if (defaultBtn) defaultBtn.classList.add('active');
        }

        // Filter and render
        const exams = EXAMS_DATA.filter(e => e.subject === subject);
        this.renderExamGrid(exams);
    },

    renderExamGrid(exams) {
        const container = document.getElementById('examsGridContainer');
        if (!container) return;

        if (exams.length === 0) {
            container.innerHTML = `<div style="text-align:center;width:100%;padding:40px;color:var(--text-muted)">Không có dữ liệu Đề thi cho môn này.</div>`;
            return;
        }

        let html = '';
        exams.forEach(ex => {
            const iconObj = {
                math: '📐', lit: '📝', eng: '🌐'
            };
            const icon = iconObj[ex.subject] || '📄';
            // CSS safe class for type
            const typeClass = ex.type.toLowerCase().replace(/\s+/g, '-');

            html += `
                <div class="exam-card" onclick="App.openExamViewer('${ex.id}')">
                    <div class="exam-card-header">
                        <div class="exam-icon">${icon}</div>
                        <span class="exam-type ${typeClass}">${ex.type}</span>
                    </div>
                    <div class="exam-title">${ex.title}</div>
                    <div class="exam-meta">
                        <div class="exam-meta-item"><span>🏛️</span> ${ex.school}</div>
                        <div class="exam-meta-item"><span>📅</span> Năm: ${ex.year} • Ngày đăng: ${ex.date}</div>
                        <div class="exam-meta-item" style="color:var(--primary);margin-top:4px">
                            <span>⬇️</span> ${ex.downloads.toLocaleString('vi-VN')} lượt quan tâm
                        </div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    },

    openExamViewer(id) {
        const exam = EXAMS_DATA.find(e => e.id === id);
        if (!exam) return;

        const modal = document.getElementById('examViewerModal');
        const iframe = document.getElementById('pdfIframe');
        const title = document.getElementById('viewerTitle');
        const subtitle = document.getElementById('viewerSubtitle');

        if (modal && iframe) {
            // Prevent iframe from caching history if needed
            iframe.src = exam.pdfUrl + "#toolbar=0&navpanes=0&scrollbar=0";
            title.textContent = exam.title;
            subtitle.textContent = `${exam.school} - ${exam.year}`;
            modal.classList.add('active');

            // Lock body scroll
            document.body.style.overflow = 'hidden';

            // Increment dummy downloads
            exam.downloads++;
            this.filterExams(exam.subject); // re-render grid in background to show updated number
        }
    },

    closeExamViewer() {
        const modal = document.getElementById('examViewerModal');
        const iframe = document.getElementById('pdfIframe');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto'; // Unlock body scroll
            setTimeout(() => { if (iframe) iframe.src = ""; }, 300); // Clear iframe memory after animation
        }
    }
});

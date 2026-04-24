/**
 * exams.js - Tách logic Ngân hàng đề thi (Tab 6)
 */

Object.assign(App, {
    // ========================
    // TAB 6: EXAM BANK
    // ========================
    filterExams(subject, btnElement) {
        // Update active class on buttons
        if (btnElement) {
            document.querySelectorAll('.subject-filters .btn').forEach(b => b.classList.remove('active'));
            btnElement.classList.add('active');
        }

        // Filter and render
        let exams = EXAMS_DATA;
        if (subject !== 'all') {
            exams = EXAMS_DATA.filter(e => e.subject === subject);
        }
        
        // Sort by date (newest first)
        exams.sort((a, b) => {
            const dateA = a.date.split('/').reverse().join('');
            const dateB = b.date.split('/').reverse().join('');
            return dateB.localeCompare(dateA);
        });

        this.renderExamGrid(exams);
    },

    renderExamGrid(exams) {
        const container = document.getElementById('examsGridContainer');
        if (!container) return;

        if (exams.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="icon">🔍</div>
                    <p>Không tìm thấy đề thi nào phù hợp.</p>
                </div>`;
            return;
        }

        let html = '';
        exams.forEach(ex => {
            const iconObj = {
                math: '📐', 
                lit: '📝', 
                eng: '🌐',
                phys: '⚡',
                chem: '🧪',
                bio: '🌿',
                hist: '📜',
                geo: '🗺️',
                civic: '⚖️'
            };
            const icon = iconObj[ex.subject] || '📄';
            
            // Badge color based on type
            let typeLabel = ex.type;
            let typeClass = 'type-other';
            if (ex.title.toLowerCase().includes('thử')) {
                typeLabel = 'Đề Thi Thử';
                typeClass = 'type-mock';
            } else if (ex.title.toLowerCase().includes('tuyển sinh') || ex.title.toLowerCase().includes('chính thức')) {
                typeLabel = 'Tuyển Sinh';
                typeClass = 'type-official';
            } else if (ex.title.toLowerCase().includes('khảo sát')) {
                typeLabel = 'Khảo Sát';
                typeClass = 'type-survey';
            }

            html += `
                <div class="exam-card animate-in" onclick="App.openExamViewer('${ex.id}')">
                    <div class="exam-card-header">
                        <div class="exam-icon-wrapper">
                            <span class="exam-icon-emoji">${icon}</span>
                        </div>
                        <span class="exam-type-badge ${typeClass}">${typeLabel}</span>
                    </div>
                    <div class="exam-title" title="${ex.title}">${ex.title}</div>
                    <div class="exam-info-grid">
                        <div class="info-item">
                            <span class="info-icon">📍</span>
                            <span class="info-text">${ex.district}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-icon">📅</span>
                            <span class="info-text">${ex.date}</span>
                        </div>
                    </div>
                    <div class="exam-card-footer">
                        <div class="exam-views">
                            <span class="view-icon">👁️</span>
                            <span>${(ex.downloads + 120).toLocaleString()} lượt xem</span>
                        </div>
                        <div class="btn-download-mini">
                            <span class="icon">📄</span> Xem đề
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
        const downloadBtn = document.getElementById('viewerDownloadBtn');

        if (modal && iframe) {
            // Prevent iframe from caching history if needed
            iframe.src = exam.pdfUrl + "#toolbar=0&navpanes=0&scrollbar=0";
            title.textContent = exam.title;
            subtitle.textContent = `${exam.school} - ${exam.year}`;
            
            // Set download link
            if (downloadBtn) {
                downloadBtn.href = exam.pdfUrl;
                downloadBtn.download = exam.title + ".pdf";
            }

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

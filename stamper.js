// stamper.js - Bureaucratic Document Stamper & Certification Spooler
// The most soul-crushingly monotonous state clerk utility: stamping endless tax files in triplicate.

(function() {
    'use strict';

    class RetroStamperApp {
        constructor() {
            this.dockets = [
                {
                    id: 'DOC-1049-A',
                    title: 'CLAIM FOR DEDUCTIBLE EXPENDITURE #4829',
                    citizen: 'Citizen: Harold Jenkins (SSN: 042-99-1142)',
                    summary: 'Claimant requests a $312.00 medical deduction for "emotional distress caused by looking at Director Vance\'s haircut".',
                    stamped: null
                },
                {
                    id: 'DOC-2201-B',
                    title: 'PET FOOD DEDUCTION INQUIRY',
                    citizen: 'Citizen: Martha Higgins (SSN: 884-12-9901)',
                    summary: 'Claimant demands zero-tax status because her 3 parakeets sing patriotic state anthems between 8:00 AM and 9:00 AM.',
                    stamped: null
                },
                {
                    id: 'DOC-3349-C',
                    title: 'RETROACTIVE COFFEE EXPENSE WAIVER',
                    citizen: 'Employee: Arthur P. Pendelton (Desk 14-B)',
                    summary: 'Request to classify 450 cups of vending machine espresso as "Hazardous Duty Industrial Lubricant".',
                    stamped: null
                },
                {
                    id: 'DOC-4190-D',
                    title: 'SCHEDULE-A MUNICIPAL AMORTIZATION',
                    citizen: 'Desk 12-A Examiner Bob Miller',
                    summary: 'Petition to requisition 1x orthopedic memory foam cushion to alleviate sciatica induced by bureaucratic posture.',
                    stamped: null
                },
                {
                    id: 'DOC-5582-E',
                    title: 'FORM 730 LATE PENALTY FORGIVENESS',
                    citizen: 'Citizen: Frank Reynolds (SSN: 112-44-8890)',
                    summary: 'Taxpayer explains tax filing was 4 months late because his postal carrier was attacked by an angry flock of geese.',
                    stamped: null
                }
            ];

            this.currentIdx = 0;
            this.activeStamp = 'REJECTED';
            this.totalStampedCount = 0;
        }

        init() {
            this.renderDocket();
            this.setupEvents();
        }

        renderDocket() {
            const doc = this.dockets[this.currentIdx];
            if (!doc) return;

            const idEl = document.getElementById('stamper-doc-id');
            const titleEl = document.getElementById('stamper-doc-title');
            const citEl = document.getElementById('stamper-doc-citizen');
            const sumEl = document.getElementById('stamper-doc-summary');
            const stampMarkEl = document.getElementById('stamper-applied-seal');

            if (idEl) idEl.innerText = doc.id;
            if (titleEl) titleEl.innerText = doc.title;
            if (citEl) citEl.innerText = doc.citizen;
            if (sumEl) sumEl.innerText = doc.summary;

            if (stampMarkEl) {
                if (doc.stamped) {
                    stampMarkEl.className = `stamper-seal-display seal-${doc.stamped.type.toLowerCase()}`;
                    stampMarkEl.innerText = `[ ${doc.stamped.text} ]\nEXAMINER #14-B`;
                    stampMarkEl.style.display = 'block';
                } else {
                    stampMarkEl.style.display = 'none';
                }
            }

            const counterEl = document.getElementById('stamper-progress-count');
            if (counterEl) {
                counterEl.innerText = `Docket ${this.currentIdx + 1} of ${this.dockets.length} | Processed: ${this.totalStampedCount}`;
            }
        }

        setStampType(type) {
            this.activeStamp = type;
            document.querySelectorAll('.stamp-picker-btn').forEach(b => {
                b.classList.toggle('active', b.dataset.stamp === type);
            });
            if (window.AudioMgr) window.AudioMgr.playSfx('select');
        }

        applyStamp() {
            const doc = this.dockets[this.currentIdx];
            if (!doc) return;

            let text = 'REJECTED';
            if (this.activeStamp === 'AUDIT') text = 'AUDIT MANDATORY';
            if (this.activeStamp === 'CERTIFIED') text = 'APPROVED & FILED';

            doc.stamped = {
                type: this.activeStamp,
                text: text,
                timestamp: new Date().toLocaleTimeString()
            };

            this.totalStampedCount++;

            // Heavy bureaucratic stamping sound
            if (window.AudioMgr) {
                window.AudioMgr.playSfx('stapler');
                setTimeout(() => window.AudioMgr.playSfx('hit'), 40);
            }

            this.renderDocket();

            // Workday quest check: process at least 3 dockets
            if (this.totalStampedCount >= 3 && window.QuestEngine) {
                window.QuestEngine.complete('stamper');
            }
        }

        nextDocket() {
            this.currentIdx = (this.currentIdx + 1) % this.dockets.length;
            this.renderDocket();
            if (window.AudioMgr) window.AudioMgr.playSfx('blip');
        }

        prevDocket() {
            this.currentIdx = (this.currentIdx - 1 + this.dockets.length) % this.dockets.length;
            this.renderDocket();
            if (window.AudioMgr) window.AudioMgr.playSfx('blip');
        }
    }

    window.StamperApp = new RetroStamperApp();

    document.addEventListener('DOMContentLoaded', () => {
        window.StamperApp.init();
    });
})();

// quests.js - Narrative Workday Quest Engine for Arthur Pendelton
// Tracks milestones, updates the Workday Objectives window, and saves progress to localStorage.

(function() {
    'use strict';

    const QUEST_STORAGE_KEY = 'wintax98_quests_v1';

    class WorkdayQuestEngine {
        constructor() {
            this.quests = [
                {
                    id: 'logon',
                    title: '1. Morning Workstation Logon',
                    desc: 'Log in to the WinTax 98 network domain with Arthur Pendelton\'s credentials.',
                    hint: 'Completed at startup screen.',
                    done: false
                },
                {
                    id: 'coffee',
                    title: '2. Caffeine Survival Protocol',
                    desc: 'Launch Coffee.exe, eject the CD-ROM cup holder tray, and pour a fresh hot espresso.',
                    hint: 'Double-click Coffee.exe on the desktop.',
                    done: false
                },
                {
                    id: 'memo',
                    title: '3. Read Supervisor\'s Email Directive',
                    desc: 'Open Revenue Mail Express and read Director Vance\'s urgent email about missing pens.',
                    hint: 'Open Mail Express from desktop or Start Menu.',
                    done: false
                },
                {
                    id: 'excel',
                    title: '4. Audit Paperclip Budget in Excel 97',
                    desc: 'Open Microsoft Excel, inspect BUDGET_1998.XLS and verify total expenses with =SUM formula.',
                    hint: 'Open Excel 97 on desktop -> check cell D10.',
                    done: false
                },
                {
                    id: 'stamper',
                    title: '5. Physical Document Rubber Stamping',
                    desc: 'Launch Document Stamper and certify or reject 3 pending taxpayer exemption notices.',
                    hint: 'Double-click Document Stamper on desktop.',
                    done: false
                },
                {
                    id: 'review',
                    title: '6. Review Form 1040 Deductions',
                    desc: 'Open TaxReturn 4.2 and click the Section IV taxpayer certification declaration checkbox.',
                    hint: 'Open TaxReturn 4.2 -> click Section IV checkbox.',
                    done: false
                },
                {
                    id: 'slack',
                    title: '7. Slacking Off at the Desk',
                    desc: 'Waste government time by launching any desktop distraction (Minesweeper, Doom, Panda Race, or RPG).',
                    hint: 'Launch any retro game shortcut on the desktop.',
                    done: false
                },
                {
                    id: 'filing',
                    title: '8. Transmit Final Form 1040 (Clock-Out)',
                    desc: 'Transmit the complete tax return to the central IRS mainframe before 5:00 PM!',
                    hint: 'Click "Transmit Electronic Filing" in TaxReturn 4.2.',
                    done: false
                }
            ];

            this.workMinutes = 15; // 4:15 PM start
            this.init();
        }

        init() {
            const saved = localStorage.getItem(QUEST_STORAGE_KEY);
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    this.quests.forEach(q => {
                        if (parsed[q.id]) q.done = true;
                    });
                } catch (e) {
                    console.error("Error loading quests", e);
                }
            }
            this.renderUI();
            this.updateClockDisplay();
        }

        save() {
            const data = {};
            this.quests.forEach(q => { data[q.id] = q.done; });
            localStorage.setItem(QUEST_STORAGE_KEY, JSON.stringify(data));
        }

        isDone(questId) {
            const q = this.quests.find(item => item.id === questId);
            return q ? q.done : false;
        }

        complete(questId) {
            const q = this.quests.find(item => item.id === questId);
            if (!q || q.done) return;

            q.done = true;
            this.save();
            this.renderUI();
            this.updateClockDisplay();

            if (window.AudioMgr && window.AudioMgr.playSfx) {
                window.AudioMgr.playSfx('tada');
            }

            // Visual notification in-site
            if (window.SystemAlert) {
                const completedCount = this.quests.filter(item => item.done).length;
                window.SystemAlert(
                    `WORKDAY OBJECTIVE COMPLETED!\n\n` +
                    `[✓] ${q.title}\n\n` +
                    `Current Workday Quota: ${completedCount} of ${this.quests.length} completed.\n` +
                    `Clock: 4:${String(this.getNarrativeMinute()).padStart(2, '0')} PM (Deadline: 5:00 PM).`,
                    "Workday Quest Progress",
                    "info"
                );
            }

            // Check if all completed!
            if (this.quests.every(item => item.done)) {
                setTimeout(() => this.showVictoryEnding(), 800);
            }
        }

        getNarrativeMinute() {
            const completedCount = this.quests.filter(item => item.done).length;
            // 4:15 + 5 mins per quest -> 4:55 / 5:00 PM
            return Math.min(59, 15 + completedCount * 5);
        }

        updateClockDisplay() {
            const clockEl = document.getElementById('system-clock');
            if (clockEl) {
                const min = this.getNarrativeMinute();
                clockEl.title = `Workday Deadline: 5:00 PM | Current: 4:${String(min).padStart(2, '0')} PM`;
            }

            const badge = document.getElementById('quest-taskbar-badge');
            if (badge) {
                const completedCount = this.quests.filter(item => item.done).length;
                badge.innerText = `${completedCount}/${this.quests.length}`;
            }
        }

        renderUI() {
            const listEl = document.getElementById('quests-list-container');
            if (!listEl) return;

            listEl.innerHTML = '';
            const completedCount = this.quests.filter(item => item.done).length;

            const header = document.createElement('div');
            header.style.padding = '8px';
            header.style.background = '#000080';
            header.style.color = '#ffffff';
            header.style.fontSize = '11px';
            header.style.marginBottom = '8px';
            header.innerHTML = `
                <strong>EMPLOYEE:</strong> Arthur P. Pendelton (Desk 14-B)<br>
                <strong>DEADLINE:</strong> 5:00 PM SHARP | <strong>COMPLETED:</strong> ${completedCount} / ${this.quests.length}
            `;
            listEl.appendChild(header);

            this.quests.forEach(q => {
                const item = document.createElement('div');
                item.className = 'quest-item-box';
                item.style.padding = '6px';
                item.style.marginBottom = '6px';
                item.style.border = '1px solid #808080';
                item.style.background = q.done ? '#f0fdf4' : '#ffffff';
                item.style.fontSize = '11px';

                item.innerHTML = `
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <span style="font-weight: bold; color: ${q.done ? '#15803d' : '#000080'}; ${q.done ? 'text-decoration: line-through;' : ''}">
                            ${q.done ? '✓ ' : '□ '} ${q.title}
                        </span>
                        <span style="font-size: 10px; color: ${q.done ? '#16a34a' : '#b91c1c'}; font-weight: bold;">
                            ${q.done ? 'COMPLETED' : 'PENDING'}
                        </span>
                    </div>
                    <div style="font-size: 10px; color: #4b5563; margin-top: 2px;">
                        ${q.desc}
                    </div>
                    <div style="font-size: 9px; color: #6b7280; font-style: italic; margin-top: 2px;">
                        Hint: ${q.hint}
                    </div>
                `;
                listEl.appendChild(item);
            });
        }

        renderQuestsWindow() {
            this.renderUI();
        }

        showVictoryEnding() {
            if (window.AudioMgr && window.AudioMgr.playSfx) {
                window.AudioMgr.playSfx('victory');
            }
            if (window.SystemAlert) {
                window.SystemAlert(
                    "CONGRATULATIONS, ARTHUR P. PENDELTON!\n\n" +
                    "The clock strikes 5:00 PM!\n\n" +
                    "✓ All Form 1040 returns audited and filed.\n" +
                    "✓ Rogue basement paperwork neutralized.\n" +
                    "✓ Director Vance left the office baffled.\n\n" +
                    "You shut down WinTax 98, slip on your raincoat, and catch the 5:15 PM commuter train home.\n\n" +
                    "SURVIVAL CERTIFICATE AWARDED: Grade 3 Master Bureaucrat.",
                    "Victory - Workday Complete!",
                    "info"
                );
            }
        }

        reset() {
            localStorage.removeItem(QUEST_STORAGE_KEY);
            this.quests.forEach(q => q.done = false);
            this.renderUI();
            this.updateClockDisplay();
        }
    }

    window.QuestEngine = new WorkdayQuestEngine();
})();

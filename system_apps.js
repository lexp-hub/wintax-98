// system_apps.js - System Applications for WinTax 98 Second Edition
// Includes: In-site Modal Message Box (replacing alert), Task Manager, Control Panel, Calculator, DOS Prompt, File Explorer, Display Props

(function() {
    'use strict';

    // =========================================================================
    // 1. IN-SITE MODAL MESSAGE BOX (REPLACING BROWSER ALERT)
    // =========================================================================
    let msgboxCallback = null;

    window.SystemAlert = function(message, title, iconType, onOk) {
        const backdrop = document.getElementById('msgbox-backdrop');
        const box = document.getElementById('win-msgbox');
        const titleEl = document.getElementById('msgbox-title');
        const textEl = document.getElementById('msgbox-text');
        const iconEl = document.getElementById('msgbox-icon');
        const titleIconEl = document.getElementById('msgbox-titlebar-icon');
        const actionsEl = document.getElementById('msgbox-actions');

        if (!backdrop || !box) {
            console.warn("MsgBox container not found");
            return;
        }

        // Authentic Windows 98 chord / ding
        if (window.AudioMgr && window.AudioMgr.playSfx) {
            window.AudioMgr.playSfx('chord');
        }

        title = title || 'WinTax 98 - Warning';
        iconType = iconType || 'warning';

        let iconSrc = 'assets/icon_warning.png';
        if (iconType === 'error') iconSrc = 'assets/icon_error.png';
        if (iconType === 'info') iconSrc = 'assets/icon_info.png';
        if (iconType === 'question') iconSrc = 'assets/icon_question.png';

        if (titleEl) titleEl.innerText = title;
        if (textEl) textEl.innerText = message;
        if (iconEl) iconEl.src = iconSrc;
        if (titleIconEl) titleIconEl.src = iconSrc;

        msgboxCallback = onOk || null;

        if (actionsEl) {
            actionsEl.innerHTML = '<button type="button" class="win-btn win-msgbox-btn" id="msgbox-btn-ok">OK</button>';
            const okBtn = document.getElementById('msgbox-btn-ok');
            if (okBtn) {
                okBtn.onclick = function() {
                    window.CloseSystemMsgBox();
                    if (msgboxCallback) msgboxCallback();
                };
                okBtn.focus();
            }
        }

        backdrop.classList.remove('hidden');
    };

    window.SystemConfirm = function(message, title, iconType, onYes, onNo) {
        const backdrop = document.getElementById('msgbox-backdrop');
        const box = document.getElementById('win-msgbox');
        const titleEl = document.getElementById('msgbox-title');
        const textEl = document.getElementById('msgbox-text');
        const iconEl = document.getElementById('msgbox-icon');
        const titleIconEl = document.getElementById('msgbox-titlebar-icon');
        const actionsEl = document.getElementById('msgbox-actions');

        if (!backdrop || !box) return;

        if (window.AudioMgr && window.AudioMgr.playSfx) {
            window.AudioMgr.playSfx('chord');
        }

        title = title || 'WinTax 98 - Confirmation';
        iconType = iconType || 'question';

        let iconSrc = 'assets/icon_question.png';
        if (iconType === 'error') iconSrc = 'assets/icon_error.png';
        if (iconType === 'warning') iconSrc = 'assets/icon_warning.png';
        if (iconType === 'info') iconSrc = 'assets/icon_info.png';

        if (titleEl) titleEl.innerText = title;
        if (textEl) textEl.innerText = message;
        if (iconEl) iconEl.src = iconSrc;
        if (titleIconEl) titleIconEl.src = iconSrc;

        if (actionsEl) {
            actionsEl.innerHTML = `
                <button type="button" class="win-btn win-msgbox-btn" id="msgbox-btn-yes">Yes</button>
                <button type="button" class="win-btn win-msgbox-btn" id="msgbox-btn-no">No</button>
            `;
            const yesBtn = document.getElementById('msgbox-btn-yes');
            const noBtn = document.getElementById('msgbox-btn-no');

            if (yesBtn) {
                yesBtn.onclick = function() {
                    window.CloseSystemMsgBox();
                    if (onYes) onYes();
                };
                yesBtn.focus();
            }
            if (noBtn) {
                noBtn.onclick = function() {
                    window.CloseSystemMsgBox();
                    if (onNo) onNo();
                };
            }
        }

        backdrop.classList.remove('hidden');
    };

    window.CloseSystemMsgBox = function() {
        const backdrop = document.getElementById('msgbox-backdrop');
        if (backdrop) backdrop.classList.add('hidden');
    };

    // Global override of window.alert to route all browser alerts to WinTax 98 modal dialog
    window.alert = function(msg) {
        let type = 'warning';
        let title = 'WinTax 98 - Warning';
        const str = String(msg || '');
        if (str.toUpperCase().includes('ERROR') || str.toUpperCase().includes('BLOCK') || str.toUpperCase().includes('DENIED') || str.toUpperCase().includes('CANNOT') || str.toUpperCase().includes('IMPOSSIBILE')) {
            type = 'error';
            title = 'WinTax 98 - Critical Error';
        } else if (str.toUpperCase().includes('NOTICE') || str.toUpperCase().includes('SPOOLER') || str.toUpperCase().includes('PROTOCOL') || str.toUpperCase().includes('SUCCESS') || str.toUpperCase().includes('RECYCLE')) {
            type = 'info';
            title = 'WinTax 98 - Information';
        }
        window.SystemAlert(str, title, type);
    };

    // Close MsgBox with Esc or Enter key
    document.addEventListener('keydown', (e) => {
        const backdrop = document.getElementById('msgbox-backdrop');
        if (backdrop && !backdrop.classList.contains('hidden')) {
            if (e.key === 'Escape' || e.key === 'Enter') {
                e.preventDefault();
                const okBtn = document.getElementById('msgbox-btn-ok') || document.getElementById('msgbox-btn-yes');
                if (okBtn) okBtn.click();
                else window.CloseSystemMsgBox();
            }
        }
    });


    // =========================================================================
    // 2. FINANCIAL CALCULATOR 90s (calc.exe)
    // =========================================================================
    class Calculator {
        constructor() {
            this.currentValue = '0';
            this.prevValue = null;
            this.operator = null;
            this.waitingForOperand = false;
            this.display = null;
        }

        init() {
            this.display = document.getElementById('calc-display');
            this.updateDisplay();
        }

        updateDisplay() {
            if (!this.display) return;
            this.display.value = this.currentValue;
        }

        inputDigit(digit) {
            if (this.waitingForOperand) {
                this.currentValue = String(digit);
                this.waitingForOperand = false;
            } else {
                this.currentValue = this.currentValue === '0' ? String(digit) : this.currentValue + digit;
            }
            this.updateDisplay();
        }

        inputDecimal() {
            if (this.waitingForOperand) {
                this.currentValue = '0.';
                this.waitingForOperand = false;
            } else if (!this.currentValue.includes('.')) {
                this.currentValue += '.';
            }
            this.updateDisplay();
        }

        toggleSign() {
            const val = parseFloat(this.currentValue);
            this.currentValue = String(-val);
            this.updateDisplay();
        }

        clear() {
            this.currentValue = '0';
            this.prevValue = null;
            this.operator = null;
            this.waitingForOperand = false;
            this.updateDisplay();
        }

        clearEntry() {
            this.currentValue = '0';
            this.updateDisplay();
        }

        backspace() {
            if (this.waitingForOperand) return;
            if (this.currentValue.length > 1) {
                this.currentValue = this.currentValue.slice(0, -1);
            } else {
                this.currentValue = '0';
            }
            this.updateDisplay();
        }

        performOperation(nextOperator) {
            const inputValue = parseFloat(this.currentValue);

            if (this.operator && this.waitingForOperand) {
                this.operator = nextOperator;
                return;
            }

            if (this.prevValue === null) {
                this.prevValue = inputValue;
            } else if (this.operator) {
                const result = this.calculate(this.prevValue, inputValue, this.operator);
                this.currentValue = String(result);
                this.prevValue = result;
                this.updateDisplay();
            }

            this.waitingForOperand = true;
            this.operator = nextOperator;
        }

        calculate(first, second, op) {
            switch(op) {
                case '+': return first + second;
                case '-': return first - second;
                case '*': return first * second;
                case '/': return second !== 0 ? first / second : 'Error';
                case '=': return second;
                default: return second;
            }
        }

        equals() {
            if (!this.operator || this.prevValue === null) return;
            const inputValue = parseFloat(this.currentValue);
            const result = this.calculate(this.prevValue, inputValue, this.operator);
            this.currentValue = String(result);
            this.prevValue = null;
            this.operator = null;
            this.waitingForOperand = true;
            this.updateDisplay();
        }

        sqrt() {
            const val = parseFloat(this.currentValue);
            if (val >= 0) {
                this.currentValue = String(Math.sqrt(val));
                this.waitingForOperand = true;
                this.updateDisplay();
            } else {
                this.currentValue = 'Error';
                this.updateDisplay();
            }
        }

        applyIVA() {
            const val = parseFloat(this.currentValue) || 0;
            const res = (val * 1.22).toFixed(2);
            this.currentValue = String(res);
            this.waitingForOperand = true;
            this.updateDisplay();
            window.SystemAlert(`Gross amount with 22% VAT: $ ${res}\nLate filing penalty assessment: $ 0.00`, 'VAT Tax Calculation', 'info');
        }

        applyRitenuta() {
            const val = parseFloat(this.currentValue) || 0;
            const res = (val * 0.80).toFixed(2);
            this.currentValue = String(res);
            this.waitingForOperand = true;
            this.updateDisplay();
            window.SystemAlert(`Net settlement after 20% Withholding: $ ${res}\nIRS Form 1099-MISC generated.`, 'Withholding Tax Calculation', 'info');
        }
    }

    window.CalcApp = new Calculator();


    // =========================================================================
    // 3. WINTAX DOS PROMPT (command.com)
    // =========================================================================
    class DosPrompt {
        constructor() {
            this.outputEl = null;
            this.inputEl = null;
            this.history = [];
            this.historyIndex = -1;
        }

        init() {
            this.outputEl = document.getElementById('dos-output');
            this.inputEl = document.getElementById('dos-input');

            if (this.inputEl) {
                this.inputEl.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        const cmd = this.inputEl.value.trim();
                        this.execute(cmd);
                        this.inputEl.value = '';
                    } else if (e.key === 'ArrowUp') {
                        if (this.history.length > 0 && this.historyIndex > 0) {
                            this.historyIndex--;
                            this.inputEl.value = this.history[this.historyIndex];
                        }
                    } else if (e.key === 'ArrowDown') {
                        if (this.historyIndex < this.history.length - 1) {
                            this.historyIndex++;
                            this.inputEl.value = this.history[this.historyIndex];
                        } else {
                            this.historyIndex = this.history.length;
                            this.inputEl.value = '';
                        }
                    }
                });
            }
        }

        print(text) {
            if (!this.outputEl) return;
            const line = document.createElement('div');
            line.textContent = text;
            this.outputEl.appendChild(line);
            const parent = this.outputEl.parentElement;
            if (parent) parent.scrollTop = parent.scrollHeight;
        }

        execute(cmd) {
            if (!cmd) {
                this.print('C:\\TAX_DOCUMENTS>');
                return;
            }

            this.history.push(cmd);
            this.historyIndex = this.history.length;
            this.print(`C:\\TAX_DOCUMENTS> ${cmd}`);

            const tokens = cmd.toLowerCase().split(/\s+/);
            const base = tokens[0];

            switch(base) {
                case 'help':
                    this.print("Available commands:");
                    this.print("  DIR       List tax records and files in current directory");
                    this.print("  VER       Display WinTax 98 operating system version");
                    this.print("  CLS       Clear screen");
                    this.print("  CALC      Launch 90s Financial Calculator");
                    this.print("  TASKMGR   Launch WinTax Task Manager");
                    this.print("  CONTROL   Open Control Panel");
                    this.print("  EXPLORER  Open File Explorer (C:\\)");
                    this.print("  DOOM      Launch 3D DOOM Tax Audit");
                    this.print("  PANDA     Launch Panda Getaway Simulator");
                    this.print("  FORMAT    Attempt low-level drive format");
                    this.print("  TAXES     Calculate outstanding tax liabilities");
                    this.print("  EXIT      Close DOS Prompt");
                    break;

                case 'dir':
                    this.print(" Volume in drive C is WINTAX_98");
                    this.print(" Volume Serial Number: 1998-IRS1");
                    this.print(" Directory of C:\\TAX_DOCUMENTS\n");
                    this.print(".              <DIR>        10-29-98  09:00 .");
                    this.print("..             <DIR>        10-29-98  09:00 ..");
                    this.print("FORM1040 ADE        142,336 10-29-98  10:14 FORM1040_2024.ADE");
                    this.print("DOOM_3D  EXE      1,240,576 10-29-98  11:30 DOOM_TAX.EXE");
                    this.print("PANDA    EXE        680,120 10-29-98  12:00 PANDA_RACE.EXE");
                    this.print("TAX_NOTE TXT          4,120 10-29-98  08:22 TAX_NOTES.TXT");
                    this.print("IRS_LEVY DOC         89,200 10-29-98  14:15 IRS_LEVY_NOTICE.DOC");
                    this.print("         5 File(s)    2,156,352 bytes");
                    this.print("         2 Dir(s)       512,000 bytes free");
                    break;

                case 'ver':
                    this.print("WinTax 98 [Version 4.10.1998 Second Edition]");
                    this.print("Revenue Service Kernel with FAT32 and SoundBlaster 16 support.");
                    break;

                case 'cls':
                    if (this.outputEl) this.outputEl.innerHTML = '';
                    break;

                case 'format':
                case 'format c:':
                    this.print("Formatting drive C: ...");
                    setTimeout(() => {
                        this.print("ACCESS DENIED: Federal tax liens are permanently etched on Master Boot Record Sector 0.");
                        window.SystemAlert("Cannot format drive C:\\.\nFederal tax liabilities cannot be wiped by formatting.", "WinTax Format Error", "error");
                    }, 600);
                    break;

                case 'taxes':
                case 'tax':
                    this.print("Querying IRS Central Mainframe Database...");
                    setTimeout(() => {
                        this.print("TAX ASSESSMENT SUMMARY:\nFederal Income Tax: $ 4,230.00\nState Tax: $ 312.00\nLate Penalties: $ 819.45\nTOTAL AMOUNT DUE: $ 5,361.45");
                    }, 500);
                    break;

                case 'calc':
                    this.print("Launching Financial Calculator...");
                    if (window.WinMgr) window.WinMgr.openApp('calc');
                    break;

                case 'taskmgr':
                    this.print("Launching Task Manager...");
                    if (window.WinMgr) window.WinMgr.openApp('taskmgr');
                    break;

                case 'control':
                    this.print("Opening Control Panel...");
                    if (window.WinMgr) window.WinMgr.openApp('control');
                    break;

                case 'explorer':
                    this.print("Opening File Explorer...");
                    if (window.WinMgr) window.WinMgr.openApp('explorer');
                    break;

                case 'doom':
                    this.print("Loading DOOM_TAX 3D Engine...");
                    if (window.WinMgr) window.WinMgr.openApp('doom');
                    break;

                case 'panda':
                    this.print("Starting Fiat Panda Pursuit Getaway Simulator...");
                    if (window.WinMgr) window.WinMgr.openApp('racer');
                    break;

                case 'exit':
                    if (window.WinMgr) window.WinMgr.close('win-dos');
                    break;

                default:
                    this.print(`Bad command or file name: "${cmd}". Type "HELP" for available commands.`);
                    break;
            }
        }
    }

    window.DosApp = new DosPrompt();


    // =========================================================================
    // 4. WINTAX TASK MANAGER (taskmgr.exe)
    // =========================================================================
    class TaskManager {
        constructor() {
            this.currentTab = 'apps';
            this.selectedAppId = null;
            this.selectedPid = null;
            this.canvas = null;
            this.ctx = null;
            this.history = new Array(40).fill(25);
            this.animInterval = null;
            this.currentCpu = 35;

            this.processes = [
                { name: 'taxreturn.exe', pid: 104, cpu: 14, mem: '14,280 KB', desc: 'Electronic Tax Software' },
                { name: 'doom_tax.exe', pid: 482, cpu: 28, mem: '32,140 KB', desc: '3D Raycaster Engine' },
                { name: 'panda_race.exe', pid: 310, cpu: 12, mem: '18,900 KB', desc: 'Getaway Pursuit Simulator' },
                { name: 'audit_daemon.dll', pid: 666, cpu: 22, mem: '8,450 KB', desc: 'Random Audit Generator' },
                { name: 'spooler_lq.exe', pid: 219, cpu: 4, mem: '4,110 KB', desc: 'Epson Dot-Matrix Driver' },
                { name: 'coffee_tray.vxd', pid: 88, cpu: 1, mem: '1,200 KB', desc: 'CD-ROM Thermal Cup Holder' },
                { name: 'kernel98.dll', pid: 4, cpu: 3, mem: '2,400 KB', desc: 'WinTax 98 Kernel' },
                { name: 'svchost_audit.exe', pid: 512, cpu: 9, mem: '6,780 KB', desc: 'Physical Identity Verifier' },
                { name: 'taskmgr.exe', pid: 720, cpu: 2, mem: '2,100 KB', desc: 'Task Manager' }
            ];
        }

        init() {
            this.canvas = document.getElementById('taskmgr-perf-canvas');
            if (this.canvas) {
                this.ctx = this.canvas.getContext('2d');
            }
            this.setupTabs();
            this.refreshAppsList();
            this.renderProcesses();
            this.startPerfGraph();
        }

        setupTabs() {
            const tabs = document.querySelectorAll('#win-taskmgr .win-tab');
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    const targetTab = tab.getAttribute('data-tab');
                    this.switchTab(targetTab);
                });
            });

            const killAppBtn = document.getElementById('taskmgr-kill-app-btn');
            if (killAppBtn) {
                killAppBtn.onclick = () => {
                    if (!this.selectedAppId) {
                        window.SystemAlert("Please select an application from the list to end it.", "Task Manager", "warning");
                        return;
                    }
                    if (window.WinMgr) {
                        window.WinMgr.close(this.selectedAppId);
                        this.refreshAppsList();
                        window.SystemAlert("Application terminated forcefully.\nNo tax liability data was lost.", "Task Manager", "info");
                    }
                };
            }

            const newAppBtn = document.getElementById('taskmgr-new-app-btn');
            if (newAppBtn) {
                newAppBtn.onclick = () => {
                    if (window.WinMgr) window.WinMgr.open('win-run');
                };
            }

            const killProcBtn = document.getElementById('taskmgr-kill-proc-btn');
            if (killProcBtn) {
                killProcBtn.onclick = () => {
                    if (!this.selectedPid) {
                        window.SystemAlert("Please select a process to end it.", "Task Manager", "warning");
                        return;
                    }
                    window.SystemConfirm(
                        "WARNING: Terminating a federal revenue process may trigger an immediate IRS audit under Sec. 7201.\n\nAre you sure you want to terminate this process?",
                        "Process Warning",
                        "warning",
                        () => {
                            this.processes = this.processes.filter(p => p.pid !== this.selectedPid);
                            this.selectedPid = null;
                            this.renderProcesses();
                            window.SystemAlert("Process terminated. Tax debt remains recorded on central mainframe.", "Process Terminated", "info");
                        }
                    );
                };
            }
        }

        switchTab(tabName) {
            this.currentTab = tabName;
            const tabs = document.querySelectorAll('#win-taskmgr .win-tab');
            tabs.forEach(t => {
                t.classList.toggle('active', t.getAttribute('data-tab') === tabName);
            });

            document.querySelectorAll('#win-taskmgr .taskmgr-tab-page').forEach(page => {
                page.classList.add('hidden');
            });

            const activePage = document.getElementById(`taskmgr-tab-${tabName}`);
            if (activePage) activePage.classList.remove('hidden');

            if (tabName === 'apps') this.refreshAppsList();
            if (tabName === 'proc') this.renderProcesses();
        }

        refreshAppsList() {
            const container = document.getElementById('taskmgr-apps-list');
            if (!container || !window.WinMgr) return;
            container.innerHTML = '';

            const windows = window.WinMgr.windows;
            let count = 0;

            Object.keys(windows).forEach(id => {
                const win = windows[id];
                if (win.el.classList.contains('hidden') && !win.isMinimized) return;
                count++;

                const row = document.createElement('div');
                row.className = `taskmgr-item ${this.selectedAppId === id ? 'selected' : ''}`;
                row.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 6px;">
                        <img src="${win.iconImg || 'assets/icon_windows.png'}" width="16" height="16" style="image-rendering: pixelated;">
                        <span>${win.title}</span>
                    </div>
                    <span style="color: ${win.isMinimized ? '#666' : '#008000'}; font-size: 10px;">${win.isMinimized ? 'Minimized' : 'Running'}</span>
                `;

                row.onclick = () => {
                    this.selectedAppId = id;
                    this.refreshAppsList();
                };

                container.appendChild(row);
            });

            if (count === 0) {
                container.innerHTML = '<div style="padding:10px; color:#888; font-size:11px; text-align:center;">No open applications on desktop</div>';
            }
        }

        renderProcesses() {
            const tbody = document.getElementById('taskmgr-proc-tbody');
            if (!tbody) return;
            tbody.innerHTML = '';

            this.processes.forEach(proc => {
                const tr = document.createElement('tr');
                if (this.selectedPid === proc.pid) tr.className = 'selected';

                tr.innerHTML = `
                    <td><strong>${proc.name}</strong></td>
                    <td style="text-align: right;">${proc.pid}</td>
                    <td style="text-align: right;">${proc.cpu}%</td>
                    <td style="text-align: right;">${proc.mem}</td>
                `;

                tr.onclick = () => {
                    this.selectedPid = proc.pid;
                    this.renderProcesses();
                };

                tbody.appendChild(tr);
            });
        }

        startPerfGraph() {
            if (this.animInterval) clearInterval(this.animInterval);

            this.animInterval = setInterval(() => {
                const delta = (Math.random() - 0.48) * 12;
                this.currentCpu = Math.max(15, Math.min(99, Math.round(this.currentCpu + delta)));

                this.history.shift();
                this.history.push(this.currentCpu);

                const cpuText = document.getElementById('taskmgr-cpu-val');
                if (cpuText) cpuText.innerText = `${this.currentCpu}%`;

                this.drawPerfCanvas();
            }, 600);
        }

        drawPerfCanvas() {
            if (!this.ctx || !this.canvas) return;
            const w = this.canvas.width;
            const h = this.canvas.height;
            const ctx = this.ctx;

            ctx.fillStyle = '#001a00';
            ctx.fillRect(0, 0, w, h);

            ctx.strokeStyle = '#004d00';
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (let x = 0; x < w; x += 16) {
                ctx.moveTo(x, 0);
                ctx.lineTo(x, h);
            }
            for (let y = 0; y < h; y += 12) {
                ctx.moveTo(0, y);
                ctx.lineTo(w, y);
            }
            ctx.stroke();

            ctx.strokeStyle = '#00ff33';
            ctx.lineWidth = 2;
            ctx.beginPath();

            const step = w / (this.history.length - 1);
            for (let i = 0; i < this.history.length; i++) {
                const x = i * step;
                const y = h - (this.history[i] / 100) * (h - 6) - 3;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
    }

    window.TaskMgrApp = new TaskManager();


    // =========================================================================
    // 5. DISPLAY PROPERTIES (desk.cpl)
    // =========================================================================
    window.DisplayPropsApp = {
        applyColor: function(colorHex) {
            const desktop = document.getElementById('desktop');
            if (desktop) {
                desktop.style.background = colorHex;
            }
            window.SystemAlert(`Desktop background color set to: ${colorHex}`, 'Display Properties', 'info');
        }
    };


    // =========================================================================
    // 6. FILE EXPLORER (explorer.exe)
    // =========================================================================
    window.ExplorerApp = {
        openItem: function(itemId) {
            window.AudioMgr.playSfx('select');
            switch(itemId) {
                case 'unico':
                    if (window.WinMgr) window.WinMgr.openApp('entratel');
                    break;
                case 'doom':
                    if (window.WinMgr) window.WinMgr.openApp('doom');
                    break;
                case 'panda':
                    if (window.WinMgr) window.WinMgr.openApp('racer');
                    break;
                case 'note':
                    if (window.WinMgr) window.WinMgr.openApp('notepad');
                    break;
                case 'paint':
                    if (window.WinMgr) window.WinMgr.openApp('paint');
                    break;
                case 'doc':
                    window.SystemAlert(
                        "[FINAL NOTICE OF LEVY]\n\n" +
                        "Subject: Notice of Intent to Levy 1997 Special License Assessment.\n" +
                        "Amount Assessed: $ 1,840.50.\n" +
                        "Payment Deadline: 1:00 PM today.",
                        "File Explorer - IRS Notice",
                        "warning"
                    );
                    break;
                default:
                    window.SystemAlert("Selected item: " + itemId, "File Explorer", "info");
                    break;
            }
        }
    };


    // =========================================================================
    // 7. FORMAT C: AND COFFEE UTILITIES
    // =========================================================================
    function setupFormatUtility() {
        const startBtn = document.getElementById('btn-start-format');
        const fillBar = document.getElementById('format-progress-fill');
        if (!startBtn || !fillBar) return;

        let formatting = false;
        startBtn.onclick = () => {
            if (formatting) return;
            formatting = true;
            fillBar.style.width = '0%';
            startBtn.disabled = true;
            window.AudioMgr.playSfx('select');

            let progress = 0;
            const timer = setInterval(() => {
                progress += Math.floor(Math.random() * 15) + 5;
                if (progress >= 96) {
                    clearInterval(timer);
                    fillBar.style.width = '96%';
                    formatting = false;
                    startBtn.disabled = false;
                    window.AudioMgr.playSfx('chord');
                    window.SystemAlert(
                        "[CRITICAL FORMAT ERROR]\n\n" +
                        "Cannot format drive C:\\.\n" +
                        "4,820 MB of binding federal tax liens detected in master file table.\n" +
                        "Drive format aborted under 26 U.S. Code § 7201.",
                        "Format Error - Drive C:",
                        "error"
                    );
                } else {
                    fillBar.style.width = `${progress}%`;
                }
            }, 180);
        };
    }

    function setupCoffeeUtility() {
        const ejectBtn = document.getElementById('btn-caffe-eject');
        const pourBtn = document.getElementById('btn-caffe-pour');
        const statusLine = document.getElementById('caffe-status-line');
        const cupState = document.getElementById('caffe-cup-state');
        if (!ejectBtn) return;

        let isOpen = false;
        ejectBtn.onclick = () => {
            isOpen = !isOpen;
            window.AudioMgr.playSfx('screech');
            if (isOpen) {
                ejectBtn.innerText = 'Close Tray';
                if (statusLine) statusLine.innerText = 'TRAY STATUS: [TRAY OPEN: CUP HOLDER READY]';
                if (cupState) cupState.innerText = 'CD-ROM tray ejected. Place warm coffee mug on tray.';
            } else {
                ejectBtn.innerText = 'Eject Tray';
                if (statusLine) statusLine.innerText = 'TRAY STATUS: [TRAY CLOSED]';
                if (cupState) cupState.innerText = 'Cup tray is currently retracted.';
            }
        };

        if (pourBtn) {
            pourBtn.onclick = () => {
                window.AudioMgr.playSfx('ding');
                if (statusLine) statusLine.innerText = 'TRAY STATUS: [REFILL 100% - CAFFEINE BOOST ACTIVE]';
                if (cupState) cupState.innerText = 'Fresh hot espresso poured! Taxpayer focus restored by 50%.';
            };
        }
    }

    // =========================================================================
    // 8. GLOBAL KEYBOARD SHORTCUTS (Ctrl+Alt+Del, Ctrl+Shift+Esc)
    // =========================================================================
    window.addEventListener('keydown', (e) => {
        if ((e.ctrlKey && e.altKey && e.key === 'Delete') || (e.ctrlKey && e.shiftKey && e.key === 'Escape')) {
            e.preventDefault();
            if (window.WinMgr) {
                window.WinMgr.open('win-taskmgr');
                window.TaskMgrApp.refreshAppsList();
            }
        }
    });

    document.addEventListener('DOMContentLoaded', () => {
        window.CalcApp.init();
        window.DosApp.init();
        window.TaskMgrApp.init();
        setupFormatUtility();
        setupCoffeeUtility();
    });

})();

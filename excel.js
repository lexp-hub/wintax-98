// excel.js - Microsoft Excel 97 / TaxCalc Sheets 98
// Functional retro spreadsheet application with grid, formula evaluation (=SUM, math), and VFS save/load.

(function() {
    'use strict';

    class RetroExcelApp {
        constructor() {
            this.cols = ['A', 'B', 'C', 'D', 'E', 'F'];
            this.rows = 14;
            this.activeCell = 'A1';
            this.data = {};
            this.currentFileName = 'BUDGET_1998.XLS';

            this.initDefaultData();
        }

        initDefaultData() {
            // Default hyper-boring state tax office budget ledger
            this.data = {
                'A1': 'EXPENDITURE ITEM', 'B1': 'QTY', 'C1': 'UNIT COST ($)', 'D1': 'TOTAL ($)',
                'A2': 'Paperclips (Box of 100)', 'B2': '140', 'C2': '0.85', 'D2': '=B2*C2',
                'A3': 'Red Ballpoint Pens (Lost)', 'B3': '24', 'C3': '1.20', 'D3': '=B3*C3',
                'A4': 'Ergonomic Cushion (Desk 14-B)', 'B4': '1', 'C4': '49.90', 'D4': '=B4*C4',
                'A5': 'Instant Coffee Granules (1kg)', 'B5': '12', 'C5': '8.50', 'D5': '=B5*C5',
                'A6': 'Carbon Triplicate Sheets', 'B6': '500', 'C6': '0.15', 'D6': '=B6*C6',
                'A7': 'Staples Gauge 24/6 (5000/pk)', 'B7': '10', 'C7': '3.25', 'D7': '=B7*C7',
                'A8': 'Rubber Stamp Ink Bottles', 'B8': '5', 'C8': '4.50', 'D8': '=B8*C8',
                'A9': '', 'B9': '', 'C9': '', 'D9': '',
                'A10': 'TOTAL EXPENDITURES:', 'B10': '', 'C10': '', 'D10': '=SUM(D2:D8)'
            };
        }

        init() {
            this.renderGrid();
            this.setupEvents();
            this.recalculate();
        }

        renderGrid() {
            const table = document.getElementById('excel-grid-table');
            if (!table) return;

            table.innerHTML = '';

            // Header Row (Columns A-F)
            const thead = document.createElement('thead');
            const headRow = document.createElement('tr');
            
            // Corner cell
            const corner = document.createElement('th');
            corner.className = 'excel-header-corner';
            corner.innerText = '';
            headRow.appendChild(corner);

            this.cols.forEach(col => {
                const th = document.createElement('th');
                th.className = 'excel-col-header';
                th.innerText = col;
                headRow.appendChild(th);
            });
            thead.appendChild(headRow);
            table.appendChild(thead);

            // Body Rows (1 to rows)
            const tbody = document.createElement('tbody');
            for (let r = 1; r <= this.rows; r++) {
                const tr = document.createElement('tr');

                // Row Number Header
                const thRow = document.createElement('th');
                thRow.className = 'excel-row-header';
                thRow.innerText = r;
                tr.appendChild(thRow);

                // Cells
                this.cols.forEach(c => {
                    const td = document.createElement('td');
                    const coord = `${c}${r}`;
                    td.className = 'excel-cell';
                    td.dataset.coord = coord;
                    td.id = `excel-cell-${coord}`;
                    td.contentEditable = 'true';
                    td.spellcheck = false;

                    tr.appendChild(td);
                });

                tbody.appendChild(tr);
            }
            table.appendChild(tbody);
        }

        setupEvents() {
            const table = document.getElementById('excel-grid-table');
            const fxInput = document.getElementById('excel-formula-input');
            const coordBadge = document.getElementById('excel-active-coord');

            if (table) {
                table.addEventListener('focusin', (e) => {
                    const cell = e.target.closest('.excel-cell');
                    if (cell) {
                        this.setActiveCell(cell.dataset.coord);
                    }
                });

                table.addEventListener('input', (e) => {
                    const cell = e.target.closest('.excel-cell');
                    if (cell) {
                        const coord = cell.dataset.coord;
                        this.data[coord] = cell.innerText.trim();
                        if (fxInput) fxInput.value = this.data[coord];
                        this.recalculate();
                    }
                });

                table.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        this.recalculate();
                        const nextRow = Math.min(this.rows, parseInt(this.activeCell.slice(1)) + 1);
                        const nextCoord = `${this.activeCell[0]}${nextRow}`;
                        this.focusCell(nextCoord);
                    }
                });
            }

            if (fxInput) {
                fxInput.addEventListener('input', () => {
                    if (this.activeCell) {
                        this.data[this.activeCell] = fxInput.value;
                        this.recalculate();
                    }
                });

                fxInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        this.recalculate();
                        if (table) table.focus();
                    }
                });
            }
        }

        setActiveCell(coord) {
            document.querySelectorAll('.excel-cell.active').forEach(c => c.classList.remove('active'));
            this.activeCell = coord;

            const cell = document.getElementById(`excel-cell-${coord}`);
            if (cell) cell.classList.add('active');

            const badge = document.getElementById('excel-active-coord');
            if (badge) badge.innerText = coord;

            const fxInput = document.getElementById('excel-formula-input');
            if (fxInput) {
                fxInput.value = this.data[coord] || '';
            }
        }

        focusCell(coord) {
            const cell = document.getElementById(`excel-cell-${coord}`);
            if (cell) {
                cell.focus();
                this.setActiveCell(coord);
            }
        }

        evaluateCell(coord, visited = new Set()) {
            const raw = this.data[coord];
            if (!raw) return '';

            // If not a formula, return as-is or number
            if (!String(raw).startsWith('=')) {
                return raw;
            }

            if (visited.has(coord)) return '#CIRCULAR!';
            visited.add(coord);

            const expr = String(raw).substring(1).toUpperCase().trim();

            // Support =SUM(X1:X2)
            const sumMatch = expr.match(/^SUM\(([A-F])(\d+):([A-F])(\d+)\)$/);
            if (sumMatch) {
                const c1 = sumMatch[1], r1 = parseInt(sumMatch[2]);
                const c2 = sumMatch[3], r2 = parseInt(sumMatch[4]);
                let total = 0;

                const colStart = this.cols.indexOf(c1);
                const colEnd = this.cols.indexOf(c2);

                for (let c = colStart; c <= colEnd; c++) {
                    for (let r = Math.min(r1, r2); r <= Math.max(r1, r2); r++) {
                        const targetCoord = `${this.cols[c]}${r}`;
                        const val = parseFloat(this.evaluateCell(targetCoord, new Set(visited)));
                        if (!isNaN(val)) total += val;
                    }
                }
                return total.toFixed(2);
            }

            // Support basic math like =B2*C2 or =B2+C2 or =A1*0.19
            try {
                // Replace cell references with evaluated numeric values
                const replaced = expr.replace(/[A-F]\d+/g, (ref) => {
                    const evaluated = parseFloat(this.evaluateCell(ref, new Set(visited)));
                    return isNaN(evaluated) ? '0' : evaluated;
                });

                // Safe arithmetic evaluator
                if (/^[\d\s\+\-\*\/\.\(\)]+$/.test(replaced)) {
                    // eslint-disable-next-line no-eval
                    const res = Function(`"use strict"; return (${replaced})`)();
                    return typeof res === 'number' ? res.toFixed(2) : res;
                }
            } catch (e) {
                return '#VALUE!';
            }

            return raw;
        }

        recalculate() {
            for (let r = 1; r <= this.rows; r++) {
                this.cols.forEach(c => {
                    const coord = `${c}${r}`;
                    const cell = document.getElementById(`excel-cell-${coord}`);
                    if (!cell) return;

                    // If cell is currently being edited, don't overwrite user typing
                    if (document.activeElement === cell) return;

                    const val = this.evaluateCell(coord);
                    cell.innerText = val !== undefined ? val : '';

                    // Styling for numbers and headers
                    if (!isNaN(parseFloat(val)) && isFinite(val) && (c === 'B' || c === 'C' || c === 'D')) {
                        cell.style.textAlign = 'right';
                    } else {
                        cell.style.textAlign = 'left';
                    }

                    if (r === 1 || r === 10) {
                        cell.style.fontWeight = 'bold';
                    } else {
                        cell.style.fontWeight = 'normal';
                    }
                });
            }

            // Workday quest check: calculate total budget
            if (window.QuestEngine && this.data['D10'] && String(this.data['D10']).includes('SUM')) {
                window.QuestEngine.complete('excel');
            }
        }

        autoSum() {
            if (!this.activeCell) return;
            const col = this.activeCell[0];
            const row = parseInt(this.activeCell.slice(1));
            if (row > 1) {
                const formula = `=SUM(${col}2:${col}${row - 1})`;
                this.data[this.activeCell] = formula;
                const fxInput = document.getElementById('excel-formula-input');
                if (fxInput) fxInput.value = formula;
                this.recalculate();
                if (window.AudioMgr) window.AudioMgr.playSfx('select');
            }
        }

        saveToVFS() {
            if (!window.VFS) return;
            const lines = [];
            for (let r = 1; r <= this.rows; r++) {
                const rowVals = this.cols.map(c => this.data[`${c}${r}`] || '');
                lines.push(rowVals.join('\t'));
            }
            const content = lines.join('\n');
            const path = `C:\\TAX_DOCUMENTS\\${this.currentFileName}`;
            window.VFS.writeFile(path, content);
            if (window.SystemAlert) {
                window.SystemAlert(`Spreadsheet saved to virtual disk:\n${path}`, 'Microsoft Excel - Saved', 'info');
            }
        }

        openDefaultLedger() {
            this.initDefaultData();
            this.recalculate();
            if (window.AudioMgr) window.AudioMgr.playSfx('select');
        }
    }

    window.ExcelApp = new RetroExcelApp();

    document.addEventListener('DOMContentLoaded', () => {
        window.ExcelApp.init();
    });
})();

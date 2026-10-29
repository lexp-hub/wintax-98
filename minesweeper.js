// minesweeper.js - Campo Minato dell'IVA a Debito (winmine.exe)

class Minesweeper {
    constructor() {
        this.rows = 8;
        this.cols = 8;
        this.minesCount = 10;
        this.grid = [];
        this.revealedCount = 0;
        this.flagsCount = 0;
        this.isGameOver = false;
        this.timer = 0;
        this.timerInterval = null;

        this.gridEl = document.getElementById('mine-grid');
        this.counterEl = document.getElementById('mine-counter');
        this.timerEl = document.getElementById('mine-timer');
        this.faceBtn = document.getElementById('mine-face-btn');

        this.init();
    }

    init() {
        if (this.faceBtn) {
            this.faceBtn.onclick = () => this.reset();
        }
        this.reset();
    }

    reset() {
        this.isGameOver = false;
        this.revealedCount = 0;
        this.flagsCount = 0;
        this.timer = 0;
        clearInterval(this.timerInterval);
        this.timerInterval = null;

        if (this.faceBtn) this.faceBtn.innerText = ':)';
        this.updateCounter();
        if (this.timerEl) this.timerEl.innerText = '000';

        // Crea matrice vuota
        this.grid = [];
        for (let r = 0; r < this.rows; r++) {
            this.grid[r] = [];
            for (let c = 0; c < this.cols; c++) {
                this.grid[r][c] = {
                    mine: false,
                    revealed: false,
                    flagged: false,
                    count: 0
                };
            }
        }

        // Posiziona le 10 mine
        let placed = 0;
        while (placed < this.minesCount) {
            const r = Math.floor(Math.random() * this.rows);
            const c = Math.floor(Math.random() * this.cols);
            if (!this.grid[r][c].mine) {
                this.grid[r][c].mine = true;
                placed++;
            }
        }

        // Calcola numeri adiacenti
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (!this.grid[r][c].mine) {
                    let count = 0;
                    for (let dr = -1; dr <= 1; dr++) {
                        for (let dc = -1; dc <= 1; dc++) {
                            const nr = r + dr;
                            const nc = c + dc;
                            if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols) {
                                if (this.grid[nr][nc].mine) count++;
                            }
                        }
                    }
                    this.grid[r][c].count = count;
                }
            }
        }

        this.renderGrid();
    }

    startTimer() {
        if (this.timerInterval) return;
        this.timerInterval = setInterval(() => {
            if (this.isGameOver) return;
            this.timer = Math.min(999, this.timer + 1);
            if (this.timerEl) {
                this.timerEl.innerText = String(this.timer).padStart(3, '0');
            }
        }, 1000);
    }

    updateCounter() {
        if (!this.counterEl) return;
        const remaining = Math.max(0, this.minesCount - this.flagsCount);
        this.counterEl.innerText = String(remaining).padStart(3, '0');
    }

    renderGrid() {
        if (!this.gridEl) return;
        this.gridEl.innerHTML = '';

        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const cell = document.createElement('div');
                cell.className = 'mine-cell';
                cell.dataset.r = r;
                cell.dataset.c = c;

                cell.addEventListener('mousedown', (e) => {
                    if (this.isGameOver) return;
                    if (e.button === 0 && this.faceBtn) {
                        this.faceBtn.innerText = ':o';
                    }
                });

                cell.addEventListener('mouseup', () => {
                    if (!this.isGameOver && this.faceBtn) {
                        this.faceBtn.innerText = ':)';
                    }
                });

                cell.addEventListener('click', () => {
                    this.handleLeftClick(r, c);
                });

                cell.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    this.handleRightClick(r, c);
                });

                this.gridEl.appendChild(cell);
            }
        }
    }

    handleLeftClick(r, c) {
        if (this.isGameOver) return;
        const cell = this.grid[r][c];
        if (cell.flagged || cell.revealed) return;

        this.startTimer();

        if (cell.mine) {
            // BOOM!
            this.gameOver(false);
            return;
        }

        this.reveal(r, c);

        // Controllo vittoria
        if (this.revealedCount === (this.rows * this.cols - this.minesCount)) {
            this.gameOver(true);
        }
    }

    handleRightClick(r, c) {
        if (this.isGameOver) return;
        const cell = this.grid[r][c];
        if (cell.revealed) return;

        cell.flagged = !cell.flagged;
        this.flagsCount += cell.flagged ? 1 : -1;
        this.updateCounter();

        const el = this.gridEl.children[r * this.cols + c];
        el.innerText = cell.flagged ? 'P' : '';
        el.style.color = '#ff0000';
        window.AudioMgr.playSfx('select');
    }

    reveal(r, c) {
        const cell = this.grid[r][c];
        if (cell.revealed || cell.flagged) return;

        cell.revealed = true;
        this.revealedCount++;

        const el = this.gridEl.children[r * this.cols + c];
        el.classList.add('revealed');

        if (cell.count > 0) {
            el.innerText = cell.count;
            const colors = ['', '#0000ff', '#008000', '#ff0000', '#000080', '#800000', '#008080', '#000000', '#808080'];
            el.style.color = colors[cell.count] || '#000';
        } else {
            el.innerText = '';
            // Espansione automatica delle celle vuote
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    const nr = r + dr;
                    const nc = c + dc;
                    if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols) {
                        this.reveal(nr, nc);
                    }
                }
            }
        }
        window.AudioMgr.playSfx('blip');
    }

    gameOver(won) {
        this.isGameOver = true;
        clearInterval(this.timerInterval);

        if (won) {
            if (this.faceBtn) this.faceBtn.innerText = 'B)';
            window.AudioMgr.playSfx('victory');
            alert("[CAMPO MINATO]\nVittoria tributaria! Hai eluso tutte le verifiche dell'IVA a debito!");
        } else {
            if (this.faceBtn) this.faceBtn.innerText = 'X(';
            window.AudioMgr.playSfx('explode');

            // Mostra tutte le mine
            for (let r = 0; r < this.rows; r++) {
                for (let c = 0; c < this.cols; c++) {
                    if (this.grid[r][c].mine) {
                        const el = this.gridEl.children[r * this.cols + c];
                        el.innerText = '*';
                        el.style.background = '#ffcccc';
                        el.style.color = '#000';
                    }
                }
            }
        }
    }
}

window.MinesweeperGame = new Minesweeper();

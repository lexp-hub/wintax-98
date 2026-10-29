// racer.js - Retro 90s Pseudo-3D Car Racer: Fuga in Fiat Panda dalla Finanza

class RetroRacer {
    constructor() {
        this.container = document.getElementById('win-racer');
        this.canvas = document.getElementById('racer-canvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');

        this.isRunning = false;
        this.animFrameId = null;

        // Parametri Giocatore & Panda
        this.playerX = 0; // -1 (sinistra) a +1 (destra)
        this.speed = 0;
        this.maxSpeed = 160;
        this.accel = 80;
        this.nitro = 100;
        this.isNitro = false;

        // Tracciato e Distanza
        this.trackPosition = 0;
        this.trackLength = 2200; // ~18-20 secondi di corsa
        this.curve = 0;

        // Traffico: Auto Blu e Posti di Blocco
        this.traffic = [];

        this.keys = { left: false, right: false, up: true, down: false, nitro: false };

        this.setupControls();
    }

    setupControls() {
        window.addEventListener('keydown', (e) => {
            if (!this.isRunning) return;
            const k = e.key.toLowerCase();
            if (k === 'arrowleft' || k === 'a') { this.keys.left = true; e.preventDefault(); }
            if (k === 'arrowright' || k === 'd') { this.keys.right = true; e.preventDefault(); }
            if (k === 'arrowup' || k === 'w') { this.keys.up = true; e.preventDefault(); }
            if (k === 'arrowdown' || k === 's') { this.keys.down = true; e.preventDefault(); }
            if (e.code === 'Space') {
                this.keys.nitro = true;
                e.preventDefault();
            }
        });

        window.addEventListener('keyup', (e) => {
            const k = e.key.toLowerCase();
            if (k === 'arrowleft' || k === 'a') this.keys.left = false;
            if (k === 'arrowright' || k === 'd') this.keys.right = false;
            if (k === 'arrowup' || k === 'w') this.keys.up = false;
            if (k === 'arrowdown' || k === 's') this.keys.down = false;
            if (e.code === 'Space') this.keys.nitro = false;
        });
    }

    start() {
        if (this.animFrameId) {
            cancelAnimationFrame(this.animFrameId);
            this.animFrameId = null;
        }

        this.isRunning = true;
        this.playerX = 0;
        this.speed = 60;
        this.trackPosition = 0;
        this.nitro = 100;
        this.curve = 0;

        // Genera traffico di Auto Blu lungo la strada
        this.traffic = [
            { pos: 300, lane: -0.4, speed: 80, type: 'autoblu' },
            { pos: 600, lane: 0.4, speed: 75, type: 'autoblu' },
            { pos: 900, lane: 0.0, speed: 70, type: 'blocco' },
            { pos: 1250, lane: -0.5, speed: 85, type: 'autoblu' },
            { pos: 1550, lane: 0.35, speed: 80, type: 'autoblu' },
            { pos: 1850, lane: -0.2, speed: 90, type: 'autoblu' }
        ];

        window.AudioMgr.playOutrunTheme();
        this.lastTime = performance.now();
        this.animFrameId = requestAnimationFrame((t) => this.loop(t));
    }

    update(dt) {
        if (!this.isRunning) return;

        // Accelerazione e Nitro
        let topSpeed = this.maxSpeed;
        if (this.keys.nitro && this.nitro > 0) {
            topSpeed = 210;
            this.nitro = Math.max(0, this.nitro - dt * 25);
            this.speed += this.accel * dt * 2.5;
        } else if (this.keys.up) {
            this.speed += this.accel * dt;
        } else if (this.keys.down) {
            this.speed -= this.accel * dt * 1.5;
        } else {
            this.speed -= this.accel * dt * 0.4;
        }

        this.speed = Math.max(20, Math.min(topSpeed, this.speed));

        // Sterzata proporzionale alla velocità
        const steerSpeed = (this.speed / 100) * 1.8 * dt;
        if (this.keys.left) this.playerX -= steerSpeed;
        if (this.keys.right) this.playerX += steerSpeed;

        // Limiti carreggiata (se esci sull'erba perdi velocità)
        this.playerX = Math.max(-1.4, Math.min(1.4, this.playerX));
        if (Math.abs(this.playerX) > 1.0) {
            this.speed = Math.max(30, this.speed - dt * 120);
        }

        // Avanzamento tracciato
        this.trackPosition += this.speed * dt * 1.8;

        // Curva dolce simulata
        this.curve = Math.sin(this.trackPosition * 0.003) * 0.6;
        this.playerX -= this.curve * (this.speed / 200) * dt;

        // Aggiorna auto del traffico e collisioni
        for (const car of this.traffic) {
            car.pos += car.speed * dt * 1.2;

            // Rilevamento collisione con la Panda
            const dist = car.pos - this.trackPosition;
            if (dist > -15 && dist < 35 && Math.abs(car.lane - this.playerX) < 0.35) {
                // Scontro con auto blu!
                window.AudioMgr.playSfx('screech');
                window.AudioMgr.playSfx('hit');
                this.speed = 30;
                this.playerX += car.lane > this.playerX ? -0.4 : 0.4;
                document.body.classList.add('screen-shake');
                setTimeout(() => document.body.classList.remove('screen-shake'), 180);
            }
        }

        // Traguardo: Casello Autostradale raggiunto!
        if (this.trackPosition >= this.trackLength) {
            this.win();
        }
    }

    win() {
        this.isRunning = false;
        if (this.animFrameId) {
            cancelAnimationFrame(this.animFrameId);
            this.animFrameId = null;
        }
        window.AudioMgr.stopMusic();
        window.AudioMgr.playSfx('victory');

        alert("[PANDA_RACE.EXE]\nTOLL BOOTH REACHED!\nYou outran the IRS highway patrol cars!\nSystem notification dismissed successfully.");

        if (window.onPopupCloseSuccess) {
            window.onPopupCloseSuccess();
        }
        if (this.container) this.container.classList.add('hidden');
    }

    render() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const horizon = h * 0.42;

        // Cielo e Skyline anni '90 (Cielo sfumato arancione/viola stile OutRun)
        const skyGrad = ctx.createLinearGradient(0, 0, 0, horizon);
        skyGrad.addColorStop(0, '#1e1b4b');
        skyGrad.addColorStop(1, '#db2777');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, w, horizon);

        // Profilo Montagne/Città in parallasse
        const bgOffset = (this.trackPosition * 0.1) % w;
        ctx.fillStyle = '#4c1d95';
        ctx.beginPath();
        ctx.moveTo(0, horizon);
        for (let x = 0; x <= w + 40; x += 40) {
            const my = horizon - 20 - Math.sin((x + bgOffset) * 0.05) * 15;
            ctx.lineTo(x, my);
        }
        ctx.lineTo(w, horizon);
        ctx.closePath();
        ctx.fill();

        // Terreno / Erba a fasce alternate
        ctx.fillStyle = '#065f46';
        ctx.fillRect(0, horizon, w, h - horizon);

        // Rendering Strada Prospettica Pseudo-3D
        const roadW = w * 0.65;
        const lines = 60;

        for (let i = lines; i > 0; i--) {
            const p1 = (i - 1) / lines;
            const p2 = i / lines;

            const y1 = horizon + Math.pow(p1, 2.2) * (h - horizon);
            const y2 = horizon + Math.pow(p2, 2.2) * (h - horizon);
            const hLine = y2 - y1;

            const w1 = roadW * p1;
            const w2 = roadW * p2;

            const curveOffset1 = Math.pow(p1, 2) * this.curve * (w * 0.4);
            const curveOffset2 = Math.pow(p2, 2) * this.curve * (w * 0.4);

            const x1 = (w / 2) + curveOffset1;
            const x2 = (w / 2) + curveOffset2;

            // Fasce alternate per dare l'illusione di scorrimento ad alta velocità
            const segmentIdx = Math.floor((this.trackPosition * 0.4 + i * 2) % 6);
            const isAlt = segmentIdx < 3;

            // Erba a bordi strada
            ctx.fillStyle = isAlt ? '#047857' : '#065f46';
            ctx.fillRect(0, y1, w, hLine + 1);

            // Cordoli bianchi e rossi
            const curbW1 = w1 * 1.15;
            const curbW2 = w2 * 1.15;
            ctx.fillStyle = isAlt ? '#ef4444' : '#ffffff';
            ctx.beginPath();
            ctx.moveTo(x1 - curbW1, y1); ctx.lineTo(x1 + curbW1, y1);
            ctx.lineTo(x2 + curbW2, y2); ctx.lineTo(x2 - curbW2, y2);
            ctx.closePath();
            ctx.fill();

            // Asfalto
            ctx.fillStyle = isAlt ? '#334155' : '#1e293b';
            ctx.beginPath();
            ctx.moveTo(x1 - w1, y1); ctx.lineTo(x1 + w1, y1);
            ctx.lineTo(x2 + w2, y2); ctx.lineTo(x2 - w2, y2);
            ctx.closePath();
            ctx.fill();

            // Linea centrale tratteggiata
            if (isAlt) {
                const lw1 = Math.max(1, w1 * 0.04);
                const lw2 = Math.max(1, w2 * 0.04);
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.moveTo(x1 - lw1, y1); ctx.lineTo(x1 + lw1, y1);
                ctx.lineTo(x2 + lw2, y2); ctx.lineTo(x2 - lw2, y2);
                ctx.closePath();
                ctx.fill();
            }
        }

        // Rendering Auto del Traffico (Auto Blu)
        this.traffic.forEach(car => {
            const relDist = car.pos - this.trackPosition;
            if (relDist > 0 && relDist < 450) {
                const p = 1.0 - (relDist / 450);
                const py = horizon + Math.pow(p, 2.2) * (h - horizon);
                const curveOff = Math.pow(p, 2) * this.curve * (w * 0.4);
                const px = (w / 2) + curveOff + (car.lane * (roadW * p));

                const carW = 65 * p;
                const carH = 38 * p;

                if (carW > 4) {
                    ctx.save();
                    ctx.translate(px - carW / 2, py - carH);

                    // Auto Blu ministeriale
                    ctx.fillStyle = '#0f172a';
                    ctx.fillRect(0, carH * 0.3, carW, carH * 0.7);
                    ctx.fillStyle = '#38bdf8';
                    ctx.fillRect(carW * 0.15, carH * 0.1, carW * 0.7, carH * 0.4);

                    // Lampeggiante blu della Finanza
                    const flash = Math.floor(Date.now() / 100) % 2 === 0;
                    ctx.fillStyle = flash ? '#00f3ff' : '#0033aa';
                    ctx.fillRect(carW * 0.4, 0, carW * 0.2, carH * 0.15);

                    // Fari posteriori rossi
                    ctx.fillStyle = '#ef4444';
                    ctx.fillRect(carW * 0.05, carH * 0.7, carW * 0.2, carH * 0.2);
                    ctx.fillRect(carW * 0.75, carH * 0.7, carW * 0.2, carH * 0.2);

                    ctx.restore();
                }
            }
        });

        // Rendering della mitica FIAT PANDA BIANCA (Vista Posteriore)
        this.renderFiatPanda(ctx, w, h);

        // Dashboard Anni '90 (Tachimetro, Distanza, Nitro)
        this.renderDashboard(ctx, w, h);
    }

    renderFiatPanda(ctx, w, h) {
        const pandaW = 86;
        const pandaH = 65;
        const pandaX = (w / 2) + (this.playerX * (w * 0.32)) - (pandaW / 2);
        const pandaY = h - 85 + (Math.sin(this.trackPosition * 0.3) * 2);

        ctx.save();
        ctx.translate(pandaX, pandaY);

        // Ombra sotto l'auto
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.beginPath();
        ctx.ellipse(pandaW / 2, pandaH + 4, pandaW * 0.55, 7, 0, 0, Math.PI * 2);
        ctx.fill();

        // Carrozzeria Bianca Squadrata tipica Fiat Panda
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(6, 18, pandaW - 12, pandaH - 24);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeRect(6, 18, pandaW - 12, pandaH - 24);

        // Portapacchi sul tetto anni '90
        ctx.fillStyle = '#000000';
        ctx.fillRect(14, 10, pandaW - 28, 4);
        ctx.fillRect(18, 14, 4, 5);
        ctx.fillRect(pandaW - 22, 14, 4, 5);

        // Lunotto posteriore squadrato scuro
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(14, 22, pandaW - 28, 20);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(18, 24, pandaW - 36, 4); // Riflesso vetro

        // Paraurti in plastica nera grezza
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(4, pandaH - 18, pandaW - 8, 14);

        // License plate (e.g. "TAX-AUDIT")
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(pandaW * 0.32, pandaH - 15, pandaW * 0.36, 8);
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 6px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('TAX-AUDIT', pandaW / 2, pandaH - 9);

        // Fanali posteriori rettangolari (Rosso/Arancio)
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(8, pandaH - 16, 10, 8);
        ctx.fillRect(pandaW - 18, pandaH - 16, 10, 8);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(8, pandaH - 22, 10, 5);
        ctx.fillRect(pandaW - 18, pandaH - 22, 10, 5);

        // Ruote nere
        ctx.fillStyle = '#000000';
        ctx.fillRect(2, pandaH - 10, 8, 12);
        ctx.fillRect(pandaW - 10, pandaH - 10, 8, 12);

        // Fiammata di scarico se c'e il Nitro attivo!
        if (this.keys.nitro && this.nitro > 0) {
            ctx.fillStyle = '#00f3ff';
            ctx.beginPath();
            ctx.arc(14, pandaH + 2, 8 + Math.random() * 4, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    renderDashboard(ctx, w, h) {
        // Cruscotto digitale retro
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(10, 10, 190, 48);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1;
        ctx.strokeRect(10, 10, 190, 48);

        ctx.font = 'bold 11px monospace';
        ctx.fillStyle = '#facc15';
        ctx.fillText(`SPEED: ${Math.floor(this.speed)} MPH`, 18, 26);

        // Barra Nitro
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(`NITRO [SPACE]:`, 18, 44);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(115, 34, 75, 12);
        ctx.fillStyle = '#00f3ff';
        ctx.fillRect(115, 34, (this.nitro / 100) * 75, 12);

        // Progresso Distanza
        const pct = Math.min(100, Math.floor((this.trackPosition / this.trackLength) * 100));
        ctx.fillStyle = '#22c55e';
        ctx.fillText(`ESCAPE: ${pct}%`, w - 100, 26);
    }

    loop(timestamp) {
        if (!this.isRunning) return;
        const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05);
        this.lastTime = timestamp;

        this.update(dt);
        this.render();

        if (this.isRunning && this.container && !this.container.classList.contains('hidden')) {
            this.animFrameId = requestAnimationFrame((t) => this.loop(t));
        }
    }
}

window.RacerGame = new RetroRacer();

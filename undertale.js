// undertale.js - Controllo Formale 36-Ter: Stile Undertale Autentico Senza Emoji

class UndertaleBoss {
    constructor() {
        this.container = document.getElementById('undertale-modal');
        this.canvas = document.getElementById('undertale-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.dialogueEl = document.getElementById('undertale-dialogue');
        this.hpTextEl = document.getElementById('undertale-hp-text');
        this.hpFillEl = document.getElementById('undertale-hp-fill');
        this.bossHpFill = document.getElementById('undertale-boss-hp');
        this.turnInfoEl = document.getElementById('undertale-turn-info');
        this.menuContainer = document.getElementById('undertale-menu-actions');
        this.subActionContainer = document.getElementById('undertale-subactions');

        this.isRunning = false;
        this.animFrameId = null;
        this.turn = 'MENU';
        this.playerHp = 20;
        this.playerMaxHp = 20;
        this.bossHp = 80;
        this.bossMaxHp = 80;
        this.bossMercyMeter = 0;

        this.box = { x: 110, y: 150, w: 280, h: 145 };

        // Hitbox autentica Undertale: raggio 3px al centro
        this.heart = {
            x: 250,
            y: 220,
            size: 16,
            hitboxRadius: 3.0,
            speed: 3.2,
            invulnerableTime: 0
        };

        this.projectiles = [];
        this.waveTimer = 0;
        this.currentWave = 0;
        this.keys = { left: false, right: false, up: false, down: false };

        this.attackBar = {
            active: false,
            pos: 60,
            speed: 5.0,
            dir: 1
        };

        this.setupControls();
    }

    setupControls() {
        window.addEventListener('keydown', (e) => {
            if (!this.isRunning) return;
            const key = e.key.toLowerCase();
            if (key === 'arrowleft' || key === 'a') { this.keys.left = true; e.preventDefault(); }
            if (key === 'arrowright' || key === 'd') { this.keys.right = true; e.preventDefault(); }
            if (key === 'arrowup' || key === 'w') { this.keys.up = true; e.preventDefault(); }
            if (key === 'arrowdown' || key === 's') { this.keys.down = true; e.preventDefault(); }
            if (e.code === 'Space') {
                if (this.attackBar.active) {
                    this.finishPlayerAttack();
                    e.preventDefault();
                }
            }
        });

        window.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            if (key === 'arrowleft' || key === 'a') this.keys.left = false;
            if (key === 'arrowright' || key === 'd') this.keys.right = false;
            if (key === 'arrowup' || key === 'w') this.keys.up = false;
            if (key === 'arrowdown' || key === 's') this.keys.down = false;
        });

        this.canvas.addEventListener('mousedown', () => {
            if (this.attackBar.active) this.finishPlayerAttack();
        });

        let isDragging = false;
        const moveHeart = (clientX, clientY) => {
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            const mx = (clientX - rect.left) * scaleX;
            const my = (clientY - rect.top) * scaleY;
            this.heart.x = Math.max(this.box.x + 10, Math.min(this.box.x + this.box.w - 10, mx));
            this.heart.y = Math.max(this.box.y + 10, Math.min(this.box.y + this.box.h - 10, my));
        };

        this.canvas.addEventListener('mousedown', () => {
            if (this.turn === 'ENEMY_ATTACK') isDragging = true;
        });
        window.addEventListener('mousemove', (e) => {
            if (isDragging && this.turn === 'ENEMY_ATTACK') moveHeart(e.clientX, e.clientY);
        });
        window.addEventListener('mouseup', () => { isDragging = false; });

        this.canvas.addEventListener('touchmove', (e) => {
            if (this.turn === 'ENEMY_ATTACK' && e.touches[0]) {
                moveHeart(e.touches[0].clientX, e.touches[0].clientY);
                e.preventDefault();
            }
        }, { passive: false });
    }

    start() {
        if (this.animFrameId) {
            cancelAnimationFrame(this.animFrameId);
            this.animFrameId = null;
        }

        this.container.classList.remove('hidden');
        this.isRunning = true;
        this.playerHp = 20;
        this.bossHp = 80;
        this.bossMercyMeter = 0;
        this.currentWave = 0;
        this.turn = 'MENU';
        this.updateHpUI();

        window.AudioMgr.playUndertaleTheme();
        this.setDialogue("* CONTROLLO FORMALE EX ART. 36-TER INIZIATO.\n* 'Rilevata anomalia nei parametri di sicurezza! Dimostra la tua conformita' tributaria!'");
        this.showMainMenu();

        this.lastTime = performance.now();
        this.animFrameId = requestAnimationFrame((t) => this.loop(t));
    }

    setDialogue(text) {
        this.dialogueEl.innerHTML = text.replace(/\n/g, '<br>');
    }

    updateHpUI() {
        this.hpTextEl.innerText = `${Math.max(0, this.playerHp)} / ${this.playerMaxHp}`;
        const pct = (this.playerHp / this.playerMaxHp) * 100;
        this.hpFillEl.style.width = `${Math.max(0, pct)}%`;
        this.bossHpFill.style.width = `${Math.max(0, (this.bossHp / this.bossMaxHp) * 100)}%`;
    }

    showMainMenu() {
        this.turn = 'MENU';
        this.menuContainer.classList.remove('hidden');
        this.subActionContainer.innerHTML = '';
        this.subActionContainer.classList.add('hidden');
        this.turnInfoEl.innerText = 'Seleziona un comando di difesa tributaria.';
    }

    selectAction(action) {
        window.AudioMgr.playSfx('select');
        this.menuContainer.classList.add('hidden');
        this.subActionContainer.classList.remove('hidden');
        this.subActionContainer.innerHTML = '';

        if (action === 'FIGHT') {
            const btn = document.createElement('button');
            btn.className = 'win-btn';
            btn.style.width = '100%';
            btn.innerText = 'Esibisci Ricevuta Raccomandata A/R';
            btn.onclick = () => this.startPlayerAttack();
            this.subActionContainer.appendChild(btn);
        } else if (action === 'ACT') {
            const acts = [
                { label: 'Presenta Modello F24 quietanzato', text: 'Esibisci il timbro di pagamento della banca. Il funzionario vacilla!', mercy: 35 },
                { label: 'Mostra scontrino fiscale farmaceutico', text: 'Documenti la detrazione per spese mediche. Conformita\' aumentata!', mercy: 35 },
                { label: 'Richiedi colloquio con il responsabile', text: 'Invochi l\'Art. 6 della Legge 241/90. Procedura sospesa temporaneamente!', mercy: 40 }
            ];
            acts.forEach(a => {
                const b = document.createElement('button');
                b.className = 'win-btn';
                b.style.width = '100%';
                b.innerText = a.label;
                b.onclick = () => this.performAct(a);
                this.subActionContainer.appendChild(b);
            });
        } else if (action === 'ITEM') {
            const items = [
                { label: 'Caffe del distributore (+10 HP)', heal: 10, text: 'Bevi il caffe in bicchiere di plastica. Concentrazione ripristinata!' },
                { label: 'Brioche del bar dell\'ufficio (+15 HP)', heal: 15, text: 'Consumi la brioche. Recuperi 15 HP!' }
            ];
            items.forEach(it => {
                const b = document.createElement('button');
                b.className = 'win-btn';
                b.style.width = '100%';
                b.innerText = it.label;
                b.onclick = () => this.useItem(it);
                this.subActionContainer.appendChild(b);
            });
        } else if (action === 'MERCY') {
            const b = document.createElement('button');
            b.className = 'win-btn';
            b.style.width = '100%';
            b.innerText = (this.bossMercyMeter >= 100 || this.bossHp <= 20) ? 'ARCHIVIA IN AUTOTUTELA' : 'Rinuncia ai termini di difesa';
            b.onclick = () => {
                if (this.bossMercyMeter >= 100 || this.bossHp <= 20) {
                    this.winFight();
                } else {
                    this.setDialogue("* Il funzionario verbalizza: 'Istanza di rinuncia respinta per carenza formale!'");
                    setTimeout(() => this.startEnemyTurn(), 1600);
                }
            };
            this.subActionContainer.appendChild(b);
        }

        const backBtn = document.createElement('button');
        backBtn.className = 'win-btn';
        backBtn.style.width = '100%';
        backBtn.innerText = '<-- Indietro';
        backBtn.onclick = () => this.showMainMenu();
        this.subActionContainer.appendChild(backBtn);
    }

    startPlayerAttack() {
        this.subActionContainer.classList.add('hidden');
        this.turn = 'ATTACKING_BOSS';
        this.attackBar.active = true;
        this.attackBar.pos = 60;
        this.attackBar.dir = 1;
        this.attackBar.speed = 5.0;
        this.turnInfoEl.innerText = 'PREMI SPAZIO O CLICCA PER CENTRARE IL PROTOCOLLO';
        this.setDialogue("* Prendi la mira verso l'ufficio verifiche tributarie!");
    }

    finishPlayerAttack() {
        if (!this.attackBar.active) return;
        this.attackBar.active = false;
        const target = this.canvas.width / 2;
        const dist = Math.abs(this.attackBar.pos - target);
        let dmg = 0;

        if (dist < 20) {
            dmg = 32;
            window.AudioMgr.playSfx('explode');
            this.setDialogue(`* SGRAVIO TOTALE! Sentenza favorevole della Commissione! -${dmg} HP!`);
        } else if (dist < 70) {
            dmg = 20;
            window.AudioMgr.playSfx('hit');
            this.setDialogue(`* Timbro di protocollo acquisito! -${dmg} HP!`);
        } else {
            dmg = 10;
            window.AudioMgr.playSfx('blip');
            this.setDialogue(`* Colpo incerto: richiesta ulteriore perizia. -${dmg} HP.`);
        }

        this.bossHp -= dmg;
        this.updateHpUI();

        if (this.bossHp <= 0) {
            setTimeout(() => this.winFight(), 1400);
        } else {
            setTimeout(() => this.startEnemyTurn(), 1800);
        }
    }

    performAct(act) {
        this.bossMercyMeter += act.mercy;
        this.setDialogue(`* ${act.text}\n* Grado di conformita': ${Math.min(100, this.bossMercyMeter)}%`);
        this.subActionContainer.classList.add('hidden');
        if (this.bossMercyMeter >= 100) {
            this.setDialogue(`* Il funzionario ripone il timbro d'irregolarita'.\n* 'Documentazione idonea: si dispone l'archiviazione formale!'`);
        }
        setTimeout(() => this.startEnemyTurn(), 1800);
    }

    useItem(item) {
        this.playerHp = Math.min(this.playerMaxHp, this.playerHp + item.heal);
        this.updateHpUI();
        window.AudioMgr.playSfx('victory');
        this.setDialogue(`* ${item.text}`);
        this.subActionContainer.classList.add('hidden');
        setTimeout(() => this.startEnemyTurn(), 1600);
    }

    startEnemyTurn() {
        this.turn = 'ENEMY_ATTACK';
        this.subActionContainer.classList.add('hidden');
        this.menuContainer.classList.add('hidden');
        this.turnInfoEl.innerText = 'SCHIVA I PROIETTILI - Frecce, WASD o Trascina';

        this.heart.x = this.box.x + this.box.w / 2;
        this.heart.y = this.box.y + this.box.h / 2;

        this.projectiles = [];
        this.waveTimer = 7.0;
        this.currentWave = (this.currentWave + 1) % 3;

        const lines = [
            "* 'VERIFICA SPESE: SCHIVA LE MARCHE DA BOLLO DA 16,00 EUR!'",
            "* 'CONTROLLO REDDITI: SCHIVA LE RIGHE DEL MODELLO UNICO!'",
            "* 'INCROCIO DATI CATASTALI IN CORSO!'"
        ];
        this.setDialogue(lines[this.currentWave]);
    }

    spawnProjectiles(dt) {
        if (this.turn !== 'ENEMY_ATTACK') return;
        this.waveTimer -= dt;

        if (this.currentWave === 0) {
            // Marche da bollo a caduta lenta
            if (Math.random() < 0.06) {
                this.projectiles.push({
                    type: 'marca',
                    x: this.box.x + 10 + Math.random() * (this.box.w - 35),
                    y: this.box.y - 12,
                    vx: 0,
                    vy: 1.8 + Math.random() * 0.6,
                    w: 22,
                    h: 14
                });
            }
        } else if (this.currentWave === 1) {
            // Modelli F24 orizzontali lenti
            if (Math.random() < 0.045) {
                const right = Math.random() > 0.5;
                this.projectiles.push({
                    type: 'f24',
                    x: right ? this.box.x + this.box.w + 10 : this.box.x - 25,
                    y: this.box.y + 15 + Math.random() * (this.box.h - 30),
                    vx: right ? -2.0 : 2.0,
                    vy: 0,
                    w: 24,
                    h: 15
                });
            }
        } else {
            // Timbri rotanti a rimbalzo calmo
            if (Math.random() < 0.035 && this.projectiles.length < 4) {
                this.projectiles.push({
                    type: 'timbro',
                    x: this.box.x + 20,
                    y: this.box.y + 20,
                    vx: (Math.random() > 0.5 ? 1 : -1) * 1.5,
                    vy: (Math.random() > 0.5 ? 1 : -1) * 1.5,
                    size: 18
                });
            }
        }

        if (this.waveTimer <= 0) {
            this.projectiles = [];
            window.AudioMgr.playSfx('select');
            this.setDialogue("* Aggiornamento archivio telematico completato.");
            this.showMainMenu();
        }
    }

    updatePhysics(dt) {
        if (this.turn === 'ENEMY_ATTACK') {
            let dx = 0;
            let dy = 0;
            if (this.keys.left) dx -= 1;
            if (this.keys.right) dx += 1;
            if (this.keys.up) dy -= 1;
            if (this.keys.down) dy += 1;

            if (dx !== 0 && dy !== 0) {
                dx *= 0.7071;
                dy *= 0.7071;
            }

            this.heart.x += dx * this.heart.speed;
            this.heart.y += dy * this.heart.speed;

            const half = this.heart.size / 2;
            this.heart.x = Math.max(this.box.x + half + 2, Math.min(this.box.x + this.box.w - half - 2, this.heart.x));
            this.heart.y = Math.max(this.box.y + half + 2, Math.min(this.box.y + this.box.h - half - 2, this.heart.y));

            if (this.heart.invulnerableTime > 0) {
                this.heart.invulnerableTime -= dt;
            }

            const hx = this.heart.x;
            const hy = this.heart.y;
            const r = this.heart.hitboxRadius;

            for (let i = this.projectiles.length - 1; i >= 0; i--) {
                const p = this.projectiles[i];
                p.x += p.vx;
                p.y += p.vy;

                if (p.type === 'timbro') {
                    if (p.x < this.box.x + 2 || p.x > this.box.x + this.box.w - p.size - 2) p.vx *= -1;
                    if (p.y < this.box.y + 2 || p.y > this.box.y + this.box.h - p.size - 2) p.vy *= -1;
                }

                if (this.heart.invulnerableTime <= 0) {
                    const pw = p.w || p.size;
                    const ph = p.h || p.size;

                    if (hx + r > p.x && hx - r < p.x + pw &&
                        hy + r > p.y && hy - r < p.y + ph) {
                        this.playerHp -= 3;
                        this.heart.invulnerableTime = 0.8;
                        window.AudioMgr.playSfx('hit');
                        this.updateHpUI();
                        document.body.classList.add('screen-shake');
                        setTimeout(() => document.body.classList.remove('screen-shake'), 160);

                        if (this.playerHp <= 0) {
                            this.gameOver();
                            return;
                        }
                    }
                }

                if (p.y > this.box.y + this.box.h + 20 || p.x < this.box.x - 30 || p.x > this.box.x + this.box.w + 30) {
                    this.projectiles.splice(i, 1);
                }
            }
        }

        if (this.turn === 'ATTACKING_BOSS' && this.attackBar.active) {
            this.attackBar.pos += this.attackBar.speed * this.attackBar.dir;
            if (this.attackBar.pos > this.canvas.width - 50) this.attackBar.dir = -1;
            if (this.attackBar.pos < 50) this.attackBar.dir = 1;
        }
    }

    render() {
        const ctx = this.ctx;
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawTerminal(ctx);

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.strokeRect(this.box.x, this.box.y, this.box.w, this.box.h);

        ctx.save();
        ctx.beginPath();
        ctx.rect(this.box.x + 2, this.box.y + 2, this.box.w - 4, this.box.h - 4);
        ctx.clip();

        this.projectiles.forEach(p => {
            if (p.type === 'marca') {
                ctx.fillStyle = '#0284c7';
                ctx.fillRect(p.x, p.y, p.w, p.h);
                ctx.fillStyle = '#ffffff';
                ctx.font = '8px monospace';
                ctx.fillText('16E', p.x + 2, p.y + 10);
            } else if (p.type === 'f24') {
                ctx.fillStyle = '#fef08a';
                ctx.fillRect(p.x, p.y, p.w, p.h);
                ctx.strokeStyle = '#ca8a04';
                ctx.strokeRect(p.x, p.y, p.w, p.h);
                ctx.fillStyle = '#000000';
                ctx.font = '7px monospace';
                ctx.fillText('F24', p.x + 3, p.y + 11);
            } else if (p.type === 'timbro') {
                ctx.fillStyle = '#dc2626';
                ctx.fillRect(p.x, p.y, p.size, p.size);
                ctx.fillStyle = '#ffffff';
                ctx.font = '7px monospace';
                ctx.fillText('RESP', p.x + 2, p.y + 12);
            }
        });

        if (this.turn === 'ENEMY_ATTACK') {
            if (this.heart.invulnerableTime <= 0 || Math.floor(Date.now() / 80) % 2 === 0) {
                this.drawHeart(ctx, this.heart.x, this.heart.y, this.heart.size);
            }
        }

        ctx.restore();

        if (this.turn === 'ATTACKING_BOSS' && this.attackBar.active) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(40, this.box.y + 45, this.canvas.width - 80, 45);
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 2;
            ctx.strokeRect(40, this.box.y + 45, this.canvas.width - 80, 45);

            const targetX = this.canvas.width / 2;
            ctx.fillStyle = 'rgba(250, 204, 21, 0.5)';
            ctx.fillRect(targetX - 25, this.box.y + 45, 50, 45);
            ctx.fillStyle = '#22c55e';
            ctx.fillRect(targetX - 4, this.box.y + 45, 8, 45);

            ctx.fillStyle = '#ffffff';
            ctx.fillRect(this.attackBar.pos - 4, this.box.y + 40, 8, 55);
        }
    }

    drawTerminal(ctx) {
        const cx = this.canvas.width / 2;
        const cy = 72;
        const floatY = Math.sin(Date.now() * 0.003) * 3;

        ctx.fillStyle = '#1e293b';
        ctx.fillRect(cx - 55, cy - 38 + floatY, 110, 68);
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 2;
        ctx.strokeRect(cx - 55, cy - 38 + floatY, 110, 68);

        ctx.fillStyle = '#020617';
        ctx.fillRect(cx - 48, cy - 31 + floatY, 96, 54);

        ctx.fillStyle = this.bossMercyMeter >= 100 ? '#22c55e' : '#38bdf8';
        ctx.font = '11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(this.bossMercyMeter >= 100 ? '[CONFORME]' : '[VERIFICA]', cx, cy - 5 + floatY);

        ctx.font = '8px monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('ENTRATEL v.4.02', cx, cy + 13 + floatY);
    }

    drawHeart(ctx, x, y, size) {
        ctx.save();
        ctx.translate(x, y);
        ctx.fillStyle = '#ff2244';
        ctx.beginPath();
        const topCurveHeight = size * 0.3;
        ctx.moveTo(0, topCurveHeight);
        ctx.bezierCurveTo(-size / 2, -topCurveHeight, -size, topCurveHeight, 0, size);
        ctx.bezierCurveTo(size, topCurveHeight, size / 2, -topCurveHeight, 0, topCurveHeight);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, size * 0.45, 1.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    winFight() {
        this.isRunning = false;
        if (this.animFrameId) {
            cancelAnimationFrame(this.animFrameId);
            this.animFrameId = null;
        }

        window.AudioMgr.stopMusic();
        window.AudioMgr.playSfx('victory');
        this.setDialogue("* VERIFICA EX ART. 36-TER REGOLARMENTE SUPERATA.\n* Il funzionario ha convalidato la trasmissione telematica.");
        this.turnInfoEl.innerText = 'CONVALIDA IDENTITA\' CONCLUSA CON SUCCESSO';

        setTimeout(() => {
            this.container.classList.add('hidden');
            if (window.onCaptchaSuccess) {
                window.onCaptchaSuccess();
            }
        }, 1800);
    }

    gameOver() {
        this.isRunning = false;
        if (this.animFrameId) {
            cancelAnimationFrame(this.animFrameId);
            this.animFrameId = null;
        }

        window.AudioMgr.stopMusic();
        window.AudioMgr.playSfx('hit');
        this.setDialogue("* ACCERTAMENTO FORMALE NOTIFICATO.\n* Pratica bloccata per vizi documentali.");
        this.turnInfoEl.innerText = 'VERIFICA FALLITA';

        setTimeout(() => {
            this.container.classList.add('hidden');
            alert("Controllo formale non superato. Puoi ripetere la verifica di sicurezza.");
        }, 1600);
    }

    loop(timestamp) {
        if (!this.isRunning) return;
        const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05);
        this.lastTime = timestamp;

        this.spawnProjectiles(dt);
        this.updatePhysics(dt);
        this.render();

        if (this.isRunning && this.container && !this.container.classList.contains('hidden')) {
            this.animFrameId = requestAnimationFrame((t) => this.loop(t));
        }
    }
}

window.UndertaleGame = new UndertaleBoss();

// geometry.js - Protocollo Chiusura Finestra: Velocità Calma e Costante, Giocabile e Equo

class GeometryBoss {
    constructor() {
        this.container = document.getElementById('geometry-modal');
        this.canvas = document.getElementById('geometry-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.progressBar = document.getElementById('geometry-progress');
        this.progressText = document.getElementById('geometry-pct');
        this.attemptsText = document.getElementById('geometry-attempts');

        this.isRunning = false;
        this.animFrameId = null;
        this.attempts = 1;
        this.trackLength = 1900;
        this.distanceTraveled = 0;

        // Player Cube
        this.cube = {
            x: 80,
            y: 0,
            size: 28,
            vy: 0,
            jumpStrength: -8.5,
            gravity: 0.44,
            rotation: 0,
            isGrounded: false
        };

        this.floorY = 220;

        // Jump buffer for responsiveness
        this.jumpBuffered = false;
        this.jumpBufferTimer = 0;

        this.obstacles = [];
        this.particles = [];
        this.trail = [];

        this.setupControls();
    }

    setupControls() {
        const triggerJump = (e) => {
            if (!this.isRunning) return;
            if (e.type === 'keydown' && e.code !== 'Space' && e.code !== 'ArrowUp' && e.key !== 'w') return;
            e.preventDefault();
            this.handleJumpInput();
        };

        window.addEventListener('keydown', triggerJump);
        this.canvas.addEventListener('mousedown', (e) => { e.preventDefault(); this.handleJumpInput(); });
        this.canvas.addEventListener('touchstart', (e) => { e.preventDefault(); this.handleJumpInput(); }, { passive: false });
    }

    handleJumpInput() {
        if (!this.isRunning) return;

        // Verifica Globo Giallo di Salto (Jump Orb)
        const cx = this.cube.x + this.cube.size / 2;
        const cy = this.cube.y + this.cube.size / 2;

        for (const obs of this.obstacles) {
            if (obs.type === 'orb' && !obs.used) {
                const ox = obs.x - this.distanceTraveled;
                const oy = obs.y;
                if (Math.hypot(cx - ox, cy - oy) < 55) {
                    obs.used = true;
                    this.cube.vy = -9.2;
                    this.cube.isGrounded = false;
                    window.AudioMgr.playSfx('jump');
                    this.spawnBurst(ox, oy, '#facc15', 10);
                    return;
                }
            }
        }

        // Salto normale
        if (this.cube.isGrounded) {
            this.cube.vy = this.cube.jumpStrength;
            this.cube.isGrounded = false;
            window.AudioMgr.playSfx('jump');
        } else {
            this.jumpBuffered = true;
            this.jumpBufferTimer = 0.2;
        }
    }

    buildLevel() {
        // Percorso calmo, ampiamente distanziato, senza trappole impossibili
        this.obstacles = [
            // 1. Spuntone singolo
            { type: 'spike', x: 420, y: this.floorY },

            // 2. Secondo spuntone distanziato
            { type: 'spike', x: 780, y: this.floorY },

            // 3. Piattaforma rialzata larga
            { type: 'block', x: 1100, y: this.floorY - 30, w: 120, h: 30 },

            // 4. Globo di salto (Jump Orb)
            { type: 'spike', x: 1450, y: this.floorY },
            { type: 'orb', x: 1475, y: this.floorY - 45, used: false },
            { type: 'spike', x: 1500, y: this.floorY },

            // 5. Salto finale
            { type: 'spike', x: 1750, y: this.floorY }
        ];
    }

    start() {
        // Cancella qualsiasi loop precedente per evitare accelerazioni cumulative!
        if (this.animFrameId) {
            cancelAnimationFrame(this.animFrameId);
            this.animFrameId = null;
        }

        this.container.classList.remove('hidden');
        this.isRunning = true;
        this.distanceTraveled = 0;
        this.attemptsText.innerText = `Tentativo #${this.attempts}`;
        this.cube.y = this.floorY - this.cube.size;
        this.cube.vy = 0;
        this.cube.rotation = 0;
        this.cube.isGrounded = true;
        this.particles = [];
        this.trail = [];
        this.jumpBuffered = false;

        this.buildLevel();
        window.AudioMgr.playGeometryTechno();

        this.lastTime = performance.now();
        this.animFrameId = requestAnimationFrame((t) => this.loop(t));
    }

    die() {
        this.isRunning = false;
        if (this.animFrameId) {
            cancelAnimationFrame(this.animFrameId);
            this.animFrameId = null;
        }

        window.AudioMgr.playSfx('hit');
        window.AudioMgr.stopMusic();
        this.attempts++;

        this.spawnBurst(this.cube.x + 14, this.cube.y + 14, '#00f3ff', 16);
        document.body.classList.add('screen-shake');
        setTimeout(() => document.body.classList.remove('screen-shake'), 160);

        // Riavvio pulito dopo 600ms
        setTimeout(() => {
            if (this.container && !this.container.classList.contains('hidden')) {
                this.start();
            }
        }, 600);
    }

    spawnBurst(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const spd = 1.5 + Math.random() * 3;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * spd,
                vy: Math.sin(angle) * spd,
                size: 3 + Math.random() * 3,
                color,
                life: 0.7
            });
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

        this.progressText.innerText = '100% COMPLETATO';
        this.progressBar.style.width = '100%';

        setTimeout(() => {
            this.container.classList.add('hidden');
            if (window.onPopupCloseSuccess) {
                window.onPopupCloseSuccess();
            }
        }, 1200);
    }

    update(dt) {
        if (!this.isRunning) return;

        // VELOCITÀ CALMA, COSTANTE E UMANAMENTE GIOCABILE (2.5 px per frame)
        const runSpeed = 2.5;
        this.distanceTraveled += runSpeed;

        const pct = Math.min(100, Math.floor((this.distanceTraveled / this.trackLength) * 100));
        this.progressText.innerText = `${pct}%`;
        this.progressBar.style.width = `${pct}%`;

        if (this.distanceTraveled >= this.trackLength) {
            this.win();
            return;
        }

        if (this.jumpBuffered) {
            this.jumpBufferTimer -= dt;
            if (this.jumpBufferTimer <= 0) this.jumpBuffered = false;
        }

        // Gravità e movimento verticale
        this.cube.vy += this.cube.gravity;
        this.cube.y += this.cube.vy;

        // Pavimento
        if (this.cube.y >= this.floorY - this.cube.size) {
            this.cube.y = this.floorY - this.cube.size;
            this.cube.vy = 0;
            this.cube.isGrounded = true;
            this.cube.rotation = Math.round(this.cube.rotation / (Math.PI / 2)) * (Math.PI / 2);

            if (this.jumpBuffered) {
                this.cube.vy = this.cube.jumpStrength;
                this.cube.isGrounded = false;
                this.jumpBuffered = false;
                window.AudioMgr.playSfx('jump');
            }
        } else {
            this.cube.isGrounded = false;
            this.cube.rotation += 0.08; // Rotazione dolce
        }

        this.trail.push({ x: this.cube.x, y: this.cube.y, rot: this.cube.rotation });
        if (this.trail.length > 4) this.trail.shift();

        // Hitbox giocatore: tollerante (inset di 7px)
        const hitMargin = 7;
        const playerBox = {
            x: this.cube.x + hitMargin,
            y: this.cube.y + hitMargin,
            w: this.cube.size - (hitMargin * 2),
            h: this.cube.size - (hitMargin * 2)
        };

        // Verifica ostacoli
        for (const obs of this.obstacles) {
            const screenX = obs.x - this.distanceTraveled;

            if (obs.type === 'spike') {
                const spikeBaseW = 20;
                const spikeH = 22;
                const spikeLeft = screenX + 4;
                const spikeRight = spikeLeft + spikeBaseW;
                const spikeTop = obs.y - spikeH;

                if (playerBox.x + playerBox.w > spikeLeft &&
                    playerBox.x < spikeRight &&
                    playerBox.y + playerBox.h > spikeTop) {
                    this.die();
                    return;
                }
            } else if (obs.type === 'block') {
                if (playerBox.x + playerBox.w > screenX && playerBox.x < screenX + obs.w) {
                    if (this.cube.vy >= 0 && this.cube.y + this.cube.size - this.cube.vy <= obs.y + 8) {
                        this.cube.y = obs.y - this.cube.size;
                        this.cube.vy = 0;
                        this.cube.isGrounded = true;
                        this.cube.rotation = Math.round(this.cube.rotation / (Math.PI / 2)) * (Math.PI / 2);
                        if (this.jumpBuffered) {
                            this.cube.vy = this.cube.jumpStrength;
                            this.cube.isGrounded = false;
                            this.jumpBuffered = false;
                            window.AudioMgr.playSfx('jump');
                        }
                    } else if (playerBox.y + playerBox.h > obs.y + 6) {
                        this.die();
                        return;
                    }
                }
            }
        }

        this.updateParticles(dt);
    }

    updateParticles(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= dt * 1.5;
            if (p.life <= 0) this.particles.splice(i, 1);
        }
    }

    render() {
        const ctx = this.ctx;
        ctx.fillStyle = '#080c14';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Griglia di sfondo
        const gridOff = (this.distanceTraveled * 0.3) % 35;
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
        ctx.lineWidth = 1;
        for (let x = -gridOff; x < this.canvas.width; x += 35) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, this.canvas.height); ctx.stroke();
        }

        // Pavimento Neon
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, this.floorY, this.canvas.width, this.canvas.height - this.floorY);
        ctx.strokeStyle = '#00f3ff';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(0, this.floorY); ctx.lineTo(this.canvas.width, this.floorY); ctx.stroke();

        // Disegno Ostacoli
        this.obstacles.forEach(obs => {
            const sx = obs.x - this.distanceTraveled;
            if (sx < -60 || sx > this.canvas.width + 60) return;

            if (obs.type === 'spike') {
                ctx.fillStyle = '#ff0055';
                ctx.strokeStyle = '#ff99bb';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(sx + 4, obs.y);
                ctx.lineTo(sx + 14, obs.y - 24);
                ctx.lineTo(sx + 24, obs.y);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            } else if (obs.type === 'block') {
                ctx.fillStyle = '#1e293b';
                ctx.fillRect(sx, obs.y, obs.w, obs.h);
                ctx.strokeStyle = '#38bdf8';
                ctx.lineWidth = 2;
                ctx.strokeRect(sx, obs.y, obs.w, obs.h);
            } else if (obs.type === 'orb') {
                ctx.fillStyle = obs.used ? '#475569' : '#facc15';
                ctx.beginPath();
                ctx.arc(sx, obs.y, 15, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.stroke();

                if (!obs.used) {
                    ctx.font = 'bold 8px monospace';
                    ctx.fillStyle = '#000000';
                    ctx.textAlign = 'center';
                    ctx.fillText('JUMP', sx, obs.y + 3);
                }
            }
        });

        // Scia
        this.trail.forEach((tr, i) => {
            ctx.save();
            ctx.translate(tr.x + this.cube.size / 2, tr.y + this.cube.size / 2);
            ctx.rotate(tr.rot);
            ctx.fillStyle = `rgba(0, 243, 255, ${i * 0.08})`;
            ctx.fillRect(-this.cube.size / 2, -this.cube.size / 2, this.cube.size, this.cube.size);
            ctx.restore();
        });

        // Cubo Giocatore
        if (this.isRunning) {
            ctx.save();
            ctx.translate(this.cube.x + this.cube.size / 2, this.cube.y + this.cube.size / 2);
            ctx.rotate(this.cube.rotation);

            ctx.fillStyle = '#00f3ff';
            ctx.fillRect(-this.cube.size / 2, -this.cube.size / 2, this.cube.size, this.cube.size);

            ctx.fillStyle = '#0284c7';
            ctx.fillRect(-this.cube.size / 4, -this.cube.size / 4, this.cube.size / 2, this.cube.size / 2);

            ctx.fillStyle = '#ffffff';
            ctx.fillRect(-3, -5, 6, 3);
            ctx.fillRect(-3, 2, 6, 3);

            ctx.restore();
        }

        // Particelle
        this.particles.forEach(p => {
            ctx.fillStyle = p.color;
            ctx.globalAlpha = Math.max(0, p.life);
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
        });
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

window.GeometryGame = new GeometryBoss();

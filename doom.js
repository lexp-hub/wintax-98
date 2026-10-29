// doom.js - DOOM Fiscale 3D Raycaster (Versione Definitiva Senza Emulatore)

class DoomManager {
    constructor() {
        this.container = document.getElementById('win-doom');
        this.canvas = document.getElementById('doom-canvas');
        if (this.canvas) this.ctx = this.canvas.getContext('2d');

        this.isRunning = false;
        this.animFrameId = null;

        // Asset Grafici Pixel Art
        this.assetsLoaded = false;
        this.imgWall = null;
        this.imgStaplerIdle = null;
        this.imgStaplerFire = null;
        this.imgTaxDemon = null;
        this.imgFaceNormal = null;
        this.imgFaceFire = null;
        this.imgFaceHurt = null;

        // Mappa 16x16 Corridoi Archivio Tributario (1 = Schedario, 0 = Vuoto)
        this.map = [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
            [1,0,1,1,0,0,1,0,1,1,1,1,0,1,0,1],
            [1,0,1,0,0,0,0,0,0,0,0,1,0,1,0,1],
            [1,0,1,0,1,1,1,1,1,0,0,1,0,1,0,1],
            [1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,1],
            [1,0,0,0,1,0,0,0,1,0,1,1,1,1,0,1],
            [1,1,1,0,1,0,0,0,1,0,1,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,1,0,1,1,0,1],
            [1,0,1,1,1,0,0,0,0,0,0,0,1,1,0,1],
            [1,0,1,0,0,0,1,1,1,0,0,0,0,0,0,1],
            [1,0,1,0,1,0,1,0,1,0,1,1,1,1,0,1],
            [1,0,0,0,1,0,1,0,1,0,0,0,0,1,0,1],
            [1,1,1,0,1,0,0,0,0,0,1,1,0,1,0,1],
            [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ];
        this.mapW = 16;
        this.mapH = 16;

        // Posizione iniziale: Corridoio (1.5, 1.5)
        this.player = {
            x: 1.5,
            y: 1.5,
            angle: 0.0,
            fov: Math.PI / 3, // 60 gradi
            hp: 100,
            ammo: 60,
            weaponBob: 0,
            isFiring: false,
            fireFrame: 0,
            faceMood: 'normal'
        };

        this.enemies = [
            { x: 5.5, y: 3.5, hp: 3, maxHp: 3, alive: true, hurtTimer: 0 },
            { x: 11.5, y: 7.5, hp: 3, maxHp: 3, alive: true, hurtTimer: 0 },
            { x: 7.5, y: 12.5, hp: 3, maxHp: 3, alive: true, hurtTimer: 0 },
            { x: 13.5, y: 10.5, hp: 3, maxHp: 3, alive: true, hurtTimer: 0 }
        ];

        this.particles = [];
        this.keys = { up: false, down: false, left: false, right: false, strafeLeft: false, strafeRight: false };
        this.showMap = true;

        this.loadAssets();
        this.setupControls();
    }

    loadAssets() {
        let loaded = 0;
        const total = 7;
        const check = () => {
            loaded++;
            if (loaded >= total) {
                this.assetsLoaded = true;
            }
        };

        // Texture Muro Archivio Fiscale
        this.imgWall = new Image();
        this.imgWall.onload = check;
        this.imgWall.src = 'assets/wall_texture.jpg';

        // Sprite Cucitrice e Demone F24
        this.imgStaplerIdle = new Image();
        this.imgStaplerIdle.onload = check;
        this.imgStaplerIdle.src = 'assets/stapler_idle.png';

        this.imgStaplerFire = new Image();
        this.imgStaplerFire.onload = check;
        this.imgStaplerFire.src = 'assets/stapler_fire.png';

        this.imgTaxDemon = new Image();
        this.imgTaxDemon.onload = check;
        this.imgTaxDemon.src = 'assets/tax_demon.png';

        // Volto Mugshot del Commercialista (Doomguy Burocratico)
        this.imgFaceNormal = new Image();
        this.imgFaceNormal.onload = check;
        this.imgFaceNormal.src = 'assets/face_normal.png';

        this.imgFaceFire = new Image();
        this.imgFaceFire.onload = check;
        this.imgFaceFire.src = 'assets/face_fire.png';

        this.imgFaceHurt = new Image();
        this.imgFaceHurt.onload = check;
        this.imgFaceHurt.src = 'assets/face_hurt.png';
    }

    setupControls() {
        window.addEventListener('keydown', (e) => {
            if (!this.isRunning) return;
            const k = e.key.toLowerCase();
            const code = e.code;

            if (k === 'arrowup' || k === 'w' || code === 'KeyW' || code === 'ArrowUp') { this.keys.up = true; e.preventDefault(); }
            if (k === 'arrowdown' || k === 's' || code === 'KeyS' || code === 'ArrowDown') { this.keys.down = true; e.preventDefault(); }
            if (k === 'arrowleft' || k === 'a' || code === 'KeyA' || code === 'ArrowLeft') { this.keys.left = true; e.preventDefault(); }
            if (k === 'arrowright' || k === 'd' || code === 'KeyD' || code === 'ArrowRight') { this.keys.right = true; e.preventDefault(); }
            if (k === 'q' || code === 'KeyQ') { this.keys.strafeLeft = true; e.preventDefault(); }
            if (k === 'e' || code === 'KeyE') { this.keys.strafeRight = true; e.preventDefault(); }
            if (k === 'm' || code === 'KeyM') { this.showMap = !this.showMap; e.preventDefault(); }
            if (code === 'Space' || k === ' ') {
                e.preventDefault();
                this.fireStapler();
            }
        });

        window.addEventListener('keyup', (e) => {
            const k = e.key.toLowerCase();
            const code = e.code;
            if (k === 'arrowup' || k === 'w' || code === 'KeyW' || code === 'ArrowUp') this.keys.up = false;
            if (k === 'arrowdown' || k === 's' || code === 'KeyS' || code === 'ArrowDown') this.keys.down = false;
            if (k === 'arrowleft' || k === 'a' || code === 'KeyA' || code === 'ArrowLeft') this.keys.left = false;
            if (k === 'arrowright' || k === 'd' || code === 'KeyD' || code === 'ArrowRight') this.keys.right = false;
            if (k === 'q' || code === 'KeyQ') this.keys.strafeLeft = false;
            if (k === 'e' || code === 'KeyE') this.keys.strafeRight = false;
        });

        if (this.canvas) {
            this.canvas.setAttribute('tabindex', '0');
            this.canvas.addEventListener('mousedown', (e) => {
                if (this.isRunning) {
                    e.preventDefault();
                    this.fireStapler();
                }
            });
        }
    }

    start() {
        if (this.animFrameId) {
            cancelAnimationFrame(this.animFrameId);
            this.animFrameId = null;
        }

        this.isRunning = true;
        this.player.x = 1.5;
        this.player.y = 1.5;
        this.player.angle = 0.0;
        this.player.hp = 100;
        this.player.ammo = 60;
        this.player.faceMood = 'normal';
        this.enemies = [
            { x: 5.5, y: 3.5, hp: 3, maxHp: 3, alive: true, hurtTimer: 0 },
            { x: 11.5, y: 7.5, hp: 3, maxHp: 3, alive: true, hurtTimer: 0 },
            { x: 7.5, y: 12.5, hp: 3, maxHp: 3, alive: true, hurtTimer: 0 },
            { x: 13.5, y: 10.5, hp: 3, maxHp: 3, alive: true, hurtTimer: 0 }
        ];
        this.particles = [];

        window.AudioMgr.playDoomMetal();
        this.lastTime = performance.now();
        this.animFrameId = requestAnimationFrame((t) => this.loop(t));
    }

    fireStapler() {
        if (this.player.ammo <= 0 || this.player.isFiring) return;
        this.player.ammo--;
        this.player.isFiring = true;
        this.player.fireFrame = 6;
        this.player.faceMood = 'firing';
        window.AudioMgr.playSfx('stapler');

        const rayAngle = this.player.angle;
        const step = 0.08;

        for (let d = 0; d < 8; d += step) {
            const tx = this.player.x + Math.cos(rayAngle) * d;
            const ty = this.player.y + Math.sin(rayAngle) * d;

            if (this.isWall(Math.floor(tx), Math.floor(ty))) {
                this.spawnParticles(tx, ty, '#c0c0c0', 6);
                break;
            }

            for (const en of this.enemies) {
                if (en.alive && Math.hypot(en.x - tx, en.y - ty) < 0.45) {
                    en.hp--;
                    en.hurtTimer = 0.22;
                    window.AudioMgr.playSfx('hit');
                    this.spawnParticles(en.x, en.y, '#ffff88', 8);

                    if (en.hp <= 0) {
                        en.alive = false;
                        window.AudioMgr.playSfx('explode');
                        this.spawnParticles(en.x, en.y, '#ff4444', 25);
                        this.checkVictory();
                    }
                    return;
                }
            }
        }
    }

    spawnParticles(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 0.12,
                vy: (Math.random() - 0.5) * 0.12,
                life: 0.5,
                color
            });
        }
    }

    stop() {
        this.isRunning = false;
        if (this.animFrameId) {
            cancelAnimationFrame(this.animFrameId);
            this.animFrameId = null;
        }
        if (window.AudioMgr) {
            window.AudioMgr.stopMusic();
        }
    }

    checkVictory() {
        const remaining = this.enemies.filter(e => e.alive).length;
        if (remaining === 0) {
            this.stop();
            if (window.QuestEngine) window.QuestEngine.complete('doom');
            setTimeout(() => {
                window.AudioMgr.playSfx('victory');
                alert("[DOOM_TAX.EXE]\nMISSION ACCOMPLISHED!\nAll tax audit files have been stapled and archived!\nHigh contrast mode approved.");
                if (window.onSoulsSuccess) window.onSoulsSuccess();
                if (this.container) this.container.classList.add('hidden');
            }, 300);
        }
    }

    isWall(x, y) {
        if (x < 0 || x >= this.mapW || y < 0 || y >= this.mapH) return 1;
        return this.map[y][x];
    }

    canMove(x, y) {
        const r = 0.22;
        if (x - r < 0 || x + r >= this.mapW || y - r < 0 || y + r >= this.mapH) return false;
        return (
            !this.isWall(Math.floor(x - r), Math.floor(y - r)) &&
            !this.isWall(Math.floor(x + r), Math.floor(y - r)) &&
            !this.isWall(Math.floor(x - r), Math.floor(y + r)) &&
            !this.isWall(Math.floor(x + r), Math.floor(y + r))
        );
    }

    update(dt) {
        if (!this.isRunning) return;

        // Rotazione
        const rotSpeed = 2.8 * dt;
        if (this.keys.left) this.player.angle -= rotSpeed;
        if (this.keys.right) this.player.angle += rotSpeed;

        // Movimento avanti/indietro e strafe laterale
        const moveSpeed = 3.2 * dt;
        let dx = 0, dy = 0;
        if (this.keys.up) {
            dx += Math.cos(this.player.angle) * moveSpeed;
            dy += Math.sin(this.player.angle) * moveSpeed;
        }
        if (this.keys.down) {
            dx -= Math.cos(this.player.angle) * moveSpeed;
            dy -= Math.sin(this.player.angle) * moveSpeed;
        }
        if (this.keys.strafeLeft) {
            dx += Math.cos(this.player.angle - Math.PI / 2) * moveSpeed;
            dy += Math.sin(this.player.angle - Math.PI / 2) * moveSpeed;
        }
        if (this.keys.strafeRight) {
            dx += Math.cos(this.player.angle + Math.PI / 2) * moveSpeed;
            dy += Math.sin(this.player.angle + Math.PI / 2) * moveSpeed;
        }

        // Movimento con scorrimento fluido lungo i muri (wall sliding)
        if (this.canMove(this.player.x + dx, this.player.y)) {
            this.player.x += dx;
        }
        if (this.canMove(this.player.x, this.player.y + dy)) {
            this.player.y += dy;
        }

        if (dx !== 0 || dy !== 0) this.player.weaponBob += dt * 8;
        if (this.player.isFiring) {
            this.player.fireFrame--;
            if (this.player.fireFrame <= 0) {
                this.player.isFiring = false;
                if (this.player.faceMood === 'firing') this.player.faceMood = 'normal';
            }
        }

        // AI Nemici
        this.enemies.forEach(en => {
            if (!en.alive) return;
            if (en.hurtTimer > 0) en.hurtTimer -= dt;

            const dist = Math.hypot(this.player.x - en.x, this.player.y - en.y);
            if (dist < 6.5 && dist > 0.6) {
                const angle = Math.atan2(this.player.y - en.y, this.player.x - en.x);
                const ex = Math.cos(angle) * 0.85 * dt;
                const ey = Math.sin(angle) * 0.85 * dt;
                if (this.canMove(en.x + ex, en.y)) en.x += ex;
                if (this.canMove(en.x, en.y + ey)) en.y += ey;
            } else if (dist <= 0.6) {
                this.player.hp -= 20 * dt;
                this.player.faceMood = 'hurt';
                window.AudioMgr.playSfx('demon_growl');
                document.body.classList.add('screen-shake');
                setTimeout(() => {
                    document.body.classList.remove('screen-shake');
                    if (this.player.faceMood === 'hurt') this.player.faceMood = 'normal';
                }, 140);

                if (this.player.hp <= 0) {
                    this.isRunning = false;
                    window.AudioMgr.stopMusic();
                    window.AudioMgr.playSfx('explode');
                    alert("[DOOM_TAX.EXE]\nYou were overwhelmed by tax audit notices!\nTry clearing the basement archive corridors again.");
                    if (this.container) this.container.classList.add('hidden');
                }
            }
        });

        // Particelle
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= dt;
            if (p.life <= 0) this.particles.splice(i, 1);
        }
    }

    render() {
        if (!this.ctx) return;
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const hudH = 44;
        const viewH = h - hudH;
        const halfH = viewH / 2;

        // Soffitto scuro da ufficio anni '90 (pannelli acustici / neon)
        const ceilGrad = ctx.createLinearGradient(0, 0, 0, halfH);
        ceilGrad.addColorStop(0, '#0a0f1d');
        ceilGrad.addColorStop(1, '#1e293b');
        ctx.fillStyle = ceilGrad;
        ctx.fillRect(0, 0, w, halfH);

        // Pavimento moquette / linoleum con reticolo prospettico anni '90
        const floorGrad = ctx.createLinearGradient(0, halfH, 0, viewH);
        floorGrad.addColorStop(0, '#1c1917');
        floorGrad.addColorStop(1, '#292524');
        ctx.fillStyle = floorGrad;
        ctx.fillRect(0, halfH, w, halfH);

        // Giunture del pavimento in prospettiva
        ctx.strokeStyle = 'rgba(75, 85, 99, 0.35)';
        ctx.lineWidth = 1;
        for (let y = halfH + 8; y < viewH; y += Math.max(4, Math.floor((y - halfH) * 0.28))) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }

        // Raycasting 3D con TEXTURE MAPPING
        const numRays = 200;
        const rayWidth = w / numRays;
        const zBuffer = [];

        const hasTex = this.imgWall && this.imgWall.complete && this.imgWall.width > 0;
        const texW = hasTex ? this.imgWall.width : 64;
        const texH = hasTex ? this.imgWall.height : 64;

        for (let i = 0; i < numRays; i++) {
            const rayAngle = this.player.angle - (this.player.fov / 2) + (i / numRays) * this.player.fov;
            let dist = 0, hitWall = 0, side = 0;
            const cosA = Math.cos(rayAngle), sinA = Math.sin(rayAngle);

            let mapX = Math.floor(this.player.x), mapY = Math.floor(this.player.y);
            const deltaDistX = Math.abs(1 / (cosA || 0.0001));
            const deltaDistY = Math.abs(1 / (sinA || 0.0001));
            let stepX, stepY, sideDistX, sideDistY;

            if (cosA < 0) { stepX = -1; sideDistX = (this.player.x - mapX) * deltaDistX; }
            else { stepX = 1; sideDistX = (mapX + 1.0 - this.player.x) * deltaDistX; }

            if (sinA < 0) { stepY = -1; sideDistY = (this.player.y - mapY) * deltaDistY; }
            else { stepY = 1; sideDistY = (mapY + 1.0 - this.player.y) * deltaDistY; }

            while (hitWall === 0 && dist < 16) {
                if (sideDistX < sideDistY) { sideDistX += deltaDistX; mapX += stepX; side = 0; }
                else { sideDistY += deltaDistY; mapY += stepY; side = 1; }
                hitWall = this.isWall(mapX, mapY);
            }

            if (side === 0) dist = (mapX - this.player.x + (1 - stepX) / 2) / cosA;
            else dist = (mapY - this.player.y + (1 - stepY) / 2) / sinA;

            const correctedDist = dist * Math.cos(rayAngle - this.player.angle);
            zBuffer[i] = correctedDist;

            const wallH = Math.min(viewH * 2.0, (viewH / (correctedDist || 0.1)) * 1.0);
            const wallTop = halfH - wallH / 2;

            // Calcolo coordinata orizzontale texture (wallX)
            let wallX = (side === 0) ? (this.player.y + dist * sinA) : (this.player.x + dist * cosA);
            wallX -= Math.floor(wallX);

            let texX = Math.floor(wallX * texW);
            if (side === 0 && cosA > 0) texX = texW - texX - 1;
            if (side === 1 && sinA < 0) texX = texW - texX - 1;

            if (hasTex) {
                ctx.drawImage(
                    this.imgWall,
                    texX, 0, 1, texH,
                    i * rayWidth, wallTop, rayWidth + 0.6, wallH
                );

                const fog = Math.min(0.85, correctedDist / 8);
                if (fog > 0.05) {
                    ctx.fillStyle = `rgba(10, 15, 29, ${fog})`;
                    ctx.fillRect(i * rayWidth, wallTop, rayWidth + 0.6, wallH);
                }
                if (side === 1) {
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
                    ctx.fillRect(i * rayWidth, wallTop, rayWidth + 0.6, wallH);
                }
            } else {
                const fog = Math.max(0.2, 1.0 - (correctedDist / 10));
                ctx.fillStyle = side === 0 ? `rgb(${Math.floor(120*fog)},${Math.floor(130*fog)},${Math.floor(140*fog)})` : `rgb(${Math.floor(90*fog)},${Math.floor(100*fog)},${Math.floor(110*fog)})`;
                ctx.fillRect(i * rayWidth, wallTop, rayWidth + 0.6, wallH);
            }
        }

        // Rendering Sprite Nemici: Cartella Esattoriale Demoniaca con Ali
        this.renderEnemies(ctx, w, viewH, halfH, zBuffer, numRays);

        // Mirino DOOM verde/rosso al centro
        this.renderCrosshair(ctx, w, halfH);

        // Rendering Mini-Radar Automap in alto a destra
        if (this.showMap) {
            this.renderRadar(ctx, w);
        }

        // Rendering Arma in 1a persona: Cucitrice Meccanica Reale
        this.renderWeapon(ctx, w, viewH);

        // Rendering Status Bar DOOM con autentico Mugshot in Pixel Art
        this.renderDoomHud(ctx, w, h, hudH);
    }

    renderCrosshair(ctx, w, halfH) {
        const cx = Math.floor(w / 2);
        const cy = Math.floor(halfH);
        ctx.strokeStyle = this.player.isFiring ? '#ef4444' : '#22c55e';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx - 7, cy); ctx.lineTo(cx - 2, cy);
        ctx.moveTo(cx + 2, cy); ctx.lineTo(cx + 7, cy);
        ctx.moveTo(cx, cy - 7); ctx.lineTo(cx, cy - 2);
        ctx.moveTo(cx, cy + 2); ctx.lineTo(cx, cy + 7);
        ctx.stroke();
    }

    renderRadar(ctx, w) {
        const mapSize = 64;
        const mapMargin = 8;
        const mapX = w - mapSize - mapMargin;
        const mapY = mapMargin;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
        ctx.fillRect(mapX, mapY, mapSize, mapSize);
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1;
        ctx.strokeRect(mapX, mapY, mapSize, mapSize);

        const cellSize = mapSize / this.mapW;
        ctx.fillStyle = '#475569';
        for (let my = 0; my < this.mapH; my++) {
            for (let mx = 0; mx < this.mapW; mx++) {
                if (this.map[my][mx]) {
                    ctx.fillRect(mapX + mx * cellSize, mapY + my * cellSize, cellSize, cellSize);
                }
            }
        }

        // Nemici sul radar
        ctx.fillStyle = '#ef4444';
        this.enemies.forEach(en => {
            if (en.alive) {
                ctx.beginPath();
                ctx.arc(mapX + en.x * cellSize, mapY + en.y * cellSize, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        // Giocatore sul radar
        ctx.fillStyle = '#22c55e';
        const px = mapX + this.player.x * cellSize;
        const py = mapY + this.player.y * cellSize;
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#86efac';
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + Math.cos(this.player.angle) * 7, py + Math.sin(this.player.angle) * 7);
        ctx.stroke();
    }

    renderEnemies(ctx, w, viewH, halfH, zBuffer, numRays) {
        const sorted = this.enemies
            .filter(e => e.alive)
            .map(e => {
                const dx = e.x - this.player.x;
                const dy = e.y - this.player.y;
                return {
                    enemy: e,
                    dist: Math.hypot(dx, dy),
                    angle: Math.atan2(dy, dx) - this.player.angle
                };
            })
            .sort((a, b) => b.dist - a.dist);

        const hasEnemyTex = this.imgTaxDemon && this.imgTaxDemon.complete && this.imgTaxDemon.width > 0;

        sorted.forEach(s => {
            let diffAngle = s.angle;
            while (diffAngle < -Math.PI) diffAngle += Math.PI * 2;
            while (diffAngle > Math.PI) diffAngle -= Math.PI * 2;

            if (diffAngle > -this.player.fov && diffAngle < this.player.fov && s.dist > 0.4) {
                const screenX = (w / 2) + Math.tan(diffAngle) / Math.tan(this.player.fov / 2) * (w / 2);
                const spriteH = Math.min(viewH * 1.5, (viewH / s.dist) * 0.95);
                const spriteW = spriteH;
                const spriteTop = halfH - spriteH / 2;

                const rayIdx = Math.floor((screenX / w) * numRays);
                if (rayIdx >= 0 && rayIdx < numRays && s.dist < zBuffer[rayIdx]) {
                    ctx.save();
                    if (s.enemy.hurtTimer > 0) {
                        ctx.filter = 'brightness(2.2) contrast(1.6)';
                    }

                    if (hasEnemyTex) {
                        ctx.drawImage(this.imgTaxDemon, screenX - spriteW / 2, spriteTop, spriteW, spriteH);
                    } else {
                        ctx.fillStyle = '#dc2626';
                        ctx.fillRect(screenX - spriteW / 2, spriteTop, spriteW, spriteH);
                    }
                    ctx.restore();
                }
            }
        });
    }

    renderWeapon(ctx, w, viewH) {
        const bobX = Math.sin(this.player.weaponBob) * 10;
        const bobY = Math.abs(Math.cos(this.player.weaponBob)) * 8;
        const fireOffset = this.player.isFiring ? 14 : 0;

        const weaponW = Math.min(360, w * 0.58);
        const weaponH = weaponW;
        const gunX = (w / 2) - (weaponW / 2) + bobX;
        const gunY = viewH - weaponH + 15 + bobY + fireOffset;

        const currentSpr = this.player.isFiring ? this.imgStaplerFire : this.imgStaplerIdle;

        if (currentSpr && currentSpr.complete && currentSpr.width > 0) {
            ctx.drawImage(currentSpr, gunX, gunY, weaponW, weaponH);
        } else {
            ctx.fillStyle = '#475569';
            ctx.fillRect(w / 2 - 25, viewH - 80 + fireOffset, 50, 80);
        }
    }

    renderDoomHud(ctx, w, h, hudH) {
        const hudY = h - hudH;

        // Barra beveled stile DOOM/Wolfenstein
        ctx.fillStyle = '#2b3342';
        ctx.fillRect(0, hudY, w, hudH);
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 2;
        ctx.strokeRect(1, hudY + 1, w - 2, hudH - 2);

        // Box Vita
        ctx.fillStyle = '#141821';
        ctx.fillRect(12, hudY + 4, 110, hudH - 8);
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1;
        ctx.strokeRect(12, hudY + 4, 110, hudH - 8);

        ctx.font = 'bold 9px monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('TAX HEALTH', 18, hudY + 15);
        ctx.font = 'bold 16px monospace';
        ctx.fillStyle = this.player.hp > 30 ? '#22c55e' : '#ef4444';
        ctx.fillText(`${Math.max(0, Math.floor(this.player.hp))}%`, 18, hudY + 32);

        // Volto Mugshot del Commercialista al centro (Doomguy Burocratico in Pixel Art)
        const faceW = 38, faceH = 34;
        const faceX = Math.floor(w / 2 - faceW / 2);
        const faceY = hudY + 5;
        ctx.fillStyle = '#141821';
        ctx.fillRect(faceX, faceY, faceW, faceH);
        ctx.strokeStyle = '#ca8a04';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(faceX, faceY, faceW, faceH);

        let faceImg = this.imgFaceNormal;
        if (this.player.faceMood === 'hurt') {
            faceImg = this.imgFaceHurt;
        } else if (this.player.faceMood === 'firing') {
            faceImg = this.imgFaceFire;
        }

        if (faceImg && faceImg.complete && faceImg.width > 0) {
            ctx.drawImage(faceImg, faceX + 1, faceY + 1, faceW - 2, faceH - 2);
        }

        // Box Munizioni Cucitrice
        ctx.fillStyle = '#141821';
        ctx.fillRect(w / 2 + 35, hudY + 4, 120, hudH - 8);
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1;
        ctx.strokeRect(w / 2 + 35, hudY + 4, 120, hudH - 8);

        ctx.font = 'bold 9px monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('STAPLE AMMO', w / 2 + 42, hudY + 15);
        ctx.font = 'bold 16px monospace';
        ctx.fillStyle = '#facc15';
        ctx.fillText(`${this.player.ammo}`, w / 2 + 42, hudY + 32);

        // Faldoni Rimasti
        const rem = this.enemies.filter(e => e.alive).length;
        ctx.fillStyle = '#141821';
        ctx.fillRect(w - 140, hudY + 4, 125, hudH - 8);
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1;
        ctx.strokeRect(w - 140, hudY + 4, 125, hudH - 8);

        ctx.font = 'bold 9px monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('TAX FILES', w - 132, hudY + 15);
        ctx.font = 'bold 16px monospace';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(`${rem} / 4`, w - 132, hudY + 32);
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

window.DoomGame = new DoomManager();

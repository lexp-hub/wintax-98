// paint.js - Authentic Windows 98 Classic Paint (pbrush.exe)
// Supports: Pencil, Brush, Eraser, Flood Fill (Bucket), Official Tax Stamps, Color Palette, Undo/Clear

(function() {
    'use strict';

    class WinPaintApp {
        constructor() {
            this.canvas = null;
            this.ctx = null;
            this.currentColor = '#000000';
            this.currentTool = 'pencil'; // pencil, brush, eraser, bucket
            this.brushSize = 4;
            this.isDrawing = false;
            this.lastX = 0;
            this.lastY = 0;

            // Palette di 28 colori autentici Windows 98
            this.colors = [
                '#000000', '#808080', '#800000', '#808000', '#008000', '#008080', '#000080', '#800080',
                '#808040', '#004040', '#0080ff', '#004080', '#8000ff', '#804000',
                '#ffffff', '#c0c0c0', '#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff',
                '#ffff80', '#00ff80', '#80ffff', '#8080ff', '#ff0080', '#ff8040'
            ];
        }

        init() {
            this.canvas = document.getElementById('paint-canvas');
            if (!this.canvas) return;
            this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });

            this.clear(false);
            this.renderPalette();
            this.bindEvents();
            this.setTool('brush');
            this.setColor('#000000');
        }

        bindEvents() {
            if (!this.canvas) return;

            // Mouse events
            this.canvas.addEventListener('mousedown', (e) => {
                e.preventDefault();
                this.startDraw(e);
            });

            this.canvas.addEventListener('mousemove', (e) => {
                e.preventDefault();
                const coords = this.getCoords(e);
                this.updateStatusBar(coords.x, coords.y);
                if (this.isDrawing) this.draw(coords.x, coords.y);
            });

            window.addEventListener('mouseup', () => {
                if (this.isDrawing) this.stopDraw();
            });

            this.canvas.addEventListener('mouseleave', () => {
                this.updateStatusBar(null, null);
            });

            // Touch events
            this.canvas.addEventListener('touchstart', (e) => {
                e.preventDefault();
                if (e.touches && e.touches[0]) this.startDraw(e.touches[0]);
            }, { passive: false });

            this.canvas.addEventListener('touchmove', (e) => {
                e.preventDefault();
                if (e.touches && e.touches[0]) {
                    const coords = this.getCoords(e.touches[0]);
                    this.updateStatusBar(coords.x, coords.y);
                    if (this.isDrawing) this.draw(coords.x, coords.y);
                }
            }, { passive: false });

            window.addEventListener('touchend', () => {
                if (this.isDrawing) this.stopDraw();
            });
        }

        getCoords(e) {
            const rect = this.canvas.getBoundingClientRect();
            const clientX = e.clientX ?? 0;
            const clientY = e.clientY ?? 0;
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            return {
                x: Math.floor((clientX - rect.left) * scaleX),
                y: Math.floor((clientY - rect.top) * scaleY)
            };
        }

        startDraw(e) {
            const coords = this.getCoords(e);
            const x = coords.x;
            const y = coords.y;

            if (this.currentTool === 'bucket') {
                this.floodFill(x, y, this.currentColor);
                if (window.AudioMgr && window.AudioMgr.playSfx) window.AudioMgr.playSfx('select');
                return;
            }

            this.isDrawing = true;
            this.lastX = x;
            this.lastY = y;

            // Disegna immediatamente un punto/tratto al clic singolo
            this.drawDot(x, y);
        }

        drawDot(x, y) {
            const ctx = this.ctx;
            ctx.save();
            if (this.currentTool === 'eraser') {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(x - 8, y - 8, 16, 16);
            } else if (this.currentTool === 'pencil') {
                ctx.fillStyle = this.currentColor;
                ctx.fillRect(x, y, 1, 1);
            } else { // brush
                ctx.fillStyle = this.currentColor;
                ctx.beginPath();
                ctx.arc(x, y, this.brushSize, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }

        draw(x, y) {
            if (!this.isDrawing) return;
            const ctx = this.ctx;
            ctx.save();

            if (this.currentTool === 'eraser') {
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 16;
                ctx.lineCap = 'square';
                ctx.beginPath();
                ctx.moveTo(this.lastX, this.lastY);
                ctx.lineTo(x, y);
                ctx.stroke();
            } else if (this.currentTool === 'pencil') {
                ctx.strokeStyle = this.currentColor;
                ctx.lineWidth = 1;
                ctx.lineCap = 'butt';
                ctx.beginPath();
                ctx.moveTo(this.lastX, this.lastY);
                ctx.lineTo(x, y);
                ctx.stroke();
            } else { // brush
                ctx.strokeStyle = this.currentColor;
                ctx.lineWidth = this.brushSize * 2;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.beginPath();
                ctx.moveTo(this.lastX, this.lastY);
                ctx.lineTo(x, y);
                ctx.stroke();
            }

            ctx.restore();
            this.lastX = x;
            this.lastY = y;
        }

        stopDraw() {
            this.isDrawing = false;
        }

        setTool(tool) {
            this.currentTool = tool;
            document.querySelectorAll('.paint-tool-btn').forEach(btn => {
                btn.classList.toggle('active', btn.getAttribute('data-tool') === tool);
            });
            if (window.AudioMgr && window.AudioMgr.playSfx) window.AudioMgr.playSfx('select');
        }

        setColor(color) {
            this.currentColor = color;
            const preview = document.getElementById('paint-color-primary');
            if (preview) preview.style.background = color;
            document.querySelectorAll('.paint-color-box').forEach(box => {
                box.classList.toggle('selected', box.getAttribute('data-color') === color);
            });
            if (window.AudioMgr && window.AudioMgr.playSfx) window.AudioMgr.playSfx('select');
        }

        clear(playSound = true) {
            if (!this.ctx || !this.canvas) return;
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            if (playSound && window.AudioMgr && window.AudioMgr.playSfx) window.AudioMgr.playSfx('select');
        }

        // Timbri Fiscale & Burocratici 90s
        applyStamp(type) {
            if (!this.ctx || !this.canvas) return;
            if (window.AudioMgr && window.AudioMgr.playSfx) window.AudioMgr.playSfx('hit');

            const cx = Math.floor(this.canvas.width / 2);
            const cy = Math.floor(this.canvas.height / 2);

            this.ctx.save();
            this.ctx.translate(cx, cy);

            if (type === 'REJECTED') {
                this.ctx.rotate(-0.16);
                this.ctx.strokeStyle = '#cc0000';
                this.ctx.lineWidth = 4;
                this.ctx.strokeRect(-120, -28, 240, 56);
                this.ctx.font = 'bold 20px "Arial Black", Arial, sans-serif';
                this.ctx.fillStyle = '#cc0000';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText('AUDIT REJECTED', 0, 0);
            } else if (type === 'APPROVED') {
                this.ctx.rotate(-0.12);
                this.ctx.strokeStyle = '#008800';
                this.ctx.lineWidth = 4;
                this.ctx.strokeRect(-110, -26, 220, 52);
                this.ctx.font = 'bold 19px "Arial Black", Arial, sans-serif';
                this.ctx.fillStyle = '#008800';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText('IRS APPROVED', 0, 0);
            } else if (type === 'CLASSIFIED') {
                this.ctx.rotate(-0.22);
                this.ctx.strokeStyle = '#b91c1c';
                this.ctx.lineWidth = 3;
                this.ctx.strokeRect(-100, -22, 200, 44);
                this.ctx.font = 'bold 16px "Courier New", monospace';
                this.ctx.fillStyle = '#b91c1c';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText('TOP SECRET TAX', 0, 0);
            }

            this.ctx.restore();
        }

        // Flood Fill (Paint Bucket)
        floodFill(startX, startY, fillColorHex) {
            const ctx = this.ctx;
            const w = this.canvas.width;
            const h = this.canvas.height;
            if (startX < 0 || startX >= w || startY < 0 || startY >= h) return;

            const imgData = ctx.getImageData(0, 0, w, h);
            const data = imgData.data;

            const targetR = data[(startY * w + startX) * 4];
            const targetG = data[(startY * w + startX) * 4 + 1];
            const targetB = data[(startY * w + startX) * 4 + 2];
            const targetA = data[(startY * w + startX) * 4 + 3];

            // Convert hex to rgb
            const rgb = this.hexToRgb(fillColorHex);
            if (targetR === rgb.r && targetG === rgb.g && targetB === rgb.b && targetA === 255) return;

            const matchStartColor = (idx) => {
                return Math.abs(data[idx] - targetR) < 25 &&
                       Math.abs(data[idx + 1] - targetG) < 25 &&
                       Math.abs(data[idx + 2] - targetB) < 25 &&
                       Math.abs(data[idx + 3] - targetA) < 25;
            };

            const queue = [[startX, startY]];
            const visited = new Uint8Array(w * h);

            while (queue.length > 0) {
                const [curX, curY] = queue.pop();
                const pixelIdx = (curY * w + curX);
                if (visited[pixelIdx]) continue;
                visited[pixelIdx] = 1;

                const byteIdx = pixelIdx * 4;
                if (!matchStartColor(byteIdx)) continue;

                data[byteIdx] = rgb.r;
                data[byteIdx + 1] = rgb.g;
                data[byteIdx + 2] = rgb.b;
                data[byteIdx + 3] = 255;

                if (curX > 0) queue.push([curX - 1, curY]);
                if (curX < w - 1) queue.push([curX + 1, curY]);
                if (curY > 0) queue.push([curX, curY - 1]);
                if (curY < h - 1) queue.push([curX, curY + 1]);
            }

            ctx.putImageData(imgData, 0, 0);
        }

        hexToRgb(hex) {
            let c = hex.replace('#', '');
            if (c.length === 3) c = c.split('').map(x => x + x).join('');
            const num = parseInt(c, 16);
            return {
                r: (num >> 16) & 255,
                g: (num >> 8) & 255,
                b: num & 255
            };
        }

        renderPalette() {
            const container = document.getElementById('paint-palette-grid');
            if (!container) return;
            container.innerHTML = '';

            this.colors.forEach(col => {
                const box = document.createElement('div');
                box.className = `paint-color-box ${this.currentColor === col ? 'selected' : ''}`;
                box.setAttribute('data-color', col);
                box.style.background = col;
                box.onclick = () => this.setColor(col);
                container.appendChild(box);
            });
        }

        updateStatusBar(x, y) {
            const coordsEl = document.getElementById('paint-status-coords');
            if (coordsEl) {
                coordsEl.innerText = (x !== null && y !== null) ? `${x}, ${y}px` : '';
            }
        }
    }

    window.PaintApp = new WinPaintApp();

    document.addEventListener('DOMContentLoaded', () => {
        window.PaintApp.init();
    });
})();

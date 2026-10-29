// desktop.js - Window Manager, Desktop, Barra delle Applicazioni e Menu Start

class WindowManager {
    constructor() {
        this.windows = {};
        this.highestZ = 100;
        this.activeWindowId = null;
        this.dragData = null;

        this.init();
    }

    init() {
        this.setupTaskbarClock();
        this.setupStartMenu();
        this.setupDesktopIcons();
        this.setupGlobalDrag();
    }

    register(id, options = {}) {
        const el = document.getElementById(id);
        if (!el) return;

        const title = options.title || el.querySelector('.win-titlebar-left span')?.innerText || 'Applicazione';
        const iconSvg = options.iconSvg || '<rect x="1" y="1" width="14" height="14" fill="#000080"/>';

        this.windows[id] = {
            id,
            el,
            title,
            iconSvg,
            isMinimized: false,
            isMaximized: false,
            prevRect: { top: '30px', left: '120px', width: '680px', height: '520px' }
        };

        const minBtn = el.querySelector('.win-title-btn-min');
        const maxBtn = el.querySelector('.win-title-btn-max');
        const closeBtn = el.querySelector('.win-title-btn-close');

        if (minBtn) minBtn.onclick = (e) => { e.stopPropagation(); this.minimize(id); };
        if (maxBtn) maxBtn.onclick = (e) => { e.stopPropagation(); this.toggleMaximize(id); };
        if (closeBtn) closeBtn.onclick = (e) => { e.stopPropagation(); this.close(id); };

        el.addEventListener('mousedown', () => {
            this.focus(id);
        });

        const titlebar = el.querySelector('.win-titlebar');
        if (titlebar) {
            titlebar.addEventListener('mousedown', (e) => {
                if (e.target.classList.contains('win-title-btn')) return;
                if (this.windows[id].isMaximized) return;
                this.focus(id);
                const rect = el.getBoundingClientRect();
                this.dragData = {
                    id,
                    offsetX: e.clientX - rect.left,
                    offsetY: e.clientY - rect.top
                };
            });
        }

        this.updateTaskbar();
    }

    focus(id) {
        if (!this.windows[id]) return;
        this.highestZ += 2;
        const win = this.windows[id];
        win.el.style.zIndex = this.highestZ;

        Object.keys(this.windows).forEach(k => {
            this.windows[k].el.classList.remove('active');
        });
        win.el.classList.add('active');
        this.activeWindowId = id;
        this.updateTaskbar();
    }

    open(id) {
        const win = this.windows[id];
        if (!win) return;
        win.el.classList.remove('hidden');
        win.isMinimized = false;
        this.focus(id);
        this.updateTaskbar();
    }

    close(id) {
        const win = this.windows[id];
        if (!win) return;

        if (id === 'win-entratel') {
            const confirmClose = confirm("Save changes to TaxReturn_2024.ade before closing?");
            if (!confirmClose) return;
        }

        if (id === 'win-doom' && window.DoomGame) window.DoomGame.isRunning = false;
        if (id === 'win-racer' && window.RacerGame) window.RacerGame.isRunning = false;

        win.el.classList.add('hidden');
        if (this.activeWindowId === id) this.activeWindowId = null;
        this.updateTaskbar();
    }

    minimize(id) {
        const win = this.windows[id];
        if (!win) return;
        win.el.classList.add('hidden');
        win.isMinimized = true;
        if (this.activeWindowId === id) this.activeWindowId = null;
        this.updateTaskbar();
    }

    toggleMaximize(id) {
        const win = this.windows[id];
        if (!win) return;
        const el = win.el;

        if (win.isMaximized) {
            el.classList.remove('maximized');
            el.style.top = win.prevRect.top;
            el.style.left = win.prevRect.left;
            el.style.width = win.prevRect.width;
            el.style.height = win.prevRect.height;
            win.isMaximized = false;
        } else {
            win.prevRect = {
                top: el.style.top || '40px',
                left: el.style.left || '100px',
                width: el.style.width || '650px',
                height: el.style.height || '500px'
            };
            el.classList.add('maximized');
            win.isMaximized = true;
        }
        this.focus(id);
    }

    updateTaskbar() {
        const container = document.getElementById('taskbar-windows');
        if (!container) return;
        container.innerHTML = '';

        Object.keys(this.windows).forEach(id => {
            const win = this.windows[id];
            const isVisibleOnTaskbar = !win.el.classList.contains('hidden') || win.isMinimized;
            if (!isVisibleOnTaskbar) return;

            const tab = document.createElement('div');
            tab.className = `win-btn taskbar-tab ${this.activeWindowId === id && !win.isMinimized ? 'active' : ''}`;
            tab.innerHTML = `<img src="${win.iconImg || 'assets/icon_windows.png'}" style="width:14px; height:14px; margin-right:5px; vertical-align:middle; image-rendering:pixelated;" alt=""><span>${win.title}</span>`;

            tab.onclick = () => {
                if (win.isMinimized) {
                    win.el.classList.remove('hidden');
                    win.isMinimized = false;
                    this.focus(id);
                } else if (this.activeWindowId === id) {
                    this.minimize(id);
                } else {
                    this.focus(id);
                }
            };

            container.appendChild(tab);
        });
    }

    setupGlobalDrag() {
        window.addEventListener('mousemove', (e) => {
            if (!this.dragData) return;
            const win = this.windows[this.dragData.id];
            if (!win) return;

            let newX = e.clientX - this.dragData.offsetX;
            let newY = e.clientY - this.dragData.offsetY;

            newX = Math.max(0, Math.min(window.innerWidth - 80, newX));
            newY = Math.max(0, Math.min(window.innerHeight - 60, newY));

            win.el.style.left = `${newX}px`;
            win.el.style.top = `${newY}px`;
        });

        window.addEventListener('mouseup', () => {
            this.dragData = null;
        });
    }

    setupTaskbarClock() {
        const clockEl = document.getElementById('system-clock');
        const update = () => {
            if (!clockEl) return;
            const now = new Date();
            const pad = (n) => String(n).padStart(2, '0');
            clockEl.innerText = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
        };
        update();
        setInterval(update, 1000);
    }

    setupStartMenu() {
        const startBtn = document.getElementById('start-btn');
        const startMenu = document.getElementById('start-menu');

        if (startBtn && startMenu) {
            startBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isHidden = startMenu.classList.contains('hidden');
                if (isHidden) {
                    startMenu.classList.remove('hidden');
                    startBtn.classList.add('pressed');
                } else {
                    startMenu.classList.add('hidden');
                    startBtn.classList.remove('pressed');
                }
            });

            window.addEventListener('click', (e) => {
                if (!startMenu.contains(e.target) && e.target !== startBtn) {
                    startMenu.classList.add('hidden');
                    startBtn.classList.remove('pressed');
                }
            });
        }
    }

    setupDesktopIcons() {
        const icons = document.querySelectorAll('.desktop-icon');
        icons.forEach(ic => {
            ic.addEventListener('click', (e) => {
                e.stopPropagation();
                icons.forEach(i => i.classList.remove('selected'));
                ic.classList.add('selected');
            });

            ic.addEventListener('dblclick', () => {
                const appId = ic.getAttribute('data-app');
                if (appId) this.openApp(appId);
            });

            let lastTap = 0;
            ic.addEventListener('touchend', () => {
                const now = Date.now();
                if (now - lastTap < 350) {
                    const appId = ic.getAttribute('data-app');
                    if (appId) this.openApp(appId);
                }
                lastTap = now;
            });
        });

        window.addEventListener('click', () => {
            icons.forEach(i => i.classList.remove('selected'));
        });
    }

    openApp(appId) {
        window.AudioMgr.playSfx('select');
        if (appId === 'entratel') {
            this.open('win-entratel');
        } else if (appId === 'doom') {
            this.open('win-doom');
            if (window.DoomGame) window.DoomGame.start();
        } else if (appId === 'racer') {
            this.open('win-racer');
            if (window.RacerGame) window.RacerGame.start();
        } else if (appId === 'rpg') {
            this.open('win-rpg');
            if (window.CaptchaGame) window.CaptchaGame.start();
        } else if (appId === 'notepad') {
            this.open('win-notepad');
        } else if (appId === 'minesweeper') {
            this.open('win-minesweeper');
            if (window.MinesweeperGame) window.MinesweeperGame.reset();
        } else if (appId === 'paint') {
            this.open('win-paint');
        } else if (appId === 'calc') {
            this.open('win-calc');
        } else if (appId === 'cmd' || appId === 'dos') {
            this.open('win-dos');
            const input = document.getElementById('dos-input');
            if (input) setTimeout(() => input.focus(), 100);
        } else if (appId === 'taskmgr') {
            this.open('win-taskmgr');
            if (window.TaskMgrApp) window.TaskMgrApp.refreshAppsList();
        } else if (appId === 'control') {
            this.open('win-control');
        } else if (appId === 'explorer') {
            this.open('win-explorer');
        } else if (appId === 'run') {
            this.open('win-run');
            const input = document.getElementById('run-input');
            if (input) setTimeout(() => input.focus(), 100);
        } else if (appId === 'display-props') {
            this.open('win-display-props');
        } else if (appId === 'system-props') {
            this.open('win-system-props');
        } else if (appId === 'trash') {
            alert("[RECYCLE BIN]\nNo tax documents may be deleted. Outstanding tax liens are retained indefinitely under Federal law.");
        } else if (appId === 'caffe') {
            alert("[HARDWARE ERROR]\nDevice not ready. Insert a warm cup of coffee into the CD-ROM tray to proceed.");
        } else if (appId === 'format') {
            alert("[SYSTEM WARNING]\nCannot format drive C:\\.\n$ 4,820.00 in binding tax liens detected across hard drive clusters.");
        }
    }
}

window.WinMgr = new WindowManager();

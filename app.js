// app.js - Controller Applicativo Windows Classic Entratel

document.addEventListener('DOMContentLoaded', () => {
    // Registra tutte le finestre nel Window Manager
    if (window.WinMgr) {
        window.WinMgr.register('win-entratel', {
            title: 'TaxReturn 4.2',
            iconImg: 'assets/icon_computer.png'
        });
        window.WinMgr.register('win-doom', {
            title: 'DOOM_TAX.EXE',
            iconImg: 'assets/icon_msdos.png'
        });
        window.WinMgr.register('win-racer', {
            title: 'Panda_Race',
            iconImg: 'assets/icon_game.png'
        });
        window.WinMgr.register('win-rpg', {
            title: 'Audit RPG 90s',
            iconImg: 'assets/icon_floppy.png'
        });
        window.WinMgr.register('win-notepad', {
            title: 'Notepad',
            iconImg: 'assets/icon_notepad.png'
        });
        window.WinMgr.register('win-minesweeper', {
            title: 'Minesweeper',
            iconImg: 'assets/icon_minesweeper.png'
        });
        window.WinMgr.register('win-paint', {
            title: 'untitled - Paint',
            iconImg: 'assets/icon_paint.png'
        });
        window.WinMgr.register('win-calc', {
            title: 'Calculator',
            iconImg: 'assets/icon_calculator.png'
        });
        window.WinMgr.register('win-dos', {
            title: 'DOS Prompt',
            iconImg: 'assets/icon_msdos.png'
        });
        window.WinMgr.register('win-taskmgr', {
            title: 'Task Manager',
            iconImg: 'assets/icon_taskmgr.png'
        });
        window.WinMgr.register('win-control', {
            title: 'Control Panel',
            iconImg: 'assets/icon_control_panel.png'
        });
        window.WinMgr.register('win-explorer', {
            title: 'File Explorer - C:\\',
            iconImg: 'assets/icon_folder.png'
        });
        window.WinMgr.register('win-run', {
            title: 'Run...',
            iconImg: 'assets/icon_windows.png'
        });
        window.WinMgr.register('win-display-props', {
            title: 'Display Properties',
            iconImg: 'assets/icon_gears.png'
        });
        window.WinMgr.register('win-system-props', {
            title: 'System Properties',
            iconImg: 'assets/icon_computer.png'
        });
        window.WinMgr.register('win-trash', {
            title: 'Recycle Bin',
            iconImg: 'assets/icon_recycle.png'
        });
        window.WinMgr.register('win-format', {
            title: 'Format - Local Disk (C:)',
            iconImg: 'assets/icon_hard_disk.png'
        });
        window.WinMgr.register('win-caffe', {
            title: 'Coffee.exe',
            iconImg: 'assets/icon_cd.png'
        });

        // Open TaxReturn 4.2 window by default
        window.WinMgr.open('win-entratel');
    }

    const state = {
        captchaDone: false,
        popupClosed: false,
        doomCleared: false,
        isDarkMode: false
    };

    const unlockAudio = () => {
        window.AudioMgr.resume();
        window.removeEventListener('click', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
    };
    window.addEventListener('click', unlockAudio);
    window.addEventListener('keydown', unlockAudio);

    // 1. Verifica Captcha: apre il 90s RPG Battle!
    const captchaTarget = document.getElementById('captcha-click-target');
    const captchaChk = document.getElementById('captcha-chk');
    const captchaStamp = document.getElementById('captcha-stamp');

    if (captchaTarget) {
        captchaTarget.addEventListener('click', () => {
            if (state.captchaDone) {
                alert("Formal audit under Sec. 36-B already completed with positive outcome.");
                return;
            }
            window.AudioMgr.playSfx('select');
            window.WinMgr.openApp('rpg');
        });
    }

    window.onCaptchaSuccess = () => {
        state.captchaDone = true;
        if (captchaChk) {
            captchaChk.innerText = 'X';
            captchaChk.style.background = '#dcfce7';
        }
        if (captchaStamp) captchaStamp.classList.remove('hidden');
    };

    // 2. Close Java Notification: triggers PANDA_RACE.EXE!
    const popupCloseBtn = document.getElementById('popup-close-trigger');
    const cookiePopup = document.getElementById('annoying-cookie-popup');

    if (popupCloseBtn) {
        popupCloseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (state.popupClosed) return;
            window.AudioMgr.playSfx('screech');
            window.WinMgr.openApp('racer');
        });
    }

    window.onPopupCloseSuccess = () => {
        state.popupClosed = true;
        if (cookiePopup) {
            cookiePopup.style.transition = 'all 0.3s ease';
            cookiePopup.style.opacity = '0';
            setTimeout(() => cookiePopup.remove(), 300);
        }
    };

    // 3. Request High Contrast: triggers DOOM_TAX.EXE 3D!
    const darkModeBtn = document.getElementById('btn-darkmode-toggle');
    if (darkModeBtn) {
        darkModeBtn.addEventListener('click', () => {
            if (!state.doomCleared) {
                window.WinMgr.openApp('doom');
            } else {
                state.isDarkMode = !state.isDarkMode;
                document.body.classList.toggle('dark-mode', state.isDarkMode);
                darkModeBtn.innerText = state.isDarkMode ? 'Restore Standard Contrast' : 'Request High Contrast';
                window.AudioMgr.playSfx('select');
            }
        });
    }

    window.onSoulsSuccess = () => {
        state.doomCleared = true;
        state.isDarkMode = true;
        document.body.classList.add('dark-mode');
        if (darkModeBtn) {
            darkModeBtn.innerText = 'Restore Standard Contrast';
        }
    };

    // 4. Transmit Tax Return to Central IRS Mainframe
    const submitBtn = document.getElementById('btn-submit-form');
    if (submitBtn) {
        submitBtn.addEventListener('click', () => {
            window.AudioMgr.playSfx('select');
            if (!state.captchaDone || !state.popupClosed || !state.doomCleared) {
                window.AudioMgr.playSfx('hit');
                alert(
                    "[WINTAX 98 TRANSMISSION HALTED]\n\n" +
                    "Cannot complete electronic filing:\n" +
                    (!state.captchaDone ? "- Sec. 36-B physical in-person audit check incomplete (click the verification checkbox);\n" : "") +
                    (!state.popupClosed ? "- Java Tax Applet warning open (click [X] on the popup and complete the Panda getaway);\n" : "") +
                    (!state.doomCleared ? "- Tax basement corridors not cleared (click Request High Contrast to launch DOOM TAX).\n" : "")
                );
            } else {
                window.AudioMgr.playSfx('victory');
                alert(
                    "[APPROVED] ELECTRONIC FILING COMPLETED SUCCESSFULLY.\n\n" +
                    "Confirmation Number: IRS-2024-9948201-TAX\n" +
                    "Tax return archived in Federal repositories. Refund of $ 14.20 approved."
                );
            }
        });
    }

    // 5. Print Tax Form in triplicate
    const printBtn = document.getElementById('btn-print-void');
    if (printBtn) {
        printBtn.addEventListener('click', () => {
            window.AudioMgr.playSfx('blip');
            alert("[WINTAX 98 PRINT SPOOLER]\nSending document to Generic / Text Only dot-matrix printer driver.");
        });
    }

    // 6. Verifica Ispettiva Straordinaria (Test Rapido)
    const panicBtn = document.getElementById('btn-panic-test');
    if (panicBtn) {
        panicBtn.addEventListener('click', () => {
            window.AudioMgr.playSfx('stapler');
            const choices = ['doom', 'racer', 'rpg'];
            const choice = choices[Math.floor(Math.random() * choices.length)];
            window.WinMgr.openApp(choice);
        });
    }
});

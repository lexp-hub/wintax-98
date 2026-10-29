// logon.js - Windows 98 Networking Domain Logon Dialog & Narrative Intro

(function() {
    'use strict';

    class WinLogonManager {
        constructor() {
            this.overlay = null;
            this.isLoggedIn = false;
        }

        init() {
            this.overlay = document.getElementById('win-logon-overlay');
            const okBtn = document.getElementById('logon-btn-ok');
            const cancelBtn = document.getElementById('logon-btn-cancel');
            const helpBtn = document.getElementById('logon-btn-help');
            const pwdInput = document.getElementById('logon-input-password');

            if (okBtn) {
                okBtn.addEventListener('click', () => this.performLogin());
            }

            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    // Classic Windows 98 cancel: logs in anyway as guest examiner!
                    this.performLogin(true);
                });
            }

            if (helpBtn) {
                helpBtn.addEventListener('click', () => {
                    alert(
                        "WINTAX 98 LOGON HELP:\n\n" +
                        "Workstation: Desk 14-B (Internal Revenue Bureau)\n" +
                        "User: Arthur P. Pendelton\n" +
                        "Default Password: coffee1998\n\n" +
                        "Click OK to resume your shift."
                    );
                });
            }

            if (pwdInput) {
                pwdInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        this.performLogin();
                    }
                });
            }
        }

        performLogin(isGuest = false) {
            if (this.isLoggedIn) return;
            this.isLoggedIn = true;

            // Unlock and play startup audio chime
            if (window.AudioMgr) {
                window.AudioMgr.resume();
                window.AudioMgr.playStartup();
            }

            // Hide logon overlay with retro fade
            if (this.overlay) {
                this.overlay.style.transition = 'opacity 0.4s ease';
                this.overlay.style.opacity = '0';
                setTimeout(() => {
                    this.overlay.classList.add('hidden');
                }, 400);
            }

            // Complete first quest!
            if (window.QuestEngine) {
                window.QuestEngine.complete('logon');
            }

            // Narrative briefing
            setTimeout(() => {
                if (window.SystemAlert) {
                    window.SystemAlert(
                        "SHIFT COMMENCED: 4:15 PM\n\n" +
                        "Employee: Arthur P. Pendelton (Desk 14-B)\n" +
                        "Status: 45 minutes remaining until the 5:00 PM filing deadline!\n\n" +
                        "Director Vance has left an urgent warning memo in C:\\MEMOS\\.\n" +
                        "Check your Workday Objectives on the Taskbar to survive the afternoon.",
                        "WinTax 98 - Welcome Arthur Pendelton",
                        "info"
                    );
                }
            }, 600);
        }
    }

    window.LogonMgr = new WinLogonManager();

    document.addEventListener('DOMContentLoaded', () => {
        window.LogonMgr.init();
    });
})();

// logon.js - Windows 98 Workstation Access & Session Gateway

(function() {
    'use strict';

    class WinLogonManager {
        constructor() {
            this.overlay = null;
            this.isLoggedIn = false;
            this.currentProfile = 'arthur';

            this.profiles = {
                arthur: {
                    id: 'arthur',
                    name: 'Arthur P. Pendelton',
                    role: 'Senior Tax Examiner (Grade 3)',
                    badge: '#IRS-8841-B',
                    desk: 'Desk 14-B (West Annex)',
                    clearance: 'Sub-Audit Class B',
                    supervisor: 'Dir. Eugene Vance',
                    photo: 'assets/face_normal.png',
                    password: 'coffee1998',
                    status: 'Active Shift • 45m to 5:00 PM'
                },
                vance: {
                    id: 'vance',
                    name: 'Director Eugene Vance',
                    role: 'Executive Regional Director',
                    badge: '#IRS-0001-A',
                    desk: 'Executive Suite 1-A',
                    clearance: 'Federal Mainframe Level 5',
                    supervisor: 'Treasury Secretary',
                    photo: 'assets/icon_gears.png',
                    password: '',
                    status: 'On Cubicle Patrol'
                },
                guest: {
                    id: 'guest',
                    name: 'Temporary Tax Intern',
                    role: 'Unpaid Bureaucratic Trainee',
                    badge: '#IRS-TEMP-99',
                    desk: 'Hallway Folding Chair',
                    clearance: 'Observation Only',
                    supervisor: 'Arthur P. Pendelton',
                    photo: 'assets/icon_question.png',
                    password: '',
                    status: 'Orientation Day'
                }
            };
        }

        init() {
            this.overlay = document.getElementById('win-logon-overlay');
            this.setupListeners();
            this.renderCurrentProfile();
        }

        setupListeners() {
            // Main login button
            const loginBtn = document.getElementById('access-btn-login');
            if (loginBtn) {
                loginBtn.addEventListener('click', () => this.handleLoginClick());
            }

            // Password Enter key
            const pwdInput = document.getElementById('access-input-password');
            if (pwdInput) {
                pwdInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        this.handleLoginClick();
                    }
                });
            }

            // Quick Menu Buttons
            const btnProfiles = document.getElementById('access-btn-profiles');
            if (btnProfiles) {
                btnProfiles.addEventListener('click', () => this.openSubmodal('modal-profiles'));
            }

            const btnLore = document.getElementById('access-btn-lore');
            if (btnLore) {
                btnLore.addEventListener('click', () => this.openSubmodal('modal-lore'));
            }

            const btnDiag = document.getElementById('access-btn-diag');
            if (btnDiag) {
                btnDiag.addEventListener('click', () => this.runAudioDiag());
            }

            const btnReset = document.getElementById('access-btn-reset');
            if (btnReset) {
                btnReset.addEventListener('click', () => this.confirmResetShift());
            }
        }

        renderCurrentProfile() {
            const p = this.profiles[this.currentProfile];
            if (!p) return;

            const nameEl = document.getElementById('access-user-name');
            const roleEl = document.getElementById('access-user-role');
            const photoEl = document.getElementById('access-user-photo');
            const userInp = document.getElementById('access-input-user');
            const pwdInp = document.getElementById('access-input-password');

            if (nameEl) nameEl.innerText = p.name;
            if (roleEl) roleEl.innerText = p.role;
            if (photoEl) photoEl.src = p.photo;
            if (userInp) userInp.value = p.name;
            if (pwdInp) pwdInp.value = p.password;

            const badgeBox = document.getElementById('access-badge-details');
            if (badgeBox) {
                badgeBox.innerHTML = `
                    <div><strong>Badge ID:</strong> ${p.badge}</div>
                    <div><strong>Desk:</strong> ${p.desk}</div>
                    <div><strong>Clearance:</strong> ${p.clearance}</div>
                    <div><strong>Status:</strong> ${p.status}</div>
                `;
            }
        }

        selectProfile(profileId) {
            if (profileId === 'vance') {
                if (window.AudioMgr) window.AudioMgr.playSfx('hit');
                alert(
                    "SECURITY CLEARANCE VIOLATION:\n\n" +
                    "Director Eugene Vance's workstation account is biometrically restricted.\n\n" +
                    "He is currently patrolling the cubicle rows reprimanding examiners who step away from Desk 14-B.\n" +
                    "Please resume your duties as Arthur P. Pendelton."
                );
                return;
            }

            this.currentProfile = profileId;
            this.renderCurrentProfile();
            this.closeSubmodals();

            if (window.AudioMgr) window.AudioMgr.playSfx('select');
        }

        handleLoginClick() {
            const pwdInput = document.getElementById('access-input-password');
            const pwd = pwdInput ? pwdInput.value : '';

            if (this.currentProfile === 'arthur' && pwd !== 'coffee1998' && pwd !== '') {
                if (window.AudioMgr) window.AudioMgr.playSfx('hit');
                alert("ACCESS DENIED: Invalid network password.\nHint: Arthur always sets his password to 'coffee1998'.");
                return;
            }

            this.performLogin();
        }

        performLogin() {
            if (this.isLoggedIn) return;
            this.isLoggedIn = true;

            // Unlock and play startup audio chime
            if (window.AudioMgr) {
                window.AudioMgr.resume();
                window.AudioMgr.playStartup();
            }

            // Hide access menu overlay with retro fade
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

            // Narrative briefing alert
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

        showAccessMenu() {
            this.isLoggedIn = false;
            if (this.overlay) {
                this.overlay.classList.remove('hidden');
                this.overlay.style.transition = 'opacity 0.3s ease';
                this.overlay.style.opacity = '1';
            }
            if (window.AudioMgr) {
                window.AudioMgr.playSfx('select');
            }
        }

        openSubmodal(modalId) {
            this.closeSubmodals();
            const modal = document.getElementById(modalId);
            if (modal) modal.classList.remove('hidden');
            if (window.AudioMgr) window.AudioMgr.playSfx('select');
        }

        closeSubmodals() {
            document.querySelectorAll('.access-submodal').forEach(m => m.classList.add('hidden'));
        }

        runAudioDiag() {
            if (window.AudioMgr) {
                window.AudioMgr.resume();
                window.AudioMgr.playSfx('stapler');
                setTimeout(() => window.AudioMgr.playSfx('tada'), 400);
            }
            alert(
                "WINTAX 98 SOUND DIAGNOSTIC [PASSED]:\n\n" +
                "Sound Device: SoundBlaster 16 Compatible (Web Audio API Synthesizer)\n" +
                "DirectSound 3D: Emulated\n" +
                "Synthesizer Channels: 8 Chords, Metal Overdrive & Square Wave Lead\n" +
                "Output Status: Online & Clear."
            );
        }

        confirmResetShift() {
            if (confirm("RESTART SHIFT?\n\nThis will reset all Workday Objectives and restore factory files in C:\\.\nAre you sure you want to restart your shift?")) {
                if (window.QuestEngine) window.QuestEngine.reset();
                if (window.VFS) window.VFS.resetToFactory();
                this.currentProfile = 'arthur';
                this.renderCurrentProfile();
                if (window.AudioMgr) window.AudioMgr.playSfx('recycle');
                alert("Shift restarted! Arthur's workstation reset to 4:15 PM.");
            }
        }
    }

    window.LogonMgr = new WinLogonManager();

    document.addEventListener('DOMContentLoaded', () => {
        window.LogonMgr.init();
    });
})();

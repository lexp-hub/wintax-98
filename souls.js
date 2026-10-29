// souls.js - Articolo 36-Bis: Controllo Automatizzato in Stile Finestra Errore di Sistema

class SoulsBoss {
    constructor() {
        this.container = document.getElementById('souls-modal');
        this.bossHpFill = document.getElementById('souls-boss-hp');
        this.playerHpFill = document.getElementById('souls-player-hp');
        this.playerHpText = document.getElementById('souls-player-hp-text');
        this.staminaFill = document.getElementById('souls-stamina-fill');
        this.bossStatusText = document.getElementById('souls-status-text');
        this.bossDialogue = document.getElementById('souls-quote');
        this.bannerEl = document.getElementById('souls-victory-banner');
        this.rollBtn = document.getElementById('souls-roll-btn');
        this.parryBtn = document.getElementById('souls-parry-btn');
        this.attackBtn = document.getElementById('souls-attack-btn');

        this.isRunning = false;
        this.bossHp = 80;
        this.playerHp = 100;
        this.stamina = 100;
        this.isInvulnerable = false;
        this.attackTimer = null;
        this.incomingAttack = null;

        this.setupControls();
    }

    setupControls() {
        window.addEventListener('keydown', (e) => {
            if (!this.isRunning) return;
            if (e.code === 'Space') {
                e.preventDefault();
                this.dodgeRoll();
            } else if (e.key.toLowerCase() === 'f' || e.key.toLowerCase() === 'e') {
                e.preventDefault();
                this.statutoParry();
            } else if (e.key.toLowerCase() === 'q') {
                e.preventDefault();
                this.counterAttack();
            }
        });

        if (this.rollBtn) this.rollBtn.onclick = () => this.dodgeRoll();
        if (this.parryBtn) this.parryBtn.onclick = () => this.statutoParry();
        if (this.attackBtn) this.attackBtn.onclick = () => this.counterAttack();
    }

    start() {
        this.container.classList.remove('hidden');
        this.bannerEl.classList.add('hidden');
        this.isRunning = true;
        this.bossHp = 80;
        this.playerHp = 100;
        this.stamina = 100;
        this.isInvulnerable = false;
        this.incomingAttack = null;
        this.updateUI();

        window.AudioMgr.playSoulsDrone();
        this.bossDialogue.innerText = '«CHI OSA RICHIEDERE L\'ALTO CONTRASTO SENZA VERSARE L\'ADDIZIONALE REGIONALE?!»';
        this.bossStatusText.innerText = 'Il controllo automatizzato sta incrociando i dati catastali...';

        if (this.staminaInterval) clearInterval(this.staminaInterval);
        this.staminaInterval = setInterval(() => {
            if (!this.isRunning) return;
            if (this.stamina < 100) {
                this.stamina = Math.min(100, this.stamina + 5);
                this.updateUI();
            }
        }, 100);

        this.scheduleNextAttack(2600);
    }

    updateUI() {
        this.bossHpFill.style.width = `${Math.max(0, (this.bossHp / 80) * 100)}%`;
        this.playerHpFill.style.width = `${Math.max(0, this.playerHp)}%`;
        this.playerHpText.innerText = `${Math.max(0, Math.floor(this.playerHp))} / 100`;
        this.staminaFill.style.width = `${Math.max(0, this.stamina)}%`;
    }

    dodgeRoll() {
        if (!this.isRunning || this.stamina < 20) {
            window.AudioMgr.playSfx('blip');
            return;
        }

        this.stamina -= 20;
        this.isInvulnerable = true;
        window.AudioMgr.playSfx('whoosh');

        const avatar = document.getElementById('souls-avatar');
        if (avatar) avatar.classList.add('souls-rolling');
        this.updateUI();

        setTimeout(() => {
            this.isInvulnerable = false;
            if (avatar) avatar.classList.remove('souls-rolling');
        }, 650);
    }

    statutoParry() {
        if (!this.isRunning || this.stamina < 25) return;
        this.stamina -= 25;
        this.updateUI();
        window.AudioMgr.playSfx('select');

        if (this.incomingAttack && this.incomingAttack.warning) {
            window.AudioMgr.playSfx('victory');
            this.bossDialogue.innerText = '«IMPOSSIBILE! ECCEZIONE DI LEGITTIMITA\' EX L. 212/2000 ACCOLTA?!»';
            this.bossStatusText.innerText = '[PARRY ESEGUITO] Verbale annullato e sistema stordito!';
            this.bossHp -= 28;
            this.incomingAttack = null;
            document.body.classList.add('screen-shake');
            setTimeout(() => document.body.classList.remove('screen-shake'), 220);
            this.updateUI();

            if (this.bossHp <= 0) {
                this.win();
            } else {
                this.scheduleNextAttack(3200);
            }
        } else {
            this.bossStatusText.innerText = 'Eccezione respinta: tempismo non conforme.';
        }
    }

    counterAttack() {
        if (!this.isRunning || this.stamina < 15) return;
        this.stamina -= 15;
        window.AudioMgr.playSfx('hit');
        this.bossHp -= 14;
        this.updateUI();
        this.bossStatusText.innerText = 'Ricorso in Autotutela notificato! -14 HP al Fisco!';

        if (this.bossHp <= 0) {
            this.win();
        }
    }

    scheduleNextAttack(delay) {
        if (!this.isRunning) return;
        if (this.attackTimer) clearTimeout(this.attackTimer);

        this.attackTimer = setTimeout(() => {
            if (!this.isRunning) return;
            this.executeBossAttack();
        }, delay);
    }

    executeBossAttack() {
        const attacks = [
            {
                name: 'RECUPERO DETRAZIONI SPESE MEDICHE',
                windup: 1300,
                damage: 30,
                quote: '«DOV\'E\' LA RICEVUTA DELLA PRESTAZIONE SPECIALISTICA?!»'
            },
            {
                name: 'SANZIONE AMMINISTRATIVA 30% EX ART. 13',
                windup: 1400,
                damage: 35,
                quote: '«OMESSO VERSAMENTO ENTRO IL TERMINE DI LEGGE!»'
            },
            {
                name: 'ISCRIZIONE A RUOLO A TITOLO DEFINITIVO',
                windup: 1250,
                damage: 30,
                quote: '«EMISSIONE CARTELLA DI PAGAMENTO ESECUTIVA!»'
            }
        ];

        const atk = attacks[Math.floor(Math.random() * attacks.length)];
        this.incomingAttack = { ...atk, warning: true };
        this.bossDialogue.innerText = atk.quote;
        this.bossStatusText.innerText = `[ATTENZIONE: ${atk.name} IN CORSO! SCHIVA CON [SPAZIO] O PARRY CON [F] ADESSO!]`;
        window.AudioMgr.playSfx('laser');

        const warningFlash = document.getElementById('souls-warning-overlay');
        if (warningFlash) warningFlash.classList.add('flash-active');

        setTimeout(() => {
            if (warningFlash) warningFlash.classList.remove('flash-active');
            if (!this.isRunning || !this.incomingAttack) return;

            if (this.isInvulnerable) {
                window.AudioMgr.playSfx('blip');
                this.bossStatusText.innerText = '[SCHIVATA PERFETTA] Notifica decaduta per decorrenza termini!';
            } else {
                this.playerHp -= atk.damage;
                window.AudioMgr.playSfx('explode');
                document.body.classList.add('screen-shake');
                setTimeout(() => document.body.classList.remove('screen-shake'), 220);
                this.bossStatusText.innerText = `[COLPO SUBITO] Rilevata anomalia contabile: -${atk.damage} Resistenza!`;
                this.updateUI();

                if (this.playerHp <= 0) {
                    this.gameOver();
                    return;
                }
            }

            this.incomingAttack = null;
            this.scheduleNextAttack(2600);
        }, atk.windup);
    }

    win() {
        this.isRunning = false;
        if (this.attackTimer) clearTimeout(this.attackTimer);
        clearInterval(this.staminaInterval);
        window.AudioMgr.stopMusic();
        window.AudioMgr.playSfx('bell');
        window.AudioMgr.playSfx('victory');

        this.bannerEl.classList.remove('hidden');
        this.bannerEl.innerHTML = `
            <div style="font-size: 1.4rem; color: #facc15; font-weight: bold; letter-spacing: 2px;">CONTROLLO 36-BIS ARCHIVIATO</div>
            <div style="font-size: 11px; color: #ffffff; margin-top: 8px;">Concessa l'attivazione della modalita' ad Alto Contrasto.</div>
        `;

        setTimeout(() => {
            this.container.classList.add('hidden');
            if (window.onSoulsSuccess) {
                window.onSoulsSuccess();
            }
        }, 2600);
    }

    gameOver() {
        this.isRunning = false;
        if (this.attackTimer) clearTimeout(this.attackTimer);
        clearInterval(this.staminaInterval);
        window.AudioMgr.stopMusic();
        window.AudioMgr.playSfx('hit');

        this.bannerEl.classList.remove('hidden');
        this.bannerEl.innerHTML = `
            <div style="font-size: 1.4rem; color: #ef4444; font-weight: bold;">DEBITO ISCRITTO A RUOLO</div>
            <div style="font-size: 11px; color: #ffffff; margin-top: 8px;">La sessione deve essere riconfermata.</div>
        `;

        setTimeout(() => {
            this.container.classList.add('hidden');
            alert("Controllo 36-bis concluso con esito negativo. Puoi riprovare.");
        }, 2200);
    }
}

window.SoulsGame = new SoulsBoss();

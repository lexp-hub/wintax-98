// captcha_rpg.js - Finto Captcha in Stile RPG a Turni Anni '90 (Pokemon / Final Fantasy DOS)

class CaptchaRpg {
    constructor() {
        this.container = document.getElementById('win-rpg');
        this.enemyHpEl = document.getElementById('rpg-enemy-hp-text');
        this.enemyHpBar = document.getElementById('rpg-enemy-hp-bar');
        this.playerHpEl = document.getElementById('rpg-player-hp-text');
        this.playerHpBar = document.getElementById('rpg-player-hp-bar');
        this.playerMpEl = document.getElementById('rpg-player-mp-text');
        this.dialogueEl = document.getElementById('rpg-dialogue');
        this.mainMenu = document.getElementById('rpg-main-menu');
        this.subactionsMenu = document.getElementById('rpg-subactions-menu');

        this.enemyMaxHp = 80;
        this.enemyHp = 80;
        this.playerMaxHp = 50;
        this.playerHp = 50;
        this.playerMaxMp = 30;
        this.playerMp = 30;

        this.enemyStunned = false;
        this.isPlayerTurn = true;
    }

    start() {
        if (this.container) this.container.classList.remove('hidden');

        this.enemyHp = this.enemyMaxHp;
        this.playerHp = this.playerMaxHp;
        this.playerMp = this.playerMaxMp;
        this.enemyStunned = false;
        this.isPlayerTurn = true;

        this.updateUI();
        window.AudioMgr.playRpgBattleTheme();

        this.setDialogue("A wild Tax Auditor (Lv. 42) appears from the Archives!\n'Produce your expense receipts in triplicate immediately!'");
        this.showMainMenu();
    }

    stop() {
        if (window.AudioMgr) {
            window.AudioMgr.stopMusic();
        }
    }

    setDialogue(text) {
        if (this.dialogueEl) {
            this.dialogueEl.innerHTML = text.replace(/\n/g, '<br>');
        }
    }

    updateUI() {
        if (this.enemyHpEl) this.enemyHpEl.innerText = `${Math.max(0, this.enemyHp)} / ${this.enemyMaxHp}`;
        if (this.enemyHpBar) this.enemyHpBar.style.width = `${Math.max(0, (this.enemyHp / this.enemyMaxHp) * 100)}%`;

        if (this.playerHpEl) this.playerHpEl.innerText = `${Math.max(0, this.playerHp)} / ${this.playerMaxHp}`;
        if (this.playerHpBar) this.playerHpBar.style.width = `${Math.max(0, (this.playerHp / this.playerMaxHp) * 100)}%`;

        if (this.playerMpEl) this.playerMpEl.innerText = `${this.playerMp} / ${this.playerMaxMp}`;
    }

    showMainMenu() {
        this.isPlayerTurn = true;
        if (this.mainMenu) this.mainMenu.classList.remove('hidden');
        if (this.subactionsMenu) this.subactionsMenu.classList.add('hidden');
    }

    selectAction(action) {
        window.AudioMgr.playSfx('select');
        if (this.mainMenu) this.mainMenu.classList.add('hidden');
        if (this.subactionsMenu) this.subactionsMenu.classList.remove('hidden');
        this.subactionsMenu.innerHTML = '';

        if (action === 'FIGHT') {
            const moves = [
                { name: '1. Itemized Deduction Receipt', dmg: 20, mp: 0, text: 'You present an itemized pharmacy receipt! The auditor takes 20 DMG!' },
                { name: '2. Bureaucratic Sub-Clause Cite', dmg: 28, mp: 0, text: 'You cite non-existent paragraphs from the Tax Code! Auditor is confused: -28 HP!' },
                { name: '3. Supreme Court Precedent (15 MP)', dmg: 38, mp: 15, text: 'Federal Appeals binding precedent! Critical blow: -38 HP!' }
            ];
            moves.forEach(m => {
                const b = document.createElement('button');
                b.className = 'win-btn';
                b.style.width = '100%';
                b.innerText = m.name;
                b.onclick = () => this.executePlayerMove(m);
                this.subactionsMenu.appendChild(b);
            });
        } else if (action === 'BAG') {
            const items = [
                { name: 'Vending Machine Coffee (+20 HP)', heal: 20, text: 'You drink stale vending machine coffee. Recover 20 HP!' },
                { name: 'Certified Revenue Stamp (+15 MP)', mp: 15, text: 'You attach a certified revenue stamp. Recover 15 MP!' }
            ];
            items.forEach(it => {
                const b = document.createElement('button');
                b.className = 'win-btn';
                b.style.width = '100%';
                b.innerText = it.name;
                b.onclick = () => this.useItem(it);
                this.subactionsMenu.appendChild(b);
            });
        } else if (action === 'STATUTE') {
            const b = document.createElement('button');
            b.className = 'win-btn';
            b.style.width = '100%';
            b.innerText = 'Invoke Taxpayer Bill of Rights (P.L. 104-168)';
            b.onclick = () => {
                this.enemyStunned = true;
                window.AudioMgr.playSfx('blip');
                this.setDialogue("You invoke principles of good faith and due process!\nThe auditor is stunned and will skip the next turn!");
                if (this.subactionsMenu) this.subactionsMenu.classList.add('hidden');
                setTimeout(() => this.executeEnemyTurn(), 1600);
            };
            this.subactionsMenu.appendChild(b);
        } else if (action === 'RUN') {
            const b = document.createElement('button');
            b.className = 'win-btn';
            b.style.width = '100%';
            b.innerText = 'Bicycle Getaway (Impossible to escape IRS)';
            b.onclick = () => {
                this.setDialogue("Cannot escape: Tax database is interconnected via mainframe!");
                if (this.subactionsMenu) this.subactionsMenu.classList.add('hidden');
                setTimeout(() => this.executeEnemyTurn(), 1500);
            };
            this.subactionsMenu.appendChild(b);
        }

        const back = document.createElement('button');
        back.className = 'win-btn';
        back.style.width = '100%';
        back.innerText = '<-- Back';
        back.onclick = () => this.showMainMenu();
        this.subactionsMenu.appendChild(back);
    }

    executePlayerMove(move) {
        if (move.mp > this.playerMp) {
            alert("Insufficient MP points!");
            return;
        }

        this.playerMp -= move.mp;
        this.enemyHp -= move.dmg;
        window.AudioMgr.playSfx('hit');
        this.updateUI();

        if (this.subactionsMenu) this.subactionsMenu.classList.add('hidden');
        this.setDialogue(move.text);

        if (this.enemyHp <= 0) {
            setTimeout(() => this.win(), 1400);
        } else {
            setTimeout(() => this.executeEnemyTurn(), 1800);
        }
    }

    useItem(item) {
        if (item.heal) this.playerHp = Math.min(this.playerMaxHp, this.playerHp + item.heal);
        if (item.mp) this.playerMp = Math.min(this.playerMaxMp, this.playerMp + item.mp);
        window.AudioMgr.playSfx('victory');
        this.updateUI();

        if (this.subactionsMenu) this.subactionsMenu.classList.add('hidden');
        this.setDialogue(item.text);

        setTimeout(() => this.executeEnemyTurn(), 1600);
    }

    executeEnemyTurn() {
        if (this.enemyStunned) {
            this.enemyStunned = false;
            this.setDialogue("The Auditor is still stunned by due process and cannot issue fines!");
            setTimeout(() => this.showMainMenu(), 1400);
            return;
        }

        const enemyMoves = [
            { name: "Demand 2018 receipts", dmg: 12, text: "The Auditor demands receipts for a winter scarf from 2018! You take 12 damage!" },
            { name: "Impose 30% penalty", dmg: 16, text: "Missing schedule line 4B! You suffer 16 tax damage!" },
            { name: "Bank account audit check", dmg: 14, text: "Cross-referencing bank account transfers! You take 14 damage!" }
        ];

        const atk = enemyMoves[Math.floor(Math.random() * enemyMoves.length)];
        this.playerHp -= atk.dmg;
        window.AudioMgr.playSfx('hit');
        this.updateUI();
        document.body.classList.add('screen-shake');
        setTimeout(() => document.body.classList.remove('screen-shake'), 160);

        this.setDialogue(atk.text);

        if (this.playerHp <= 0) {
            setTimeout(() => this.gameOver(), 1500);
        } else {
            setTimeout(() => this.showMainMenu(), 1800);
        }
    }

    win() {
        window.AudioMgr.stopMusic();
        window.AudioMgr.playSfx('victory');
        this.setDialogue("VICTORY!\nThe Auditor concedes and issues an official tax relief decree!\nPhysical attendance validated under Federal Code.");

        setTimeout(() => {
            if (this.container) this.container.classList.add('hidden');
            if (window.onCaptchaSuccess) {
                window.onCaptchaSuccess();
            }
        }, 2200);
    }

    gameOver() {
        window.AudioMgr.stopMusic();
        window.AudioMgr.playSfx('explode');
        this.setDialogue("YOU HAVE BEEN ERASED FROM THE TAX REGISTER!\nAudit notice enforceable immediately.");

        setTimeout(() => {
            if (this.container) this.container.classList.add('hidden');
            alert("You ran out of taxpayer hit points! You can retry the verification.");
        }, 1800);
    }
}

window.CaptchaGame = new CaptchaRpg();

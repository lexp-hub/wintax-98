// audio.js - Motore di Sintesi Audio Procedurale Web Audio API Anni '90

class SoundEngine {
    constructor() {
        this.ctx = null;
        this.currentTrack = null;
        this.currentTrackInterval = null;
        this.currentTrackTimeout = null;
        this.activeNodes = [];
        this.masterGain = null;
        this.musicGain = null;
        this.sfxGain = null;
        this.isMuted = false;
        this.init();
    }

    init() {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
                this.masterGain = this.ctx.createGain();
                this.masterGain.gain.value = 0.5;
                this.masterGain.connect(this.ctx.destination);

                this.musicGain = this.ctx.createGain();
                this.musicGain.gain.value = 0.35;
                this.musicGain.connect(this.masterGain);

                this.sfxGain = this.ctx.createGain();
                this.sfxGain.gain.value = 0.45;
                this.sfxGain.connect(this.masterGain);
            }
        } catch (e) {
            console.warn("AudioContext non supportato:", e);
        }
    }

    resume() {
        if (!this.ctx) this.init();
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playSfx(type) {
        if (!this.ctx || this.isMuted) return;
        this.resume();
        const t = this.ctx.currentTime;

        switch (type) {
            case 'stapler': {
                // Suono cucitrice metallica DOOM
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'square';
                osc.frequency.setValueAtTime(800, t);
                osc.frequency.exponentialRampToValueAtTime(120, t + 0.08);
                gain.gain.setValueAtTime(0.5, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
                osc.connect(gain);
                gain.connect(this.sfxGain);
                osc.start(t);
                osc.stop(t + 0.08);
                break;
            }
            case 'engine': {
                // Rombetto motore auto
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(65, t);
                osc.frequency.linearRampToValueAtTime(110, t + 0.15);
                gain.gain.setValueAtTime(0.2, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
                osc.connect(gain);
                gain.connect(this.sfxGain);
                osc.start(t);
                osc.stop(t + 0.15);
                break;
            }
            case 'screech': {
                // Frenata/sgommata auto
                const bufferSize = this.ctx.sampleRate * 0.2;
                const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
                const noise = this.ctx.createBufferSource();
                noise.buffer = buffer;
                const filter = this.ctx.createBiquadFilter();
                filter.type = 'bandpass';
                filter.frequency.setValueAtTime(2800, t);
                filter.Q.value = 6;
                const gain = this.ctx.createGain();
                gain.gain.setValueAtTime(0.4, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
                noise.connect(filter);
                filter.connect(gain);
                gain.connect(this.sfxGain);
                noise.start(t);
                break;
            }
            case 'hit': {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(180, t);
                osc.frequency.exponentialRampToValueAtTime(40, t + 0.2);
                gain.gain.setValueAtTime(0.4, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
                osc.connect(gain);
                gain.connect(this.sfxGain);
                osc.start(t);
                osc.stop(t + 0.2);
                break;
            }
            case 'explode': {
                const bufferSize = this.ctx.sampleRate * 0.35;
                const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
                const noise = this.ctx.createBufferSource();
                noise.buffer = buffer;
                const filter = this.ctx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(600, t);
                filter.frequency.exponentialRampToValueAtTime(40, t + 0.35);
                const gain = this.ctx.createGain();
                gain.gain.setValueAtTime(0.6, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);
                noise.connect(filter);
                filter.connect(gain);
                gain.connect(this.sfxGain);
                noise.start(t);
                break;
            }
            case 'laser': {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(900, t);
                osc.frequency.exponentialRampToValueAtTime(150, t + 0.12);
                gain.gain.setValueAtTime(0.25, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
                osc.connect(gain);
                gain.connect(this.sfxGain);
                osc.start(t);
                osc.stop(t + 0.12);
                break;
            }
            case 'blip': {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(750, t);
                gain.gain.setValueAtTime(0.18, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.04);
                osc.connect(gain);
                gain.connect(this.sfxGain);
                osc.start(t);
                osc.stop(t + 0.04);
                break;
            }
            case 'select': {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(500, t);
                osc.frequency.setValueAtTime(750, t + 0.04);
                gain.gain.setValueAtTime(0.2, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
                osc.connect(gain);
                gain.connect(this.sfxGain);
                osc.start(t);
                osc.stop(t + 0.08);
                break;
            }
            case 'victory': {
                const notes = [440, 554.37, 659.25, 880];
                notes.forEach((freq, idx) => {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'square';
                    osc.frequency.value = freq;
                    const st = t + idx * 0.1;
                    gain.gain.setValueAtTime(0.22, st);
                    gain.gain.exponentialRampToValueAtTime(0.01, st + 0.22);
                    osc.connect(gain);
                    gain.connect(this.sfxGain);
                    osc.start(st);
                    osc.stop(st + 0.22);
                });
                break;
            }
            case 'demon_growl': {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(95, t);
                osc.frequency.linearRampToValueAtTime(45, t + 0.25);
                const filter = this.ctx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(260, t);
                gain.gain.setValueAtTime(0.35, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);
                osc.connect(filter);
                filter.connect(gain);
                gain.connect(this.sfxGain);
                osc.start(t);
                osc.stop(t + 0.25);
                break;
            }
            case 'chord': {
                // Autentico accordo di errore Windows (Chord.wav)
                const chordNotes = [130.81, 155.56, 185.00, 220.00];
                chordNotes.forEach(freq => {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(freq, t);
                    gain.gain.setValueAtTime(0.18, t);
                    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
                    osc.connect(gain);
                    gain.connect(this.sfxGain);
                    osc.start(t);
                    osc.stop(t + 0.45);
                });
                break;
            }
            case 'ding': {
                // Classico Ding.wav di avviso
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(1046.5, t); // C6
                gain.gain.setValueAtTime(0.35, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
                osc.connect(gain);
                gain.connect(this.sfxGain);
                osc.start(t);
                osc.stop(t + 0.35);
                break;
            }
            case 'tada': {
                // Classico Ta-da.wav di successo
                const arpeg = [523.25, 659.25, 783.99, 1046.50];
                arpeg.forEach((freq, idx) => {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(freq, t + idx * 0.08);
                    const dur = (idx === arpeg.length - 1) ? 0.6 : 0.15;
                    gain.gain.setValueAtTime(0.25, t + idx * 0.08);
                    gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + dur);
                    osc.connect(gain);
                    gain.connect(this.sfxGain);
                    osc.start(t + idx * 0.08);
                    osc.stop(t + idx * 0.08 + dur);
                });
                break;
            }
        }
    }

    playStartup() {
        try {
            if (!this.ctx || this.isMuted) return;
            this.resume();
            const t = this.ctx.currentTime;
            // Windows 98 inspired harmonic ambient chord chime
            const notes = [261.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
            notes.forEach((freq, i) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = i % 2 === 0 ? 'sine' : 'triangle';
                osc.frequency.setValueAtTime(freq, t + i * 0.08);
                gain.gain.setValueAtTime(0.15, t + i * 0.08);
                gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 1.6);
                osc.connect(gain);
                gain.connect(this.masterGain || this.ctx.destination);
                osc.start(t + i * 0.08);
                osc.stop(t + i * 0.08 + 1.6);
            });
        } catch (e) {
            console.warn("Error playing startup chime:", e);
        }
    }

    stopMusic() {
        if (this.currentTrackTimeout) {
            clearTimeout(this.currentTrackTimeout);
            this.currentTrackTimeout = null;
        }
        if (this.currentTrackInterval) {
            clearInterval(this.currentTrackInterval);
            this.currentTrackInterval = null;
        }
        if (this.activeNodes) {
            this.activeNodes.forEach(node => {
                try { node.stop(); node.disconnect(); } catch (e) {}
            });
            this.activeNodes = [];
        }
        this.currentTrack = null;
    }

    // 1. DOOM E1M1 Heavy Metal Riff (At Doom's Gate)
    playDoomMetal() {
        if (!this.ctx || this.isMuted) return;
        this.stopMusic();
        this.resume();
        this.currentTrack = 'doom';

        const E1 = 82.41, G1 = 98.00, Bb1 = 116.54, A1 = 110.00, B1 = 123.47;
        const e1m1Notes = [
            E1, E1, E1 * 2, E1, E1, G1, E1, E1, Bb1, E1, E1, A1, E1, E1, Bb1, B1,
            E1, E1, E1 * 2, E1, E1, G1, E1, E1, Bb1, E1, E1, A1, E1, E1, Bb1, B1
        ];

        let idx = 0;
        const noteDuration = 0.11; // ~136 BPM

        this.currentTrackInterval = setInterval(() => {
            if (this.currentTrack !== 'doom') return;
            const freq = e1m1Notes[idx % e1m1Notes.length];
            const t = this.ctx.currentTime;

            // Distorted Sawtooth Guitar Bass
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, t);

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(900, t);
            filter.Q.value = 4;

            gain.gain.setValueAtTime(0.28, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + noteDuration * 0.9);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.musicGain);

            osc.start(t);
            osc.stop(t + noteDuration * 0.9);

            // Cassa batteria ogni 4 note
            if (idx % 4 === 0) {
                const kick = this.ctx.createOscillator();
                const kGain = this.ctx.createGain();
                kick.type = 'sine';
                kick.frequency.setValueAtTime(130, t);
                kick.frequency.exponentialRampToValueAtTime(35, t + 0.08);
                kGain.gain.setValueAtTime(0.4, t);
                kGain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
                kick.connect(kGain);
                kGain.connect(this.musicGain);
                kick.start(t);
                kick.stop(t + 0.1);
            }

            idx++;
        }, noteDuration * 1000);
    }

    // 2. OutRun / Lotus Esprit Retro 90s Car Racer Theme (140 BPM)
    playOutrunTheme() {
        if (!this.ctx || this.isMuted) return;
        this.stopMusic();
        this.resume();
        this.currentTrack = 'outrun';

        const bassScale = [110, 110, 130.81, 146.83, 164.81, 146.83, 130.81, 110];
        const leadScale = [220, 261.63, 293.66, 329.63, 392, 440, 523.25, 587.33];
        let step = 0;
        const stepTime = 0.11;

        this.currentTrackInterval = setInterval(() => {
            if (this.currentTrack !== 'outrun') return;
            const t = this.ctx.currentTime;

            // Basso slap arcade
            const bassOsc = this.ctx.createOscillator();
            const bGain = this.ctx.createGain();
            bassOsc.type = 'triangle';
            bassOsc.frequency.setValueAtTime(bassScale[step % bassScale.length], t);
            bGain.gain.setValueAtTime(0.3, t);
            bGain.gain.exponentialRampToValueAtTime(0.01, t + stepTime * 0.8);
            bassOsc.connect(bGain);
            bGain.connect(this.musicGain);
            bassOsc.start(t);
            bassOsc.stop(t + stepTime * 0.8);

            // Lead Synth melodico
            if (step % 2 === 0) {
                const leadOsc = this.ctx.createOscillator();
                const lGain = this.ctx.createGain();
                leadOsc.type = 'sawtooth';
                leadOsc.frequency.setValueAtTime(leadScale[(step * 2) % leadScale.length], t);
                lGain.gain.setValueAtTime(0.14, t);
                lGain.gain.exponentialRampToValueAtTime(0.01, t + stepTime * 1.6);
                leadOsc.connect(lGain);
                lGain.connect(this.musicGain);
                leadOsc.start(t);
                leadOsc.stop(t + stepTime * 1.6);
            }

            // Ritmo batteria
            if (step % 4 === 0) {
                const kick = this.ctx.createOscillator();
                const kGain = this.ctx.createGain();
                kick.type = 'sine';
                kick.frequency.setValueAtTime(140, t);
                kick.frequency.exponentialRampToValueAtTime(40, t + 0.08);
                kGain.gain.setValueAtTime(0.35, t);
                kGain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
                kick.connect(kGain);
                kGain.connect(this.musicGain);
                kick.start(t);
                kick.stop(t + 0.1);
            }

            step++;
        }, stepTime * 1000);
    }

    // 3. 90s RPG Battle Theme (Stile Pokémon / Final Fantasy DOS)
    playRpgBattleTheme() {
        if (!this.ctx || this.isMuted) return;
        this.stopMusic();
        this.resume();
        this.currentTrack = 'rpg';

        const notes = [
            146.83, 146.83, 293.66, 220, 207.65, 196, 174.61, 146.83, 174.61, 196,
            130.81, 130.81, 261.63, 196, 185, 174.61, 155.56, 130.81, 155.56, 174.61
        ];

        let step = 0;
        const dur = 0.12;

        this.currentTrackInterval = setInterval(() => {
            if (this.currentTrack !== 'rpg') return;
            const t = this.ctx.currentTime;
            const freq = notes[step % notes.length];

            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(freq, t);

            gain.gain.setValueAtTime(0.18, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + dur * 0.9);

            osc.connect(gain);
            gain.connect(this.musicGain);
            osc.start(t);
            osc.stop(t + dur * 0.9);

            step++;
        }, dur * 1000);
    }
}

window.AudioMgr = new SoundEngine();

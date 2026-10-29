# WinTax 98 (Second Edition) 🏛️💾

An authentic, fully-featured parody of Windows 98 and IRS tax filing bureaucracy built entirely with HTML5, CSS3, Web Audio API, and vanilla JavaScript (zero external dependencies).

Featuring classic window management, desktop shortcuts, taskbar, start menu, system dialogs, sound synthesizer, retro applications, and nostalgic 90s minigames required to file your annual tax return.

---

## 🖥️ Operating System Features

- **Classic Window Manager (`desktop.js`)**:
  - Drag-and-drop windows with boundary constraints.
  - Minimize, Maximize/Restore, and Close functionality with state memory.
  - Active focus ordering with dynamic Z-Index tracking.
  - Authentic Windows 98 Taskbar with running application tabs and live system clock.
  - Classic Start Menu with hierarchical navigation (`Programs`, `Documents`, `Settings`, `Run...`, `Shut Down`).
- **Authentic Desktop**:
  - Pixel-perfect retro icons with desktop selection & double-click activation.
  - Custom wallpaper support via Display Properties.
- **In-Site Modal System Dialogs (`win-msgbox`)**:
  - Complete replacement of native browser `alert()` and `confirm()` with authentic Windows 98 beveled message boxes.
  - Dynamic audio feedback (`chord.wav`, `ding.wav`, `tada.wav`).

---

## 📦 Bundled Applications

| Program | Executable | Description |
|---|---|---|
| **TaxReturn 4.2** | `entratel.exe` | IRS Form 1040 & Schedule-A electronic filing system with automated tax computation and validation locks. |
| **MS Paint** | `pbrush.exe` | Classic paint program with 2-column toolbox (Pen, Brush, Eraser, Flood Fill Bucket), 28-color palette, and official audit stamps (`IRS APPROVED`, `AUDIT REJECTED`, `TOP SECRET TAX`). |
| **Task Manager** | `taskmgr.exe` | Live 3-tab task manager: active window list with *End Task*, tax process viewer, and real-time canvas CPU oscilloscope. |
| **Control Panel** | `control.exe` | Applets for Display Properties (desktop color themes), System Properties (Pentium 133 MHz specs), Audio test, Network, and Add/Remove Programs. |
| **Financial Calculator** | `calc.exe` | 90s LCD calculator with math memory, `+22% VAT`, and `-20% Withholding` tax buttons. |
| **DOS Prompt** | `command.com` | Fullscreen/windowed interactive command line (`C:\TAX_DOCUMENTS>`) with `DIR`, `HELP`, `CLS`, `VER`, `TASSE`, and app launchers. |
| **File Explorer** | `explorer.exe` | Hierarchical drive tree (`C:\`, `A:\`, `D:\`) with browsable files and double-click launcher. |
| **Minesweeper** | `winmine.exe` | Classic retro minesweeper with smiley face and digital counter. |
| **Notepad** | `notepad.exe` | Clean plain-text editor with tax auditor guidelines. |

---

## 🕹️ Bureaucratic Minigames

To successfully transmit Form 1040 to the central IRS mainframe, the taxpayer must conquer three bureaucratic challenges:

1. **`DOOM_TAX.EXE` (3D Raycaster Engine)**:
   - Wolfenstein/DOOM-style raycasting 3D engine in HTML5 Canvas.
   - Armed with an office stapler, clear out the dark basement archive corridors full of floating tax audit notices.
   - Dynamic bureaucratic mugshot HUD tracking player health and stapler ammo.
2. **`PANDA_RACE.EXE` (Retro Pseudo-3D Road Racer)**:
   - Outrun IRS highway patrol cars behind the wheel of a classic 1990s Fiat Panda.
   - Nitro boost, road curves, perspective scaling, and tire screech audio synthesis.
3. **`Audit RPG 90s` (Turn-Based Battle)**:
   - 90s Game Boy / SNES style turn-based battle against a wild Level 42 Tax Auditor.
   - Use itemized pharmacy receipts, cite fabricated tax sub-clauses, or invoke the Taxpayer Bill of Rights.

---

## 🔊 Sound & Audio Engine (`audio.js`)

WinTax 98 includes a standalone procedural sound generator using the Web Audio API:
- Synthesized Windows startup chime (`ta-da`).
- System chords, critical errors, warning dings, and click SFX.
- 8-bit chiptune battle themes and racing engine frequencies.
- Zero external MP3/WAV dependencies.

---

## 🚀 Running Locally

No build step or Node.js runtime required. Simply serve the directory with any static HTTP server:

```bash
# Python 3
python3 -m http.server 8080

# Or Node.js
npx serve .
```

Open your browser and navigate to `http://localhost:8080/`.

---

## 📜 License

MIT License. Educational and parody project.

# CYBER DRAUGHTS // 10×10 INTERNATIONAL CHECKERS PROTOCOL

A premium, web-based International Checkers (Draughts) cockpit game featuring interactive cyberpunk audio-visual FX, procedural Web Audio API synthesis, complete FMJD draughts mechanics with chain captures and flying kings, and an adaptive tactical Minimax AI opponent engine.

Built with **HTML5**, **CSS3**, and **Vanilla JavaScript** (Zero external dependencies, zero external audio assets).

---

## 🎮 LIVE PLAY & QUICK START

The game is completely standalone. Simply open `index.html` in any modern web browser (Edge, Chrome, Firefox, Safari):

- Location 1: `cyberpunk-checkers/index.html`
- Location 2: Root scratch directory: `index.html`

Double click `index.html` or drag it into your browser window to immediately enter the cockpit.

---

## ⚡ CORE FEATURES & SPECIFICATIONS

### 1. Intro Splash Screen & Cinematic Sound
- **Full-Screen Cyberpunk Splash Screen**: Renders upon loading with an animated cyber grid backdrop, radial vignette, and glowing neon typography.
- **Glitch Text Effect**: Prominently displays the text **"Fatxulloning birinchi dasturi"** using dual-channel cyan & magenta chromatic glitch displacements.
- **Procedural "Joker Theme" Soundtrack**: Synthesizes a haunting, cinematic D-minor cello motif inspired by Hildur Guðnadóttir's Joker score (deep D2/D1 sub-drone, bowed solo cello lead with pitch vibrato and resonant filter sweeps).
- **3-Second Auto-Fade**: An animated progress loader runs for 3 seconds before smoothly fading out into the cockpit, or immediately when the user clicks or presses any key.

### 2. Protocol Pause System
- **Stylized Neon Pause Button**: Positioned in the header cockpit telemetry cluster (marked with the dual vertical bar `||` glyph).
- **Match Freeze**: Freezes the 30-second turn countdown clock, disables all unit selection and movement on the board, and logs the freeze event.
- **Neon Dim Overlay**: Centers an illuminated `"PROTOCOL PAUSED"` HUD panel over the dimmed board with a `RESUME PROTOCOL` button.
- **Hotkeys**: Pressing `[Space]` or `[P]` toggles the pause state instantly.

### 3. Aesthetics & Special Visual Effects
- **Cockpit Interface**: Deep charcoal gray carbon framework (`#07090d`, `#0e1219`) with CRT scanlines, glassmorphism telemetry docks, and futuristic neon typography (Orbitron, Rajdhani, Share Tech Mono).
- **10×10 Matrix Board**:
  - Full 10×10 grid layout with 50 dark playable squares and 40 starting units (20 Cyan vs 20 Magenta).
  - Glowing HUD border dynamically pulsing in the active commander's color (Neon Cyan `#00f0ff` for Player 1, Neon Magenta `#ff007f` for Player 2 / AI).
  - Alphanumeric coordinate rulers (A–J on top/bottom, 10–1 on left/right) and optional toggleable Draughts square numbers (1–50).
- **Interactivity FX (Hardware-Accelerated Canvas Engine)**:
  - **Radar Pulsing**: Clicking any piece triggers expanding concentric cyber sonar rings with fading opacity.
  - **Destination Highlights**: High-tech animated dashed glowing neon vector paths traced from the selected piece to all viable landing cells, complete with corner landing reticles.
  - **Particle Dissolve**: When enemy units are captured, triggers a digital disintegration explosion spawning 50+ glowing neon micro-voxels, sparks, and energy shards dissolving in real time.
  - **Overdrive King Promotion**: When a piece crowns on the opponent's back rank, triggers an intense shockwave flare with ascending sparkles and equips the piece with an elite holographic rotating crown ring and golden core insignia.

### 4. Procedural Web Audio API Engine (`script.js`)
*Synthesized purely with browser AudioContext oscillators, wave shapers, and biquad filters — no audio files required.*
- **Cinematic Joker Theme**: Procedural dark cello synth motif with deep sub-bass and warm harmonics.
- **Digital Click**: Bandpass-filtered resonant high-pitch synthesizer chirp for UI buttons and piece selection.
- **Soft Vector Swoosh**: Modulated noise buffer sweep with exponential envelope for smooth piece motion.
- **Dynamic Synthetic Bass Blast**: Heavy 808 sub-bass drop (sweeping from 140Hz down to 36Hz) paired with a punchy transient kick and wave-shaping distortion for captures.
- **Overdrive Promotion Fanfare**: Ascending cyber synthesizer arpeggio (G4–C5–E5–G5–C6) with resonant low-pass filter opening.
- **Pause & Resume Cues**: Descending power-freeze tone for pause, ascending power-thaw chime for resume.
- **Miltillash Warning Alarm**: Urgent dual-frequency alert chirps (880Hz / 1175Hz) triggered when time is critical.
- **Victory & Defeat Stingers**: Shimmering C-major cyber chord for victory, descending glitch bass rumble for defeat.
- **Audio Controls**: Mute/Unmute SFX button, Joker Theme OST toggle button (`OST ON` / `OST OFF`), and master volume slider.

### 3. Complete International Checkers (10×10 Draughts) Mechanics
- **30-Second Digital Gauge & Miltillash Protocol**:
  - Circular SVG tachometer showing real-time second countdown.
  - **Miltillash Alert**: Activates at **≤ 5 seconds**, pulsing emergency red borders, flashing warning badge, and audio klaxon chirps.
  - If the timer hits zero, the turn auto-passes (or executes a forced legal move).
- **Movement & Mandatory Captures**:
  - Click-to-move input system with validation.
  - **Mandatory Capture Rule**: If an enemy capture exists, capturing is strictly mandatory.
  - **Majority Rule (Rule of Maximum Captures)**: If multiple capture sequences exist, players must execute the path that captures the highest number of pieces.
  - **Backward Capture for Men**: Regular men step forward, but can jump both **forward and backward** to capture enemy pieces.
  - **Flying Kings**: Kings slide any distance diagonally and can capture enemy pieces across long diagonals, landing on any open square beyond the jumped unit.
  - **Sequential Chain Jumps**: Multi-jumps must be completed step-by-step within the active turn. Captured pieces are removed once the full jump sequence concludes.
- **Combat Telemetry & History Terminal**:
  - Side-docked scrollable terminal recording standard Draughts / algebraic notation (e.g., `1. C4-D5`, `2. F6xD4 [x]`, `[CROWN]`).
  - Functioning **"Undo Move"** button that rolls back board matrices, piece counts, turn state, and terminal logs.
  - One-click **"Notation Copy"** button to copy full match PGN/algebraic history to the clipboard.

### 4. Expert Tactical AI Engine
- **Minimax with Alpha-Beta Pruning**:
  - Automatically identifies and executes mandatory captures first.
  - Evaluates search trees (Depth 1 to 4 depending on selected difficulty: Novice, Tactical, Apex).
  - Move ordering prioritizing captures to maximize alpha-beta cutoffs.
- **Tactical Heuristic Parameters**:
  - **Material Balance**: Men = 100, Kings = 320.
  - **Unit Security**: Edge vulnerability penalties and diagonal support pairing bonuses.
  - **Back Row Defense**: Heavy protection bonus (+35) for maintaining units on row 0 to prevent enemy coronation.
  - **Advancement Pressure**: Positional weighting rewarding men advancing toward promotion ranks.
  - **Central Dominance**: Bonus for occupying central squares (columns D, E, F, G; ranks 4–5).
  - **Threat Targeting**: Active hunting and restricting enemy kings.
- **Real-Time Neural Telemetry Readout**: Displays AI search depth, nodes evaluated, heuristic evaluation score, and calculation cycle time in milliseconds.

---

## 📁 REPOSITORY STRUCTURE

```
cyberpunk-checkers/
├── index.html            # Cockpit HUD layout, SVGs, grid viewport, terminals, modals
├── style.css             # Cyberpunk theme, neon palettes, CRT scanlines, animations
├── script.js             # Web Audio synth, Canvas FX, FMJD 10x10 Engine, Minimax AI
├── test-suite.html       # Automated headless verification test suite (25 test cases)
└── README.md             # Complete architecture and rulebook documentation
```

---

## 🛡️ INTERNATIONAL CHECKERS QUICK RULES CHEAT SHEET
1. Board has 100 squares; play is restricted to the 50 dark squares.
2. Regular men move diagonally forward 1 step.
3. Regular men can capture diagonally both FORWARD and BACKWARD.
4. Flying Kings move any number of empty squares along all 4 diagonals.
5. Captures are strictly mandatory; must execute the sequence capturing the most pieces.
6. A man only crowns into a King if it ends its turn on the opponent's back rank.

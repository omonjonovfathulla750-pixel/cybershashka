/**
 * CYBER DRAUGHTS // 10x10 INTERNATIONAL CHECKERS PROTOCOL
 * Core Game Engine, Procedural Web Audio API, Canvas FX, and Tactical AI
 */

(function () {
  'use strict';

  /* =========================================================================
     1. PROCEDURAL WEB AUDIO SYNTHESIZER (NO EXTERNAL AUDIO FILES)
     ========================================================================= */
  class CyberAudioEngine {
    constructor() {
      this.ctx = null;
      this.masterGain = null;
      this.musicGain = null;
      this.enabled = true;
      this.musicEnabled = true;
      this.volume = 0.7;
      this.musicVolume = 0.45;
      this.jokerThemePlaying = false;
      this.jokerLoopTimeout = null;
      this.jokerDroneOsc = null;
      this.jokerDroneGain = null;
      this.activeMelodyOsc = null;
    }

    init() {
      if (this.ctx) return;
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContextClass();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);

        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
        this.musicGain.connect(this.masterGain);
      } catch (e) {
        console.warn('Web Audio API not supported or initialized:', e);
      }
    }

    ensureContext() {
      if (!this.ctx) this.init();
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    setVolume(val) {
      this.volume = Math.max(0, Math.min(1, val));
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
        this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      }
    }

    toggleMute() {
      this.enabled = !this.enabled;
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.setValueAtTime(this.enabled ? this.volume : 0, this.ctx.currentTime);
      }
      return this.enabled;
    }

    toggleMusic() {
      this.musicEnabled = !this.musicEnabled;
      if (this.musicEnabled) {
        this.startJokerTheme();
      } else {
        this.stopJokerTheme();
      }
      return this.musicEnabled;
    }

    /**
     * Cinematic "Joker Theme" Procedural Dark Cello Synthesizer Suite
     * Inspired by Hildur Guðnadóttir's acclaimed minor cello motif (D minor).
     * Synthesized purely via Web Audio API oscillators, wave shapers, and LFO vibrato.
     */
    startJokerTheme() {
      if (!this.musicEnabled) return;
      this.ensureContext();
      if (!this.ctx) return;
      if (this.jokerThemePlaying) return;

      this.jokerThemePlaying = true;
      const t = this.ctx.currentTime;

      // 1. Deep Sub-Bass D Cello Drone
      try {
        this.jokerDroneOsc = this.ctx.createOscillator();
        const droneSub = this.ctx.createOscillator();
        this.jokerDroneGain = this.ctx.createGain();
        const droneFilter = this.ctx.createBiquadFilter();

        droneFilter.type = 'lowpass';
        droneFilter.frequency.setValueAtTime(140, t);

        this.jokerDroneOsc.type = 'sawtooth';
        this.jokerDroneOsc.frequency.setValueAtTime(73.42, t); // D2
        droneSub.type = 'sine';
        droneSub.frequency.setValueAtTime(36.71, t); // D1

        this.jokerDroneGain.gain.setValueAtTime(0.001, t);
        this.jokerDroneGain.gain.linearRampToValueAtTime(0.28, t + 2.0);

        this.jokerDroneOsc.connect(droneFilter);
        droneSub.connect(droneFilter);
        droneFilter.connect(this.jokerDroneGain);
        this.jokerDroneGain.connect(this.musicGain);

        this.jokerDroneOsc.start(t);
        droneSub.start(t);
        this.droneSubOsc = droneSub;
      } catch (e) {
        console.warn('Drone oscillator error:', e);
      }

      // 2. Play Melancholic Solo Cello Motif Loop
      // Notes: D3 -> F3 -> E3 -> D3 -> C#3 -> D3 -> Bb2 -> A2
      const melodyNotes = [
        { freq: 146.83, dur: 2.2 }, // D3
        { freq: 174.61, dur: 1.8 }, // F3
        { freq: 164.81, dur: 2.0 }, // E3
        { freq: 146.83, dur: 2.5 }, // D3
        { freq: 138.59, dur: 2.2 }, // C#3
        { freq: 146.83, dur: 2.0 }, // D3
        { freq: 116.54, dur: 2.4 }, // Bb2
        { freq: 110.00, dur: 3.0 }  // A2
      ];

      let noteIndex = 0;
      const scheduleNextNote = () => {
        if (!this.jokerThemePlaying || !this.musicEnabled) return;
        const note = melodyNotes[noteIndex];
        noteIndex = (noteIndex + 1) % melodyNotes.length;

        this.playCelloNote(note.freq, note.dur);
        this.jokerLoopTimeout = setTimeout(scheduleNextNote, note.dur * 1000 * 0.95);
      };

      // Start first phrase after brief atmospheric swell
      this.jokerLoopTimeout = setTimeout(scheduleNextNote, 600);
    }

    playCelloNote(freq, duration) {
      if (!this.ctx || !this.musicEnabled) return;
      const t = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // Cello timbre: sawtooth with warm resonant lowpass filter
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);

      // Subtle LFO Pitch Vibrato (~4.5 Hz)
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(4.5, t);
      lfoGain.gain.setValueAtTime(2.2, t); // Vibrato depth
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start(t);
      lfo.stop(t + duration);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, t);
      filter.frequency.linearRampToValueAtTime(750, t + duration * 0.4);
      filter.frequency.exponentialRampToValueAtTime(280, t + duration);
      filter.Q.setValueAtTime(3.0, t);

      // Bowed string envelope (slow attack, sustained tone, gentle release)
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.32, t + duration * 0.25);
      gain.gain.setValueAtTime(0.28, t + duration * 0.7);
      gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      osc.start(t);
      osc.stop(t + duration + 0.1);
    }

    stopJokerTheme() {
      this.jokerThemePlaying = false;
      if (this.jokerLoopTimeout) {
        clearTimeout(this.jokerLoopTimeout);
        this.jokerLoopTimeout = null;
      }
      if (this.jokerDroneGain && this.ctx) {
        try {
          const t = this.ctx.currentTime;
          this.jokerDroneGain.gain.linearRampToValueAtTime(0.001, t + 0.6);
          setTimeout(() => {
            if (this.jokerDroneOsc) {
              this.jokerDroneOsc.stop();
              this.jokerDroneOsc = null;
            }
            if (this.droneSubOsc) {
              this.droneSubOsc.stop();
              this.droneSubOsc = null;
            }
          }, 650);
        } catch (e) {}
      }
    }

    /**
     * Pause Protocol Audio Cue (Descending Power-Freeze)
     */
    playPauseSound() {
      if (!this.enabled) return;
      this.ensureContext();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, t);
      filter.frequency.exponentialRampToValueAtTime(180, t + 0.22);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(540, t);
      osc.frequency.exponentialRampToValueAtTime(110, t + 0.22);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.26);
    }

    /**
     * Resume Protocol Audio Cue (Ascending Power-Thaw)
     */
    playResumeSound() {
      if (!this.enabled) return;
      this.ensureContext();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(220, t);
      filter.frequency.exponentialRampToValueAtTime(2400, t + 0.2);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.exponentialRampToValueAtTime(680, t + 0.2);

      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.26);
    }

    /**
     * Digital Click Audio Trigger (UI button click, piece select)
     */
    playClick() {
      if (!this.enabled) return;
      this.ensureContext();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2400, t);
      filter.Q.setValueAtTime(6, t);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1800, t);
      osc.frequency.exponentialRampToValueAtTime(600, t + 0.04);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.05);
    }

    /**
     * Soft Vector Swoosh (Piece motion / slide)
     */
    playSwoosh() {
      if (!this.enabled) return;
      this.ensureContext();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      const dur = 0.22;

      // Filtered White Noise Generator
      const bufferSize = this.ctx.sampleRate * dur;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(400, t);
      filter.frequency.exponentialRampToValueAtTime(1400, t + dur * 0.5);
      filter.frequency.exponentialRampToValueAtTime(300, t + dur);
      filter.Q.setValueAtTime(3.5, t);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.001, t);
      noiseGain.gain.linearRampToValueAtTime(0.35, t + dur * 0.35);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + dur);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.masterGain);

      // Sub-pitch vector tone
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, t);
      osc.frequency.exponentialRampToValueAtTime(440, t + dur * 0.5);
      osc.frequency.exponentialRampToValueAtTime(160, t + dur);

      oscGain.gain.setValueAtTime(0.01, t);
      oscGain.gain.linearRampToValueAtTime(0.18, t + dur * 0.3);
      oscGain.gain.exponentialRampToValueAtTime(0.001, t + dur);

      osc.connect(oscGain);
      oscGain.connect(this.masterGain);

      noise.start(t);
      osc.start(t);
      noise.stop(t + dur);
      osc.stop(t + dur);
    }

    /**
     * Dynamic Synthetic Bass Blast (Capture & Disintegration)
     */
    playBassBlast() {
      if (!this.enabled) return;
      this.ensureContext();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      const dur = 0.55;

      // 808 Sub-Drop Oscillator
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(140, t);
      subOsc.frequency.exponentialRampToValueAtTime(36, t + 0.35);

      subGain.gain.setValueAtTime(0.85, t);
      subGain.gain.exponentialRampToValueAtTime(0.001, t + dur);

      // Punch transient click
      const punchOsc = this.ctx.createOscillator();
      const punchGain = this.ctx.createGain();
      punchOsc.type = 'triangle';
      punchOsc.frequency.setValueAtTime(260, t);
      punchOsc.frequency.exponentialRampToValueAtTime(40, t + 0.08);

      punchGain.gain.setValueAtTime(0.5, t);
      punchGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

      // Drive Waveshaper for grit
      const shaper = this.ctx.createWaveShaper();
      const n_samples = 256;
      const curve = new Float32Array(n_samples);
      for (let i = 0; i < n_samples; ++i) {
        const x = (i * 2) / n_samples - 1;
        curve[i] = ((3 + 2) * x * 20 * (Math.PI / 180)) / (Math.PI + 2 * Math.abs(x));
      }
      shaper.curve = curve;

      subOsc.connect(subGain);
      subGain.connect(shaper);
      shaper.connect(this.masterGain);

      punchOsc.connect(punchGain);
      punchGain.connect(this.masterGain);

      subOsc.start(t);
      punchOsc.start(t);
      subOsc.stop(t + dur);
      punchOsc.stop(t + 0.09);
    }

    /**
     * Overdrive King Promotion Fanfare
     */
    playPromotion() {
      if (!this.enabled) return;
      this.ensureContext();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      const freqs = [392.0, 523.25, 659.25, 783.99, 1046.5]; // G4, C5, E5, G5, C6
      const noteDur = 0.09;

      freqs.forEach((freq, idx) => {
        const noteTime = t + idx * noteDur;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, noteTime);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, noteTime);
        filter.frequency.exponentialRampToValueAtTime(4000, noteTime + noteDur * 2);

        gain.gain.setValueAtTime(0.25, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.35);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc.start(noteTime);
        osc.stop(noteTime + 0.4);
      });
    }

    /**
     * Miltillash Warning Alert Chirp (Turn timer <= 5s)
     */
    playWarningBeep() {
      if (!this.enabled) return;
      this.ensureContext();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(880, t);
      osc.frequency.setValueAtTime(1174.66, t + 0.06);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.setValueAtTime(0.01, t + 0.12);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.13);
    }

    /**
     * Victory Fanfare Synth
     */
    playVictory() {
      if (!this.enabled) return;
      this.ensureContext();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      const chord = [261.63, 329.63, 392.00, 523.25, 659.25]; // C major chord
      chord.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.5, t + 0.8);

        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(t + i * 0.05);
        osc.stop(t + 1.3);
      });
    }

    /**
     * Defeat Glitch Drone
     */
    playDefeat() {
      if (!this.enabled) return;
      this.ensureContext();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, t);
      osc.frequency.exponentialRampToValueAtTime(45, t + 1.0);

      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.1);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 1.2);
    }
  }

  /* =========================================================================
     2. HARDWARE-ACCELERATED CANVAS FX ENGINE (RADAR, PATHS, PARTICLES, PROMOTIONS)
     ========================================================================= */
  class CanvasFXEngine {
    constructor(canvas, boardViewport) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.viewport = boardViewport;
      this.particles = [];
      this.radarWaves = [];
      this.activePaths = [];
      this.shockwaves = [];
      this.animId = null;
      this.dashOffset = 0;
      this.lastTime = performance.now();
      this.dpr = window.devicePixelRatio || 1;

      this.resize();
      window.addEventListener('resize', () => this.resize());
      if (window.ResizeObserver) {
        new ResizeObserver(() => this.resize()).observe(this.viewport);
      }
      this.loop = this.loop.bind(this);
      this.start();
    }

    resize() {
      const rect = this.viewport.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      this.dpr = window.devicePixelRatio || 1;
      this.width = rect.width;
      this.height = rect.height;
      this.canvas.width = Math.round(this.width * this.dpr);
      this.canvas.height = Math.round(this.height * this.dpr);
      this.canvas.style.width = `${this.width}px`;
      this.canvas.style.height = `${this.height}px`;
    }

    start() {
      if (!this.animId) {
        this.lastTime = performance.now();
        this.loop();
      }
    }

    getCellCenter(row, col) {
      const cellW = this.width / 10;
      const cellH = this.height / 10;
      return {
        x: (col + 0.5) * cellW,
        y: (row + 0.5) * cellH,
        cellW,
        cellH
      };
    }

    /**
     * Trigger Radar Pulsing on piece click
     */
    spawnRadar(row, col, color = '#00f0ff') {
      const { x, y, cellW } = this.getCellCenter(row, col);
      this.radarWaves.push({
        x,
        y,
        radius: cellW * 0.3,
        maxRadius: cellW * 1.8,
        color,
        alpha: 1.0,
        speed: cellW * 3.0
      });
    }

    /**
     * Set Destination Highlight Paths (Dashed glowing vectors)
     */
    setPaths(fromSquare, destinationSquares, color = '#00f0ff') {
      if (!fromSquare || !destinationSquares || destinationSquares.length === 0) {
        this.activePaths = [];
        return;
      }
      const fromR = fromSquare.r !== undefined ? fromSquare.r : fromSquare.row;
      const fromC = fromSquare.c !== undefined ? fromSquare.c : fromSquare.col;
      const start = this.getCellCenter(fromR, fromC);

      this.activePaths = destinationSquares.map(dest => {
        const targetR = dest.r !== undefined ? dest.r : dest.row;
        const targetC = dest.c !== undefined ? dest.c : dest.col;
        const target = this.getCellCenter(targetR, targetC);
        return {
          sx: start.x,
          sy: start.y,
          tx: target.x,
          ty: target.y,
          color,
          destRow: targetR,
          destCol: targetC
        };
      });
    }

    clearPaths() {
      this.activePaths = [];
    }

    /**
     * Trigger Digital Disintegration / Particle Dissolve of captured piece
     */
    spawnDissolve(row, col, isMagenta = false) {
      const { x, y, cellW } = this.getCellCenter(row, col);
      const count = 55;
      const primaryColor = isMagenta ? '#ff007f' : '#00f0ff';
      const secondaryColor = '#ffffff';

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * (cellW * 1.4) + (cellW * 0.4);
        const size = Math.random() * 4 + 2;
        const life = Math.random() * 0.4 + 0.6; // duration in seconds
        this.particles.push({
          x: x + (Math.random() - 0.5) * (cellW * 0.6),
          y: y + (Math.random() - 0.5) * (cellW * 0.6),
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size,
          maxLife: life,
          life,
          color: Math.random() > 0.3 ? primaryColor : secondaryColor,
          rotation: Math.random() * Math.PI,
          vRot: (Math.random() - 0.5) * 8
        });
      }
    }

    /**
     * Trigger Overdrive King Promotion shockwave & intense flare
     */
    spawnPromotionShockwave(row, col, color = '#ffbe0b') {
      const { x, y, cellW } = this.getCellCenter(row, col);
      this.shockwaves.push({
        x,
        y,
        radius: 5,
        maxRadius: cellW * 2.2,
        color,
        alpha: 1.0,
        speed: cellW * 3.5,
        pillarHeight: cellW * 4,
        pillarAlpha: 1.0
      });

      // Spawn golden ascending sparkles
      for (let i = 0; i < 40; i++) {
        this.particles.push({
          x: x + (Math.random() - 0.5) * (cellW * 0.8),
          y: y + (Math.random() - 0.5) * (cellW * 0.8),
          vx: (Math.random() - 0.5) * (cellW * 0.8),
          vy: -Math.random() * (cellW * 2.5) - (cellW * 0.5),
          size: Math.random() * 3 + 2,
          maxLife: 0.8,
          life: 0.8,
          color: '#ffbe0b',
          rotation: 0,
          vRot: 2
        });
      }
    }

    loop() {
      const now = performance.now();
      const dt = Math.min((now - this.lastTime) / 1000, 0.1);
      this.lastTime = now;

      // Handle DPI and clean viewport
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      this.ctx.clearRect(0, 0, this.width, this.height);

      // 1. Draw Destination Paths (Intense Neon Dashed Trajectories & Target Reticles)
      this.dashOffset -= 45 * dt;
      if (this.activePaths.length > 0) {
        this.ctx.save();
        this.activePaths.forEach(path => {
          // A. Ambient Neon Underglow Beam
          this.ctx.beginPath();
          this.ctx.moveTo(path.sx, path.sy);
          this.ctx.lineTo(path.tx, path.ty);
          this.ctx.strokeStyle = path.color;
          this.ctx.globalAlpha = 0.35;
          this.ctx.lineWidth = 8;
          this.ctx.setLineDash([]);
          this.ctx.stroke();

          // B. High-Tech Animated Dashed Vector Line
          this.ctx.beginPath();
          this.ctx.moveTo(path.sx, path.sy);
          this.ctx.lineTo(path.tx, path.ty);
          this.ctx.strokeStyle = '#ffffff';
          this.ctx.globalAlpha = 0.95;
          this.ctx.lineWidth = 3;
          this.ctx.setLineDash([12, 8]);
          this.ctx.lineDashOffset = this.dashOffset;
          this.ctx.shadowColor = path.color;
          this.ctx.shadowBlur = 16;
          this.ctx.stroke();

          // C. Target Landing Marker & Corner Reticles
          const cellHalf = (this.width / 10) * 0.44;
          const bracketLen = 10;
          this.ctx.setLineDash([]);
          this.ctx.globalAlpha = 0.9;
          this.ctx.strokeStyle = path.color;
          this.ctx.lineWidth = 2.5;
          this.ctx.shadowColor = path.color;
          this.ctx.shadowBlur = 12;

          this.ctx.beginPath();
          // Top-Left
          this.ctx.moveTo(path.tx - cellHalf, path.ty - cellHalf + bracketLen);
          this.ctx.lineTo(path.tx - cellHalf, path.ty - cellHalf);
          this.ctx.lineTo(path.tx - cellHalf + bracketLen, path.ty - cellHalf);
          // Top-Right
          this.ctx.moveTo(path.tx + cellHalf - bracketLen, path.ty - cellHalf);
          this.ctx.lineTo(path.tx + cellHalf, path.ty - cellHalf);
          this.ctx.lineTo(path.tx + cellHalf, path.ty - cellHalf + bracketLen);
          // Bottom-Right
          this.ctx.moveTo(path.tx + cellHalf, path.ty + cellHalf - bracketLen);
          this.ctx.lineTo(path.tx + cellHalf, path.ty + cellHalf);
          this.ctx.lineTo(path.tx + cellHalf - bracketLen, path.ty + cellHalf);
          // Bottom-Left
          this.ctx.moveTo(path.tx - cellHalf + bracketLen, path.ty + cellHalf);
          this.ctx.lineTo(path.tx - cellHalf, path.ty + cellHalf);
          this.ctx.lineTo(path.tx - cellHalf, path.ty + cellHalf - bracketLen);
          this.ctx.stroke();

          // Center Target Pip
          this.ctx.beginPath();
          this.ctx.arc(path.tx, path.ty, 4, 0, Math.PI * 2);
          this.ctx.fillStyle = path.color;
          this.ctx.fill();
        });
        this.ctx.restore();
      }

      // 2. Draw Radar Pulse Waves
      for (let i = this.radarWaves.length - 1; i >= 0; i--) {
        const w = this.radarWaves[i];
        w.radius += w.speed * dt;
        w.alpha = Math.max(0, 1 - w.radius / w.maxRadius);

        if (w.alpha <= 0 || w.radius >= w.maxRadius) {
          this.radarWaves.splice(i, 1);
          continue;
        }

        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(w.x, w.y, w.radius, 0, Math.PI * 2);
        this.ctx.strokeStyle = w.color;
        this.ctx.globalAlpha = w.alpha;
        this.ctx.lineWidth = 3;
        this.ctx.shadowColor = w.color;
        this.ctx.shadowBlur = 12;
        this.ctx.stroke();

        // Inner harmonic ring
        this.ctx.beginPath();
        this.ctx.arc(w.x, w.y, w.radius * 0.65, 0, Math.PI * 2);
        this.ctx.globalAlpha = w.alpha * 0.5;
        this.ctx.lineWidth = 1.5;
        this.ctx.stroke();
        this.ctx.restore();
      }

      // 3. Draw Promotion Shockwaves
      for (let i = this.shockwaves.length - 1; i >= 0; i--) {
        const sw = this.shockwaves[i];
        sw.radius += sw.speed * dt;
        sw.alpha = Math.max(0, 1 - sw.radius / sw.maxRadius);
        sw.pillarAlpha = Math.max(0, sw.pillarAlpha - dt * 1.5);

        if (sw.alpha <= 0 && sw.pillarAlpha <= 0) {
          this.shockwaves.splice(i, 1);
          continue;
        }

        this.ctx.save();
        // Expanding circular shockwave
        if (sw.alpha > 0) {
          this.ctx.beginPath();
          this.ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
          this.ctx.strokeStyle = sw.color;
          this.ctx.globalAlpha = sw.alpha;
          this.ctx.lineWidth = 4;
          this.ctx.shadowColor = sw.color;
          this.ctx.shadowBlur = 20;
          this.ctx.stroke();
        }

        // Intense center flare
        if (sw.pillarAlpha > 0) {
          const grad = this.ctx.createRadialGradient(sw.x, sw.y, 2, sw.x, sw.y, this.width / 10);
          grad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
          grad.addColorStop(0.4, sw.color);
          grad.addColorStop(1, 'transparent');
          this.ctx.fillStyle = grad;
          this.ctx.globalAlpha = sw.pillarAlpha;
          this.ctx.beginPath();
          this.ctx.arc(sw.x, sw.y, this.width / 10, 0, Math.PI * 2);
          this.ctx.fill();
        }
        this.ctx.restore();
      }

      // 4. Draw Disintegration Particles (Digital Voxels)
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.life -= dt;
        if (p.life <= 0) {
          this.particles.splice(i, 1);
          continue;
        }

        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rotation += p.vRot * dt;

        const alpha = p.life / p.maxLife;

        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate(p.rotation);
        this.ctx.fillStyle = p.color;
        this.ctx.globalAlpha = alpha;
        this.ctx.shadowColor = p.color;
        this.ctx.shadowBlur = 8;

        // Draw micro cyber-quad
        this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        this.ctx.restore();
      }

      this.animId = requestAnimationFrame(this.loop);
    }
  }

  /* =========================================================================
     3. INTERNATIONAL CHECKERS (10x10 DRAUGHTS) ENGINE RULES
     ========================================================================= */

  // Piece Constants
  const EMPTY = 0;
  const MAN_P1 = 1;   // Cyan Player
  const KING_P1 = 2;
  const MAN_P2 = 3;   // Magenta / AI
  const KING_P2 = 4;

  const PLAYER_1 = 1; // Cyan
  const PLAYER_2 = 2; // Magenta

  class InternationalCheckersEngine {
    constructor() {
      this.board = [];
      this.activePlayer = PLAYER_1;
      this.selectedPiece = null;
      this.legalMovesForSelected = [];
      this.mustCapturePieces = [];
      this.chainInProgress = false;
      this.chainPiece = null;
      this.pendingCapturedPieces = []; // Captured pieces removed at end of sequence
      this.reset();
    }

    reset() {
      // 10x10 Matrix: row 0..9, col 0..9
      this.board = Array(10).fill(null).map(() => Array(10).fill(EMPTY));
      this.activePlayer = PLAYER_1;
      this.selectedPiece = null;
      this.legalMovesForSelected = [];
      this.mustCapturePieces = [];
      this.chainInProgress = false;
      this.chainPiece = null;
      this.pendingCapturedPieces = [];

      // International Draughts Setup:
      // Dark playable squares: (r + c) % 2 === 1
      // Player 2 occupies rows 0, 1, 2, 3 (20 pieces)
      for (let r = 0; r <= 3; r++) {
        for (let c = 0; c < 10; c++) {
          if ((r + c) % 2 === 1) {
            this.board[r][c] = MAN_P2;
          }
        }
      }

      // Player 1 occupies rows 6, 7, 8, 9 (20 pieces)
      for (let r = 6; r <= 9; r++) {
        for (let c = 0; c < 10; c++) {
          if ((r + c) % 2 === 1) {
            this.board[r][c] = MAN_P1;
          }
        }
      }

      this.calculateMandatoryCaptures();
    }

    cloneState() {
      return {
        board: this.board.map(row => [...row]),
        activePlayer: this.activePlayer,
        chainInProgress: this.chainInProgress,
        chainPiece: this.chainPiece ? { ...this.chainPiece } : null,
        pendingCapturedPieces: [...this.pendingCapturedPieces]
      };
    }

    restoreState(state) {
      this.board = state.board.map(row => [...row]);
      this.activePlayer = state.activePlayer;
      this.chainInProgress = state.chainInProgress;
      this.chainPiece = state.chainPiece ? { ...state.chainPiece } : null;
      this.pendingCapturedPieces = [...state.pendingCapturedPieces];
      this.selectedPiece = null;
      this.legalMovesForSelected = [];
      this.calculateMandatoryCaptures();
    }

    isPlayerPiece(piece, player) {
      if (player === PLAYER_1) return piece === MAN_P1 || piece === KING_P1;
      if (player === PLAYER_2) return piece === MAN_P2 || piece === KING_P2;
      return false;
    }

    isOpponentPiece(piece, player) {
      if (piece === EMPTY) return false;
      return !this.isPlayerPiece(piece, player);
    }

    isKing(piece) {
      return piece === KING_P1 || piece === KING_P2;
    }

    isValidCoord(r, c) {
      return r >= 0 && r < 10 && c >= 0 && c < 10;
    }

    /**
     * Compute all capture sequences for a given piece on a board
     * Supports backward jumps for regular men and flying kings
     * Returns an array of paths: [{ to: {r, c}, captures: [{r, c}], ... }]
     */
    getPieceCapturePaths(r, c, currentBoard = this.board, alreadyCaptured = []) {
      const piece = currentBoard[r][c];
      if (piece === EMPTY) return [];
      const isKing = this.isKing(piece);
      const player = (piece === MAN_P1 || piece === KING_P1) ? PLAYER_1 : PLAYER_2;
      const directions = [
        [-1, -1], [-1, 1], [1, -1], [1, 1]
      ];
      const paths = [];

      if (!isKing) {
        // Regular Man: can jump in all 4 directions if adjacent square has opponent
        for (const [dr, dc] of directions) {
          const midR = r + dr;
          const midC = c + dc;
          const landR = r + dr * 2;
          const landC = c + dc * 2;

          if (this.isValidCoord(landR, landC)) {
            const midPiece = currentBoard[midR][midC];
            const landPiece = currentBoard[landR][landC];

            // Check if middle square is opponent, not already jumped in this chain, and landing is empty
            const alreadyJumped = alreadyCaptured.some(cap => cap.r === midR && cap.c === midC);
            if (this.isOpponentPiece(midPiece, player) && !alreadyJumped && landPiece === EMPTY) {
              const newCaptures = [...alreadyCaptured, { r: midR, c: midC }];
              
              // Temporarily advance piece on board clone to check for chain continuations
              const nextBoard = currentBoard.map(row => [...row]);
              nextBoard[r][c] = EMPTY;
              nextBoard[landR][landC] = piece;

              const subPaths = this.getPieceCapturePaths(landR, landC, nextBoard, newCaptures);
              if (subPaths.length > 0) {
                for (const sub of subPaths) {
                  paths.push({
                    from: { r, c },
                    step: { r: landR, c: landC },
                    captures: sub.captures,
                    target: sub.target || sub.step,
                    fullChain: [{ r: landR, c: landC }, ...(sub.fullChain || [])]
                  });
                }
              } else {
                paths.push({
                  from: { r, c },
                  step: { r: landR, c: landC },
                  captures: newCaptures,
                  target: { r: landR, c: landC },
                  fullChain: [{ r: landR, c: landC }]
                });
              }
            }
          }
        }
      } else {
        // Flying King: can slide along diagonal, jump over single opponent, land on any free square beyond
        for (const [dr, dc] of directions) {
          let step = 1;
          let enemyFound = null;

          while (true) {
            const checkR = r + dr * step;
            const checkC = c + dc * step;
            if (!this.isValidCoord(checkR, checkC)) break;

            const targetPiece = currentBoard[checkR][checkC];
            if (targetPiece !== EMPTY) {
              if (this.isPlayerPiece(targetPiece, player)) {
                // Blocked by friendly piece
                break;
              } else {
                // Opponent piece encountered
                const alreadyJumped = alreadyCaptured.some(cap => cap.r === checkR && cap.c === checkC);
                if (alreadyJumped) {
                  break; // Cannot jump same piece twice
                }
                enemyFound = { r: checkR, c: checkC };
                break;
              }
            }
            step++;
          }

          if (enemyFound) {
            // Find all landing squares beyond enemy piece along the same line
            let landStep = 1;
            while (true) {
              const landR = enemyFound.r + dr * landStep;
              const landC = enemyFound.c + dc * landStep;
              if (!this.isValidCoord(landR, landC)) break;
              if (currentBoard[landR][landC] !== EMPTY) break; // Blocked

              const newCaptures = [...alreadyCaptured, enemyFound];
              const nextBoard = currentBoard.map(row => [...row]);
              nextBoard[r][c] = EMPTY;
              nextBoard[landR][landC] = piece;

              const subPaths = this.getPieceCapturePaths(landR, landC, nextBoard, newCaptures);
              if (subPaths.length > 0) {
                for (const sub of subPaths) {
                  paths.push({
                    from: { r, c },
                    step: { r: landR, c: landC },
                    captures: sub.captures,
                    target: sub.target || sub.step,
                    fullChain: [{ r: landR, c: landC }, ...(sub.fullChain || [])]
                  });
                }
              } else {
                paths.push({
                  from: { r, c },
                  step: { r: landR, c: landC },
                  captures: newCaptures,
                  target: { r: landR, c: landC },
                  fullChain: [{ r: landR, c: landC }]
                });
              }
              landStep++;
            }
          }
        }
      }

      return paths;
    }

    /**
     * Compute simple non-capture moves for a piece
     */
    getPieceSimpleMoves(r, c) {
      const piece = this.board[r][c];
      if (piece === EMPTY) return [];
      const moves = [];

      if (!this.isKing(piece)) {
        // Regular Man: moves forward only (P1 moves row - 1, P2 moves row + 1)
        const forwardDir = piece === MAN_P1 ? -1 : 1;
        const targetRow = r + forwardDir;
        for (const dc of [-1, 1]) {
          const targetCol = c + dc;
          if (this.isValidCoord(targetRow, targetCol) && this.board[targetRow][targetCol] === EMPTY) {
            moves.push({
              from: { r, c },
              step: { r: targetRow, c: targetCol },
              captures: [],
              isCapture: false
            });
          }
        }
      } else {
        // Flying King: slides any distance along all 4 diagonals
        const directions = [
          [-1, -1], [-1, 1], [1, -1], [1, 1]
        ];
        for (const [dr, dc] of directions) {
          let step = 1;
          while (true) {
            const tr = r + dr * step;
            const tc = c + dc * step;
            if (!this.isValidCoord(tr, tc) || this.board[tr][tc] !== EMPTY) break;
            moves.push({
              from: { r, c },
              step: { r: tr, c: tc },
              captures: [],
              isCapture: false
            });
            step++;
          }
        }
      }

      return moves;
    }

    /**
     * Calculate mandatory captures across all pieces for active player.
     * International Checkers "Majority Rule":
     * If multiple captures are possible, player MUST choose a capture path
     * that achieves the MAXIMUM number of captured pieces.
     */
    calculateMandatoryCaptures() {
      this.mustCapturePieces = [];
      let maxCaptures = 0;
      const allCaptureMoves = [];

      // If in the middle of a chain jump, only the chain piece can move!
      if (this.chainInProgress && this.chainPiece) {
        const paths = this.getPieceCapturePaths(this.chainPiece.r, this.chainPiece.c, this.board, this.pendingCapturedPieces);
        if (paths.length > 0) {
          this.mustCapturePieces = [{ r: this.chainPiece.r, c: this.chainPiece.c, paths }];
        }
        return;
      }

      for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 10; c++) {
          if (this.isPlayerPiece(this.board[r][c], this.activePlayer)) {
            const paths = this.getPieceCapturePaths(r, c, this.board, []);
            if (paths.length > 0) {
              paths.forEach(p => {
                if (p.captures.length > maxCaptures) {
                  maxCaptures = p.captures.length;
                }
                allCaptureMoves.push({ r, c, path: p, count: p.captures.length });
              });
            }
          }
        }
      }

      if (maxCaptures > 0) {
        // Filter only pieces that achieve maxCaptures
        const qualifyingPiecesMap = new Map();
        allCaptureMoves.filter(m => m.count === maxCaptures).forEach(m => {
          const key = `${m.r},${m.c}`;
          if (!qualifyingPiecesMap.has(key)) {
            qualifyingPiecesMap.set(key, { r: m.r, c: m.c, paths: [] });
          }
          qualifyingPiecesMap.get(key).paths.push(m.path);
        });
        this.mustCapturePieces = Array.from(qualifyingPiecesMap.values());
      }
    }

    /**
     * Get legal moves for a selected square
     */
    getLegalMovesForSquare(r, c) {
      if (!this.isPlayerPiece(this.board[r][c], this.activePlayer)) return [];

      // If chain in progress, only chain piece is allowed
      if (this.chainInProgress && this.chainPiece) {
        if (r !== this.chainPiece.r || c !== this.chainPiece.c) return [];
        const captureInfo = this.mustCapturePieces.find(p => p.r === r && p.c === c);
        if (!captureInfo) return [];
        // Map individual immediate jump steps
        const stepMap = new Map();
        captureInfo.paths.forEach(p => {
          const key = `${p.step.r},${p.step.c}`;
          if (!stepMap.has(key)) {
            stepMap.set(key, {
              from: { r, c },
              to: p.step,
              isCapture: true,
              path: p
            });
          }
        });
        return Array.from(stepMap.values());
      }

      // Mandatory Captures Rule
      if (this.mustCapturePieces.length > 0) {
        const captureInfo = this.mustCapturePieces.find(p => p.r === r && p.c === c);
        if (!captureInfo) return []; // Must choose a piece with max captures!

        const stepMap = new Map();
        captureInfo.paths.forEach(p => {
          const key = `${p.step.r},${p.step.c}`;
          if (!stepMap.has(key)) {
            stepMap.set(key, {
              from: { r, c },
              to: p.step,
              isCapture: true,
              path: p
            });
          }
        });
        return Array.from(stepMap.values());
      }

      // If no captures are available anywhere, regular non-capture moves are legal
      return this.getPieceSimpleMoves(r, c).map(m => ({
        from: m.from,
        to: m.step,
        isCapture: false
      }));
    }

    /**
     * Execute a move from -> to
     * Returns result object: { success, isCapture, capturedPieces, isPromotion, turnEnded, notation }
     */
    executeMove(fromR, fromC, toR, toC) {
      const legalMoves = this.getLegalMovesForSquare(fromR, fromC);
      const chosenMove = legalMoves.find(m => m.to.r === toR && m.to.c === toC);

      if (!chosenMove) {
        return { success: false };
      }

      const piece = this.board[fromR][fromC];
      const player = this.activePlayer;
      let isPromotion = false;
      let turnEnded = false;
      let capturedPieces = [];

      // Move piece to new cell
      this.board[toR][toC] = piece;
      this.board[fromR][fromC] = EMPTY;

      if (chosenMove.isCapture) {
        // Determine the jumped piece
        const path = chosenMove.path;
        const jumpedPiece = path.captures.find(cap => {
          // Check if this jumped piece lies between from and to
          const minR = Math.min(fromR, toR);
          const maxR = Math.max(fromR, toR);
          const minC = Math.min(fromC, toC);
          const maxC = Math.max(fromC, toC);
          return cap.r >= minR && cap.r <= maxR && cap.c >= minC && cap.c <= maxC;
        }) || path.captures[0];

        if (jumpedPiece) {
          this.pendingCapturedPieces.push(jumpedPiece);
        }

        // Check if there are further captures from the new square with the remaining enemy pieces
        const remainingCaptures = this.getPieceCapturePaths(toR, toC, this.board, this.pendingCapturedPieces);
        if (remainingCaptures.length > 0) {
          // Chain Jump continues!
          this.chainInProgress = true;
          this.chainPiece = { r: toR, c: toC };
          this.calculateMandatoryCaptures();
          turnEnded = false;
        } else {
          // Chain finished! Remove all pending captured pieces from board
          capturedPieces = [...this.pendingCapturedPieces];
          capturedPieces.forEach(cap => {
            this.board[cap.r][cap.c] = EMPTY;
          });
          this.pendingCapturedPieces = [];
          this.chainInProgress = false;
          this.chainPiece = null;
          turnEnded = true;
        }
      } else {
        turnEnded = true;
      }

      // Check Overdrive Promotion Rule:
      // In International Draughts, a piece crowns if and only if it STOPS on the crown row at the end of the turn!
      if (turnEnded) {
        const backRow = player === PLAYER_1 ? 0 : 9;
        if (toR === backRow && !this.isKing(piece)) {
          this.board[toR][toC] = player === PLAYER_1 ? KING_P1 : KING_P2;
          isPromotion = true;
        }
      }

      // Prepare Algebraic / Checkers Notation
      const colChars = 'ABCDEFGHIJ';
      const fromNot = `${colChars[fromC]}${10 - fromR}`;
      const toNot = `${colChars[toC]}${10 - toR}`;
      const symbol = chosenMove.isCapture ? 'x' : '-';
      const notation = `${fromNot}${symbol}${toNot}`;

      if (turnEnded) {
        this.activePlayer = this.activePlayer === PLAYER_1 ? PLAYER_2 : PLAYER_1;
        this.calculateMandatoryCaptures();
      }

      return {
        success: true,
        piece,
        player,
        from: { r: fromR, c: fromC },
        to: { r: toR, c: toC },
        isCapture: chosenMove.isCapture,
        capturedPieces,
        isPromotion,
        turnEnded,
        notation
      };
    }

    /**
     * Check if game has ended (No pieces or no legal moves)
     */
    checkGameOver() {
      let p1Pieces = 0;
      let p2Pieces = 0;

      for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 10; c++) {
          if (this.isPlayerPiece(this.board[r][c], PLAYER_1)) p1Pieces++;
          if (this.isPlayerPiece(this.board[r][c], PLAYER_2)) p2Pieces++;
        }
      }

      if (p1Pieces === 0) return { over: true, winner: PLAYER_2, reason: 'All Cyan units disintegrated.' };
      if (p2Pieces === 0) return { over: true, winner: PLAYER_1, reason: 'All Magenta units disintegrated.' };

      // Check if active player has any legal moves
      let hasAnyMove = false;
      if (this.mustCapturePieces.length > 0) {
        hasAnyMove = true;
      } else {
        for (let r = 0; r < 10 && !hasAnyMove; r++) {
          for (let c = 0; c < 10 && !hasAnyMove; c++) {
            if (this.isPlayerPiece(this.board[r][c], this.activePlayer)) {
              const moves = this.getPieceSimpleMoves(r, c);
              if (moves.length > 0) hasAnyMove = true;
            }
          }
        }
      }

      if (!hasAnyMove) {
        const winner = this.activePlayer === PLAYER_1 ? PLAYER_2 : PLAYER_1;
        const winnerName = winner === PLAYER_1 ? 'Player 1 (Cyan)' : 'Player 2 (Magenta)';
        return { over: true, winner, reason: `No legal tactical moves remaining. ${winnerName} prevails.` };
      }

      return { over: false };
    }

    getPieceCounts() {
      let p1Units = 0, p1Kings = 0;
      let p2Units = 0, p2Kings = 0;

      for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 10; c++) {
          const p = this.board[r][c];
          if (p === MAN_P1) p1Units++;
          else if (p === KING_P1) { p1Units++; p1Kings++; }
          else if (p === MAN_P2) p2Units++;
          else if (p === KING_P2) { p2Units++; p2Kings++; }
        }
      }

      return {
        p1Units, p1Kings, p1Captured: 20 - p2Units,
        p2Units, p2Kings, p2Captured: 20 - p1Units
      };
    }
  }

  /* =========================================================================
     4. EXPERT TACTICAL AI (MINIMAX WITH ALPHA-BETA PRUNING & HEURISTICS)
     ========================================================================= */
  class TacticalCheckersAI {
    constructor(engine, difficulty = 'medium') {
      this.engine = engine;
      this.difficulty = difficulty; // 'easy', 'medium', 'hard'
      this.nodesEvaluated = 0;
      this.searchDepth = 3;
    }

    setDifficulty(diff) {
      this.difficulty = diff;
      if (diff === 'easy') this.searchDepth = 1;
      else if (diff === 'medium') this.searchDepth = 3;
      else if (diff === 'hard') this.searchDepth = 4;
    }

    /**
     * Heuristic Evaluation Function:
     * - Material (Men = 100, Kings = 320)
     * - Advancement towards back line
     * - Back row protection (+35)
     * - Central board dominance (Columns D, E, F, G)
     * - King hunting / threat targets
     */
    evaluateBoard(board, maximizingPlayer = PLAYER_2) {
      let score = 0;

      for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 10; c++) {
          const piece = board[r][c];
          if (piece === EMPTY) continue;

          let val = 0;
          const isP2 = (piece === MAN_P2 || piece === KING_P2);
          const isKing = (piece === KING_P1 || piece === KING_P2);

          if (!isKing) {
            val += 100;
            // Advancement Bonus (P2 advances downwards, P1 upwards)
            const advancement = isP2 ? r : (9 - r);
            val += advancement * 4;

            // Back rank defense bonus (protect baseline from king coronation)
            if (isP2 && r === 0) val += 35;
            if (!isP2 && r === 9) val += 35;

            // Edge vulnerability penalty (encourages keeping towards active diagonals)
            if (c === 0 || c === 9) val -= 6;
          } else {
            val += 320;
            // King Central Mobility & Threat targeting
            const centerDist = Math.abs(r - 4.5) + Math.abs(c - 4.5);
            val += (9 - centerDist) * 3;
          }

          // Center board control (Columns 3-6, Rows 4-5)
          if (c >= 3 && c <= 6 && r >= 4 && r <= 5) {
            val += 15;
          }

          if (isP2) {
            score += val;
          } else {
            score -= val;
          }
        }
      }

      return maximizingPlayer === PLAYER_2 ? score : -score;
    }

    /**
     * Generate all possible full turn moves for a given player on a board
     */
    generateAllTurnMoves(player, board) {
      // Create temporary engine state
      const tempEngine = new InternationalCheckersEngine();
      tempEngine.board = board.map(row => [...row]);
      tempEngine.activePlayer = player;
      tempEngine.calculateMandatoryCaptures();

      const moves = [];

      // If mandatory captures exist
      if (tempEngine.mustCapturePieces.length > 0) {
        tempEngine.mustCapturePieces.forEach(p => {
          p.paths.forEach(path => {
            moves.push({
              from: path.from,
              step: path.step,
              fullChain: path.fullChain,
              captures: path.captures,
              isCapture: true
            });
          });
        });
        return moves;
      }

      // Simple moves
      for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 10; c++) {
          if (tempEngine.isPlayerPiece(board[r][c], player)) {
            const simpleMoves = tempEngine.getPieceSimpleMoves(r, c);
            simpleMoves.forEach(m => {
              moves.push({
                from: m.from,
                step: m.step,
                fullChain: [m.step],
                captures: [],
                isCapture: false
              });
            });
          }
        }
      }

      return moves;
    }

    /**
     * Apply a complete move sequence to a board
     */
    applyMove(move, player, board) {
      const nextBoard = board.map(row => [...row]);
      const piece = nextBoard[move.from.r][move.from.c];
      nextBoard[move.from.r][move.from.c] = EMPTY;

      const finalPos = move.fullChain[move.fullChain.length - 1];
      nextBoard[finalPos.r][finalPos.c] = piece;

      // Remove captured pieces
      if (move.captures && move.captures.length > 0) {
        move.captures.forEach(cap => {
          nextBoard[cap.r][cap.c] = EMPTY;
        });
      }

      // Check king promotion
      const crownRow = player === PLAYER_1 ? 0 : 9;
      if (finalPos.r === crownRow) {
        if (piece === MAN_P1) nextBoard[finalPos.r][finalPos.c] = KING_P1;
        if (piece === MAN_P2) nextBoard[finalPos.r][finalPos.c] = KING_P2;
      }

      return nextBoard;
    }

    /**
     * Minimax Search with Alpha-Beta Pruning
     */
    minimax(board, depth, alpha, beta, isMaximizing, player) {
      this.nodesEvaluated++;
      const opponent = player === PLAYER_1 ? PLAYER_2 : PLAYER_1;

      if (depth === 0) {
        return { score: this.evaluateBoard(board, PLAYER_2) };
      }

      const active = isMaximizing ? player : opponent;
      const moves = this.generateAllTurnMoves(active, board);

      if (moves.length === 0) {
        // No moves: current player loses
        return { score: isMaximizing ? -10000 + (10 - depth) : 10000 - (10 - depth) };
      }

      // Move Ordering: Captures first for optimal alpha-beta cutoffs
      moves.sort((a, b) => (b.isCapture ? 1 : 0) - (a.isCapture ? 1 : 0));

      let bestMove = moves[0];

      if (isMaximizing) {
        let maxEval = -Infinity;
        for (const move of moves) {
          const nextBoard = this.applyMove(move, active, board);
          const evaluation = this.minimax(nextBoard, depth - 1, alpha, beta, false, player).score;
          if (evaluation > maxEval) {
            maxEval = evaluation;
            bestMove = move;
          }
          alpha = Math.max(alpha, evaluation);
          if (beta <= alpha) break; // Beta cutoff
        }
        return { score: maxEval, move: bestMove };
      } else {
        let minEval = Infinity;
        for (const move of moves) {
          const nextBoard = this.applyMove(move, active, board);
          const evaluation = this.minimax(nextBoard, depth - 1, alpha, beta, true, player).score;
          if (evaluation < minEval) {
            minEval = evaluation;
            bestMove = move;
          }
          beta = Math.min(beta, evaluation);
          if (beta <= alpha) break; // Alpha cutoff
        }
        return { score: minEval, move: bestMove };
      }
    }

    /**
     * Find best tactical move for AI (Player 2)
     */
    findBestMove() {
      this.nodesEvaluated = 0;
      const startTime = performance.now();
      const moves = this.generateAllTurnMoves(PLAYER_2, this.engine.board);

      if (moves.length === 0) {
        return null;
      }

      // In Easy mode, pick random capture if exists, else random move with 70% chance
      if (this.difficulty === 'easy') {
        const captures = moves.filter(m => m.isCapture);
        const pool = captures.length > 0 ? captures : moves;
        const selected = pool[Math.floor(Math.random() * pool.length)];
        return {
          move: selected,
          score: 0,
          depth: 1,
          nodes: pool.length,
          timeMs: Math.round(performance.now() - startTime)
        };
      }

      const result = this.minimax(this.engine.board, this.searchDepth, -Infinity, Infinity, true, PLAYER_2);
      const elapsed = Math.round(performance.now() - startTime);

      return {
        move: result.move || moves[0],
        score: (result.score / 100).toFixed(2),
        depth: this.searchDepth,
        nodes: this.nodesEvaluated,
        timeMs: elapsed
      };
    }
  }

  /* =========================================================================
     5. MAIN CONTROLLER & APPLICATION ORCHESTRATION
     ========================================================================= */
  class CyberCheckersGame {
    constructor() {
      // DOM Elements
      this.boardElem = document.getElementById('checkers-board');
      this.boardFrame = document.getElementById('board-frame');
      this.boardViewport = document.getElementById('board-viewport');
      this.fxCanvas = document.getElementById('fx-canvas');
      this.announcerText = document.getElementById('announcer-text');

      // Intro Splash Screen DOM
      this.introSplash = document.getElementById('intro-splash');
      this.splashProgress = document.getElementById('splash-progress');
      this.splashPrompt = document.getElementById('splash-prompt');
      this.splashDismissed = false;

      // Pause System DOM
      this.btnPauseToggle = document.getElementById('btn-pause-toggle');
      this.pauseIcon = document.getElementById('pause-icon');
      this.pauseText = document.getElementById('pause-text');
      this.pauseOverlay = document.getElementById('pause-overlay');
      this.btnResumeGame = document.getElementById('btn-resume-game');
      this.isPaused = false;

      // Music OST DOM
      this.btnMusicToggle = document.getElementById('btn-music-toggle');
      this.musicIcon = document.getElementById('music-icon');
      this.musicText = document.getElementById('music-text');

      // Timer DOM
      this.timerDock = document.getElementById('timer-dock');
      this.timerSecondsElem = document.getElementById('timer-seconds');
      this.timerProgressRing = document.getElementById('timer-progress-ring');
      this.miltillashBadge = document.getElementById('miltillash-badge');

      // Player 1 DOM
      this.cardP1 = document.getElementById('card-p1');
      this.p1UnitsElem = document.getElementById('p1-units-count');
      this.p1KingsElem = document.getElementById('p1-kings-count');
      this.p1CapturedElem = document.getElementById('p1-captured-count');
      this.p1StatusBanner = document.getElementById('p1-status-banner');

      // Player 2 DOM
      this.cardP2 = document.getElementById('card-p2');
      this.p2NameLabel = document.getElementById('p2-name-label');
      this.p2UnitsElem = document.getElementById('p2-units-count');
      this.p2KingsElem = document.getElementById('p2-kings-count');
      this.p2CapturedElem = document.getElementById('p2-captured-count');
      this.p2StatusBanner = document.getElementById('p2-status-banner');

      // AI Telemetry DOM
      this.aiStatusText = document.getElementById('ai-status-text');
      this.aiActivityFill = document.getElementById('ai-activity-fill');
      this.aiDepthVal = document.getElementById('ai-depth-val');
      this.aiNodesVal = document.getElementById('ai-nodes-val');
      this.aiEvalVal = document.getElementById('ai-eval-val');
      this.aiTimeVal = document.getElementById('ai-time-val');

      // History & Terminal DOM
      this.terminalLog = document.getElementById('terminal-log');
      this.telemetryRound = document.getElementById('telemetry-round');
      this.telemetryMoves = document.getElementById('telemetry-moves');

      // Modal DOM
      this.gameOverModal = document.getElementById('game-over-modal');
      this.gameOverTitle = document.getElementById('game-over-title');
      this.gameOverSubtitle = document.getElementById('game-over-subtitle');
      this.rulesModal = document.getElementById('rules-modal');

      // Game Subsystems
      this.audio = new CyberAudioEngine();
      this.fx = new CanvasFXEngine(this.fxCanvas, this.boardViewport);
      this.engine = new InternationalCheckersEngine();
      this.ai = new TacticalCheckersAI(this.engine, 'medium');

      // Game Settings & State
      this.gameMode = 'ai'; // 'ai' or 'pvp'
      this.roundNumber = 1;
      this.totalMovesCount = 0;
      this.showNumbers = false;
      this.historyStack = [];
      this.moveLogRecords = [];

      // Turn Timer
      this.turnTimeLimit = 30;
      this.turnTimeRemaining = 30;
      this.timerInterval = null;
      this.miltillashActive = false;
      this.isProcessingAi = false;

      this.init();
    }

    init() {
      this.setupBoardDOM();
      this.setupEventListeners();
      this.setupSplashLifecycle();
      this.render();
      this.startTurnTimer();
      this.logTerminalSystem('TACTICAL ENGAGEMENT READY. PROTOCOL INITIATED.');
    }

    /* -------------------------------------------------------------
       Intro Splash Screen Lifecycle (3s Loader & Music Autoplay)
       ------------------------------------------------------------- */
    setupSplashLifecycle() {
      if (!this.introSplash) return;

      if (window.location.search.includes('test=true')) {
        this.dismissSplash(true);
        return;
      }

      const startTime = performance.now();
      const splashDuration = 3000; // 3 seconds

      const progressAnim = () => {
        if (this.splashDismissed) return;
        const elapsed = performance.now() - startTime;
        const ratio = Math.min(1, elapsed / splashDuration);
        if (this.splashProgress) {
          this.splashProgress.style.width = `${Math.round(ratio * 100)}%`;
        }
        if (ratio < 1) {
          requestAnimationFrame(progressAnim);
        } else {
          this.dismissSplash();
        }
      };
      requestAnimationFrame(progressAnim);

      const triggerStartOnInteraction = () => {
        this.audio.ensureContext();
        if (this.audio.musicEnabled && !this.audio.jokerThemePlaying) {
          this.audio.startJokerTheme();
        }
        this.dismissSplash();
      };

      this.introSplash.addEventListener('click', triggerStartOnInteraction);
      window.addEventListener('keydown', (e) => {
        if (!this.splashDismissed) {
          triggerStartOnInteraction();
        }
      }, { once: true });
    }

    dismissSplash(immediate = false) {
      if (this.splashDismissed) return;
      this.splashDismissed = true;
      if (this.introSplash) {
        if (immediate) {
          this.introSplash.style.display = 'none';
        } else {
          this.introSplash.classList.add('fade-out');
          setTimeout(() => {
            if (this.introSplash) this.introSplash.style.display = 'none';
          }, 850);
        }
      }
      this.audio.ensureContext();
      if (this.audio.musicEnabled && !this.audio.jokerThemePlaying) {
        this.audio.startJokerTheme();
      }
    }

    /* -------------------------------------------------------------
       Board Rendering & DOM
       ------------------------------------------------------------- */
    setupBoardDOM() {
      this.boardElem.innerHTML = '';
      let squareNumber = 1;

      for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 10; c++) {
          const cell = document.createElement('div');
          const isDark = (r + c) % 2 === 1;

          cell.className = `cell ${isDark ? 'cell-dark playable' : 'cell-light'}`;
          cell.dataset.row = r;
          cell.dataset.col = c;

          if (isDark) {
            cell.dataset.squareIndex = squareNumber;
            const numberLabel = document.createElement('span');
            numberLabel.className = 'cell-number';
            numberLabel.textContent = squareNumber;
            cell.appendChild(numberLabel);
            squareNumber++;
          }

          cell.addEventListener('click', (e) => this.handleCellClick(r, c, e));
          this.boardElem.appendChild(cell);
        }
      }
    }

    render() {
      // 1. Clear piece highlights
      const cells = this.boardElem.querySelectorAll('.cell');
      cells.forEach(cell => {
        cell.classList.remove('cell-destination');
        const existingPiece = cell.querySelector('.piece');
        if (existingPiece) existingPiece.remove();
      });

      // 2. Render Pieces on Board
      for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 10; c++) {
          const piece = this.engine.board[r][c];
          if (piece !== EMPTY) {
            const cell = this.getCellElem(r, c);
            if (cell) {
              const pieceElem = document.createElement('div');
              const isP1 = (piece === MAN_P1 || piece === KING_P1);
              const isKing = this.engine.isKing(piece);

              pieceElem.className = `piece ${isP1 ? 'piece-p1' : 'piece-p2'}`;
              if (isKing) pieceElem.classList.add('is-king');

              // Check if selected
              if (this.engine.selectedPiece && this.engine.selectedPiece.r === r && this.engine.selectedPiece.c === c) {
                pieceElem.classList.add('selected');
              }

              // Check if piece must capture
              const mustJump = this.engine.mustCapturePieces.some(p => p.r === r && p.c === c);
              if (mustJump) {
                pieceElem.classList.add('must-capture');
              }

              // Piece Core Graphic
              const core = document.createElement('div');
              core.className = 'piece-core';

              if (isKing) {
                const insignia = document.createElement('span');
                insignia.className = 'king-insignia';
                insignia.innerHTML = '&#9813;'; // Crown Symbol
                core.appendChild(insignia);

                const crownRing = document.createElement('div');
                crownRing.className = 'king-crown-overlay';
                pieceElem.appendChild(crownRing);
              }

              pieceElem.appendChild(core);
              cell.appendChild(pieceElem);
            }
          }
        }
      }

      // 3. Render Destination Highlights
      if (this.engine.selectedPiece) {
        const destinations = this.engine.getLegalMovesForSquare(this.engine.selectedPiece.r, this.engine.selectedPiece.c);
        destinations.forEach(m => {
          const cell = this.getCellElem(m.to.r, m.to.c);
          if (cell) {
            cell.classList.add('cell-destination');
          }
        });

        // Update Canvas Dashed Paths
        const teamColor = this.engine.activePlayer === PLAYER_1 ? '#00f0ff' : '#ff007f';
        this.fx.setPaths(this.engine.selectedPiece, destinations.map(d => d.to), teamColor);
      } else {
        this.fx.clearPaths();
      }

      // 4. Update HUD & Telemetry Status
      this.updateHUD();
    }

    getCellElem(r, c) {
      return this.boardElem.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
    }

    updateHUD() {
      const counts = this.engine.getPieceCounts();
      this.p1UnitsElem.textContent = counts.p1Units;
      this.p1KingsElem.textContent = counts.p1Kings;
      this.p1CapturedElem.textContent = counts.p1Captured;

      this.p2UnitsElem.textContent = counts.p2Units;
      this.p2KingsElem.textContent = counts.p2Kings;
      this.p2CapturedElem.textContent = counts.p2Captured;

      const isP1Turn = this.engine.activePlayer === PLAYER_1;
      this.cardP1.classList.toggle('active', isP1Turn);
      this.cardP2.classList.toggle('active', !isP1Turn);

      this.boardFrame.classList.toggle('turn-p1', isP1Turn);
      this.boardFrame.classList.toggle('turn-p2', !isP1Turn);

      if (isP1Turn) {
        this.p1StatusBanner.textContent = 'ACTIVE TURN';
        this.p2StatusBanner.textContent = 'STANDBY';
        this.setAnnouncer(this.engine.mustCapturePieces.length > 0 ?
          'MANDATORY TACTICAL CAPTURE REQUIRED.' :
          'PLAYER 1 (CYAN) ENGAGE PIECE.');
      } else {
        this.p1StatusBanner.textContent = 'STANDBY';
        this.p2StatusBanner.textContent = this.gameMode === 'ai' ? 'NEURAL ENGINE ENGAGED' : 'ACTIVE TURN';
        this.setAnnouncer(this.gameMode === 'ai' ?
          'AI CALCULATING TACTICAL OFFENSIVE...' :
          'PLAYER 2 (MAGENTA) ENGAGE PIECE.');
      }

      this.telemetryRound.textContent = this.roundNumber;
      this.telemetryMoves.textContent = this.totalMovesCount;

      // Update Board Numbers Toggle class
      this.boardElem.classList.toggle('show-numbers', this.showNumbers);
    }

    setAnnouncer(text) {
      if (this.announcerText) {
        this.announcerText.textContent = text;
      }
    }

    /* -------------------------------------------------------------
       Turn Timer & Miltillash Protocol (30s Circular Meter)
       ------------------------------------------------------------- */
    startTurnTimer() {
      this.stopTurnTimer();
      this.turnTimeRemaining = this.turnTimeLimit;
      this.miltillashActive = false;
      this.updateTimerDisplay();

      this.timerInterval = setInterval(() => {
        this.turnTimeRemaining--;

        // Miltillash Emergency Alarm Trigger (<= 5s)
        if (this.turnTimeRemaining <= 5 && this.turnTimeRemaining > 0) {
          if (!this.miltillashActive) {
            this.miltillashActive = true;
            this.logTerminalSystem('MILTILLASH WARNING ACTIVATED: TIME RUNNING CRITICAL.');
          }
          this.audio.playWarningBeep();
        }

        if (this.turnTimeRemaining <= 0) {
          this.handleTurnTimeout();
        }

        this.updateTimerDisplay();
      }, 1000);
    }

    stopTurnTimer() {
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
    }

    updateTimerDisplay() {
      this.timerSecondsElem.textContent = Math.max(0, this.turnTimeRemaining);

      // Circle circumference: 2 * PI * 42 = 263.89
      const totalCircumference = 264;
      const progressRatio = Math.max(0, this.turnTimeRemaining / this.turnTimeLimit);
      const offset = totalCircumference * (1 - progressRatio);
      this.timerProgressRing.style.strokeDashoffset = offset;

      if (this.turnTimeRemaining <= 5) {
        this.timerDock.classList.add('miltillash-active');
      } else {
        this.timerDock.classList.remove('miltillash-active');
      }
    }

    /* -------------------------------------------------------------
       Fully Functional Protocol Pause System
       ------------------------------------------------------------- */
    pauseGame() {
      if (this.isPaused) return;
      this.isPaused = true;
      this.stopTurnTimer();
      if (this.pauseOverlay) this.pauseOverlay.classList.add('show');
      if (this.btnPauseToggle) {
        this.btnPauseToggle.classList.add('active');
        if (this.pauseIcon) this.pauseIcon.textContent = '▶';
        if (this.pauseText) this.pauseText.textContent = 'RESUME';
      }
      this.audio.playPauseSound();
      this.logTerminalSystem(`[SYSTEM] PROTOCOL PAUSED. TIMER FROZEN AT ${this.turnTimeRemaining} SECONDS.`);
    }

    resumeGame() {
      if (!this.isPaused) return;
      this.isPaused = false;
      if (this.pauseOverlay) this.pauseOverlay.classList.remove('show');
      if (this.btnPauseToggle) {
        this.btnPauseToggle.classList.remove('active');
        if (this.pauseIcon) this.pauseIcon.textContent = '||';
        if (this.pauseText) this.pauseText.textContent = 'PAUSE';
      }
      this.audio.playResumeSound();
      this.resumeTurnTimer();
      this.logTerminalSystem('[SYSTEM] PROTOCOL RESUMED. MATCH CLOCK ACTIVE.');
    }

    togglePause() {
      if (this.isPaused) {
        this.resumeGame();
      } else {
        this.pauseGame();
      }
    }

    resumeTurnTimer() {
      this.stopTurnTimer();
      this.updateTimerDisplay();

      this.timerInterval = setInterval(() => {
        if (this.isPaused) return;
        this.turnTimeRemaining--;

        // Miltillash Emergency Alarm Trigger (<= 5s)
        if (this.turnTimeRemaining <= 5 && this.turnTimeRemaining > 0) {
          if (!this.miltillashActive) {
            this.miltillashActive = true;
            this.logTerminalSystem('MILTILLASH WARNING ACTIVATED: TIME RUNNING CRITICAL.');
          }
          this.audio.playWarningBeep();
        }

        if (this.turnTimeRemaining <= 0) {
          this.handleTurnTimeout();
        }

        this.updateTimerDisplay();
      }, 1000);
    }

    handleTurnTimeout() {
      if (this.isPaused) return;
      this.stopTurnTimer();
      this.logTerminalSystem(`CYCLE TIMEOUT: Turn auto-passed for ${this.engine.activePlayer === PLAYER_1 ? 'Player 1' : 'Player 2'}.`);
      this.audio.playClick();

      // If active player has a capture, force execute first legal move or switch turn
      const legalMoves = [];
      for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 10; c++) {
          if (this.engine.isPlayerPiece(this.engine.board[r][c], this.engine.activePlayer)) {
            const moves = this.engine.getLegalMovesForSquare(r, c);
            if (moves.length > 0) legalMoves.push(...moves);
          }
        }
      }

      if (legalMoves.length > 0) {
        const forced = legalMoves[0];
        this.executeMoveAction(forced.from.r, forced.from.c, forced.to.r, forced.to.c);
      } else {
        // Pass Turn
        this.engine.activePlayer = this.engine.activePlayer === PLAYER_1 ? PLAYER_2 : PLAYER_1;
        this.engine.selectedPiece = null;
        this.engine.chainInProgress = false;
        this.engine.calculateMandatoryCaptures();
        this.render();
        this.startTurnTimer();
        this.checkAITurnTrigger();
      }
    }

    /* -------------------------------------------------------------
       Player Interactions & "Click to Move" Logic
       ------------------------------------------------------------- */
    handleCellClick(r, c, event) {
      // Disables all selection/movement when paused!
      if (this.isPaused) return;

      // Ignore clicks during AI calculation
      if (this.isProcessingAi && this.engine.activePlayer === PLAYER_2) return;

      const piece = this.engine.board[r][c];
      const isPlayerTurnPiece = this.engine.isPlayerPiece(piece, this.engine.activePlayer);

      // Case 1: Player clicks on one of their own pieces
      if (isPlayerTurnPiece) {
        // If chain is currently in progress, cannot switch pieces!
        if (this.engine.chainInProgress && this.engine.chainPiece) {
          if (r !== this.engine.chainPiece.r || c !== this.engine.chainPiece.c) {
            return;
          }
        }

        // If mandatory captures exist, check if this piece has captures
        if (this.engine.mustCapturePieces.length > 0) {
          const canCapture = this.engine.mustCapturePieces.some(p => p.r === r && p.c === c);
          if (!canCapture) {
            this.setAnnouncer('MANDATORY CAPTURE: Select a unit with viable captures.');
            this.audio.playClick();
            return;
          }
        }

        this.engine.selectedPiece = { r, c };
        this.audio.playClick();

        // Trigger Radar Pulse Animation
        const teamColor = this.engine.activePlayer === PLAYER_1 ? '#00f0ff' : '#ff007f';
        this.fx.spawnRadar(r, c, teamColor);

        this.render();
        return;
      }

      // Case 2: Player has selected a piece and clicks on a destination square
      if (this.engine.selectedPiece) {
        const destMoves = this.engine.getLegalMovesForSquare(this.engine.selectedPiece.r, this.engine.selectedPiece.c);
        const isValidDest = destMoves.find(m => m.to.r === r && m.to.c === c);

        if (isValidDest) {
          this.executeMoveAction(this.engine.selectedPiece.r, this.engine.selectedPiece.c, r, c);
        } else {
          // Deselect piece if clicking an invalid square (unless chain in progress)
          if (!this.engine.chainInProgress) {
            this.engine.selectedPiece = null;
            this.render();
          }
        }
      }
    }

    /**
     * Executes move, plays Audio FX, triggers Canvas FX, logs history
     */
    executeMoveAction(fromR, fromC, toR, toC) {
      // Save state before move for Undo functionality
      this.pushHistoryState();

      const moveResult = this.engine.executeMove(fromR, fromC, toR, toC);
      if (!moveResult.success) return;

      this.totalMovesCount++;

      // 1. Audio FX Triggers
      if (moveResult.isCapture) {
        this.audio.playBassBlast();
      } else {
        this.audio.playSwoosh();
      }

      // 2. Visual Particle FX Triggers
      if (moveResult.isCapture && moveResult.capturedPieces.length > 0) {
        const isEnemyMagenta = (moveResult.player === PLAYER_1);
        moveResult.capturedPieces.forEach(cap => {
          this.fx.spawnDissolve(cap.r, cap.c, isEnemyMagenta);
        });
      }

      // 3. Overdrive Promotion FX
      if (moveResult.isPromotion) {
        this.audio.playPromotion();
        this.fx.spawnPromotionShockwave(toR, toC, '#ffbe0b');
        this.logTerminalSystem(`OVERDRIVE CORONATION: Piece at ${moveResult.notation.split(/[-x]/)[1]} ascended to ELITE FLYING KING!`);
      }

      // 4. Update History Terminal Log
      this.logMoveNotation(moveResult);

      // 5. Handle Chain Jumps vs Turn End
      if (!moveResult.turnEnded && this.engine.chainInProgress) {
        // Piece stays selected at landing position for next jump in chain
        this.engine.selectedPiece = { r: toR, c: toC };
        this.setAnnouncer('CHAIN JUMP SEQUENCE: Continue mandatory multi-jump.');
        this.render();
      } else {
        // Turn Ended: reset selected piece and reset turn timer
        this.engine.selectedPiece = null;
        this.render();

        // Check Victory / Game Over
        const overCheck = this.engine.checkGameOver();
        if (overCheck.over) {
          this.handleGameOver(overCheck);
          return;
        }

        if (this.engine.activePlayer === PLAYER_1) {
          this.roundNumber++;
        }

        this.startTurnTimer();
        this.checkAITurnTrigger();
      }
    }

    /* -------------------------------------------------------------
       Tactical AI Turn Trigger
       ------------------------------------------------------------- */
    checkAITurnTrigger() {
      if (this.gameMode === 'ai' && this.engine.activePlayer === PLAYER_2) {
        this.isProcessingAi = true;
        this.aiStatusText.textContent = 'ANALYZING TACTICAL TREE...';
        this.aiActivityFill.classList.add('thinking');

        // Allow UI to update before synchronous AI computation
        setTimeout(() => {
          const best = this.ai.findBestMove();
          this.aiActivityFill.classList.remove('thinking');

          if (!best || !best.move) {
            this.isProcessingAi = false;
            this.aiStatusText.textContent = 'NO MOVES FOUND';
            return;
          }

          // Update AI Telemetry HUD
          this.aiStatusText.textContent = 'OPTIMAL PATH ENGAGED';
          this.aiDepthVal.textContent = `PLY ${best.depth}`;
          this.aiNodesVal.textContent = best.nodes;
          this.aiEvalVal.textContent = (best.score > 0 ? `+${best.score}` : best.score);
          this.aiTimeVal.textContent = `${best.timeMs} ms`;

          // Execute AI chain moves sequentially with small realistic delay
          this.executeAIChain(best.move);
        }, 450);
      }
    }

    executeAIChain(aiMove) {
      let currentFrom = aiMove.from;

      const executeNextStep = (stepIdx) => {
        if (stepIdx >= aiMove.fullChain.length) {
          this.isProcessingAi = false;
          return;
        }

        const nextStep = aiMove.fullChain[stepIdx];
        this.executeMoveAction(currentFrom.r, currentFrom.c, nextStep.r, nextStep.c);
        currentFrom = nextStep;

        if (stepIdx + 1 < aiMove.fullChain.length) {
          setTimeout(() => executeNextStep(stepIdx + 1), 380);
        } else {
          this.isProcessingAi = false;
        }
      };

      executeNextStep(0);
    }

    /* -------------------------------------------------------------
       History Terminal & Notation Logging
       ------------------------------------------------------------- */
    logMoveNotation(moveResult) {
      const isP1 = (moveResult.player === PLAYER_1);

      if (isP1) {
        // Create new row
        const row = document.createElement('div');
        row.className = 'log-row-move';
        row.dataset.round = this.roundNumber;

        let extraTags = '';
        if (moveResult.isCapture) extraTags += '<span class="move-capture-tag">[x]</span>';
        if (moveResult.isPromotion) extraTags += '<span class="move-king-tag">[CROWN]</span>';

        row.innerHTML = `
          <span class="move-num">${this.roundNumber}.</span>
          <span class="move-p1">${moveResult.notation} ${extraTags}</span>
          <span class="move-p2">...</span>
        `;
        this.terminalLog.appendChild(row);
      } else {
        // Find current round row or create one
        let lastRow = this.terminalLog.querySelector(`.log-row-move[data-round="${this.roundNumber}"]`);
        if (!lastRow) {
          lastRow = document.createElement('div');
          lastRow.className = 'log-row-move';
          lastRow.dataset.round = this.roundNumber;
          lastRow.innerHTML = `
            <span class="move-num">${this.roundNumber}.</span>
            <span class="move-p1">--</span>
            <span class="move-p2"></span>
          `;
          this.terminalLog.appendChild(lastRow);
        }

        let extraTags = '';
        if (moveResult.isCapture) extraTags += '<span class="move-capture-tag">[x]</span>';
        if (moveResult.isPromotion) extraTags += '<span class="move-king-tag">[CROWN]</span>';

        const p2Span = lastRow.querySelector('.move-p2');
        if (p2Span) {
          p2Span.innerHTML = `${moveResult.notation} ${extraTags}`;
        }
      }

      // Auto-scroll to bottom of terminal
      this.terminalLog.scrollTop = this.terminalLog.scrollHeight;
    }

    logTerminalSystem(text) {
      const entry = document.createElement('div');
      entry.className = 'log-entry log-sys';
      const timeStr = new Date().toTimeString().split(' ')[0];
      entry.innerHTML = `<span class="log-time">[${timeStr}]</span> <span class="log-text">${text}</span>`;
      this.terminalLog.appendChild(entry);
      this.terminalLog.scrollTop = this.terminalLog.scrollHeight;
    }

    /* -------------------------------------------------------------
       Undo Move State System
       ------------------------------------------------------------- */
    pushHistoryState() {
      // Push deep clone of engine and match metrics
      this.historyStack.push({
        engineState: this.engine.cloneState(),
        roundNumber: this.roundNumber,
        totalMovesCount: this.totalMovesCount,
        terminalHtml: this.terminalLog.innerHTML
      });
      // Limit history stack size to 50
      if (this.historyStack.length > 50) this.historyStack.shift();
    }

    undoMove() {
      if (this.historyStack.length === 0) {
        this.setAnnouncer('NO PREVIOUS TELEMETRY TO RESTORE.');
        return;
      }

      // In AI mode, if human clicks undo on their turn, revert 2 moves (AI move + human move)
      let statesToPop = 1;
      if (this.gameMode === 'ai' && this.engine.activePlayer === PLAYER_1 && this.historyStack.length >= 2) {
        statesToPop = 2;
      }

      let restored = null;
      for (let i = 0; i < statesToPop; i++) {
        if (this.historyStack.length > 0) {
          restored = this.historyStack.pop();
        }
      }

      if (restored) {
        this.engine.restoreState(restored.engineState);
        this.roundNumber = restored.roundNumber;
        this.totalMovesCount = restored.totalMovesCount;
        this.terminalLog.innerHTML = restored.terminalHtml;
        this.terminalLog.scrollTop = this.terminalLog.scrollHeight;

        this.audio.playClick();
        this.logTerminalSystem('TEMPORAL REVERSION: State rolled back successfully.');
        this.render();
        this.startTurnTimer();
      }
    }

    /* -------------------------------------------------------------
       Game Over & Modals
       ------------------------------------------------------------- */
    handleGameOver(info) {
      this.stopTurnTimer();
      const counts = this.engine.getPieceCounts();

      if (info.winner === PLAYER_1) {
        this.audio.playVictory();
        this.gameOverTitle.textContent = 'TACTICAL VICTORY';
        this.gameOverTitle.className = 'modal-title text-cyan';
        this.gameOverSubtitle.textContent = 'CYAN OPERATOR HAS DOMINATED THE GRID';
      } else {
        this.audio.playDefeat();
        this.gameOverTitle.textContent = 'TACTICAL DEFEAT';
        this.gameOverTitle.className = 'modal-title text-magenta';
        this.gameOverSubtitle.textContent = 'MAGENTA CORE HAS OVERWHELMED YOUR DEFENSES';
      }

      document.getElementById('m-stat-moves').textContent = this.totalMovesCount;
      document.getElementById('m-stat-units').textContent = info.winner === PLAYER_1 ? counts.p1Units : counts.p2Units;
      document.getElementById('m-stat-kings').textContent = info.winner === PLAYER_1 ? counts.p1Kings : counts.p2Kings;
      document.getElementById('m-stat-captured').textContent = info.winner === PLAYER_1 ? counts.p1Captured : counts.p2Captured;

      this.logTerminalSystem(`PROTOCOL TERMINATED: ${info.reason}`);
      this.gameOverModal.classList.add('show');
    }

    restartMatch() {
      this.engine.reset();
      this.historyStack = [];
      this.roundNumber = 1;
      this.totalMovesCount = 0;
      this.terminalLog.innerHTML = '';
      this.gameOverModal.classList.remove('show');
      this.logTerminalSystem('BOARD MATRIX CLEARED. NEW COMBAT PROTOCOL INITIATED.');
      this.render();
      this.startTurnTimer();
      this.audio.playClick();
    }

    /* -------------------------------------------------------------
       Event Listeners & UI Wire-Up
       ------------------------------------------------------------- */
    setupEventListeners() {
      // Audio Toggle & Volume
      const btnAudio = document.getElementById('btn-audio-toggle');
      const audioIcon = document.getElementById('audio-icon');
      const audioText = document.getElementById('audio-text');
      const volSlider = document.getElementById('volume-slider');

      btnAudio.addEventListener('click', () => {
        const isEnabled = this.audio.toggleMute();
        audioIcon.innerHTML = isEnabled ? '&#128266;' : '&#128263;';
        audioText.textContent = isEnabled ? 'SFX ON' : 'MUTED';
        this.audio.playClick();
      });

      volSlider.addEventListener('input', (e) => {
        this.audio.setVolume(parseFloat(e.target.value));
      });

      // Quick Actions
      document.getElementById('btn-undo-move').addEventListener('click', () => this.undoMove());
      document.getElementById('btn-restart-game').addEventListener('click', () => this.restartMatch());
      document.getElementById('btn-auto-pass').addEventListener('click', () => this.handleTurnTimeout());

      // Mode Selector (AI vs PVP)
      const modeButtons = document.querySelectorAll('#mode-selector .toggle-btn');
      modeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          modeButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.gameMode = btn.dataset.mode;
          this.p2NameLabel.textContent = this.gameMode === 'ai' ? 'PLAYER 2 // CYBER NEXUS' : 'PLAYER 2 // OPERATOR';
          document.getElementById('ai-difficulty-row').style.display = this.gameMode === 'ai' ? 'flex' : 'none';
          this.logTerminalSystem(`MATCH MODE ALTERED: ${this.gameMode.toUpperCase()}`);
          this.audio.playClick();
          this.render();
          this.checkAITurnTrigger();
        });
      });

      // Difficulty Selector
      const diffButtons = document.querySelectorAll('#difficulty-selector .toggle-btn');
      diffButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          diffButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.ai.setDifficulty(btn.dataset.diff);
          this.logTerminalSystem(`AI PROTOCOL UPDATED: ${btn.dataset.diff.toUpperCase()}`);
          this.audio.playClick();
        });
      });

      // Board Helpers
      document.getElementById('chk-show-numbers').addEventListener('change', (e) => {
        this.showNumbers = e.target.checked;
        this.render();
      });

      document.getElementById('chk-sound-fx').addEventListener('change', (e) => {
        this.audio.enabled = e.target.checked;
      });

      // Modal Controls
      document.getElementById('btn-open-rules').addEventListener('click', () => {
        this.rulesModal.classList.add('show');
        this.audio.playClick();
      });
      document.getElementById('btn-close-rules').addEventListener('click', () => {
        this.rulesModal.classList.remove('show');
        this.audio.playClick();
      });
      document.getElementById('btn-modal-restart').addEventListener('click', () => this.restartMatch());
      document.getElementById('btn-modal-close').addEventListener('click', () => {
        this.gameOverModal.classList.remove('show');
        this.audio.playClick();
      });

      // Terminal Actions
      document.getElementById('btn-clear-log').addEventListener('click', () => {
        this.terminalLog.innerHTML = '';
        this.logTerminalSystem('TELEMETRY BUFFER CLEARED.');
        this.audio.playClick();
      });

      document.getElementById('btn-export-pgn').addEventListener('click', () => {
        const rows = this.terminalLog.querySelectorAll('.log-row-move');
        let text = 'CYBER DRAUGHTS 10x10 PROTOCOL\n';
        rows.forEach(r => {
          const num = r.querySelector('.move-num')?.textContent || '';
          const p1 = r.querySelector('.move-p1')?.textContent.trim() || '';
          const p2 = r.querySelector('.move-p2')?.textContent.trim() || '';
          text += `${num} ${p1}  ${p2}\n`;
        });
        navigator.clipboard.writeText(text).then(() => {
          this.logTerminalSystem('NOTATION COPIED TO CLIPBOARD.');
        }).catch(() => {
          this.logTerminalSystem('CLIPBOARD WRITE ERROR.');
        });
        this.audio.playClick();
      });

      // Pause Button & Resume Button
      if (this.btnPauseToggle) {
        this.btnPauseToggle.addEventListener('click', () => this.togglePause());
      }
      if (this.btnResumeGame) {
        this.btnResumeGame.addEventListener('click', () => this.resumeGame());
      }

      // Music OST Toggle Button
      if (this.btnMusicToggle) {
        this.btnMusicToggle.addEventListener('click', () => {
          const isPlaying = this.audio.toggleMusic();
          if (this.musicIcon) this.musicIcon.innerHTML = isPlaying ? '&#9835;' : '&#10005;';
          if (this.musicText) this.musicText.textContent = isPlaying ? 'OST ON' : 'OST OFF';
          this.audio.playClick();
        });
      }

      // Global Keyboard Shortcut: Space or P toggles Pause
      window.addEventListener('keydown', (e) => {
        if (e.code === 'Space' || e.code === 'KeyP') {
          if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
            this.togglePause();
          }
        }
      });

      // Window blur/focus audio safety
      window.addEventListener('click', () => {
        this.audio.ensureContext();
      }, { once: true });
    }
  }

  // Initialize once DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    window.gameInstance = new CyberCheckersGame();
    if (window.location.search.includes('pause=true')) {
      setTimeout(() => {
        window.gameInstance.dismissSplash(true);
        window.gameInstance.pauseGame();
      }, 200);
    } else if (window.location.search.includes('showcase=true')) {
      setTimeout(() => {
        // Dismiss splash in showcase mode
        window.gameInstance.dismissSplash(true);
        // Crown a king to showcase elite design
        window.gameInstance.engine.board[7][0] = 2;
        // Select piece at (6, 1) to showcase radar pulse and dashed paths
        const cell = window.gameInstance.getCellElem(6, 1);
        if (cell) cell.click();
      }, 250);
    }
  });
})();

(function () {
  const FamilyDash = (window.FamilyDash = window.FamilyDash || {});

  const NOTE_INDEX = {
    C: 0,
    "C#": 1,
    Db: 1,
    D: 2,
    "D#": 3,
    Eb: 3,
    E: 4,
    F: 5,
    "F#": 6,
    Gb: 6,
    G: 7,
    "G#": 8,
    Ab: 8,
    A: 9,
    "A#": 10,
    Bb: 10,
    B: 11
  };

  const SOUNDTRACKS = [
    {
      name: "Starter Line",
      stepMs: 156,
      loopsBeforeSwitch: 16,
      bassWave: "triangle",
      leadWave: "square",
      accentWave: "sine",
      drumWave: "sawtooth",
      bass: ["C3", null, "G2", null, "A2", null, "F2", null],
      lead: ["E4", "G4", "A4", "G4", "C5", "A4", "G4", "E4"],
      accent: [["C4", "G4"], null, ["D4", "A4"], null, ["A3", "E4"], null, ["F4", "A4"], null],
      drums: [1, 0, 1, 0, 1, 1, 1, 0],
      drumPitch: 92
    },
    {
      name: "Neon Snack Chase",
      stepMs: 162,
      loopsBeforeSwitch: 16,
      bassWave: "triangle",
      leadWave: "sawtooth",
      accentWave: "square",
      drumWave: "sine",
      bass: ["D3", null, "A2", null, "Bb2", null, "C3", null],
      lead: ["F4", "A4", "C5", "A4", "D5", "C5", "A4", "G4"],
      accent: [["D4", "F4"], null, ["A3", "E4"], null, ["Bb3", "D4"], null, ["C4", "G4"], null],
      drums: [1, 0, 0, 1, 1, 0, 1, 1],
      drumPitch: 86
    },
    {
      name: "Backyard Bounce",
      stepMs: 170,
      loopsBeforeSwitch: 14,
      bassWave: "triangle",
      leadWave: "square",
      accentWave: "sine",
      drumWave: "triangle",
      bass: ["G2", null, "D3", null, "E3", null, "C3", null],
      lead: ["B4", "D5", "E5", "D5", "G5", "E5", "D5", "B4"],
      accent: [["G4", "B4"], null, ["D4", "A4"], null, ["E4", "B4"], null, ["C4", "G4"], null],
      drums: [1, 0, 1, 1, 1, 0, 1, 0],
      drumPitch: 98
    },
    {
      name: "Pixel Playground",
      stepMs: 148,
      loopsBeforeSwitch: 16,
      bassWave: "square",
      leadWave: "triangle",
      accentWave: "sine",
      drumWave: "sawtooth",
      bass: ["A2", null, "E3", null, "F3", null, "G3", null],
      lead: ["A4", "C5", "E5", "C5", "F5", "E5", "D5", "C5"],
      accent: [["A3", "E4"], null, ["C4", "G4"], null, ["F4", "A4"], null, ["G4", "B4"], null],
      drums: [1, 1, 0, 1, 1, 0, 1, 0],
      drumPitch: 90
    },
    {
      name: "Turbo Tunnel",
      stepMs: 134,
      loopsBeforeSwitch: 18,
      bassWave: "sawtooth",
      leadWave: "square",
      accentWave: "triangle",
      drumWave: "square",
      bass: ["E2", null, "B2", null, "G2", null, "D3", null],
      lead: ["G4", "B4", "D5", "E5", "G5", "E5", "D5", "B4"],
      accent: [["E4", "B4"], null, ["B3", "F#4"], null, ["G4", "D5"], null, ["D4", "A4"], null],
      drums: [1, 0, 1, 0, 1, 1, 0, 1],
      drumPitch: 82
    },
    {
      name: "Saturday Sprint",
      stepMs: 176,
      loopsBeforeSwitch: 14,
      bassWave: "triangle",
      leadWave: "sine",
      accentWave: "square",
      drumWave: "triangle",
      bass: ["F2", null, "C3", null, "D3", null, "Bb2", null],
      lead: ["A4", "C5", "D5", "C5", "F5", "D5", "C5", "A4"],
      accent: [["F4", "A4"], null, ["C4", "G4"], null, ["D4", "A4"], null, ["Bb3", "F4"], null],
      drums: [1, 0, 1, 1, 0, 1, 0, 1],
      drumPitch: 95
    },
    {
      name: "Rooftop Rush",
      stepMs: 144,
      loopsBeforeSwitch: 16,
      bassWave: "triangle",
      leadWave: "sawtooth",
      accentWave: "sine",
      drumWave: "square",
      bass: ["B2", null, "F#2", null, "G2", null, "A2", null],
      lead: ["D4", "F#4", "A4", "F#4", "B4", "A4", "F#4", "E4"],
      accent: [["B3", "F#4"], null, ["F#3", "C#4"], null, ["G3", "D4"], null, ["A3", "E4"], null],
      drums: [1, 1, 0, 0, 1, 0, 1, 1],
      drumPitch: 88
    },
    {
      name: "Coin Magnet Jam",
      stepMs: 158,
      loopsBeforeSwitch: 16,
      bassWave: "square",
      leadWave: "triangle",
      accentWave: "sine",
      drumWave: "sawtooth",
      bass: ["D3", null, "A2", null, "B2", null, "G2", null],
      lead: ["F#4", "A4", "B4", "A4", "D5", "B4", "A4", "F#4"],
      accent: [["D4", "A4"], null, ["A3", "E4"], null, ["B3", "F#4"], null, ["G3", "D4"], null],
      drums: [1, 0, 1, 1, 1, 0, 0, 1],
      drumPitch: 93
    },
    {
      name: "Tiny Menace Mode",
      stepMs: 126,
      loopsBeforeSwitch: 18,
      bassWave: "sawtooth",
      leadWave: "square",
      accentWave: "triangle",
      drumWave: "sine",
      bass: ["C3", "G2", "Eb3", "Bb2", "Ab2", "Eb3", "Bb2", "G2"],
      lead: ["Eb5", "G5", "Bb5", "G5", "C6", "Bb5", "G5", "Eb5"],
      accent: [["C4", "Eb4"], null, ["G3", "Bb3"], null, ["Ab3", "C4"], null, ["Bb3", "D4"], null],
      drums: [1, 1, 1, 0, 1, 0, 1, 1],
      drumPitch: 78
    },
    {
      name: "Victory Lap Skyline",
      stepMs: 168,
      loopsBeforeSwitch: 14,
      bassWave: "triangle",
      leadWave: "sine",
      accentWave: "square",
      drumWave: "triangle",
      bass: ["G2", null, "D3", null, "E3", null, "C3", null],
      lead: ["D5", "G5", "B5", "A5", "G5", "E5", "D5", "B4"],
      accent: [["G4", "D5"], null, ["D4", "A4"], null, ["E4", "B4"], null, ["C4", "G4"], null],
      drums: [1, 0, 1, 0, 1, 1, 0, 1],
      drumPitch: 100
    }
  ];

  function noteToFrequency(note) {
    if (!note) return null;
    if (typeof note === "number") return note;
    const match = /^([A-G](?:#|b)?)(-?\d)$/.exec(note);
    if (!match) return null;
    const semitone = NOTE_INDEX[match[1]];
    const octave = Number(match[2]);
    if (semitone == null || Number.isNaN(octave)) return null;
    const midi = (octave + 1) * 12 + semitone;
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  class AudioSystem {
    constructor() {
      this.ctx = null;
      this.enabled = true;
      this.musicTimer = null;
      this.musicStep = 0;
      this.musicVolume = 0.035;
      this.soundtracks = SOUNDTRACKS;
      this.currentTrackIndex = -1;
      this.currentTrack = null;
      this.trackLoops = 0;
      this.onTrackChange = null;
    }

    ensureCtx() {
      if (!this.enabled) return null;
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) {
          this.enabled = false;
          return null;
        }
        this.ctx = new AudioCtx();
      }
      return this.ctx;
    }

    setTrackChangeListener(listener) {
      this.onTrackChange = typeof listener === "function" ? listener : null;
      if (this.onTrackChange && this.currentTrack) this.onTrackChange(this.currentTrack, this.currentTrackIndex);
    }

    announceTrack() {
      if (this.onTrackChange && this.currentTrack) this.onTrackChange(this.currentTrack, this.currentTrackIndex);
    }

    selectTrack(index) {
      if (!this.soundtracks.length) return;
      const length = this.soundtracks.length;
      const safeIndex = ((index % length) + length) % length;
      this.currentTrackIndex = safeIndex;
      this.currentTrack = this.soundtracks[safeIndex];
      this.musicStep = 0;
      this.trackLoops = 0;
      this.announceTrack();
    }

    advanceTrack() {
      if (!this.soundtracks.length) return;
      const nextIndex = this.currentTrackIndex < 0
        ? Math.floor(Math.random() * this.soundtracks.length)
        : (this.currentTrackIndex + 1) % this.soundtracks.length;
      this.selectTrack(nextIndex);
    }

    beep(type, frequency, duration, gain) {
      const ctx = this.ensureCtx();
      if (!ctx || !frequency) return;
      const osc = ctx.createOscillator();
      const amp = ctx.createGain();
      const now = ctx.currentTime;
      const attack = Math.min(0.01, (duration || 0.08) * 0.2);
      osc.type = type || "sine";
      osc.frequency.setValueAtTime(frequency || 440, now);
      amp.gain.setValueAtTime(0.0001, now);
      amp.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain || 0.05), now + attack);
      amp.gain.exponentialRampToValueAtTime(0.0001, now + Math.max(attack + 0.01, duration || 0.08));
      osc.connect(amp);
      amp.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + Math.max(0.05, duration || 0.08) + 0.03);
    }

    playVoice(pattern, step, wave, duration, gain) {
      if (!pattern || !pattern.length) return;
      const note = pattern[step % pattern.length];
      if (!note) return;
      const notes = Array.isArray(note) ? note : [note];
      notes.forEach((entry, index) => {
        const frequency = noteToFrequency(entry);
        if (!frequency) return;
        const voiceGain = (gain || 0.05) / Math.max(1, notes.length) * (index === 0 ? 1 : 0.85);
        this.beep(wave, frequency, duration, voiceGain);
      });
    }

    playMusicStep() {
      if (!this.currentTrack) {
        this.musicTimer = null;
        return;
      }

      const track = this.currentTrack;
      const step = this.musicStep % track.bass.length;
      const stepSeconds = track.stepMs / 1000;

      this.playVoice(track.bass, step, track.bassWave || "triangle", stepSeconds * 0.92, this.musicVolume * 0.95);
      this.playVoice(track.lead, step, track.leadWave || "square", stepSeconds * 0.68, this.musicVolume * 0.72);
      this.playVoice(track.accent, step, track.accentWave || "sine", stepSeconds * 0.6, this.musicVolume * 0.45);

      if (track.drums && track.drums[step % track.drums.length]) {
        this.beep(track.drumWave || "sawtooth", track.drumPitch || 90, Math.min(0.06, stepSeconds * 0.5), this.musicVolume * 0.35);
      }

      this.musicStep += 1;

      if (this.musicStep % track.bass.length === 0) {
        this.trackLoops += 1;
        if (this.trackLoops >= (track.loopsBeforeSwitch || 16)) this.advanceTrack();
      }

      this.musicTimer = window.setTimeout(() => this.playMusicStep(), this.currentTrack.stepMs);
    }

    startMusic() {
      const ctx = this.ensureCtx();
      if (!ctx) return;
      if (ctx.state === "suspended") ctx.resume();
      if (this.musicTimer) return;
      if (!this.currentTrack) {
        this.selectTrack(Math.floor(Math.random() * this.soundtracks.length));
      } else {
        this.announceTrack();
      }
      this.musicTimer = window.setTimeout(() => this.playMusicStep(), 0);
    }

    stopMusic() {
      if (this.musicTimer) {
        clearTimeout(this.musicTimer);
        this.musicTimer = null;
      }
    }

    jump() { this.beep("triangle", 550, 0.08, 0.05); }
    coin() { this.beep("sine", 880, 0.06, 0.04); }
    hit() { this.beep("square", 150, 0.12, 0.06); }
    powerup() { this.beep("sawtooth", 660, 0.1, 0.05); }
    kick() { this.beep("square", 280, 0.07, 0.05); }
  }

  FamilyDash.AudioSystem = AudioSystem;
})();

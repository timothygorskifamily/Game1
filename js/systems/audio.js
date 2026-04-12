(function () {
  const FamilyDash = (window.FamilyDash = window.FamilyDash || {});

  class AudioSystem {
    constructor() {
      this.ctx = null;
      this.enabled = true;
      this.musicTimer = null;
      this.musicStep = 0;
      this.musicVolume = 0.03;
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

    beep(type, frequency, duration, gain) {
      const ctx = this.ensureCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const amp = ctx.createGain();
      osc.type = type || "sine";
      osc.frequency.value = frequency || 440;
      amp.gain.value = gain || 0.05;
      osc.connect(amp);
      amp.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + (duration || 0.08));
    }

    startMusic() {
      const ctx = this.ensureCtx();
      if (!ctx || this.musicTimer) return;
      const bass = [130.81, 130.81, 146.83, 164.81, 130.81, 174.61, 196, 164.81];
      const lead = [523.25, 587.33, 659.25, 698.46, 783.99, 659.25, 587.33, 523.25];
      this.musicTimer = setInterval(() => {
        const step = this.musicStep % 8;
        const bassFreq = bass[step];
        const leadFreq = lead[(step + 2) % 8];
        this.beep("triangle", bassFreq, 0.16, this.musicVolume);
        this.beep("square", leadFreq, 0.11, this.musicVolume * 0.8);
        if (step % 2 === 0) this.beep("sawtooth", 90, 0.04, this.musicVolume * 0.5);
        this.musicStep += 1;
      }, 180);
    }

    stopMusic() {
      if (this.musicTimer) {
        clearInterval(this.musicTimer);
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

export class AudioSystem {
  constructor() {
    this.ctx = null;
    this.enabled = true;
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

  beep(type = "sine", frequency = 440, duration = 0.08, gain = 0.05) {
    const ctx = this.ensureCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = type;
    osc.frequency.value = frequency;
    amp.gain.value = gain;
    osc.connect(amp);
    amp.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }

  jump() { this.beep("triangle", 550, 0.08, 0.05); }
  coin() { this.beep("sine", 880, 0.06, 0.04); }
  hit() { this.beep("square", 150, 0.12, 0.06); }
  powerup() { this.beep("sawtooth", 660, 0.1, 0.05); }
  kick() { this.beep("square", 280, 0.07, 0.05); }
}

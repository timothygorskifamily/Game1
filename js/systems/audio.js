(function () {
  const FamilyDash = (window.FamilyDash = window.FamilyDash || {});

  const MUSIC_TRACKS = [
    { name: "Afterlight", src: "assets/characters/music/afterlight.mp3" },
    { name: "Golden Echoes", src: "assets/characters/music/golden_echoes.mp3" },
    { name: "Into The Dawn Demo", src: "assets/characters/music/into_the_dawn_demo.mp3" },
    { name: "Neon River", src: "assets/characters/music/neon_river.mp3" },
    { name: "Skyline Hearts", src: "assets/characters/music/skyline_hearts.mp3" },
    { name: "Summer Static", src: "assets/characters/music/summer_static.mp3" }
  ];

  class AudioSystem {
    constructor() {
      this.ctx = null;
      this.enabled = true;
      this.noiseBuffer = null;

      this.soundtracks = MUSIC_TRACKS;
      this.musicVolume = 0.48;
      this.currentTrackIndex = -1;
      this.nextTrackIndex = this.soundtracks.length
        ? Math.floor(Math.random() * this.soundtracks.length)
        : 0;
      this.musicActive = false;
      this.musicPaused = false;
      this.musicPlayer = typeof Audio === "function" ? new Audio() : null;

      if (this.musicPlayer) {
        this.musicPlayer.preload = "auto";
        this.musicPlayer.loop = false;
        this.musicPlayer.volume = this.musicVolume;
        this.musicPlayer.addEventListener("ended", () => {
          if (!this.musicActive) return;
          this.playNextTrack();
        });
        this.musicPlayer.addEventListener("error", () => {
          if (!this.musicActive) return;
          this.playNextTrack();
        });
      }
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

    getNoiseBuffer() {
      const ctx = this.ensureCtx();
      if (!ctx) return null;
      if (this.noiseBuffer) return this.noiseBuffer;

      const buffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const channel = buffer.getChannelData(0);
      for (let i = 0; i < channel.length; i += 1) {
        channel[i] = Math.random() * 2 - 1;
      }
      this.noiseBuffer = buffer;
      return this.noiseBuffer;
    }

    selectTrack(index) {
      if (!this.soundtracks.length) return null;
      const length = this.soundtracks.length;
      const safeIndex = ((index % length) + length) % length;
      this.currentTrackIndex = safeIndex;
      this.nextTrackIndex = (safeIndex + 1) % length;
      return this.soundtracks[safeIndex];
    }

    playSelectedTrack(index) {
      if (!this.musicPlayer || !this.soundtracks.length) return;
      const track = this.selectTrack(index);
      if (!track) return;

      this.musicActive = true;
      this.musicPaused = false;
      this.musicPlayer.pause();
      this.musicPlayer.src = track.src;
      this.musicPlayer.currentTime = 0;
      this.musicPlayer.volume = this.musicVolume;
      this.musicPlayer.load();

      const playPromise = this.musicPlayer.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {});
      }
    }

    playNextTrack() {
      if (!this.soundtracks.length) return;
      this.playSelectedTrack(this.nextTrackIndex);
    }

    startMusic() {
      const ctx = this.ensureCtx();
      if (ctx && ctx.state === "suspended") ctx.resume();
      if (!this.musicPlayer || !this.soundtracks.length) return;

      if (this.musicPaused && this.musicPlayer.src && this.currentTrackIndex >= 0) {
        this.resumeMusic();
        return;
      }

      if (this.musicActive && !this.musicPlayer.paused) return;
      this.playNextTrack();
    }

    pauseMusic() {
      if (!this.musicPlayer || !this.musicActive || this.musicPlayer.paused) return;
      this.musicPlayer.pause();
      this.musicPaused = true;
    }

    resumeMusic() {
      const ctx = this.ensureCtx();
      if (ctx && ctx.state === "suspended") ctx.resume();
      if (!this.musicPlayer || !this.soundtracks.length) return;

      if (!this.musicPlayer.src || this.currentTrackIndex < 0) {
        this.startMusic();
        return;
      }

      this.musicActive = true;
      this.musicPaused = false;
      this.musicPlayer.volume = this.musicVolume;

      const playPromise = this.musicPlayer.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {});
      }
    }

    stopMusic() {
      if (!this.musicPlayer) return;
      this.musicActive = false;
      this.musicPaused = false;
      this.musicPlayer.pause();
      this.musicPlayer.currentTime = 0;
      this.currentTrackIndex = -1;
    }

    playTone(options) {
      const ctx = this.ensureCtx();
      if (!ctx || !options || !options.frequency) return;

      const frequency = options.frequency;
      const duration = Math.max(0.03, options.duration || 0.08);
      const attack = Math.min(duration * 0.4, options.attack == null ? 0.008 : options.attack);
      const release = options.release == null ? 0.05 : options.release;
      const unison = Math.max(1, options.unison || 1);
      const spread = options.spread || 0;
      const offsets = unison === 1
        ? [0]
        : Array.from({ length: unison }, (_, index) => (index - (unison - 1) / 2) * spread);
      const now = ctx.currentTime;
      const stopAt = now + duration + release;
      const gainNode = ctx.createGain();
      const peakGain = Math.max(0.0002, (options.gain || 0.05) / offsets.length);

      gainNode.gain.setValueAtTime(0.0001, now);
      gainNode.gain.linearRampToValueAtTime(peakGain, now + attack);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, stopAt);
      gainNode.connect(ctx.destination);

      offsets.forEach((detuneOffset) => {
        const oscillator = ctx.createOscillator();
        oscillator.type = options.wave || "sine";
        oscillator.frequency.setValueAtTime(frequency, now);
        oscillator.detune.setValueAtTime(detuneOffset, now);
        if (options.endFrequency) {
          oscillator.frequency.exponentialRampToValueAtTime(Math.max(22, options.endFrequency), now + duration);
        }
        oscillator.connect(gainNode);
        oscillator.start(now);
        oscillator.stop(stopAt + 0.02);
      });
    }

    playNoiseHit(options) {
      const ctx = this.ensureCtx();
      const buffer = this.getNoiseBuffer();
      if (!ctx || !buffer) return;

      const duration = Math.max(0.02, options.duration || 0.04);
      const attack = Math.min(0.006, duration * 0.3);
      const release = options.release == null ? 0.025 : options.release;
      const now = ctx.currentTime;
      const stopAt = now + duration + release;
      const source = ctx.createBufferSource();
      const highpass = ctx.createBiquadFilter();
      const bandpass = ctx.createBiquadFilter();
      const gainNode = ctx.createGain();

      source.buffer = buffer;
      highpass.type = "highpass";
      highpass.frequency.value = options.highpass || 2600;
      bandpass.type = "bandpass";
      bandpass.frequency.value = options.frequency || 6000;
      bandpass.Q.value = options.q || 0.8;

      gainNode.gain.setValueAtTime(0.0001, now);
      gainNode.gain.linearRampToValueAtTime(Math.max(0.0002, options.gain || 0.02), now + attack);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, stopAt);

      source.connect(highpass);
      highpass.connect(bandpass);
      bandpass.connect(gainNode);
      gainNode.connect(ctx.destination);

      source.start(now);
      source.stop(stopAt + 0.02);
    }

    jump() {
      this.playTone({ wave: "triangle", frequency: 550, duration: 0.08, gain: 0.05, attack: 0.002, release: 0.03 });
    }

    coin() {
      this.playTone({ wave: "sine", frequency: 880, duration: 0.06, gain: 0.04, attack: 0.002, release: 0.025, unison: 2, spread: 6 });
    }

    hit() {
      this.playTone({ wave: "square", frequency: 150, endFrequency: 95, duration: 0.12, gain: 0.06, attack: 0.001, release: 0.04 });
    }

    powerup() {
      this.playTone({ wave: "sawtooth", frequency: 660, endFrequency: 920, duration: 0.1, gain: 0.05, attack: 0.002, release: 0.04, unison: 2, spread: 5 });
    }

    kick() {
      this.playTone({ wave: "square", frequency: 280, endFrequency: 190, duration: 0.07, gain: 0.05, attack: 0.001, release: 0.03 });
    }
  }

  FamilyDash.AudioSystem = AudioSystem;
})();

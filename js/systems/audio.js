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

  function hit(gain, extra) {
    return Object.assign({ gain: gain == null ? 1 : gain }, extra || {});
  }

  function openHat(gain, tone) {
    return hit(gain, { open: true, tone: tone || null });
  }

  const SOUNDTRACKS = [
    {
      name: "Starter Line",
      stepMs: 136,
      swing: 0.05,
      loopsBeforeSwitch: 10,
      bassWave: "triangle",
      subWave: "sine",
      leadWave: "square",
      counterWave: "triangle",
      chordWave: "sine",
      arpWave: "square",
      bassGain: 0.86,
      subGain: 0.48,
      chordGain: 0.24,
      arpGain: 0.28,
      leadGain: 0.72,
      counterGain: 0.3,
      leadUnison: 2,
      leadSpread: 8,
      arpUnison: 2,
      arpSpread: 5,
      sub: ["C2", null, null, null, "A1", null, null, null, "F1", null, null, null, "G1", null, null, null],
      bass: ["C3", null, "G2", null, "A2", null, "E3", null, "F2", null, "C3", null, "G2", null, "D3", null],
      chords: [["C4", "E4", "G4"], null, null, ["G4"], ["A3", "C4", "E4", "G4"], null, null, ["E4"], ["F4", "A4", "C5", "E5"], null, null, ["C5"], ["G3", "B3", "D4", "F4"], null, null, ["D4"]],
      arp: [null, "E5", "G5", "C6", null, "E5", "G5", "A5", null, "A4", "C5", "F5", null, "B4", "D5", "G5"],
      lead: ["E5", null, "G5", "A5", "G5", null, "E5", "G5", "A5", "C6", "A5", null, "G5", "E5", "D5", "G5"],
      counter: [null, null, "C5", null, null, "E5", null, null, "F5", null, null, "E5", null, "D5", null, "B4"],
      kick: [1, null, 0.7, null, 1, null, 0.85, null, 1, null, 0.72, null, 1, null, 0.92, 0.45],
      snare: [null, null, 0.7, null, null, null, 1, null, null, null, 0.72, null, null, null, 1, null],
      hat: [0.5, 0.36, 0.62, 0.36, 0.5, 0.36, 0.62, openHat(0.62), 0.5, 0.36, 0.62, 0.36, 0.5, 0.36, 0.72, openHat(0.78)]
    },
    {
      name: "Neon Snack Chase",
      stepMs: 128,
      swing: 0.07,
      loopsBeforeSwitch: 10,
      bassWave: "triangle",
      subWave: "sine",
      leadWave: "sawtooth",
      counterWave: "square",
      chordWave: "triangle",
      arpWave: "square",
      bassGain: 0.82,
      subGain: 0.45,
      chordGain: 0.22,
      arpGain: 0.33,
      leadGain: 0.74,
      counterGain: 0.27,
      leadUnison: 2,
      leadSpread: 11,
      sub: ["D2", null, null, null, "F1", null, null, null, "Bb1", null, null, null, "C2", null, null, null],
      bass: ["D3", null, "A2", null, "F2", null, "C3", null, "Bb2", null, "F2", null, "C3", null, "G2", null],
      chords: [["D4", "F4", "A4", "C5"], null, null, ["A4"], ["F4", "A4", "C5", "E5"], null, null, ["C5"], ["Bb3", "D4", "F4", "A4"], null, null, ["F4"], ["C4", "E4", "G4", "Bb4"], null, null, ["G4"]],
      arp: ["A4", "C5", "D5", "F5", "A4", "C5", "E5", "F5", "F4", "A4", "Bb4", "D5", "G4", "Bb4", "C5", "E5"],
      lead: ["F5", "A5", "C6", "A5", "G5", "F5", "D5", "F5", "A5", "C6", "D6", "C6", "A5", "G5", "F5", "E5"],
      counter: [null, null, "D5", null, null, "C5", null, "A4", null, "F5", null, null, "G5", null, "E5", null],
      kick: [1, null, 0.65, 0.3, 0.95, null, 0.85, null, 1, null, 0.72, 0.3, 0.95, null, 0.88, null],
      snare: [null, null, 0.62, null, null, null, 1, null, null, null, 0.62, null, null, null, 1, null],
      hat: [0.62, 0.4, 0.72, 0.4, 0.62, 0.4, 0.72, openHat(0.72, 6000), 0.62, 0.4, 0.72, 0.4, 0.62, 0.4, 0.78, openHat(0.82, 5600)]
    },
    {
      name: "Backyard Bounce",
      stepMs: 144,
      swing: 0.04,
      loopsBeforeSwitch: 9,
      bassWave: "triangle",
      subWave: "sine",
      leadWave: "square",
      counterWave: "triangle",
      chordWave: "sine",
      arpWave: "triangle",
      bassGain: 0.84,
      subGain: 0.46,
      chordGain: 0.25,
      arpGain: 0.27,
      leadGain: 0.68,
      counterGain: 0.26,
      leadUnison: 2,
      leadSpread: 6,
      sub: ["G1", null, null, null, "C2", null, null, null, "E2", null, null, null, "D2", null, null, null],
      bass: ["G2", null, "D3", null, "C3", null, "G2", null, "E3", null, "B2", null, "D3", null, "A2", null],
      chords: [["G4", "B4", "D5"], null, null, ["D5"], ["C4", "E4", "G4"], null, null, ["G4"], ["E4", "G4", "B4", "D5"], null, null, ["B4"], ["D4", "F#4", "A4"], null, null, ["A4"]],
      arp: [null, "B4", "D5", "G5", null, "G4", "C5", "E5", null, "G4", "B4", "D5", null, "F#4", "A4", "D5"],
      lead: ["B4", null, "D5", "E5", "G5", null, "E5", "D5", "B4", "D5", "E5", "G5", "F#5", null, "D5", "A4"],
      counter: [null, "G4", null, null, "E5", null, null, "D5", null, null, "B4", null, null, "A4", null, null],
      kick: [1, null, 0.75, null, 0.95, null, 0.78, null, 1, null, 0.75, 0.28, 0.92, null, 0.82, null],
      snare: [null, null, 0.7, null, null, null, 1, null, null, null, 0.7, null, null, null, 1, null],
      hat: [0.48, 0.35, 0.6, 0.35, 0.48, 0.35, 0.6, openHat(0.64), 0.48, 0.35, 0.6, 0.35, 0.48, 0.35, 0.68, openHat(0.75)]
    },
    {
      name: "Pixel Playground",
      stepMs: 122,
      swing: 0.06,
      loopsBeforeSwitch: 10,
      bassWave: "square",
      subWave: "sine",
      leadWave: "triangle",
      counterWave: "square",
      chordWave: "sine",
      arpWave: "square",
      bassGain: 0.78,
      subGain: 0.44,
      chordGain: 0.22,
      arpGain: 0.34,
      leadGain: 0.76,
      counterGain: 0.24,
      leadUnison: 2,
      leadSpread: 9,
      sub: ["A1", null, null, null, "F1", null, null, null, "C2", null, null, null, "G1", null, null, null],
      bass: ["A2", null, "E3", null, "F2", null, "C3", null, "C3", null, "G2", null, "G2", null, "D3", null],
      chords: [["A3", "C4", "E4"], null, null, ["E4"], ["F4", "A4", "C5"], null, null, ["C5"], ["C4", "E4", "G4"], null, null, ["G4"], ["G3", "B3", "D4"], null, null, ["D4"]],
      arp: ["E5", "A5", "C6", "A5", "C5", "F5", "A5", "F5", "E5", "G5", "C6", "G5", "D5", "G5", "B5", "G5"],
      lead: ["A5", null, "C6", "E6", "C6", "A5", "G5", "A5", "G5", null, "E5", "G5", "B5", "A5", "G5", "E5"],
      counter: [null, "E5", null, null, "F5", null, null, "E5", null, "G5", null, null, "D5", null, null, "B4"],
      kick: [1, null, 0.7, 0.25, 0.96, null, 0.82, null, 1, null, 0.7, 0.25, 0.96, null, 0.88, null],
      snare: [null, null, 0.65, null, null, null, 1, null, null, null, 0.65, null, null, null, 1, null],
      hat: [0.62, 0.44, 0.76, 0.44, 0.62, 0.44, 0.76, openHat(0.72), 0.62, 0.44, 0.76, 0.44, 0.62, 0.44, 0.8, openHat(0.85)]
    },
    {
      name: "Turbo Tunnel",
      stepMs: 116,
      swing: 0.03,
      loopsBeforeSwitch: 11,
      bassWave: "sawtooth",
      subWave: "sine",
      leadWave: "square",
      counterWave: "triangle",
      chordWave: "triangle",
      arpWave: "square",
      bassGain: 0.84,
      subGain: 0.5,
      chordGain: 0.2,
      arpGain: 0.28,
      leadGain: 0.8,
      counterGain: 0.22,
      leadUnison: 2,
      leadSpread: 10,
      sub: ["E1", null, null, null, "C2", null, null, null, "G1", null, null, null, "D2", null, null, null],
      bass: ["E2", "B2", "E3", null, "C3", null, "G2", null, "G2", "D3", "G3", null, "D3", null, "A2", null],
      chords: [["E4", "G4", "B4", "D5"], null, null, ["B4"], ["C4", "E4", "G4"], null, null, ["G4"], ["G3", "B3", "D4"], null, null, ["D4"], ["D4", "F#4", "A4"], null, null, ["A4"]],
      arp: ["B4", "E5", "G5", "B5", "G4", "C5", "E5", "G5", "D5", "G5", "B5", "D6", "A4", "D5", "F#5", "A5"],
      lead: ["G5", "B5", "D6", "E6", "D6", "B5", "G5", "E5", "G5", "B5", "D6", "B5", "A5", "F#5", "E5", "D5"],
      counter: [null, null, "E5", null, null, "C5", null, null, "B4", null, null, "A4", null, null, "F#4", null],
      kick: [1, null, 0.72, 0.3, 0.96, null, 0.84, 0.3, 1, null, 0.72, 0.3, 0.96, null, 0.9, 0.4],
      snare: [null, null, 0.72, null, null, null, 1, null, null, null, 0.72, null, null, null, 1, null],
      hat: [0.7, 0.48, 0.82, 0.48, 0.7, 0.48, 0.82, openHat(0.75, 6500), 0.7, 0.48, 0.82, 0.48, 0.7, 0.48, 0.86, openHat(0.88, 6200)]
    },
    {
      name: "Saturday Sprint",
      stepMs: 146,
      swing: 0.05,
      loopsBeforeSwitch: 9,
      bassWave: "triangle",
      subWave: "sine",
      leadWave: "sine",
      counterWave: "square",
      chordWave: "triangle",
      arpWave: "square",
      bassGain: 0.82,
      subGain: 0.46,
      chordGain: 0.24,
      arpGain: 0.24,
      leadGain: 0.68,
      counterGain: 0.28,
      leadUnison: 2,
      leadSpread: 5,
      sub: ["F1", null, null, null, "C2", null, null, null, "D2", null, null, null, "Bb1", null, null, null],
      bass: ["F2", null, "C3", null, "C3", null, "G2", null, "D3", null, "A2", null, "Bb2", null, "F2", null],
      chords: [["F4", "A4", "C5"], null, null, ["C5"], ["C4", "E4", "G4"], null, null, ["G4"], ["D4", "F4", "A4", "C5"], null, null, ["A4"], ["Bb3", "D4", "F4"], null, null, ["F4"]],
      arp: [null, "A4", "C5", "F5", null, "G4", "C5", "E5", null, "F4", "A4", "D5", null, "D4", "F4", "Bb4"],
      lead: ["A5", null, "C6", "D6", "C6", null, "A5", "G5", "A5", null, "F5", "D5", "F5", "A5", "G5", "F5"],
      counter: [null, null, "F5", null, "E5", null, null, "G5", null, null, "A5", null, "F5", null, null, "D5"],
      kick: [1, null, 0.72, null, 0.94, null, 0.8, null, 1, null, 0.72, 0.25, 0.92, null, 0.82, null],
      snare: [null, null, 0.65, null, null, null, 1, null, null, null, 0.65, null, null, null, 1, null],
      hat: [0.5, 0.34, 0.6, 0.34, 0.5, 0.34, 0.6, openHat(0.62), 0.5, 0.34, 0.6, 0.34, 0.5, 0.34, 0.68, openHat(0.74)]
    },
    {
      name: "Rooftop Rush",
      stepMs: 124,
      swing: 0.06,
      loopsBeforeSwitch: 10,
      bassWave: "triangle",
      subWave: "sine",
      leadWave: "sawtooth",
      counterWave: "triangle",
      chordWave: "sine",
      arpWave: "square",
      bassGain: 0.84,
      subGain: 0.46,
      chordGain: 0.22,
      arpGain: 0.29,
      leadGain: 0.76,
      counterGain: 0.24,
      leadUnison: 2,
      leadSpread: 9,
      sub: ["B1", null, null, null, "G1", null, null, null, "D2", null, null, null, "A1", null, null, null],
      bass: ["B2", null, "F#2", null, "G2", null, "D3", null, "D3", null, "A2", null, "A2", null, "E3", null],
      chords: [["B3", "D4", "F#4", "A4"], null, null, ["F#4"], ["G3", "B3", "D4"], null, null, ["D4"], ["D4", "F#4", "A4"], null, null, ["A4"], ["A3", "C#4", "E4", "G4"], null, null, ["E4"]],
      arp: ["F#4", "B4", "D5", "F#5", null, "B4", "D5", "G5", null, "A4", "D5", "F#5", null, "C#5", "E5", "A5"],
      lead: ["D5", "F#5", "A5", "F#5", "B5", "A5", "G5", "F#5", "D5", "F#5", "A5", "B5", "A5", "F#5", "E5", "D5"],
      counter: [null, null, "B4", null, null, "D5", null, null, "A4", null, null, "F#4", null, "E5", null, null],
      kick: [1, null, 0.75, 0.3, 0.95, null, 0.8, null, 1, null, 0.75, 0.3, 0.95, null, 0.86, null],
      snare: [null, null, 0.68, null, null, null, 1, null, null, null, 0.68, null, null, null, 1, null],
      hat: [0.66, 0.42, 0.78, 0.42, 0.66, 0.42, 0.78, openHat(0.72, 6100), 0.66, 0.42, 0.78, 0.42, 0.66, 0.42, 0.82, openHat(0.86, 5800)]
    },
    {
      name: "Coin Magnet Jam",
      stepMs: 132,
      swing: 0.08,
      loopsBeforeSwitch: 10,
      bassWave: "square",
      subWave: "sine",
      leadWave: "triangle",
      counterWave: "square",
      chordWave: "sine",
      arpWave: "triangle",
      bassGain: 0.78,
      subGain: 0.44,
      chordGain: 0.2,
      arpGain: 0.31,
      leadGain: 0.7,
      counterGain: 0.28,
      leadUnison: 2,
      leadSpread: 7,
      sub: ["D2", null, null, null, "B1", null, null, null, "G1", null, null, null, "A1", null, null, null],
      bass: ["D3", null, "A2", null, "B2", null, "F#3", null, "G2", null, "D3", null, "A2", null, "E3", null],
      chords: [["D4", "F#4", "A4"], null, null, ["A4"], ["B3", "D4", "F#4", "A4"], null, null, ["F#4"], ["G3", "B3", "D4"], null, null, ["D4"], ["A3", "C#4", "E4", "G4"], null, null, ["E4"]],
      arp: [null, "A4", "D5", "F#5", null, "F#4", "B4", "D5", null, "D5", "G5", "B5", null, "E5", "A5", "C#6"],
      lead: ["F#5", null, "A5", "B5", "A5", "F#5", "D5", "F#5", "A5", null, "B5", "D6", "C#6", "A5", "G5", "E5"],
      counter: [null, "D5", null, null, "A4", null, null, "F#5", null, null, "G5", null, null, "E5", null, null],
      kick: [1, null, 0.68, 0.28, 0.92, null, 0.84, null, 1, null, 0.68, 0.28, 0.96, null, 0.88, null],
      snare: [null, null, 0.62, null, null, null, 1, null, null, null, 0.62, null, null, null, 1, null],
      hat: [0.58, 0.4, 0.7, 0.4, 0.58, 0.4, 0.7, openHat(0.7), 0.58, 0.4, 0.7, 0.4, 0.58, 0.4, 0.76, openHat(0.82)]
    },
    {
      name: "Tiny Menace Mode",
      stepMs: 110,
      swing: 0.1,
      loopsBeforeSwitch: 12,
      bassWave: "sawtooth",
      subWave: "sine",
      leadWave: "square",
      counterWave: "triangle",
      chordWave: "triangle",
      arpWave: "square",
      bassGain: 0.84,
      subGain: 0.5,
      chordGain: 0.18,
      arpGain: 0.3,
      leadGain: 0.78,
      counterGain: 0.22,
      leadUnison: 3,
      leadSpread: 12,
      sub: ["C2", null, null, null, "Ab1", null, null, null, "Bb1", null, null, null, "G1", null, null, null],
      bass: ["C3", "G2", "Eb3", null, "Ab2", null, "Eb3", null, "Bb2", null, "F3", null, "G2", null, "D3", null],
      chords: [["C4", "Eb4", "G4", "Bb4"], null, null, ["G4"], ["Ab3", "C4", "Eb4"], null, null, ["Eb4"], ["Bb3", "D4", "F4", "Ab4"], null, null, ["F4"], ["G3", "B3", "D4", "F4"], null, null, ["D4"]],
      arp: ["G4", "C5", "Eb5", "G5", "Eb5", "Ab5", "C6", "Eb6", "F4", "Bb4", "D5", "F5", "D5", "G5", "B5", "D6"],
      lead: ["Eb5", "G5", "Bb5", "G5", "C6", "Bb5", "G5", "Eb5", "F5", "Ab5", "Bb5", "F5", "G5", "B5", "D6", "B5"],
      counter: [null, null, "C5", null, "Ab4", null, null, "Eb5", null, "Bb4", null, null, "G4", null, "D5", null],
      kick: [1, null, 0.78, 0.35, 0.96, 0.3, 0.86, null, 1, null, 0.78, 0.35, 0.98, null, 0.9, 0.45],
      snare: [null, null, 0.72, null, null, null, 1, null, null, null, 0.72, null, null, null, 1, null],
      hat: [0.74, 0.46, 0.86, 0.46, 0.74, 0.46, 0.86, openHat(0.78, 6200), 0.74, 0.46, 0.86, 0.46, 0.74, 0.46, 0.92, openHat(0.96, 5800)]
    },
    {
      name: "Victory Lap Skyline",
      stepMs: 140,
      swing: 0.05,
      loopsBeforeSwitch: 9,
      bassWave: "triangle",
      subWave: "sine",
      leadWave: "sine",
      counterWave: "triangle",
      chordWave: "sine",
      arpWave: "triangle",
      bassGain: 0.82,
      subGain: 0.46,
      chordGain: 0.25,
      arpGain: 0.23,
      leadGain: 0.72,
      counterGain: 0.28,
      leadUnison: 2,
      leadSpread: 6,
      sub: ["G1", null, null, null, "D2", null, null, null, "E2", null, null, null, "C2", null, null, null],
      bass: ["G2", null, "D3", null, "D3", null, "A2", null, "E3", null, "B2", null, "C3", null, "G2", null],
      chords: [["G4", "B4", "D5"], null, null, ["D5"], ["D4", "F#4", "A4"], null, null, ["A4"], ["E4", "G4", "B4", "D5"], null, null, ["B4"], ["C4", "E4", "G4"], null, null, ["G4"]],
      arp: [null, "B4", "D5", "G5", null, "A4", "D5", "F#5", null, "G4", "B4", "E5", null, "E4", "G4", "C5"],
      lead: ["D5", "G5", "B5", "A5", "G5", "E5", "D5", "B4", "D5", "G5", "A5", "B5", "G5", "E5", "D5", "G5"],
      counter: [null, null, "G4", null, "F#5", null, null, "A4", null, null, "B4", null, "G5", null, null, "E5"],
      kick: [1, null, 0.72, null, 0.96, null, 0.8, null, 1, null, 0.72, 0.25, 0.94, null, 0.84, null],
      snare: [null, null, 0.65, null, null, null, 1, null, null, null, 0.65, null, null, null, 1, null],
      hat: [0.54, 0.35, 0.64, 0.35, 0.54, 0.35, 0.64, openHat(0.66), 0.54, 0.35, 0.64, 0.35, 0.54, 0.35, 0.7, openHat(0.76)]
    }
  ];

  const MUSIC_LAYERS = [
    { key: "sub", waveKey: "subWave", gainKey: "subGain", lengthKey: "subLength", unisonKey: "subUnison", spreadKey: "subSpread", defaultWave: "sine", defaultGain: 0.44, defaultLength: 0.96, defaultAttack: 0.006, defaultRelease: 0.06 },
    { key: "bass", waveKey: "bassWave", gainKey: "bassGain", lengthKey: "bassLength", unisonKey: "bassUnison", spreadKey: "bassSpread", defaultWave: "triangle", defaultGain: 0.82, defaultLength: 0.88, defaultAttack: 0.005, defaultRelease: 0.05 },
    { key: "chords", waveKey: "chordWave", gainKey: "chordGain", lengthKey: "chordLength", unisonKey: "chordUnison", spreadKey: "chordSpread", defaultWave: "sine", defaultGain: 0.22, defaultLength: 1.25, defaultAttack: 0.012, defaultRelease: 0.08 },
    { key: "arp", waveKey: "arpWave", gainKey: "arpGain", lengthKey: "arpLength", unisonKey: "arpUnison", spreadKey: "arpSpread", defaultWave: "square", defaultGain: 0.26, defaultLength: 0.34, defaultAttack: 0.004, defaultRelease: 0.03, defaultUnison: 1, defaultSpread: 0 },
    { key: "lead", waveKey: "leadWave", gainKey: "leadGain", lengthKey: "leadLength", unisonKey: "leadUnison", spreadKey: "leadSpread", defaultWave: "square", defaultGain: 0.72, defaultLength: 0.62, defaultAttack: 0.006, defaultRelease: 0.05, defaultUnison: 2, defaultSpread: 8 },
    { key: "counter", waveKey: "counterWave", gainKey: "counterGain", lengthKey: "counterLength", unisonKey: "counterUnison", spreadKey: "counterSpread", defaultWave: "triangle", defaultGain: 0.24, defaultLength: 0.46, defaultAttack: 0.006, defaultRelease: 0.04 }
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

  function normalizeNoteEvent(entry) {
    if (!entry) return null;
    if (typeof entry === "object" && !Array.isArray(entry) && (entry.note || entry.notes)) {
      const notes = entry.notes || entry.note;
      return {
        notes: Array.isArray(notes) ? notes : [notes],
        gain: entry.gain == null ? 1 : entry.gain,
        length: entry.length == null ? 1 : entry.length,
        wave: entry.wave || null,
        unison: entry.unison,
        spread: entry.spread,
        attack: entry.attack,
        release: entry.release
      };
    }

    return {
      notes: Array.isArray(entry) ? entry : [entry],
      gain: 1,
      length: 1,
      wave: null,
      unison: undefined,
      spread: undefined,
      attack: undefined,
      release: undefined
    };
  }

  function normalizeDrumEvent(entry) {
    if (!entry) return null;
    if (typeof entry === "number") {
      return { gain: entry, open: false, tone: null, pitch: null };
    }
    if (typeof entry === "object") {
      return {
        gain: entry.gain == null ? 1 : entry.gain,
        open: Boolean(entry.open),
        tone: entry.tone || null,
        pitch: entry.pitch || null
      };
    }
    return null;
  }

  class AudioSystem {
    constructor() {
      this.ctx = null;
      this.enabled = true;
      this.musicTimer = null;
      this.musicStep = 0;
      this.musicVolume = 0.032;
      this.soundtracks = SOUNDTRACKS;
      this.currentTrackIndex = -1;
      this.currentTrack = null;
      this.trackLoops = 0;
      this.onTrackChange = null;
      this.noiseBuffer = null;
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

    setTrackChangeListener(listener) {
      this.onTrackChange = typeof listener === "function" ? listener : null;
      if (this.onTrackChange && this.currentTrack) this.onTrackChange(this.currentTrack, this.currentTrackIndex);
    }

    announceTrack() {
      if (this.onTrackChange && this.currentTrack) this.onTrackChange(this.currentTrack, this.currentTrackIndex);
    }

    restartMusicLoop() {
      if (!this.musicTimer) return;
      clearTimeout(this.musicTimer);
      this.musicTimer = window.setTimeout(() => this.playMusicStep(), 0);
    }

    getTrackLength(track) {
      const patternLengths = MUSIC_LAYERS
        .map((layer) => Array.isArray(track[layer.key]) ? track[layer.key].length : 0)
        .concat([
          Array.isArray(track.kick) ? track.kick.length : 0,
          Array.isArray(track.snare) ? track.snare.length : 0,
          Array.isArray(track.hat) ? track.hat.length : 0
        ]);
      return Math.max(1, ...patternLengths);
    }

    getStepDurationMs(track, stepIndex) {
      const base = track.stepMs || 132;
      const swing = track.swing || 0;
      if (!swing) return base;
      const oddStep = (stepIndex || 0) % 2 === 1;
      return Math.max(88, base * (oddStep ? 1 + swing : 1 - swing));
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

    playTrack(index) {
      const ctx = this.ensureCtx();
      if (!ctx) return;
      if (ctx.state === "suspended") ctx.resume();
      this.selectTrack(index);
      if (this.musicTimer) this.restartMusicLoop();
      else this.musicTimer = window.setTimeout(() => this.playMusicStep(), 0);
    }

    nextTrack() {
      if (!this.soundtracks.length) return;
      const nextIndex = this.currentTrackIndex < 0 ? 0 : this.currentTrackIndex + 1;
      this.playTrack(nextIndex);
    }

    previousTrack() {
      if (!this.soundtracks.length) return;
      const previousIndex = this.currentTrackIndex < 0 ? this.soundtracks.length - 1 : this.currentTrackIndex - 1;
      this.playTrack(previousIndex);
    }

    advanceTrack() {
      if (!this.soundtracks.length) return;
      const nextIndex = this.currentTrackIndex < 0
        ? Math.floor(Math.random() * this.soundtracks.length)
        : (this.currentTrackIndex + 1) % this.soundtracks.length;
      this.selectTrack(nextIndex);
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

    playLayer(track, layer, step, stepSeconds) {
      const pattern = track[layer.key];
      if (!pattern || !pattern.length) return;
      const event = normalizeNoteEvent(pattern[step % pattern.length]);
      if (!event || !event.notes || !event.notes.length) return;

      const durationRatio = event.length == null ? (track[layer.lengthKey] == null ? layer.defaultLength : track[layer.lengthKey]) : event.length;
      const totalGain = this.musicVolume *
        (track[layer.gainKey] == null ? layer.defaultGain : track[layer.gainKey]) *
        (event.gain == null ? 1 : event.gain);
      const unison = event.unison == null
        ? (track[layer.unisonKey] == null ? (layer.defaultUnison || 1) : track[layer.unisonKey])
        : event.unison;
      const spread = event.spread == null
        ? (track[layer.spreadKey] == null ? (layer.defaultSpread || 0) : track[layer.spreadKey])
        : event.spread;
      const noteGain = totalGain / Math.max(1, event.notes.length);
      const duration = stepSeconds * durationRatio;

      event.notes.forEach((note, index) => {
        const frequency = noteToFrequency(note);
        if (!frequency) return;
        this.playTone({
          wave: event.wave || track[layer.waveKey] || layer.defaultWave,
          frequency,
          duration,
          gain: noteGain * (index === 0 ? 1 : 0.86),
          attack: event.attack == null ? layer.defaultAttack : event.attack,
          release: event.release == null ? layer.defaultRelease : event.release,
          unison,
          spread
        });
      });
    }

    playKick(stepSeconds, event, track) {
      const gain = this.musicVolume * 0.9 * (event.gain == null ? 1 : event.gain);
      const pitch = event.pitch || track.kickPitch || 88;
      this.playTone({
        wave: "sine",
        frequency: pitch,
        endFrequency: Math.max(34, pitch * 0.42),
        duration: Math.min(0.13, stepSeconds * 0.9),
        gain,
        attack: 0.001,
        release: 0.05
      });
      this.playTone({
        wave: "triangle",
        frequency: pitch * 1.6,
        endFrequency: Math.max(40, pitch * 0.68),
        duration: Math.min(0.06, stepSeconds * 0.45),
        gain: gain * 0.2,
        attack: 0.001,
        release: 0.03
      });
    }

    playSnare(stepSeconds, event, track) {
      const gain = this.musicVolume * 0.5 * (event.gain == null ? 1 : event.gain);
      const tone = event.tone || track.snareTone || 1800;
      this.playNoiseHit({
        duration: Math.min(0.11, stepSeconds * 0.68),
        gain,
        frequency: tone,
        highpass: 1050,
        q: 0.75,
        release: 0.03
      });
      this.playTone({
        wave: "triangle",
        frequency: 220,
        endFrequency: 150,
        duration: Math.min(0.06, stepSeconds * 0.35),
        gain: gain * 0.22,
        attack: 0.001,
        release: 0.03
      });
    }

    playHat(stepSeconds, event, track) {
      const isOpen = Boolean(event.open);
      const gain = this.musicVolume * (isOpen ? 0.32 : 0.22) * (event.gain == null ? 1 : event.gain);
      const tone = event.tone || track.hatTone || (isOpen ? 6200 : 7600);
      this.playNoiseHit({
        duration: isOpen ? Math.min(0.09, stepSeconds * 0.7) : Math.min(0.04, stepSeconds * 0.3),
        gain,
        frequency: tone,
        highpass: isOpen ? 3600 : 4700,
        q: isOpen ? 0.6 : 1.1,
        release: isOpen ? 0.04 : 0.02
      });
    }

    playPercussion(track, step, stepSeconds) {
      const kickEvent = normalizeDrumEvent(track.kick && track.kick[step % track.kick.length]);
      if (kickEvent) this.playKick(stepSeconds, kickEvent, track);

      const snareEvent = normalizeDrumEvent(track.snare && track.snare[step % track.snare.length]);
      if (snareEvent) this.playSnare(stepSeconds, snareEvent, track);

      const hatEvent = normalizeDrumEvent(track.hat && track.hat[step % track.hat.length]);
      if (hatEvent) this.playHat(stepSeconds, hatEvent, track);
    }

    playMusicStep() {
      if (!this.currentTrack) {
        this.musicTimer = null;
        return;
      }

      const track = this.currentTrack;
      const cycleLength = this.getTrackLength(track);
      const step = this.musicStep % cycleLength;
      const stepMs = this.getStepDurationMs(track, step);
      const stepSeconds = stepMs / 1000;

      MUSIC_LAYERS.forEach((layer) => this.playLayer(track, layer, step, stepSeconds));
      this.playPercussion(track, step, stepSeconds);

      this.musicStep += 1;

      if (this.musicStep % cycleLength === 0) {
        this.trackLoops += 1;
        if (this.trackLoops >= (track.loopsBeforeSwitch || 10)) this.advanceTrack();
      }

      if (!this.currentTrack) {
        this.musicTimer = null;
        return;
      }

      const nextTrack = this.currentTrack;
      const nextLength = this.getTrackLength(nextTrack);
      const nextStep = this.musicStep % nextLength;
      this.musicTimer = window.setTimeout(() => this.playMusicStep(), this.getStepDurationMs(nextTrack, nextStep));
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

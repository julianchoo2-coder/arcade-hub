/*
 * Arcade Hub | Generative Lo-fi Radio
 * Pure Web Audio API. No downloads, samples or external music licenses.
 * Each room has its own warm chord progression, bass groove and drum pattern.
 */
(() => {
  'use strict';

  const THEMES = {
    menu: {
      bpm: 78, roots: [45, 41, 38, 43],
      chords: [[57, 60, 64, 67], [53, 57, 60, 64], [50, 53, 57, 60], [55, 59, 62, 65]],
      melody: [null, 2, null, null, 1, null, 3, null, null, 1, null, 0, null, 2, null, null],
      color: 0.72, density: 0.65
    },
    snake: {
      bpm: 90, roots: [40, 45, 43, 38],
      chords: [[52, 55, 59, 62], [57, 60, 64, 67], [55, 59, 62, 65], [50, 54, 57, 60]],
      melody: [null, 1, null, 2, 3, null, 1, null, 2, null, null, 0, 2, null, 1, null],
      color: 0.86, density: 0.8
    },
    tiger: {
      bpm: 105, roots: [43, 40, 45, 38],
      chords: [[55, 58, 62, 65], [52, 55, 59, 62], [57, 60, 64, 67], [50, 53, 57, 60]],
      melody: [2, null, 1, null, 3, null, 2, null, 1, 2, null, 0, null, 3, 1, null],
      color: 0.92, density: 0.95
    },
    bomber: {
      bpm: 96, roots: [38, 41, 45, 43],
      chords: [[50, 53, 57, 60], [53, 57, 60, 64], [57, 60, 64, 67], [55, 58, 62, 65]],
      melody: [null, 0, 1, null, null, 2, null, 3, 1, null, 2, null, 0, null, 3, null],
      color: 0.7, density: 0.84
    },
    tower: {
      bpm: 86, roots: [45, 38, 41, 43],
      chords: [[57, 60, 64, 67], [50, 53, 57, 60], [53, 57, 60, 64], [55, 59, 62, 65]],
      melody: [null, 2, null, 1, null, 3, null, 2, 1, null, null, 0, null, 2, 3, null],
      color: 0.78, density: 0.75
    }
  };

  let context = null;
  let master = null;
  let musicBus = null;
  let noiseBuffer = null;
  let loopId = null;
  let themeName = null;
  let stepIndex = 0;
  let nextStepAt = 0;
  let playing = false;
  let enabled = true;
  try { enabled = localStorage.getItem('arcadeSound') !== 'off'; } catch {}

  function midi(n) { return 440 * 2 ** ((n - 69) / 12); }
  function rnd(n) { const v = Math.sin(n * 87.73 + 19.21) * 43758.5453; return v - Math.floor(v); }

  function createAudio() {
    if (context) return context;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try { context = new AC(); } catch { return null; }

    // Soft analogue-style mix with gentle low-pass filtering and compression.
    musicBus = context.createGain();
    const warmth = context.createBiquadFilter();
    warmth.type = 'lowpass';
    warmth.frequency.value = 3600;
    warmth.Q.value = 0.45;
    const compressor = context.createDynamicsCompressor();
    compressor.threshold.value = -22;
    compressor.knee.value = 22;
    compressor.ratio.value = 2.6;
    compressor.attack.value = 0.02;
    compressor.release.value = 0.24;
    master = context.createGain();
    master.gain.value = 0;
    musicBus.connect(warmth);
    warmth.connect(compressor);
    compressor.connect(master);
    master.connect(context.destination);

    const delay = context.createDelay(0.5);
    delay.delayTime.value = 0.26;
    const feedback = context.createGain();
    feedback.gain.value = 0.13;
    const echoLevel = context.createGain();
    echoLevel.gain.value = 0.13;
    musicBus.connect(delay);
    delay.connect(echoLevel);
    echoLevel.connect(warmth);
    delay.connect(feedback);
    feedback.connect(delay);

    // Create a reusable short noise buffer for snare, hats and subtle vinyl texture.
    noiseBuffer = context.createBuffer(1, Math.ceil(context.sampleRate * 0.30), context.sampleRate);
    const samples = noiseBuffer.getChannelData(0);
    let previous = 0;
    for (let i = 0; i < samples.length; i++) {
      previous = previous * 0.12 + (Math.random() * 2 - 1) * 0.88;
      samples[i] = previous;
    }
    return context;
  }

  function musicNote(pitch, when, length, volume, type = 'sine', attack = 0.014) {
    if (!context || !musicBus) return;
    const osc = context.createOscillator();
    const filter = context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = type === 'triangle' ? 1250 : 2300;
    const gain = context.createGain();
    const end = when + length;
    osc.type = type;
    osc.frequency.setValueAtTime(midi(pitch), when);
    osc.detune.value = (rnd(pitch + stepIndex * 2.7) - 0.5) * 7;
    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.linearRampToValueAtTime(volume, when + Math.min(attack, length * 0.35));
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume * 0.55), when + Math.max(length * 0.55, attack + 0.002));
    gain.gain.exponentialRampToValueAtTime(0.0001, end);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(musicBus);
    osc.start(when);
    osc.stop(end + 0.025);
    osc.onended = () => { osc.disconnect(); filter.disconnect(); gain.disconnect(); };
  }

  function noiseHit(when, duration, frequency, volume, highpass = true) {
    if (!context || !noiseBuffer) return;
    const src = context.createBufferSource();
    src.buffer = noiseBuffer;
    const filter = context.createBiquadFilter();
    filter.type = highpass ? 'highpass' : 'bandpass';
    filter.frequency.value = frequency;
    const gain = context.createGain();
    gain.gain.setValueAtTime(Math.max(0.0001, volume), when);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + duration);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(musicBus);
    src.start(when);
    src.stop(when + duration);
    src.onended = () => { src.disconnect(); filter.disconnect(); gain.disconnect(); };
  }

  function kick(when, strength) {
    if (!context) return;
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(135, when);
    osc.frequency.exponentialRampToValueAtTime(46, when + 0.16);
    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.linearRampToValueAtTime(0.13 * strength, when + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.21);
    osc.connect(gain);
    gain.connect(musicBus);
    osc.start(when);
    osc.stop(when + 0.23);
    osc.onended = () => { osc.disconnect(); gain.disconnect(); };
  }

  function scheduleStep(index, nominal, config) {
    const step = index % 16;
    const bar = Math.floor(index / 16);
    const harmony = bar % config.roots.length;
    const root = config.roots[harmony];
    const chord = config.chords[harmony];
    const sixteenth = 60 / config.bpm / 4;
    const when = nominal + (step % 2 ? sixteenth * 0.15 : 0);
    const variation = rnd(bar * 3.9 + index * 0.17);

    if (step === 0) {
      // Gently overlapping seventh/ninth chords: the lo-fi foundation.
      chord.forEach((note, voice) => {
        musicNote(note, when + voice * 0.008, 1.6, 0.016 * config.color, 'triangle', 0.060);
      });
      if (bar % 4 === 3) musicNote(chord[1] + 12, when + 0.04, 0.60, 0.007, 'sine', 0.025);
    }
    if ([0, 7, 8, 12].includes(step)) {
      const degree = step === 7 ? 7 : step === 12 ? 12 : 0;
      musicNote(root - 12 + degree, when, step === 7 ? 0.19 : 0.34, 0.09, 'sine', 0.009);
    }
    if (step === 0 || step === 8 || (config.density > 0.9 && step === 10))
      kick(when, step === 0 ? 1 : 0.70);
    if (step === 4 || step === 12) {
      noiseHit(when, 0.115, 1100, 0.045, false);
      musicNote(root, when, 0.09, 0.022, 'triangle');
    }
    if (step % 2 === 0 && variation < config.density) {
      noiseHit(when, 0.045, 4200, step % 4 === 2 ? 0.012 : 0.007);
    }
    if (step === 15 && bar % 4 === 3) noiseHit(when, 0.065, 3200, 0.013);
    if (step === 3 && bar % 8 === 7) noiseHit(when, 0.15, 1300, 0.007, false);

    const melodic = config.melody[step];
    // Phrase gaps and bar variations keep the soundtrack from looping mechanically.
    if (melodic !== null && (variation > 0.15 || step === 4)) {
      const octave = (bar % 8 === 4 && step % 4 === 0) ? -12 : 0;
      const passing = (bar % 4 === 2 && step === 11) ? 2 : 0;
      musicNote(chord[melodic] + 12 + octave + passing, when + 0.012,
        0.17 + (step % 4 === 0 ? 0.15 : 0), 0.021 * config.color, 'sine', 0.014);
    }
  }

  function stopScheduler() {
    if (loopId !== null) { clearInterval(loopId); loopId = null; }
    playing = false;
    if (context && master) {
      const now = context.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setTargetAtTime(0, now, 0.035);
    }
  }

  function tick() {
    if (!playing || !enabled || !context || document.hidden || context.state !== 'running') return;
    const config = THEMES[themeName];
    if (!config) return;
    const interval = 60 / config.bpm / 4;
    // Schedule just ahead of the audio clock, not from setInterval timing.
    let safety = 0;
    while (nextStepAt < context.currentTime + 0.13 && safety++ < 12) {
      scheduleStep(stepIndex, Math.max(nextStepAt, context.currentTime + 0.004), config);
      nextStepAt += interval;
      stepIndex++;
    }
  }

  function launch() {
    if (!enabled || !themeName || document.hidden || !context || context.state !== 'running') return;
    stopScheduler();
    const now = context.currentTime;
    master.gain.setTargetAtTime(0.58, now, 0.18);
    stepIndex = 0;
    nextStepAt = now + 0.035;
    playing = true;
    tick();
    loopId = setInterval(tick, 65);
  }

  function start(name) {
    if (!Object.prototype.hasOwnProperty.call(THEMES, name)) return;
    if (name === themeName && (playing || !enabled)) return;
    themeName = name;
    if (!enabled) { stopScheduler(); return; }
    // Audio begins only after the browser receives a real interaction.
    if (context && context.state === 'running') launch();
  }

  function stop() { themeName = null; stopScheduler(); }

  function setEnabled(value) {
    enabled = Boolean(value);
    if (!enabled) stopScheduler();
    else {
      const ctx = createAudio();
      if (ctx?.state === 'running') launch();
      else if (ctx?.state === 'suspended') ctx.resume().then(() => launch()).catch(() => {});
    }
  }

  function getContext() {
    if (!enabled) return null;
    return createAudio();
  }

  function unlock() {
    if (!enabled) return;
    const ctx = createAudio();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().then(() => { if (themeName && !playing) launch(); }).catch(() => {});
    } else if (themeName && !playing) launch();
  }

  window.addEventListener('pointerdown', unlock, { passive: true });
  window.addEventListener('keydown', unlock);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopScheduler();
    else if (themeName && enabled && context?.state === 'running') launch();
  });

  window.ArcadeMusic = { start, stop, setEnabled, getContext, unlock,
    isEnabled: () => enabled, currentTheme: () => themeName };
})();

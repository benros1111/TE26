// Ljud och musik, gjort med Web Audio (inga ljudfiler behövs).
// Musiken är en egen 8-bitarslåt. Gör gärna en egen!
let audioCtx = null;
let muted = false;
try { muted = localStorage.getItem("te26-muted") === "1"; } catch (e) { /* ingen lagring, ok */ }

// Webbläsare (särskilt iPhone) tillåter bara ljud efter att man tryckt på något.
function unlockAudio() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    audioCtx = new AC();
  }
  if (audioCtx.state === "suspended") audioCtx.resume();
}

function tone(f1, f2, dur, type = "square", vol = 0.08, delay = 0) {
  if (!audioCtx || muted) return;
  const t = audioCtx.currentTime + delay;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(f1, t);
  osc.frequency.exponentialRampToValueAtTime(f2, t + dur);
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

const sfx = {
  jump:    () => tone(280, 640, 0.16, "square", 0.06),
  coin:    () => { tone(988, 988, 0.07, "square", 0.06); tone(1319, 1319, 0.25, "square", 0.06, 0.07); },
  stomp:   () => tone(500, 90, 0.14, "square", 0.08),
  kick:    () => tone(180, 520, 0.08, "square", 0.08),
  bump:    () => tone(160, 90, 0.08, "triangle", 0.2),
  brick:   () => { tone(400, 60, 0.2, "sawtooth", 0.08); tone(250, 40, 0.25, "square", 0.05, 0.03); },
  appear:  () => tone(300, 900, 0.35, "triangle", 0.12),
  powerup: () => [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, f, 0.09, "square", 0.06, i * 0.07)),
  hurt:    () => tone(700, 120, 0.45, "sawtooth", 0.07),
  die:     () => [494, 466, 440, 392, 330, 262].forEach((f, i) => tone(f, f * 0.98, 0.14, "square", 0.07, i * 0.13)),
  clear:   () => [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => tone(f, f, 0.14, "square", 0.07, i * 0.12)),
};

// ---------- Musik ----------
// Noter: namn + oktav. "-" = paus. Varje not i melodin är en åttondel.
const NOTE = { C: 0, "C#": 1, D: 2, "D#": 3, E: 4, F: 5, "F#": 6, G: 7, "G#": 8, A: 9, "A#": 10, B: 11 };
function freq(note) {
  const name = note.slice(0, -1);
  const octave = Number(note.slice(-1));
  return 440 * Math.pow(2, (NOTE[name] + (octave - 4) * 12 - 9) / 12);
}

const SONG = {
  lead: [
    "E5", "G5", "A5", "G5", "E5", "C5", "D5", "-",
    "E5", "G5", "A5", "C6", "B5", "G5", "A5", "-",
    "F5", "A5", "B5", "A5", "F5", "D5", "E5", "-",
    "D5", "E5", "G5", "E5", "D5", "B4", "C5", "-",
    "C5", "-", "E5", "C5", "G5", "-", "E5", "-",
    "A5", "G5", "E5", "G5", "A5", "-", "C6", "-",
    "B5", "A5", "G5", "F5", "E5", "D5", "E5", "G5",
    "D5", "-", "B4", "D5", "C5", "-", "-", "-",
  ],
  // Basen: en not per fjärdedel (två åttondelar)
  bass: [
    "C3", "G3", "C3", "G3", "A2", "E3", "A2", "E3",
    "F2", "C3", "F2", "C3", "G2", "D3", "G2", "B2",
    "C3", "G3", "E3", "G3", "F2", "C3", "A2", "C3",
    "G2", "D3", "F3", "D3", "C3", "G2", "C3", "-",
  ],
};

let music = { playing: false, step: 0, nextTime: 0, timer: null, tempo: 140 };

function startMusic(tempo = 140) {
  stopMusic();
  if (!audioCtx) return;
  music = { playing: true, step: 0, nextTime: audioCtx.currentTime + 0.1, timer: null, tempo };
  music.timer = setInterval(scheduleMusic, 50);
}

function stopMusic() {
  if (music.timer) clearInterval(music.timer);
  music.playing = false;
}

// Lägger ut noterna lite i förväg så att musiken inte hackar.
function scheduleMusic() {
  const eighth = 60 / music.tempo / 2;
  while (music.nextTime < audioCtx.currentTime + 0.2) {
    const i = music.step % SONG.lead.length;
    const delay = music.nextTime - audioCtx.currentTime;
    const lead = SONG.lead[i];
    if (lead !== "-") tone(freq(lead), freq(lead), eighth * 0.9, "square", 0.03, delay);
    if (i % 2 === 0) {
      const bass = SONG.bass[(i / 2) % SONG.bass.length];
      if (bass !== "-") tone(freq(bass), freq(bass), eighth * 1.8, "triangle", 0.09, delay);
    }
    music.nextTime += eighth;
    music.step++;
  }
}

function toggleMute() {
  muted = !muted;
  try { localStorage.setItem("te26-muted", muted ? "1" : "0"); } catch (e) { /* ok */ }
  return muted;
}

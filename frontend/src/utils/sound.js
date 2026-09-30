// Web Audio API pure synthesizer - zero external asset dependencies
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playLobbyChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // First note: G5 (784Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(783.99, now);
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.25, now + 0.05);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.75);

    // Second note: C6 (1046.5Hz) - 0.28s later
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1046.50, now + 0.28);
    gain2.gain.setValueAtTime(0, now + 0.28);
    gain2.gain.linearRampToValueAtTime(0.3, now + 0.33);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.28);
    osc2.stop(now + 1.25);
  } catch (err) {
    console.warn('[Audio] Could not play chime:', err);
  }
}

export function speakAnnouncement(tokenNumber, counterNumber) {
  if (!('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel(); // clear previous
    // Format token e.g. "MED-002" -> "Token M E D 0 0 2"
    const formattedToken = tokenNumber.split('').join(' ');
    const text = `Attention please. Token ${formattedToken}, please proceed to ${counterNumber}.`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.05;
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('[TTS] Speech announcement failed:', err);
  }
}

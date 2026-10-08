/**
 * Optional UI sounds, OFF by default.
 *
 * All tones are synthesized with the Web Audio API — no audio files, no
 * network. The context is created lazily on the first user-triggered sound,
 * so autoplay policies are never tripped by background playback.
 */

let enabled = false
let ctx = null

export function setSoundEnabled(value) {
  enabled = Boolean(value)
}

export function isSoundEnabled() {
  return enabled
}

function context() {
  if (ctx) return ctx
  const AudioContext = window.AudioContext ?? window.webkitAudioContext
  if (!AudioContext) return null
  ctx = new AudioContext()
  return ctx
}

function blip({ freq = 660, at = 0, dur = 0.06, type = 'square', gain = 0.025 }) {
  const audio = context()
  if (!audio) return
  if (audio.state === 'suspended') void audio.resume().catch(() => {})
  const t0 = audio.currentTime + at
  const osc = audio.createOscillator()
  const amp = audio.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  amp.gain.setValueAtTime(0.0001, t0)
  amp.gain.exponentialRampToValueAtTime(gain, t0 + 0.012)
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  osc.connect(amp)
  amp.connect(audio.destination)
  osc.start(t0)
  osc.stop(t0 + dur + 0.02)
}

/** Play a named UI tone. No-op unless the sound toggle is on. */
export function playSound(name) {
  if (!enabled || typeof window === 'undefined') return
  try {
    if (name === 'key') {
      blip({ freq: 660, dur: 0.05 })
    } else if (name === 'success') {
      blip({ freq: 523.25, dur: 0.09, type: 'sine', gain: 0.035 })
      blip({ freq: 783.99, at: 0.09, dur: 0.12, type: 'sine', gain: 0.035 })
    } else if (name === 'fail') {
      blip({ freq: 196, dur: 0.14, type: 'sawtooth', gain: 0.03 })
      blip({ freq: 147, at: 0.12, dur: 0.16, type: 'sawtooth', gain: 0.03 })
    }
  } catch {
    // A denied AudioContext must never break the deck.
  }
}

// Sound — Web Audio API utility for tones and system sounds
// Usage:
//   Sound.beep()
//   Sound.tone(440, 0.3)          // frequency Hz, duration seconds
//   Sound.chord([261, 329, 392])  // play multiple notes together
//   Sound.success()
//   Sound.error()
//   Sound.click()
//   Sound.enabled                 // false if user has muted via Settings

let audioContext = null;

function getAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    // Resume if suspended (browsers require user gesture first)
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    return audioContext;
}

function isMuted() {
    try {
        const raw = localStorage.getItem('pz_sound');
        return raw === 'false';
    } catch {
        return false;
    }
}

/**
 * Play a single oscillator tone.
 * @param {number} frequency - Hz
 * @param {number} durationSeconds
 * @param {number} [gainLevel=0.3] - 0 to 1
 * @param {'sine'|'square'|'triangle'|'sawtooth'} [waveType='sine']
 * @returns {void}
 */
function playTone(frequency, durationSeconds, gainLevel = 0.3, waveType = 'sine') {
    if (isMuted()) return;
    try {
        const ctx = getAudioContext();
        const oscillator = ctx.createOscillator();
        const gainNode   = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type            = waveType;
        oscillator.frequency.value = frequency;

        gainNode.gain.setValueAtTime(gainLevel, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationSeconds);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + durationSeconds);
    } catch {}
}

export const Sound = {
    /**
     * Play a simple beep.
     */
    beep() {
        playTone(880, 0.18, 0.25);
    },

    /**
     * Play a tone at a given frequency and duration.
     * @param {number} frequency Hz
     * @param {number} [durationSeconds=0.25]
     * @param {number} [gain=0.3]
     */
    tone(frequency, durationSeconds = 0.25, gain = 0.3) {
        playTone(frequency, durationSeconds, gain);
    },

    /**
     * Play multiple frequencies simultaneously as a chord.
     * @param {number[]} frequencies
     * @param {number} [durationSeconds=0.4]
     */
    chord(frequencies, durationSeconds = 0.4) {
        const gainPerNote = 0.2 / frequencies.length;
        frequencies.forEach((freq) => playTone(freq, durationSeconds, gainPerNote));
    },

    /**
     * Short, soft click — good for button presses.
     */
    click() {
        playTone(1200, 0.06, 0.12, 'triangle');
    },

    /**
     * Rising two-tone success sound.
     */
    success() {
        playTone(523, 0.15, 0.2);
        setTimeout(() => playTone(659, 0.2, 0.2), 120);
        setTimeout(() => playTone(784, 0.3, 0.2), 240);
    },

    /**
     * Low buzz error sound.
     */
    error() {
        playTone(180, 0.12, 0.3, 'square');
        setTimeout(() => playTone(150, 0.2, 0.25, 'square'), 140);
    },

    /**
     * Soft notification ping.
     */
    notify() {
        playTone(660, 0.12, 0.18);
        setTimeout(() => playTone(880, 0.18, 0.15), 110);
    },

    /**
     * Alarm pattern — repeats N times.
     * @param {number} [repeats=3]
     */
    alarm(repeats = 3) {
        for (let i = 0; i < repeats; i++) {
            setTimeout(() => {
                playTone(880, 0.25, 0.4);
                setTimeout(() => playTone(880, 0.25, 0.4), 300);
            }, i * 700);
        }
    },
};

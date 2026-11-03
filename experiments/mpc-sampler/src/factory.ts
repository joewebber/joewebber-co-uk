import { Directory, File, Paths } from 'expo-file-system';

const SR = 44100;

type Gen = (t: number, n: () => number) => number;
const exp = (t: number, k: number) => Math.exp(-t * k);

// Deterministic-ish white noise in [-1, 1].
const noise = () => Math.random() * 2 - 1;

const SOUNDS: { name: string; dur: number; gen: () => Gen }[] = [
  {
    name: 'KICK',
    dur: 0.45,
    gen: () => {
      let phase = 0;
      return (t) => {
        const f = 45 + 110 * exp(t, 28);
        phase += (2 * Math.PI * f) / SR;
        return Math.tanh(1.6 * Math.sin(phase) * exp(t, 7)) + 0.3 * noise() * exp(t, 400);
      };
    },
  },
  {
    name: 'SNARE',
    dur: 0.3,
    gen: () => (t) => 0.7 * noise() * exp(t, 18) + 0.5 * Math.sin(2 * Math.PI * 190 * t) * exp(t, 28),
  },
  {
    name: 'CLAP',
    dur: 0.35,
    gen: () => (t) => {
      const bursts = [0, 0.011, 0.022].reduce((a, s) => a + (t >= s ? exp(t - s, 90) : 0), 0);
      return noise() * (0.4 * bursts + 0.6 * exp(Math.max(0, t - 0.03), 16) * (t > 0.03 ? 1 : 0));
    },
  },
  {
    name: 'CLOSED HAT',
    dur: 0.1,
    gen: () => {
      let prev = 0;
      return (t) => {
        const n = noise();
        const hp = n - prev; // crude high-pass
        prev = n;
        return 0.8 * hp * exp(t, 55);
      };
    },
  },
  {
    name: 'OPEN HAT',
    dur: 0.5,
    gen: () => {
      let prev = 0;
      return (t) => {
        const n = noise();
        const hp = n - prev;
        prev = n;
        return 0.7 * hp * exp(t, 9);
      };
    },
  },
  {
    name: 'TOM',
    dur: 0.5,
    gen: () => {
      let phase = 0;
      return (t) => {
        phase += (2 * Math.PI * (75 + 60 * exp(t, 12))) / SR;
        return Math.sin(phase) * exp(t, 8);
      };
    },
  },
  {
    name: 'RIM',
    dur: 0.08,
    gen: () => (t) => (Math.sin(2 * Math.PI * 1700 * t) + 0.5 * noise()) * exp(t, 70) * 0.7,
  },
  {
    name: 'BASS C1',
    dur: 1.0,
    gen: () => (t) => Math.tanh(2 * Math.sin(2 * Math.PI * 32.7 * t)) * exp(t, 3) * 0.8,
  },
  {
    name: 'STAB',
    dur: 0.7,
    gen: () => (t) => {
      const f = 261.6;
      let s = 0;
      for (const m of [1, 1.26, 1.5]) s += 2 * ((t * f * m) % 1) - 1; // saws: root, maj3, 5th
      return (s / 3) * exp(t, 6) * 0.6;
    },
  },
];

function wav(samples: Float32Array): Uint8Array {
  const bytes = new Uint8Array(44 + samples.length * 2);
  const v = new DataView(bytes.buffer);
  const str = (o: number, s: string) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  str(0, 'RIFF');
  v.setUint32(4, 36 + samples.length * 2, true);
  str(8, 'WAVEfmt ');
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true); // PCM
  v.setUint16(22, 1, true); // mono
  v.setUint32(24, SR, true);
  v.setUint32(28, SR * 2, true);
  v.setUint16(32, 2, true);
  v.setUint16(34, 16, true);
  str(36, 'data');
  v.setUint32(40, samples.length * 2, true);
  samples.forEach((s, i) => v.setInt16(44 + i * 2, Math.max(-1, Math.min(1, s)) * 0x7fff, true));
  return bytes;
}

export const factoryDir = new Directory(Paths.document, 'factory');

/** Write the built-in drum kit once so the browser is never empty. */
export function ensureFactorySamples() {
  if (!factoryDir.exists) factoryDir.create({ intermediates: true });
  for (const s of SOUNDS) {
    const file = new File(factoryDir, `${s.name}.wav`);
    if (file.exists) continue;
    const gen = s.gen();
    const out = new Float32Array(Math.floor(SR * s.dur));
    for (let i = 0; i < out.length; i++) {
      const t = i / SR;
      // 2ms fade-out at the tail to avoid a click.
      const tail = Math.min(1, (s.dur - t) / 0.002);
      out[i] = gen(t, noise) * tail * 0.9;
    }
    file.create();
    file.write(wav(out));
  }
}

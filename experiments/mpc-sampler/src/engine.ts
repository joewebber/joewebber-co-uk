import { setAudioModeAsync } from 'expo-audio';
import {
  AudioBuffer,
  AudioBufferSourceNode,
  AudioContext,
  GainNode,
} from 'react-native-audio-api';

export type PlayMode = 'ONE-SHOT' | 'LOOP' | 'GATE';

export type Pad = {
  uri: string | null;
  name: string;
  volume: number; // 0..1
  pitch: number; // semitones, -12..+12
  mode: PlayMode;
};

export const emptyPad = (): Pad => ({
  uri: null,
  name: '',
  volume: 1,
  pitch: 0,
  mode: 'ONE-SHOT',
});

/**
 * Samples are decoded to PCM once, up front, and held in memory. Triggering a
 * pad is then just "start a new buffer source" on a native audio graph, which
 * is how hardware samplers behave and is far lower latency than a media player.
 */
type Voice = {
  buffer: AudioBuffer;
  gain: GainNode;
  source: AudioBufferSourceNode | null;
};

let ctx: AudioContext | null = null;
const voices = new Map<number, Voice>();

const getCtx = () => (ctx ??= new AudioContext());
const semitoneRate = (st: number) => Math.pow(2, st / 12);

export async function loadVoice(id: number, pad: Pad, onFinish: () => void) {
  unloadVoice(id);
  if (!pad.uri) return;
  const c = getCtx();
  const buffer = await c.decodeAudioData(pad.uri);
  const gain = c.createGain();
  gain.connect(c.destination);
  voices.set(id, { buffer, gain, source: null });
  applyParams(id, pad);
  void onFinish;
}

export function unloadVoice(id: number) {
  const v = voices.get(id);
  if (!v) return;
  stop(id);
  v.gain.disconnect();
  voices.delete(id);
}

export function applyParams(id: number, pad: Pad) {
  const v = voices.get(id);
  if (!v) return;
  v.gain.gain.value = pad.volume;
  if (v.source) {
    v.source.loop = pad.mode === 'LOOP';
    v.source.playbackRate.value = semitoneRate(pad.pitch);
  }
}

/** Fire the pad immediately. Synchronous: no awaits between tap and sound. */
export function trigger(id: number, pad: Pad, onFinish: () => void) {
  const v = voices.get(id);
  if (!v) return;
  if (v.source) {
    v.source.onEnded = null;
    try {
      v.source.stop();
    } catch {
      // already ended
    }
  }
  const src = getCtx().createBufferSource();
  src.buffer = v.buffer;
  src.loop = pad.mode === 'LOOP';
  src.playbackRate.value = semitoneRate(pad.pitch);
  src.connect(v.gain);
  src.onEnded = () => {
    if (v.source === src) {
      v.source = null;
      onFinish();
    }
  };
  v.source = src;
  src.start();
}

export function release(id: number, pad: Pad) {
  if (pad.mode === 'GATE') stop(id);
}

export function stop(id: number) {
  const v = voices.get(id);
  if (!v?.source) return;
  const src = v.source;
  v.source = null;
  src.onEnded = null;
  try {
    src.stop();
  } catch {
    // already ended
  }
}

export function stopAll() {
  for (const id of voices.keys()) stop(id);
}

export async function setRecordingMode(recording: boolean) {
  await setAudioModeAsync({
    allowsRecording: recording,
    playsInSilentMode: true,
  });
}

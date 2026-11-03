import {
  AudioPlayer,
  createAudioPlayer,
  setAudioModeAsync,
} from 'expo-audio';

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

type Voice = { player: AudioPlayer; sub: { remove(): void }; uri: string };
const voices = new Map<number, Voice>();

const semitoneRate = (st: number) => Math.pow(2, st / 12);

/** (Re)build the player for a pad. Call whenever its sample changes. */
export function loadVoice(id: number, pad: Pad, onFinish: () => void) {
  unloadVoice(id);
  if (!pad.uri) return;
  const player = createAudioPlayer(pad.uri, { keepAudioSessionActive: true });
  player.shouldCorrectPitch = false; // tape-style pitch, like a hardware sampler
  const sub = player.addListener('playbackStatusUpdate', (s) => {
    if (s.didJustFinish) onFinish();
  });
  voices.set(id, { player, sub, uri: pad.uri });
  applyParams(id, pad);
}

export function unloadVoice(id: number) {
  const v = voices.get(id);
  if (!v) return;
  v.sub.remove();
  v.player.remove();
  voices.delete(id);
}

export function applyParams(id: number, pad: Pad) {
  const v = voices.get(id);
  if (!v) return;
  v.player.volume = pad.volume;
  v.player.loop = pad.mode === 'LOOP';
  v.player.setPlaybackRate(semitoneRate(pad.pitch));
}

export async function trigger(id: number) {
  const v = voices.get(id);
  if (!v) return;
  // Retrigger from the top, like a hardware pad.
  if (v.player.playing || v.player.currentTime > 0) await v.player.seekTo(0);
  v.player.play();
}

export function release(id: number, pad: Pad) {
  if (pad.mode === 'GATE') stop(id);
}

export function stop(id: number) {
  const v = voices.get(id);
  if (!v) return;
  v.player.pause();
  void v.player.seekTo(0);
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

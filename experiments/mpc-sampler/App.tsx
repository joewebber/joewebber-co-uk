import { StatusBar } from 'expo-status-bar';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  useAudioRecorder,
} from 'expo-audio';
import {
  Pad,
  PlayMode,
  applyParams,
  emptyPad,
  loadVoice,
  release,
  setRecordingMode,
  stopAll,
  trigger,
  unloadVoice,
} from './src/engine';
import { PAD_COUNT, deleteSample, importSample, loadPads, savePads } from './src/storage';

type Mode = 'PLAY' | 'REC' | 'LOAD' | 'ERASE';
const MODES: Mode[] = ['PLAY', 'REC', 'LOAD', 'ERASE'];
const BANKS = ['A', 'B', 'C', 'D'];
const PLAY_MODES: PlayMode[] = ['ONE-SHOT', 'LOOP', 'GATE'];

const C = {
  bg: '#15161a',
  body: '#1f2126',
  lcd: '#9bd17b',
  lcdBg: '#1b2418',
  pad: '#2b2e35',
  padLoaded: '#e8a21a',
  padLit: '#ffe08a',
  rec: '#e5322d',
  text: '#d7d9de',
  dim: '#7b7f89',
};

export default function App() {
  useKeepAwake();
  const [pads, setPads] = useState<Pad[]>(() =>
    Array.from({ length: PAD_COUNT }, emptyPad),
  );
  const [bank, setBank] = useState(0);
  const [mode, setMode] = useState<Mode>('PLAY');
  const [selected, setSelected] = useState(0);
  const [lit, setLit] = useState<Set<number>>(new Set());
  const [recordingPad, setRecordingPad] = useState<number | null>(null);
  const [message, setMessage] = useState('READY');
  const padsRef = useRef(pads);
  padsRef.current = pads;
  const ready = useRef(false);

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  const setLight = useCallback((id: number, on: boolean) => {
    setLit((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const updatePad = useCallback((id: number, patch: Partial<Pad>) => {
    setPads((prev) => prev.map((p, i) => (i === id ? { ...p, ...patch } : p)));
  }, []);

  // Restore saved pads on launch.
  useEffect(() => {
    const saved = loadPads();
    if (saved && saved.length === PAD_COUNT) {
      setPads(saved);
      saved.forEach((p, i) => {
        if (p.uri) void loadVoice(i, p, () => setLight(i, false));
      });
    }
    ready.current = true;
  }, [setLight]);

  // Persist on change and keep voice params in sync.
  useEffect(() => {
    if (!ready.current) return;
    savePads(pads);
    pads.forEach((p, i) => applyParams(i, p));
  }, [pads]);

  const assign = async (id: number, sourceUri: string, name: string) => {
    deleteSample(padsRef.current[id].uri);
    const uri = importSample(sourceUri, id);
    const pad = { ...padsRef.current[id], uri, name };
    updatePad(id, { uri, name });
    await loadVoice(id, pad, () => setLight(id, false));
    setMessage(`PAD ${id + 1} ← ${name}`);
  };

  const startRecording = async (id: number) => {
    const perm = await requestRecordingPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Microphone needed', 'Allow microphone access in Settings to sample.');
      return;
    }
    stopAll();
    await setRecordingMode(true);
    await recorder.prepareToRecordAsync();
    recorder.record();
    setRecordingPad(id);
    setMessage(`REC PAD ${id + 1} — TAP TO STOP`);
  };

  const stopRecording = async () => {
    const id = recordingRef.current;
    if (id === null) return;
    await recorder.stop();
    setRecordingPad(null);
    await setRecordingMode(false);
    if (recorder.uri) await assign(id, recorder.uri, `REC ${new Date().toLocaleTimeString()}`);
  };

  const pickFile = async (id: number) => {
    const res = await DocumentPicker.getDocumentAsync({
      type: 'audio/*',
      copyToCacheDirectory: true,
    });
    if (res.canceled) return;
    const asset = res.assets[0];
    await assign(id, asset.uri, asset.name.replace(/\.[^.]+$/, '').toUpperCase());
  };

  const erase = (id: number) => {
    deleteSample(padsRef.current[id].uri);
    unloadVoice(id);
    updatePad(id, emptyPad());
    setMessage(`PAD ${id + 1} ERASED`);
  };

  const modeRef = useRef(mode);
  modeRef.current = mode;
  const recordingRef = useRef(recordingPad);
  recordingRef.current = recordingPad;

  const handlers = useRef({ startRecording, stopRecording, pickFile, erase });
  handlers.current = { startRecording, stopRecording, pickFile, erase };

  // Stable identity so memoised pads don't re-render on every tap.
  const onPadIn = useCallback((id: number) => {
    const pad = padsRef.current[id];
    // Sound first, UI second.
    if (recordingRef.current === null && modeRef.current === 'PLAY') {
      if (pad.uri) {
        trigger(id, pad, () => setLight(id, false));
        setLight(id, true);
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      setSelected(id);
      return;
    }
    setSelected(id);
    if (recordingRef.current !== null) {
      if (recordingRef.current === id) void handlers.current.stopRecording();
      return;
    }
    switch (modeRef.current) {
      case 'REC':
        void handlers.current.startRecording(id);
        break;
      case 'LOAD':
        void handlers.current.pickFile(id);
        break;
      case 'ERASE':
        handlers.current.erase(id);
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPadOut = useCallback((id: number) => {
    const pad = padsRef.current[id];
    if (modeRef.current === 'PLAY' && pad.mode === 'GATE') {
      release(id, pad);
      setLight(id, false);
    }
    // One-shots go dark via onEnded; loops stay lit until stopped.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sel = pads[selected];
  const stepVol = (d: number) =>
    updatePad(selected, { volume: Math.min(1, Math.max(0, +(sel.volume + d).toFixed(2))) });
  const stepPitch = (d: number) =>
    updatePad(selected, { pitch: Math.min(12, Math.max(-12, sel.pitch + d)) });
  const cycleMode = () =>
    updatePad(selected, {
      mode: PLAY_MODES[(PLAY_MODES.indexOf(sel.mode) + 1) % PLAY_MODES.length],
    });

  // MPC layout: pad 1 is bottom-left, so rows run bottom-up.
  const rows = [3, 2, 1, 0].map((r) => [0, 1, 2, 3].map((c) => r * 4 + c));

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="light" />
      <View style={styles.body}>
        <View style={styles.lcd}>
          <Text style={styles.lcdSmall}>
            BANK {BANKS[bank]}  PAD {bank * 16 + (selected % 16) + 1}
          </Text>
          <Text style={styles.lcdBig} numberOfLines={1}>
            {recordingPad !== null ? '● RECORDING' : sel.uri ? sel.name : '— EMPTY —'}
          </Text>
          <View style={styles.lcdRow}>
            <Text style={styles.lcdSmall}>VOL {Math.round(sel.volume * 100)}</Text>
            <Text style={styles.lcdSmall}>
              PITCH {sel.pitch > 0 ? '+' : ''}
              {sel.pitch}
            </Text>
            <Text style={styles.lcdSmall}>{sel.mode}</Text>
          </View>
          <Text style={styles.lcdMsg}>{message}</Text>
        </View>

        <View style={styles.row}>
          {BANKS.map((b, i) => (
            <Btn key={b} label={`BANK ${b}`} active={bank === i} onPress={() => { setBank(i); setSelected(i * 16 + (selected % 16)); }} />
          ))}
        </View>

        <View style={styles.grid}>
          {rows.map((row, ri) => (
            <View key={ri} style={styles.gridRow}>
              {row.map((local) => {
                const id = bank * 16 + local;
                const p = pads[id];
                const isRec = recordingPad === id;
                const isLit = lit.has(id);
                return (
                  <PadButton
                    key={id}
                    id={id}
                    local={local}
                    loaded={!!p.uri}
                    name={p.name}
                    lit={isLit}
                    rec={isRec}
                    selected={selected === id}
                    onIn={onPadIn}
                    onOut={onPadOut}
                  />
                );
              })}
            </View>
          ))}
        </View>

        <View style={styles.row}>
          {MODES.map((m) => (
            <Btn key={m} label={m} active={mode === m} danger={m === 'REC'} onPress={() => setMode(m)} />
          ))}
        </View>

        <View style={styles.row}>
          <Btn label="VOL −" onPress={() => stepVol(-0.05)} />
          <Btn label="VOL +" onPress={() => stepVol(0.05)} />
          <Btn label="PITCH −" onPress={() => stepPitch(-1)} />
          <Btn label="PITCH +" onPress={() => stepPitch(1)} />
        </View>
        <View style={styles.row}>
          <Btn label={`MODE: ${sel.mode}`} onPress={cycleMode} />
          <Btn label="STOP ALL" onPress={() => { stopAll(); setLit(new Set()); }} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const PadButton = memo(function PadButton({
  id, local, loaded, name, lit, rec, selected, onIn, onOut,
}: {
  id: number;
  local: number;
  loaded: boolean;
  name: string;
  lit: boolean;
  rec: boolean;
  selected: boolean;
  onIn: (id: number) => void;
  onOut: (id: number) => void;
}) {
  return (
    <Pressable
      onPressIn={() => onIn(id)}
      onPressOut={() => onOut(id)}
      unstable_pressDelay={0}
      style={[
        styles.pad,
        loaded && styles.padLoaded,
        lit && styles.padLit,
        rec && styles.padRec,
        selected && styles.padSelected,
      ]}
    >
      <Text style={[styles.padNum, loaded && styles.padNumLoaded]}>{local + 1}</Text>
      {loaded && (
        <Text style={styles.padName} numberOfLines={1}>
          {name}
        </Text>
      )}
    </Pressable>
  );
});

function Btn({
  label,
  onPress,
  active,
  danger,
}: {
  label: string;
  onPress: () => void;
  active?: boolean;
  danger?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        active && (danger ? styles.btnRec : styles.btnActive),
        pressed && { opacity: 0.6 },
      ]}
    >
      <Text style={[styles.btnText, active && { color: '#15161a' }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  body: { flex: 1, padding: 12, gap: 10, justifyContent: 'center' },
  lcd: {
    backgroundColor: C.lcdBg,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#0c0f0a',
    padding: 12,
    gap: 4,
  },
  lcdBig: { color: C.lcd, fontSize: 22, fontWeight: '700', fontFamily: 'Courier' },
  lcdSmall: { color: C.lcd, fontSize: 12, fontFamily: 'Courier', opacity: 0.85 },
  lcdMsg: { color: C.lcd, fontSize: 11, fontFamily: 'Courier', opacity: 0.55 },
  lcdRow: { flexDirection: 'row', justifyContent: 'space-between' },
  row: { flexDirection: 'row', gap: 8 },
  grid: { gap: 8 },
  gridRow: { flexDirection: 'row', gap: 8 },
  pad: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: C.pad,
    borderRadius: 10,
    padding: 6,
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  padLoaded: { backgroundColor: '#5a4310' },
  padLit: { backgroundColor: C.padLit },
  padRec: { backgroundColor: C.rec },
  padSelected: { borderColor: C.text },
  padNum: { color: C.dim, fontSize: 12, fontFamily: 'Courier' },
  padNumLoaded: { color: C.padLoaded },
  padName: { color: C.text, fontSize: 9, fontFamily: 'Courier' },
  btn: {
    flex: 1,
    backgroundColor: C.body,
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#33363e',
  },
  btnActive: { backgroundColor: C.padLoaded },
  btnRec: { backgroundColor: C.rec },
  btnText: { color: C.text, fontSize: 11, fontWeight: '700', fontFamily: 'Courier' },
});

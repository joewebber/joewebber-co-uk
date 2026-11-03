import { useCallback, useEffect, useState } from 'react';
import { FlatList, Modal, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { forgetPreview, preview, stopPreview } from './engine';
import { LibraryItem, addToLibrary, listLibrary, removeFromLibrary } from './storage';

const C = {
  bg: '#15161a',
  panel: '#1f2126',
  lcd: '#9bd17b',
  lcdBg: '#1b2418',
  accent: '#e8a21a',
  text: '#d7d9de',
  dim: '#7b7f89',
  line: '#33363e',
};

type Props = {
  visible: boolean;
  padLabel: string;
  currentUri: string | null;
  onAssign: (item: LibraryItem) => void;
  onDeleted: (uri: string) => void;
  onClose: () => void;
};

export function SampleBrowser({ visible, padLabel, currentUri, onAssign, onDeleted, onClose }: Props) {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);
  const [error, setError] = useState('');

  const refresh = useCallback(() => setItems(listLibrary()), []);

  useEffect(() => {
    if (visible) {
      refresh();
      setSelected(currentUri);
      setError('');
    } else {
      stopPreview();
      setPlaying(null);
    }
  }, [visible, currentUri, refresh]);

  const audition = async (item: LibraryItem) => {
    setSelected(item.uri);
    setPlaying(item.uri);
    setError('');
    try {
      await preview(item.uri, () => setPlaying((p) => (p === item.uri ? null : p)));
    } catch {
      setPlaying(null);
      setError(`Can't play ${item.name}`);
    }
  };

  const addFiles = async () => {
    stopPreview();
    setPlaying(null);
    const res = await DocumentPicker.getDocumentAsync({
      type: 'audio/*',
      multiple: true,
      copyToCacheDirectory: true,
    });
    if (res.canceled) return;
    let last: LibraryItem | null = null;
    for (const a of res.assets) {
      last = addToLibrary(a.uri, a.name.replace(/\.[^.]+$/, '').toUpperCase());
    }
    refresh();
    if (last) setSelected(last.uri);
  };

  const remove = () => {
    const item = items.find((i) => i.uri === selected);
    if (!item || item.factory) return;
    stopPreview();
    setPlaying(null);
    forgetPreview(item.uri);
    removeFromLibrary(item.uri);
    onDeleted(item.uri);
    setSelected(null);
    refresh();
  };

  const chosen = items.find((i) => i.uri === selected) ?? null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={s.root}>
        <View style={s.lcd}>
          <Text style={s.lcdSmall}>SAMPLE BROWSER → {padLabel}</Text>
          <Text style={s.lcdBig} numberOfLines={1}>
            {chosen ? chosen.name : 'SELECT A SAMPLE'}
          </Text>
          <Text style={s.lcdSmall}>{error || 'TAP TO PREVIEW · ASSIGN TO LOAD ONTO PAD'}</Text>
        </View>

        <FlatList
          style={s.list}
          data={items}
          keyExtractor={(i) => i.uri}
          ListEmptyComponent={<Text style={s.empty}>No samples yet. Tap ADD FILES.</Text>}
          renderItem={({ item }) => {
            const isSel = item.uri === selected;
            const isPlaying = item.uri === playing;
            return (
              <Pressable
                onPress={() => audition(item)}
                style={[s.rowItem, isSel && s.rowSel]}
              >
                <Text style={[s.icon, isPlaying && { color: C.accent }]}>{isPlaying ? '■' : '▶'}</Text>
                <Text style={[s.name, isSel && { color: C.accent }]} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={s.tag}>{item.factory ? 'FACTORY' : 'USER'}</Text>
              </Pressable>
            );
          }}
        />

        <View style={s.bar}>
          <Btn label="ADD FILES" onPress={addFiles} />
          <Btn label="STOP" onPress={() => { stopPreview(); setPlaying(null); }} />
          <Btn label="DELETE" disabled={!chosen || chosen.factory} onPress={remove} />
        </View>
        <View style={s.bar}>
          <Btn label="CANCEL" onPress={onClose} />
          <Btn label="ASSIGN" primary disabled={!chosen} onPress={() => chosen && onAssign(chosen)} />
        </View>
      </SafeAreaView>
    </Modal>
  );
}

function Btn({
  label, onPress, primary, disabled,
}: { label: string; onPress: () => void; primary?: boolean; disabled?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [s.btn, primary && s.btnPrimary, disabled && { opacity: 0.35 }, pressed && { opacity: 0.6 }]}
    >
      <Text style={[s.btnText, primary && { color: C.bg }]}>{label}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg, padding: 12, gap: 10 },
  lcd: { backgroundColor: C.lcdBg, borderRadius: 6, borderWidth: 2, borderColor: '#0c0f0a', padding: 12, gap: 4 },
  lcdBig: { color: C.lcd, fontSize: 20, fontWeight: '700', fontFamily: 'Courier' },
  lcdSmall: { color: C.lcd, fontSize: 11, fontFamily: 'Courier', opacity: 0.8 },
  list: { flex: 1, backgroundColor: C.panel, borderRadius: 6 },
  empty: { color: C.dim, padding: 16, fontFamily: 'Courier' },
  rowItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: C.line },
  rowSel: { backgroundColor: '#2b2e35' },
  icon: { color: C.text, width: 18, fontSize: 14 },
  name: { flex: 1, color: C.text, fontSize: 15, fontFamily: 'Courier' },
  tag: { color: C.dim, fontSize: 10, fontFamily: 'Courier' },
  bar: { flexDirection: 'row', gap: 8 },
  btn: { flex: 1, backgroundColor: C.panel, borderRadius: 6, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: C.line },
  btnPrimary: { backgroundColor: C.accent },
  btnText: { color: C.text, fontSize: 12, fontWeight: '700', fontFamily: 'Courier' },
});

import { Directory, File, Paths } from 'expo-file-system';
import { Pad } from './engine';
import { ensureFactorySamples, factoryDir } from './factory';

const libraryDir = new Directory(Paths.document, 'library');
const stateFile = new File(Paths.document, 'pads.json');

export const PAD_COUNT = 64; // 4 banks of 16, like an MPC

export type LibraryItem = { uri: string; name: string; factory: boolean };

const AUDIO_EXT = /\.(wav|mp3|m4a|aac|ogg|flac|caf|aif|aiff)$/i;

/** Copy a picked/recorded file into the sample library and return it. */
export function addToLibrary(sourceUri: string, name: string): LibraryItem {
  if (!libraryDir.exists) libraryDir.create({ intermediates: true });
  const ext = sourceUri.split('?')[0].split('.').pop() || 'm4a';
  const safe = name.replace(/[^\w .-]+/g, '_').trim() || 'SAMPLE';
  const dest = new File(libraryDir, `${safe}__${Date.now()}.${ext}`);
  new File(sourceUri).copy(dest);
  return { uri: dest.uri, name: safe, factory: false };
}

export function removeFromLibrary(uri: string) {
  try {
    const f = new File(uri);
    if (f.exists) f.delete();
  } catch {
    // already gone
  }
}

export function listLibrary(): LibraryItem[] {
  ensureFactorySamples();
  const read = (dir: Directory, factory: boolean): LibraryItem[] =>
    dir.exists
      ? dir
          .list()
          .filter((e): e is File => e instanceof File && AUDIO_EXT.test(e.name))
          .map((f) => ({
            uri: f.uri,
            factory,
            name: f.name.replace(/\.[^.]+$/, '').replace(/__\d+$/, ''),
          }))
          .sort((a, b) => a.name.localeCompare(b.name))
      : [];
  return [...read(factoryDir, true), ...read(libraryDir, false)];
}

export function savePads(pads: Pad[]) {
  try {
    if (!stateFile.exists) stateFile.create();
    stateFile.write(JSON.stringify(pads));
  } catch (e) {
    console.warn('Could not save pads', e);
  }
}

export function loadPads(): Pad[] | null {
  try {
    if (!stateFile.exists) return null;
    const pads = JSON.parse(stateFile.textSync()) as Pad[];
    // Drop samples whose files have disappeared.
    return pads.map((p) => (p.uri && !new File(p.uri).exists ? { ...p, uri: null, name: '' } : p));
  } catch {
    return null;
  }
}

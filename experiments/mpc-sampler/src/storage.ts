import { Directory, File, Paths } from 'expo-file-system';
import { Pad } from './engine';

const samplesDir = new Directory(Paths.document, 'samples');
const stateFile = new File(Paths.document, 'pads.json');

export const PAD_COUNT = 64; // 4 banks of 16, like an MPC

/** Copy a picked/recorded file into permanent storage and return its new uri. */
export function importSample(sourceUri: string, padId: number): string {
  if (!samplesDir.exists) samplesDir.create({ intermediates: true });
  const ext = sourceUri.split('?')[0].split('.').pop() || 'm4a';
  const dest = new File(samplesDir, `pad-${padId}-${Date.now()}.${ext}`);
  new File(sourceUri).copy(dest);
  return dest.uri;
}

export function deleteSample(uri: string | null) {
  if (!uri) return;
  try {
    const f = new File(uri);
    if (f.exists) f.delete();
  } catch {
    // already gone
  }
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

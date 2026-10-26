// --- FRENCH SYLLABIC PHONICS DATA (méthode syllabique) --------------------
// Consonants (columns) × vowel elements (rows) → syllable, in the spirit of
// the classic French "tableau de syllabes" used to teach blended decoding.

// Same order as the `consonne` category in data/frenchTiles.ts (deduped),
// with a leading ∅ column for the bare vowel, mirroring data/pinyin.ts.
export const CONSONANTS = ['∅', 'b', 'c', 'd', 'f', 'g', 'h', 'j', 'l', 'm', 'n', 'p', 'r', 's', 't', 'v', 'x', 'z'] as const;
export type Consonant = typeof CONSONANTS[number];

export type VowelGroupKey = 'simple' | 'oral' | 'nasal' | 'glide';

export type VowelGroup = {
  key: VowelGroupKey;
  label: string;
  labelFr: string;
  items: string[];
};

export const VOWEL_GROUPS: VowelGroup[] = [
  {
    key: 'simple',
    label: 'Single Vowels',
    labelFr: 'Voyelles simples',
    items: ['a', 'à', 'â', 'e', 'é', 'è', 'ê', 'ë', 'i', 'î', 'ï', 'o', 'ô', 'u', 'û', 'y'],
  },
  {
    key: 'oral',
    label: 'Vowel Combinations',
    labelFr: 'Voyelles composées',
    items: ['ai', 'aî', 'au', 'ay', 'ea', 'eau', 'ee', 'ei', 'eu', 'ey', 'oe', 'œ', 'œu', 'oi', 'oî', 'ou', 'où', 'oû', 'oy', 'ue', 'ui'],
  },
  {
    key: 'nasal',
    label: 'Nasal Vowels',
    labelFr: 'Voyelles nasales',
    items: ['am', 'an', 'aen', 'em', 'en', 'im', 'in', 'aim', 'ain', 'eim', 'ein', 'om', 'on', 'um', 'un', 'ym', 'yn', 'oing'],
  },
  {
    key: 'glide',
    label: 'Semi-Vowels / Glides',
    labelFr: 'Semi-voyelles',
    items: ['ia', 'ie', 'ieu', 'io', 'ion', 'iou', 'oua', 'oué', 'oui', 'ouin', 'ua', 'ue'],
  },
];

export type VowelRow = { id: string; text: string; group: VowelGroupKey };

// Flattened rows in group order, each with a unique id (text repeats across groups, e.g. "ue")
export const VOWEL_ROWS: VowelRow[] = VOWEL_GROUPS.flatMap(g =>
  g.items.map(text => ({ id: `${g.key}-${text}`, text, group: g.key }))
);

// Every consonant + vowel element is a pronounceable syllable in French —
// unlike Pinyin there is no sparse validity grid, so every cell blends.
export function buildFrenchSyllable(consonant: string, vowel: string): string {
  return consonant === '∅' ? vowel : consonant + vowel;
}

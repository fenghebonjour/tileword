// --- FRENCH TILE DEFINITIONS --------------------------------------------------

export type FrenchTileCategoryKey =
  | 'voyelle' | 'son_vocalique' | 'consonne'
  | 'digraphe' | 'accentuee' | 'groupe';

export type FrenchTileCategory = {
  label: string;    // English
  labelFr: string;  // French
  color: string;
  bg: string;
  tiles: string[];
};

export type FrenchTile = {
  id: number;
  text: string;        // canonical spelling (e.g. "an/en", "ai")
  display: string;     // what shows on the tile face
  variants: string[] | null;
  activeVariant: number;
  category: FrenchTileCategoryKey;
};

export const FRENCH_TILE_CATEGORIES: Record<FrenchTileCategoryKey, FrenchTileCategory> = {
  voyelle: {
    label: "Vowel", labelFr: "Voyelle",
    color: "#E84855",
    bg: "#1a0608",
    tiles: ["a", "a", "a", "e", "e", "e", "i", "i", "o", "o", "u", "u", "y"],
  },
  son_vocalique: {
    label: "Vowel Sound", labelFr: "Son vocalique",
    color: "#F4A261",
    bg: "#1a0e04",
    tiles: [
      "ou", "ou",
      "au/eau", "au/eau",
      "eu", "eu",
      "oi", "oi",
      "ai", "ai",
      "an/en", "an/en",
      "in/ain", "in/ain",
      "on", "on",
      "un",
    ],
  },
  consonne: {
    label: "Consonant", labelFr: "Consonne",
    color: "#FFBF69",
    bg: "#1a1004",
    tiles: [
      "b", "c", "d", "d", "f", "g", "h", "j",
      "l", "l", "m", "m", "n", "n", "p", "p",
      "r", "r", "s", "s", "t", "t", "v", "x", "z",
    ],
  },
  digraphe: {
    label: "Digraph", labelFr: "Digraphe",
    color: "#2EC4B6",
    bg: "#041514",
    tiles: ["ch", "ch", "ph", "gn", "qu", "qu", "gu", "ss"],
  },
  accentuee: {
    label: "Accented", labelFr: "Accentuée",
    color: "#C77DFF",
    bg: "#120a1a",
    tiles: ["é", "é", "é", "è", "è", "ê", "à", "â", "î", "ô", "û", "ç"],
  },
  groupe: {
    label: "Cluster", labelFr: "Groupe",
    color: "#9EF01A",
    bg: "#0d1400",
    tiles: ["bl", "br", "cl", "cr", "fl", "fr", "gl", "gr", "pl", "pr", "tr", "tr", "dr", "st", "sp"],
  },
};

// Concatenate tile text to form the written word
export function getFrenchTileText(tile: FrenchTile): string {
  if (tile.variants) return tile.variants[tile.activeVariant];
  return tile.text.replace(/^-/, '');
}

export function buildFrenchWord(tiles: FrenchTile[]): string {
  return tiles.map(getFrenchTileText).join('');
}

// Parse a raw text entry into a FrenchTile
export function parseFrenchTile(text: string, cat: FrenchTileCategoryKey, id: number): FrenchTile {
  if (text.includes('/')) {
    const variants = text.split('/');
    return { id, text, display: text, variants, activeVariant: 0, category: cat };
  }
  return { id, text, display: text, variants: null, activeVariant: 0, category: cat };
}

// Build the full shuffled deck
export function buildFrenchDeck(): FrenchTile[] {
  const deck: FrenchTile[] = [];
  let id = 0;
  Object.entries(FRENCH_TILE_CATEGORIES).forEach(([cat, data]) => {
    data.tiles.forEach(text => {
      deck.push(parseFrenchTile(text, cat as FrenchTileCategoryKey, id++));
    });
  });
  return deck;
}

let _frenchTileId = 50000;
export function freshFrenchTileId(): number { return _frenchTileId++; }

// Category colour lookup
export function getFrenchCategoryColor(cat: FrenchTileCategoryKey): string {
  return FRENCH_TILE_CATEGORIES[cat]?.color ?? '#ffffff';
}
export function getFrenchCategoryBg(cat: FrenchTileCategoryKey): string {
  return FRENCH_TILE_CATEGORIES[cat]?.bg ?? '#111';
}
export function getFrenchCategoryLabel(cat: FrenchTileCategoryKey): string {
  return FRENCH_TILE_CATEGORIES[cat]?.labelFr ?? '';
}

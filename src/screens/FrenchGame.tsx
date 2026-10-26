import { useState, useEffect, useRef, useCallback } from 'react';
import { useWindowSize } from '../hooks/useWindowSize';
import {
  FRENCH_TILE_CATEGORIES, buildFrenchDeck, buildFrenchWord,
  getFrenchCategoryColor, getFrenchCategoryBg, getFrenchCategoryLabel,
  parseFrenchTile, freshFrenchTileId,
} from '../data/frenchTiles';
import type { FrenchTile, FrenchTileCategoryKey } from '../data/frenchTiles';
import { checkFrenchWord } from '../data/frenchWords';
import { CheerBurst } from '../components/CheerBurst';
import { AudioEngine } from '../audio/AudioEngine';

// ─── TTS ─────────────────────────────────────────────────────────────────────
let _frVoice: SpeechSynthesisVoice | null = null;
function getFrVoice(): SpeechSynthesisVoice | null {
  if (_frVoice) return _frVoice;
  if (!('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  _frVoice = voices.find(v => v.lang.startsWith('fr')) ?? null;
  return _frVoice;
}
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.addEventListener('voiceschanged', () => { _frVoice = null; getFrVoice(); });
}

function speakFr(text: string, rate = 0.85) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = 'fr-FR';
  const v = getFrVoice();
  if (v) utt.voice = v;
  utt.rate = rate;
  window.speechSynthesis.speak(utt);
}

// ─── TILE COMPONENT ───────────────────────────────────────────────────────────
function FrTile({
  tile, selected, onClick, onCycleVariant, disabled = false, size = 'normal',
}: {
  tile: FrenchTile;
  selected?: boolean;
  onClick: () => void;
  onCycleVariant?: (e: React.MouseEvent) => void;
  disabled?: boolean;
  size?: 'normal' | 'small';
}) {
  const color = getFrenchCategoryColor(tile.category);
  const bg    = getFrenchCategoryBg(tile.category);
  const label = getFrenchCategoryLabel(tile.category);
  const [hover, setHover] = useState(false);
  const isSmall = size === 'small';
  const w = isSmall ? 48 : 62;
  const h = isSmall ? 56 : 72;
  const fs = isSmall ? 14 : 18;

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={onClick}
        disabled={disabled}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          width: w, height: h, borderRadius: 10,
          background: selected
            ? `linear-gradient(145deg, ${color}55, ${color}22)`
            : hover
            ? `linear-gradient(145deg, ${bg}, ${color}18)`
            : `linear-gradient(145deg, ${bg}, #0d0d14)`,
          border: `${selected ? 2 : 1.5}px solid ${selected ? color : color + '66'}`,
          color: selected ? color : color + 'cc',
          cursor: disabled ? 'default' : 'pointer',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
          boxShadow: selected
            ? `0 0 16px ${color}55, 0 4px 12px #00000066`
            : hover ? `0 4px 12px ${color}22` : '0 2px 6px #00000044',
          transition: 'all 0.15s ease',
          transform: selected ? 'translateY(-4px) scale(1.05)' : hover ? 'translateY(-2px)' : 'none',
          outline: 'none',
          padding: 0,
        }}
      >
        <div style={{ fontSize: fs, fontWeight: 800, fontFamily: "'Noto Serif SC', serif", letterSpacing: '-0.02em' }}>
          {tile.variants ? tile.variants[tile.activeVariant] : tile.text.replace(/^-/, '')}
        </div>
        <div style={{ fontSize: 7, opacity: 0.5, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          {label}
        </div>
      </button>
      {/* Variant cycle badge */}
      {tile.variants && onCycleVariant && (
        <button
          onClick={onCycleVariant}
          title="Changer la variante"
          style={{
            position: 'absolute', top: -5, right: -5,
            width: 16, height: 16, borderRadius: '50%',
            background: color, border: 'none',
            color: '#000', fontSize: 8, fontWeight: 900,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 2,
          }}
        >⇄</button>
      )}
    </div>
  );
}

// ─── SCORE VALUE ─────────────────────────────────────────────────────────────
function tileScore(cat: FrenchTileCategoryKey): number {
  switch (cat) {
    case 'digraphe':     return 4;
    case 'groupe':       return 3;
    case 'son_vocalique':return 3;
    case 'accentuee':    return 2;
    default:             return 1;
  }
}

// ─── MAIN GAME ────────────────────────────────────────────────────────────────
type ScoredWord = { word: string; pts: number; tiles: FrenchTile[] };
type Props = { onBack: () => void };

const HAND_SIZE = 8;

export function FrenchGame({ onBack }: Props) {
  const vw       = useWindowSize();
  const isMobile = vw < 640;

  const deckRef     = useRef<FrenchTile[]>([]);
  const deckIdxRef  = useRef(0);
  const [hand,     setHand]     = useState<FrenchTile[]>([]);
  const [selected, setSelected] = useState<FrenchTile[]>([]);
  const [scored,   setScored]   = useState<ScoredWord[]>([]);
  const [score,    setScore]    = useState(0);
  const [message,  setMessage]  = useState<{ text: string; type: 'ok' | 'err' | '' }>({ text: '', type: '' });
  const [shake,    setShake]    = useState(false);
  const [cheerKey, setCheerKey] = useState(0);
  const msgRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fisher-Yates
  function shuffle<T>(a: T[]): T[] {
    const b = [...a];
    for (let i = b.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [b[i], b[j]] = [b[j], b[i]];
    }
    return b;
  }

  function drawTiles(count: number): FrenchTile[] {
    const result: FrenchTile[] = [];
    while (result.length < count) {
      if (deckIdxRef.current >= deckRef.current.length) {
        deckRef.current = shuffle(buildFrenchDeck());
        deckIdxRef.current = 0;
      }
      const t = deckRef.current[deckIdxRef.current++];
      result.push({ ...t, id: freshFrenchTileId() });
    }
    return result;
  }

  // Init
  useEffect(() => {
    deckRef.current = shuffle(buildFrenchDeck());
    deckIdxRef.current = 0;
    setHand(drawTiles(HAND_SIZE));
    AudioEngine.startMusic();
    return () => AudioEngine.stopMusic();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showMsg = useCallback((text: string, type: 'ok' | 'err') => {
    if (msgRef.current) clearTimeout(msgRef.current);
    setMessage({ text, type });
    msgRef.current = setTimeout(() => setMessage({ text: '', type: '' }), 2500);
  }, []);

  // Toggle tile selection
  function toggleTile(tile: FrenchTile) {
    AudioEngine.play('tileClick');
    speakFr(tile.variants ? tile.variants[tile.activeVariant] : tile.text.replace(/^-/, ''));
    setSelected(prev => {
      const idx = prev.findIndex(t => t.id === tile.id);
      return idx !== -1 ? prev.filter((_, i) => i !== idx) : [...prev, tile];
    });
  }

  // Cycle variant on a hand tile (doesn't affect selection order)
  function cycleVariant(tile: FrenchTile) {
    setHand(prev => prev.map(t =>
      t.id === tile.id && t.variants
        ? { ...t, activeVariant: (t.activeVariant + 1) % t.variants.length }
        : t
    ));
    setSelected(prev => prev.map(t =>
      t.id === tile.id && t.variants
        ? { ...t, activeVariant: (t.activeVariant + 1) % t.variants.length }
        : t
    ));
  }

  // Submit word
  function submitWord() {
    if (selected.length < 1) return;
    const word = buildFrenchWord(selected);
    if (!checkFrenchWord(word)) {
      AudioEngine.play('wordWrong');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      showMsg(`"${word}" n'est pas un mot valide`, 'err');
      return;
    }
    const pts = selected.reduce((sum, t) => sum + tileScore(t.category), 0) * selected.length;
    const newScored: ScoredWord = { word, pts, tiles: [...selected] };
    setScored(prev => [newScored, ...prev]);
    setScore(s => s + pts);
    setCheerKey(k => k + 1);
    AudioEngine.play('wordCorrect');
    speakFr(word, 0.8);
    showMsg(`+${pts} pts · ${word.toUpperCase()}`, 'ok');

    // Remove used tiles, refill
    const usedIds = new Set(selected.map(t => t.id));
    const remaining = hand.filter(t => !usedIds.has(t.id));
    const refill = drawTiles(HAND_SIZE - remaining.length);
    setHand([...remaining, ...refill]);
    setSelected([]);
  }

  // Clear selection
  function clearSelection() {
    setSelected([]);
  }

  // New hand (discard all, draw 8 fresh)
  function newHand() {
    AudioEngine.play('roundEnd');
    setSelected([]);
    setHand(drawTiles(HAND_SIZE));
  }

  const wordPreview = buildFrenchWord(selected);
  const previewPts  = selected.reduce((sum, t) => sum + tileScore(t.category), 0) * selected.length;

  // ── Colors ──────────────────────────────────────────────────────────────────
  const C = {
    bg:       '#0d0d14',
    header:   '#E84855',       // French red
    blue:     '#0055A4',       // French blue (tricolor)
    gold:     '#f0c060',
    ok:       '#9EF01A',
    err:      '#E84855',
    subtext:  '#ffffff44',
    border:   '#ffffff0d',
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: C.bg,
      backgroundImage: `
        radial-gradient(ellipse at 20% 30%, #0055A422 0%, transparent 50%),
        radial-gradient(ellipse at 80% 70%, #E8485514 0%, transparent 50%)
      `,
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      color: '#e0e0f0',
      overflow: 'hidden',
    }}>
      <style>{`
        @keyframes frShake {
          0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)}
          40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)}
        }
        @keyframes frFadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
        @keyframes frPop { 0%{transform:scale(0.8);opacity:0} 60%{transform:scale(1.06)} 100%{transform:scale(1);opacity:1} }
        @keyframes frSlide { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:none} }
      `}</style>

      {cheerKey > 0 && <CheerBurst key={cheerKey} />}

      {/* ── Tricolor stripe ── */}
      <div style={{ height: 4, display: 'flex', flexShrink: 0 }}>
        <div style={{ flex: 1, background: '#0055A4' }} />
        <div style={{ flex: 1, background: '#FFFFFF' }} />
        <div style={{ flex: 1, background: '#EF4135' }} />
      </div>

      {/* ── Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 20px',
        borderBottom: `1px solid ${C.border}`,
        background: '#0d0d14f0',
        flexShrink: 0,
      }}>
        <button
          onClick={onBack}
          style={{
            background: '#ffffff0d', border: '1px solid #ffffff15',
            color: '#ffffff88', borderRadius: 8, padding: '6px 14px',
            cursor: 'pointer', fontSize: 13, fontFamily: 'inherit',
          }}
        >← Retour</button>

        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: "'Noto Serif SC', serif", fontSize: 18, fontWeight: 900,
            color: C.header, letterSpacing: '0.04em',
          }}>
            🇫🇷 Français
          </div>
          <div style={{ fontSize: 9, color: C.subtext, letterSpacing: '0.14em' }}>
            CONSTRUISEZ DES MOTS
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: C.gold }}>{score}</div>
          <div style={{ fontSize: 9, color: C.subtext }}>POINTS</div>
        </div>
      </div>

      {/* ── Main area ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto', padding: '16px' }}>

        {/* ── Word preview ── */}
        <div style={{
          minHeight: 88,
          background: '#ffffff06',
          border: `1px solid ${C.border}`,
          borderRadius: 14,
          marginBottom: 12,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '10px 16px', gap: 6,
          animation: shake ? 'frShake 0.5s ease' : 'none',
        }}>
          {selected.length === 0 ? (
            <div style={{ color: C.subtext, fontSize: 13, letterSpacing: '0.1em' }}>
              Sélectionnez des tuiles…
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
                {selected.map((t, i) => (
                  <FrTile key={`${t.id}-${i}`} tile={t} selected size="small"
                    onClick={() => toggleTile(t)} />
                ))}
              </div>
              <div style={{
                fontFamily: "'Noto Serif SC', serif",
                fontSize: 22, fontWeight: 900,
                color: '#e0e0f0', letterSpacing: '0.08em',
              }}>
                {wordPreview}
              </div>
              {previewPts > 0 && (
                <div style={{ fontSize: 11, color: C.gold }}>{previewPts} pts</div>
              )}
            </>
          )}
        </div>

        {/* ── Message banner ── */}
        {message.text && (
          <div style={{
            textAlign: 'center', padding: '8px 16px', borderRadius: 10, marginBottom: 10,
            background: message.type === 'ok' ? '#9EF01A18' : '#E8485518',
            border: `1px solid ${message.type === 'ok' ? '#9EF01A44' : '#E8485544'}`,
            color: message.type === 'ok' ? C.ok : C.err,
            fontSize: 13, fontWeight: 700, letterSpacing: '0.06em',
            animation: 'frFadeIn 0.2s ease',
          }}>
            {message.text}
          </div>
        )}

        {/* ── Action buttons ── */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
          <button
            onClick={submitWord}
            disabled={selected.length === 0}
            style={{
              flex: 2, padding: '12px 10px', borderRadius: 12,
              background: selected.length > 0
                ? 'linear-gradient(135deg, #0055A433, #0055A418)'
                : '#ffffff0a',
              border: `1.5px solid ${selected.length > 0 ? '#0055A499' : '#ffffff11'}`,
              color: selected.length > 0 ? '#6699ff' : '#ffffff22',
              fontSize: 14, fontWeight: 800, cursor: selected.length > 0 ? 'pointer' : 'default',
              letterSpacing: '0.08em', fontFamily: 'inherit',
              transition: 'all 0.15s',
            }}
          >✓ Valider</button>
          <button
            onClick={clearSelection}
            disabled={selected.length === 0}
            style={{
              flex: 1, padding: '12px 10px', borderRadius: 12,
              background: '#ffffff06',
              border: '1px solid #ffffff15',
              color: selected.length > 0 ? '#ffffff66' : '#ffffff22',
              fontSize: 13, fontWeight: 700, cursor: selected.length > 0 ? 'pointer' : 'default',
              letterSpacing: '0.06em', fontFamily: 'inherit',
            }}
          >✕ Effacer</button>
          <button
            onClick={newHand}
            style={{
              flex: 1, padding: '12px 10px', borderRadius: 12,
              background: 'linear-gradient(135deg, #E8485518, #E8485508)',
              border: '1px solid #E8485544',
              color: '#ff8080', fontSize: 12, fontWeight: 700,
              cursor: 'pointer', letterSpacing: '0.06em', fontFamily: 'inherit',
            }}
          >↺ Nouvelle main</button>
        </div>

        {/* ── Hand ── */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: isMobile ? 8 : 10,
          justifyContent: 'center', marginBottom: 16,
        }}>
          {hand.map(tile => (
            <FrTile
              key={tile.id}
              tile={tile}
              selected={selected.some(t => t.id === tile.id)}
              onClick={() => toggleTile(tile)}
              onCycleVariant={tile.variants
                ? (e) => { e.stopPropagation(); cycleVariant(tile); }
                : undefined
              }
            />
          ))}
        </div>

        {/* ── Category legend ── */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginBottom: 14,
        }}>
          {(Object.keys(FRENCH_TILE_CATEGORIES) as (keyof typeof FRENCH_TILE_CATEGORIES)[]).map(key => {
            const cat = FRENCH_TILE_CATEGORIES[key];
            return (
              <div key={key} style={{
                fontSize: 9, padding: '3px 8px', borderRadius: 6,
                background: `${cat.color}11`,
                border: `1px solid ${cat.color}33`,
                color: `${cat.color}bb`, letterSpacing: '0.1em',
              }}>
                {cat.labelFr.toUpperCase()}
              </div>
            );
          })}
        </div>

        {/* ── Scored words ── */}
        {scored.length > 0 && (
          <div style={{
            background: '#ffffff04', border: `1px solid ${C.border}`,
            borderRadius: 12, padding: '12px 14px',
          }}>
            <div style={{ fontSize: 9, color: C.subtext, letterSpacing: '0.14em', marginBottom: 8 }}>
              MOTS TROUVÉS
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {scored.map((sw, i) => (
                <button
                  key={i}
                  onClick={() => speakFr(sw.word)}
                  title={`${sw.pts} pts — cliquer pour entendre`}
                  style={{
                    padding: '4px 12px', borderRadius: 20,
                    background: '#9EF01A0d', border: '1px solid #9EF01A33',
                    color: '#9EF01A', fontSize: 13, fontWeight: 700,
                    cursor: 'pointer', fontFamily: "'Noto Serif SC', serif",
                    animation: i === 0 ? 'frPop 0.35s ease' : 'none',
                  }}
                >
                  {sw.word}
                  <span style={{ fontSize: 9, opacity: 0.6, marginLeft: 4 }}>+{sw.pts}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom tricolor stripe ── */}
      <div style={{ height: 3, display: 'flex', flexShrink: 0 }}>
        <div style={{ flex: 1, background: '#0055A4' }} />
        <div style={{ flex: 1, background: '#FFFFFF22' }} />
        <div style={{ flex: 1, background: '#EF4135' }} />
      </div>
    </div>
  );
}

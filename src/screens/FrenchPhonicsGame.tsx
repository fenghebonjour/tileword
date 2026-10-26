import { Fragment, useState, useCallback } from 'react';
import { useWindowSize } from '../hooks/useWindowSize';
import { CONSONANTS, VOWEL_ROWS, buildFrenchSyllable } from '../data/frenchPhonics';
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

function speakFr(text: string, rate = 0.8) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = 'fr-FR';
  const v = getFrVoice();
  if (v) utt.voice = v;
  utt.rate = rate;
  window.speechSynthesis.speak(utt);
}

type Props = { onBack: () => void };

const TOTAL = CONSONANTS.length * VOWEL_ROWS.length;

// Colour palette — French tricolor accent, distinct from Pinyin's gold
const C = {
  bg: '#0d0d14',
  header: '#0055A4',
  accent: '#EF4135',
  discovered: '#9EF01A',
  dimText: '#ffffff33',
  dimBg: '#11111e',
  validBg: '#181828',
  discBorder: '#9EF01A77',
  selectBorder: '#0055A499',
};

// ─── INFO PANEL ─────────────────────────────────────────────────────────────
function InfoPanel({ syllable, isNew }: { syllable: string; isNew: boolean }) {
  return (
    <div style={{
      padding: '14px 20px',
      background: '#0f0f1e',
      border: '1px solid #ffffff0d',
      borderTop: `2px solid ${isNew ? C.discovered : '#ffffff15'}`,
      display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
      transition: 'border-color 0.3s',
      minHeight: 62,
    }}>
      <div style={{ fontFamily: "'Noto Serif SC',serif", fontSize: 24, fontWeight: 900, color: C.header, letterSpacing: '0.05em', minWidth: 100 }}>
        {syllable}
      </div>
      <button
        onClick={() => speakFr(syllable)}
        style={{
          padding: '6px 16px', borderRadius: 8,
          background: '#ffffff08', border: '1px solid #ffffff18',
          color: '#ffffffaa', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
        }}
      >🔊 Écouter</button>
    </div>
  );
}

// ─── DESKTOP MATRIX ─────────────────────────────────────────────────────────
function MatrixView({ discovered, onDiscover, newlyFound, selected, onSelect }: {
  discovered: Set<string>;
  onDiscover: (s: string) => void;
  newlyFound: string | null;
  selected: string | null;
  onSelect: (s: string) => void;
}) {
  const cellW = 44, labelW = 56, headerH = 28, rowH = 22;

  function handleClick(consonant: string, vowel: string) {
    const syl = buildFrenchSyllable(consonant, vowel);
    speakFr(syl);
    onSelect(syl);
    onDiscover(syl);
  }

  return (
    <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '72vh', flex: 1 }}>
      <style>{`
        @keyframes frCellFlash {
          0%  { background: #0055A4; }
          100%{ background: #1a2a10; }
        }
      `}</style>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `${labelW}px repeat(${CONSONANTS.length}, ${cellW}px)`,
        gridAutoRows: `${rowH}px`,
        gap: 1,
        width: 'max-content',
        margin: '0 auto',
      }}>
        {/* Header row */}
        <div style={{ height: headerH, gridRow: 1, gridColumn: 1, background: C.dimBg }} />
        {CONSONANTS.map((cons, ci) => (
          <div key={cons} style={{
            height: headerH,
            gridRow: 1, gridColumn: ci + 2,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 700, color: '#ffffffaa',
            background: C.dimBg,
            borderBottom: '1px solid #ffffff22',
          }}>
            {cons}
          </div>
        ))}

        {/* Data rows: one per vowel element */}
        {VOWEL_ROWS.map((row, ri) => (
          <Fragment key={row.id}>
            {/* Row label */}
            <div key={`lbl-${row.id}`} style={{
              gridRow: ri + 2, gridColumn: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
              paddingRight: 6,
              fontSize: 10, fontWeight: 700, color: '#ffffff99',
              background: C.dimBg,
              borderRight: '1px solid #ffffff22',
            }}>
              {row.text}
            </div>

            {/* Cells */}
            {CONSONANTS.map((cons, ci) => {
              const syl = buildFrenchSyllable(cons, row.text);
              const isDisc = discovered.has(syl);
              const isNew = newlyFound === syl;
              const isSel = selected === syl;
              return (
                <button
                  key={`${cons}-${row.id}`}
                  onClick={() => handleClick(cons, row.text)}
                  title={`${cons} + ${row.text} = ${syl}`}
                  style={{
                    gridRow: ri + 2, gridColumn: ci + 2,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 9, fontWeight: 700,
                    cursor: 'pointer',
                    border: isSel ? `1px solid ${C.selectBorder}` : `1px solid #ffffff18`,
                    borderRadius: 2,
                    color: isDisc ? C.discovered : '#ffffff55',
                    background: isNew ? undefined : isDisc
                      ? '#152510'
                      : C.validBg,
                    animation: isNew ? 'frCellFlash 0.7s ease-out forwards' : undefined,
                    transition: 'background 0.15s, color 0.15s',
                    outline: 'none',
                    padding: 0,
                    fontFamily: "'Noto Serif SC', serif",
                  }}
                >
                  {syl}
                </button>
              );
            })}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

// ─── MOBILE JOURNEY ──────────────────────────────────────────────────────────
function JourneyView({ discovered, onDiscover, stageIdx, onStageChange }: {
  discovered: Set<string>;
  onDiscover: (s: string) => void;
  stageIdx: number;
  onStageChange: (i: number) => void;
}) {
  const currentRow = VOWEL_ROWS[stageIdx];
  const [popup, setPopup] = useState<string | null>(null);

  const discoveredHere = CONSONANTS.filter(cons => discovered.has(buildFrenchSyllable(cons, currentRow.text)));

  function handleTap(cons: string) {
    const syl = buildFrenchSyllable(cons, currentRow.text);
    speakFr(syl);
    setPopup(syl);
    onDiscover(syl);
    setTimeout(() => setPopup(null), 1800);
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 12px', gap: 16 }}>
      {/* Stage indicator */}
      <div style={{ fontSize: 11, color: C.dimText, letterSpacing: '0.1em' }}>
        VOYELLE {stageIdx + 1} / {VOWEL_ROWS.length}
      </div>

      {/* Progress bar */}
      <div style={{ width: '100%', maxWidth: 320, height: 4, background: '#ffffff11', borderRadius: 2 }}>
        <div style={{
          height: '100%', borderRadius: 2,
          width: `${(stageIdx / (VOWEL_ROWS.length - 1)) * 100}%`,
          background: C.header,
          transition: 'width 0.3s',
        }} />
      </div>

      {/* Big vowel tile */}
      <div style={{
        width: 80, height: 90,
        borderRadius: 12,
        background: 'linear-gradient(145deg, #0055A422, #0055A408)',
        border: `2px solid #0055A477`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 8px 32px #0055A422',
      }}>
        <div style={{ fontSize: 11, color: '#6699ffaa', letterSpacing: '0.1em', marginBottom: 4 }}>VOYELLE</div>
        <div style={{ fontFamily: "'Noto Serif SC',serif", fontSize: 28, fontWeight: 900, color: '#6699ff' }}>
          {currentRow.text}
        </div>
      </div>

      {/* Consonants grid */}
      <div style={{ fontSize: 11, color: C.dimText, letterSpacing: '0.1em' }}>TAP A CONSONANT</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', maxWidth: 320 }}>
        {CONSONANTS.map(cons => {
          const syl = buildFrenchSyllable(cons, currentRow.text);
          const isDisc = discovered.has(syl);
          return (
            <button
              key={cons}
              onClick={() => handleTap(cons)}
              style={{
                width: 58, height: 64,
                borderRadius: 10,
                background: isDisc
                  ? 'linear-gradient(145deg, #1a2a10, #0e1e08)'
                  : 'linear-gradient(145deg, #1a1a30, #11111e)',
                border: isDisc
                  ? `1.5px solid ${C.discBorder}`
                  : '1.5px solid #ffffff1a',
                color: isDisc ? C.discovered : '#ffffffbb',
                cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 2,
                fontFamily: "'Noto Serif SC', serif",
                transition: 'all 0.2s',
                outline: 'none',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 800 }}>{cons}</div>
              <div style={{ fontSize: 9, fontWeight: 600, opacity: 0.7 }}>
                {isDisc ? syl : '?'}
              </div>
            </button>
          );
        })}
      </div>

      {/* Found count */}
      <div style={{ fontSize: 12, color: '#ffffff55' }}>
        {discoveredHere.length} / {CONSONANTS.length} found
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
        <button
          onClick={() => onStageChange(Math.max(0, stageIdx - 1))}
          disabled={stageIdx === 0}
          style={{
            padding: '10px 20px', borderRadius: 10,
            background: stageIdx === 0 ? '#ffffff05' : '#1a1a30',
            border: `1px solid ${stageIdx === 0 ? '#ffffff0d' : '#ffffff22'}`,
            color: stageIdx === 0 ? '#ffffff22' : '#ffffffbb',
            fontSize: 13, cursor: stageIdx === 0 ? 'default' : 'pointer',
            fontFamily: "'Noto Serif SC', serif",
          }}
        >← Prev</button>
        <button
          onClick={() => onStageChange(Math.min(VOWEL_ROWS.length - 1, stageIdx + 1))}
          disabled={stageIdx === VOWEL_ROWS.length - 1}
          style={{
            padding: '10px 20px', borderRadius: 10,
            background: stageIdx === VOWEL_ROWS.length - 1 ? '#ffffff05' : '#1a1a30',
            border: `1px solid ${stageIdx === VOWEL_ROWS.length - 1 ? '#ffffff0d' : '#ffffff22'}`,
            color: stageIdx === VOWEL_ROWS.length - 1 ? '#ffffff22' : '#ffffffbb',
            fontSize: 13, cursor: stageIdx === VOWEL_ROWS.length - 1 ? 'default' : 'pointer',
            fontFamily: "'Noto Serif SC', serif",
          }}
        >Next →</button>
      </div>

      {/* Discovery popup */}
      {popup && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1a2a10ee, #0e1e08ee)',
            border: `2px solid ${C.discovered}`,
            borderRadius: 20, padding: '24px 40px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
            boxShadow: `0 0 60px ${C.discovered}44`,
            animation: 'frPopupIn 0.4s cubic-bezier(0.16,1,0.3,1)',
          }}>
            <div style={{ fontFamily: "'Noto Serif SC',serif", fontSize: 36, fontWeight: 900, color: C.header }}>
              {popup}
            </div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes frPopupIn {
          from { opacity: 0; transform: scale(0.7); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export function FrenchPhonicsGame({ onBack }: Props) {
  const vw = useWindowSize();
  const isMobile = vw < 640;

  const [discovered, setDiscovered] = useState(() => new Set<string>());
  const [cheerKey, setCheerKey] = useState(0);
  const [newlyFound, setNewlyFound] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [stageIdx, setStageIdx] = useState(0);

  const handleDiscover = useCallback((syllable: string) => {
    if (!discovered.has(syllable)) {
      setDiscovered(prev => { const n = new Set(prev); n.add(syllable); return n; });
      setNewlyFound(syllable);
      setCheerKey(k => k + 1);
      AudioEngine.play('wordScore');
      setTimeout(() => setNewlyFound(null), 700);
    }
    setSelected(syllable);
  }, [discovered]);

  const progressPct = Math.round((discovered.size / TOTAL) * 100);

  return (
    <div style={{
      minHeight: '100vh',
      background: C.bg,
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      overflow: 'hidden',
    }}>
      {/* Cheer overlay */}
      {cheerKey > 0 && <CheerBurst key={cheerKey} />}

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 20px',
        borderBottom: '1px solid #ffffff0d',
        background: '#0d0d14f0',
        position: 'sticky', top: 0, zIndex: 100,
        flexShrink: 0,
      }}>
        <button
          onClick={onBack}
          style={{
            background: '#ffffff0d', border: '1px solid #ffffff15',
            color: '#ffffff88', borderRadius: 8, padding: '6px 14px',
            cursor: 'pointer', fontSize: 13,
          }}
        >← Back</button>

        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: "'Noto Serif SC',serif", fontSize: 18, fontWeight: 900,
            color: '#6699ff', letterSpacing: '0.04em',
          }}>
            Fr Phonics
          </div>
          <div style={{ fontSize: 9, color: '#ffffff33', letterSpacing: '0.14em' }}>
            CONSONANT × VOYELLE → SYLLABE
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.discovered }}>
            {discovered.size} / {TOTAL}
          </div>
          <div style={{ fontSize: 9, color: '#ffffff33' }}>{progressPct}% discovered</div>
        </div>
      </div>

      {/* Game content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {isMobile ? (
          <JourneyView
            discovered={discovered}
            onDiscover={handleDiscover}
            stageIdx={stageIdx}
            onStageChange={setStageIdx}
          />
        ) : (
          <div style={{ flex: 1, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 0, overflow: 'hidden' }}>
            <div style={{ fontSize: 10, color: '#ffffff33', marginBottom: 6, letterSpacing: '0.12em' }}>
              CLICK ANY CELL TO BLEND · ROWS = VOYELLES · COLUMNS = CONSONANTS
            </div>
            <MatrixView
              discovered={discovered}
              onDiscover={handleDiscover}
              newlyFound={newlyFound}
              selected={selected}
              onSelect={setSelected}
            />
          </div>
        )}
      </div>

      {/* Info panel — desktop only */}
      {!isMobile && selected && (
        <InfoPanel syllable={selected} isNew={newlyFound === selected} />
      )}
    </div>
  );
}

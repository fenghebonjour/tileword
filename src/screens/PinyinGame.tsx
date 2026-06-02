import { useState, useCallback } from 'react';
import { useWindowSize } from '../hooks/useWindowSize';
import { INITIALS, FINALS_JOURNEY, getPinyin, SYLLABLE_CHARS, VALID_SYLLABLES } from '../data/pinyin';
import { CheerBurst } from '../components/CheerBurst';
import { AudioEngine } from '../audio/AudioEngine';

// Cache a zh-CN voice as soon as the browser loads voices
let _zhVoice: SpeechSynthesisVoice | null = null;
function getZhVoice(): SpeechSynthesisVoice | null {
  if (_zhVoice) return _zhVoice;
  if (!('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  _zhVoice = voices.find(v => v.lang.startsWith('zh')) ?? null;
  return _zhVoice;
}
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.addEventListener('voiceschanged', () => {
    _zhVoice = null; // reset so next call re-queries
    getZhVoice();
  });
}

// Initials demoed using the standard Chinese phonics syllable names:
// b/p/m/f → -o vowel (bō pō mō fó), d/t/n/l → -e vowel (dé tè ne lè),
// g/k/h → -e vowel, j/q/x/zh/ch/sh/r/z/c/s → -i vowel.
// This gives the "-or/-er" neutral-vowel sound that makes the consonant clear.
const INITIAL_DEMO: Record<string, string> = {
  b:'波', p:'坡', m:'摸', f:'佛', d:'得', t:'特', n:'呢', l:'勒',
  g:'哥', k:'科', h:'喝', j:'机', q:'期', x:'稀',
  zh:'知', ch:'吃', sh:'诗', r:'日', z:'滋', c:'词', s:'思',
};

// 1st-tone (level tone) hanzi for every pinyin syllable.
// Used for TTS demos so learners always hear the clean base form.
const TONE1_CHARS: Record<string, string> = {
  // ∅-initial finals
  a:'阿', ai:'哀', ao:'凹', an:'安', ang:'肮',
  e:'鹅', ei:'欸', en:'恩', o:'噢', ou:'鸥',
  yi:'衣', ya:'鸦', yao:'腰', ye:'耶', you:'优',
  yan:'烟', yin:'音', yang:'央', ying:'英', yong:'拥',
  wu:'乌', wa:'挖', wo:'窝', wai:'歪', wei:'威',
  wan:'弯', wen:'温', wang:'汪',
  yu:'迂', yue:'约', yuan:'冤', yun:'晕',
  // b
  ba:'巴', bai:'掰', bao:'褒', ban:'班', bang:'帮',
  bei:'杯', ben:'奔', beng:'崩', bi:'逼', bie:'憋',
  biao:'标', bian:'边', bin:'宾', bing:'冰', bo:'波',
  // p
  pa:'趴', pai:'拍', pao:'抛', pan:'攀',
  pei:'呸', peng:'嘭', pi:'批', pie:'撇',
  piao:'飘', pian:'偏', pin:'拼', ping:'乒', po:'泼',
  // m
  ma:'妈', mao:'猫',
  mi:'咪', miao:'喵', mo:'摸',
  // f
  fa:'发', fang:'方', fei:'飞', fen:'分', feng:'风', fu:'夫',
  // d
  da:'搭', dao:'刀', dan:'丹', dang:'当',
  de:'得', deng:'灯', di:'低', die:'爹', diao:'凋',
  dian:'颠', ding:'叮', dong:'冬', dou:'兜', du:'督',
  duan:'端', dui:'堆', dun:'蹲', duo:'多',
  // t
  ta:'他', tao:'掏', tan:'贪', tang:'汤',
  ti:'梯', tie:'贴', tiao:'挑', tian:'天',
  ting:'听', tong:'通', tou:'偷', tu:'秃', tuan:'湍',
  tui:'推', tun:'吞', tuo:'拖',
  // n
  ni:'妮', ning:'柠', nu:'奴',
  // l
  la:'拉', liao:'撩', liu:'溜',
  // g
  gai:'该', gao:'高', gan:'干', gang:'刚',
  ge:'搁', geng:'更', gong:'工', gou:'沟', gu:'孤',
  gua:'瓜', guai:'乖', guan:'关', guang:'光',
  gui:'归', guo:'锅',
  // k
  kai:'开', kan:'刊', ke:'科', keng:'坑', kong:'空', ku:'哭',
  kua:'夸', kuan:'宽', kuang:'框', kun:'坤',
  // h
  ha:'哈', hai:'嗨', han:'憨', hang:'夯',
  he:'喝', heng:'哼', hong:'轰', hu:'呼',
  hua:'花', huan:'欢', huang:'荒', hui:'挥', hun:'婚',
  // j
  ji:'机', jia:'加', jiao:'浇', jiu:'究',
  jian:'尖', jin:'今', jiang:'江', jing:'京',
  ju:'拘', juan:'捐', jun:'军', jue:'撅',
  // q
  qi:'期', qia:'掐', qiao:'敲', qiu:'秋',
  qian:'千', qin:'钦', qiang:'枪', qing:'清', qu:'区',
  quan:'圈', que:'缺',
  // x
  xi:'稀', xia:'虾', xiao:'消', xiu:'休',
  xian:'先', xin:'心', xiang:'香', xing:'星', xiong:'凶',
  xu:'需', xuan:'宣', xue:'削',
  // zh
  zha:'扎', zhao:'招', zhan:'沾', zhang:'章',
  zhe:'遮', zhen:'针', zheng:'征', zhi:'知', zhong:'中',
  zhou:'州', zhu:'朱', zhuan:'专', zhuang:'装',
  zhui:'锥', zhuo:'捉',
  // ch
  cha:'插', chao:'抄', chan:'搀', chang:'昌',
  che:'车', cheng:'撑', chi:'吃', chong:'冲',
  chou:'抽', chu:'出', chuan:'穿', chuang:'窗',
  chui:'吹', chun:'春', chuo:'戳',
  // sh
  sha:'沙', shao:'梢', shan:'山', shang:'商',
  she:'奢', shen:'深', sheng:'声', shi:'诗', shou:'收',
  shu:'书', shuan:'拴', shuang:'双', shuo:'说',
  // z
  zai:'灾', zeng:'增', zi:'滋', zong:'宗', zuan:'钻', zun:'尊',
  // c
  ca:'擦', can:'参', cang:'仓', cong:'聪', cun:'村', cuo:'搓',
  // s
  sai:'腮', san:'三', sang:'桑', si:'思', song:'松',
  sou:'搜', su:'苏', suan:'酸', suo:'梭',
};

// Speak initial → final → combined syllable using Chinese characters for correct zh-CN pronunciation
function speakPinyinSequence(init: string, fin: string, syllable: string) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const voice = getZhVoice();
  const say = (text: string) => {
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = 'zh-CN';
    if (voice) utt.voice = voice;
    utt.rate = 0.75;
    window.speechSynthesis.speak(utt);
  };

  if (init !== '∅') {
    const initChar = INITIAL_DEMO[init];
    if (initChar) say(initChar);
    // Final via its standalone (∅) form, always 1st tone
    const zeroSyl = getPinyin('∅', fin);
    const finalChar = zeroSyl ? (TONE1_CHARS[zeroSyl] ?? SYLLABLE_CHARS[zeroSyl]?.[0]) : null;
    if (finalChar) say(finalChar);
  }
  // Full syllable — prefer 1st-tone hanzi, fall back to SYLLABLE_CHARS, then raw pinyin
  const sylChar = TONE1_CHARS[syllable] ?? SYLLABLE_CHARS[syllable]?.[0];
  say(sylChar ?? syllable);
}

type Props = { onBack: () => void };

const TOTAL = VALID_SYLLABLES.size;

// Colour palette for the pinyin game (warm red/gold, Chinese aesthetic)
const C = {
  bg: '#0d0d14',
  header: '#f0c060',
  accent: '#E84855',
  teal: '#2EC4B6',
  discovered: '#9EF01A',
  dimText: '#ffffff33',
  dimBg: '#11111e',
  validBg: '#181828',
  discBg: 'linear-gradient(135deg, #1a2a10, #0e1e08)',
  discBorder: '#9EF01A77',
  selectBorder: '#f0c06099',
};

// ─── INFO PANEL ─────────────────────────────────────────────────────────────
function InfoPanel({ syllable, isNew }: { syllable: string; isNew: boolean }) {
  const chars = SYLLABLE_CHARS[syllable] ?? [];
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
      <div style={{ fontFamily: "'Noto Serif SC',serif", fontSize: 24, fontWeight: 900, color: C.header, letterSpacing: '0.05em', minWidth: 72 }}>
        {syllable}
      </div>
      <div style={{ width: 1, height: 36, background: '#ffffff15' }} />
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', flex: 1 }}>
        {chars.length > 0 ? chars.map((ch, i) => (
          <div key={i} style={{
            fontFamily: "'Noto Serif SC',serif",
            fontSize: 26, fontWeight: 900,
            color: '#e0e0f0',
            padding: '4px 12px',
            background: '#ffffff08',
            border: '1px solid #ffffff11',
            borderRadius: 8,
            lineHeight: 1.2,
          }}>{ch}</div>
        )) : (
          <div style={{ color: C.dimText, fontSize: 13 }}>Rare syllable — no common characters</div>
        )}
      </div>
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
  const cellW = 40, labelW = 48, headerH = 28, rowH = 22;

  function handleClick(init: string, fin: string) {
    const syl = getPinyin(init, fin);
    if (!syl) return;
    speakPinyinSequence(init, fin, syl);
    onSelect(syl);
    onDiscover(syl);
  }

  return (
    <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '72vh', flex: 1 }}>
      <style>{`
        @keyframes cellFlash {
          0%  { background: #f0c060; }
          100%{ background: #1a2a10; }
        }
      `}</style>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `${labelW}px repeat(${INITIALS.length}, ${cellW}px)`,
        gridAutoRows: `${rowH}px`,
        gap: 1,
        width: 'max-content',
        margin: '0 auto',
      }}>
        {/* Header row */}
        <div style={{ height: headerH, gridRow: 1, gridColumn: 1, background: C.dimBg }} />
        {INITIALS.map((init, ci) => (
          <div key={init} style={{
            height: headerH,
            gridRow: 1, gridColumn: ci + 2,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 700, color: '#ffffffaa',
            background: C.dimBg,
            borderBottom: '1px solid #ffffff22',
          }}>
            {init === '∅' ? '∅' : init}
          </div>
        ))}

        {/* Data rows: one per final */}
        {FINALS_JOURNEY.map((fin, ri) => (
          <>
            {/* Row label */}
            <div key={`lbl-${fin}`} style={{
              gridRow: ri + 2, gridColumn: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
              paddingRight: 6,
              fontSize: 10, fontWeight: 700, color: '#ffffff99',
              background: C.dimBg,
              borderRight: '1px solid #ffffff22',
            }}>
              {fin}
            </div>

            {/* Cells */}
            {INITIALS.map((init, ci) => {
              const syl = getPinyin(init, fin);
              if (!syl) {
                return (
                  <div key={`${init}-${fin}`} style={{
                    gridRow: ri + 2, gridColumn: ci + 2,
                    background: '#0b0b16',
                  }} />
                );
              }
              const isDisc = discovered.has(syl);
              const isNew = newlyFound === syl;
              const isSel = selected === syl;
              return (
                <button
                  key={`${init}-${fin}`}
                  onClick={() => handleClick(init, fin)}
                  title={`${init} + ${fin} = ${syl}`}
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
                    animation: isNew ? 'cellFlash 0.7s ease-out forwards' : undefined,
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
          </>
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
  const currentFinal = FINALS_JOURNEY[stageIdx];
  const [popup, setPopup] = useState<string | null>(null);

  // Which initials are valid + discovered for this final
  const validInitials = INITIALS.filter(init => getPinyin(init, currentFinal) !== null);
  const discoveredHere = validInitials.filter(init => {
    const syl = getPinyin(init, currentFinal);
    return syl && discovered.has(syl);
  });

  function handleTap(init: string) {
    const syl = getPinyin(init, currentFinal);
    if (!syl) return;
    speakPinyinSequence(init, currentFinal, syl);
    setPopup(syl);
    onDiscover(syl);
    setTimeout(() => setPopup(null), 1800);
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 12px', gap: 16 }}>
      {/* Stage indicator */}
      <div style={{ fontSize: 11, color: C.dimText, letterSpacing: '0.1em' }}>
        FINAL {stageIdx + 1} / {FINALS_JOURNEY.length}
      </div>

      {/* Progress bar */}
      <div style={{ width: '100%', maxWidth: 320, height: 4, background: '#ffffff11', borderRadius: 2 }}>
        <div style={{
          height: '100%', borderRadius: 2,
          width: `${(stageIdx / (FINALS_JOURNEY.length - 1)) * 100}%`,
          background: C.header,
          transition: 'width 0.3s',
        }} />
      </div>

      {/* Big final tile */}
      <div style={{
        width: 80, height: 90,
        borderRadius: 12,
        background: 'linear-gradient(145deg, #E8485522, #E8485508)',
        border: `2px solid #E8485577`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 8px 32px #E8485522',
      }}>
        <div style={{ fontSize: 11, color: '#E84855aa', letterSpacing: '0.1em', marginBottom: 4 }}>FINAL</div>
        <div style={{ fontFamily: "'Noto Serif SC',serif", fontSize: 28, fontWeight: 900, color: '#E84855' }}>
          {currentFinal}
        </div>
      </div>

      {/* Initials grid */}
      <div style={{ fontSize: 11, color: C.dimText, letterSpacing: '0.1em' }}>TAP AN INITIAL</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', maxWidth: 320 }}>
        {INITIALS.map(init => {
          const syl = getPinyin(init, currentFinal);
          const isValid = syl !== null;
          const isDisc = syl ? discovered.has(syl) : false;
          return (
            <button
              key={init}
              onClick={() => isValid && handleTap(init)}
              disabled={!isValid}
              style={{
                width: 58, height: 64,
                borderRadius: 10,
                background: isDisc
                  ? 'linear-gradient(145deg, #1a2a10, #0e1e08)'
                  : isValid
                    ? 'linear-gradient(145deg, #1a1a30, #11111e)'
                    : 'transparent',
                border: isDisc
                  ? `1.5px solid ${C.discBorder}`
                  : isValid
                    ? '1.5px solid #ffffff1a'
                    : '1px dashed #ffffff08',
                color: isDisc ? C.discovered : isValid ? '#ffffffbb' : '#ffffff15',
                cursor: isValid ? 'pointer' : 'default',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 2,
                fontFamily: "'Noto Serif SC', serif",
                transition: 'all 0.2s',
                outline: 'none',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 800 }}>{init}</div>
              {isValid && (
                <div style={{ fontSize: 9, fontWeight: 600, opacity: 0.7 }}>
                  {isDisc ? syl : '?'}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Found count */}
      <div style={{ fontSize: 12, color: '#ffffff55' }}>
        {discoveredHere.length} / {validInitials.length} found
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
          onClick={() => onStageChange(Math.min(FINALS_JOURNEY.length - 1, stageIdx + 1))}
          disabled={stageIdx === FINALS_JOURNEY.length - 1}
          style={{
            padding: '10px 20px', borderRadius: 10,
            background: stageIdx === FINALS_JOURNEY.length - 1 ? '#ffffff05' : '#1a1a30',
            border: `1px solid ${stageIdx === FINALS_JOURNEY.length - 1 ? '#ffffff0d' : '#ffffff22'}`,
            color: stageIdx === FINALS_JOURNEY.length - 1 ? '#ffffff22' : '#ffffffbb',
            fontSize: 13, cursor: stageIdx === FINALS_JOURNEY.length - 1 ? 'default' : 'pointer',
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
            animation: 'popupIn 0.4s cubic-bezier(0.16,1,0.3,1)',
          }}>
            <div style={{ fontFamily: "'Noto Serif SC',serif", fontSize: 36, fontWeight: 900, color: C.header }}>
              {popup}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {(SYLLABLE_CHARS[popup] ?? []).map((ch, i) => (
                <div key={i} style={{ fontFamily: "'Noto Serif SC',serif", fontSize: 28, fontWeight: 900, color: '#e0e0f0' }}>{ch}</div>
              ))}
            </div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes popupIn {
          from { opacity: 0; transform: scale(0.7); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export function PinyinGame({ onBack }: Props) {
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
            color: C.header, letterSpacing: '0.04em',
          }}>
            拼 Pinyin
          </div>
          <div style={{ fontSize: 9, color: '#ffffff33', letterSpacing: '0.14em' }}>
            INITIAL × FINAL → SYLLABLE
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
            {/* Column headers sticky label */}
            <div style={{ fontSize: 10, color: '#ffffff33', marginBottom: 6, letterSpacing: '0.12em' }}>
              CLICK ANY VALID CELL TO DISCOVER · ROWS = FINALS · COLUMNS = INITIALS
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

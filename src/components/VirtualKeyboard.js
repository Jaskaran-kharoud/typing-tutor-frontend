import React, { useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import './VirtualKeyboard.css';

// ── Punjabi Inscript map: physical key → { n: normal, s: shift } ─────────────
const PA_MAP = {
  'q':{n:'ੌ',s:'ਔ'},'w':{n:'ੈ',s:'ਐ'},'e':{n:'ਾ',s:'ਆ'},'r':{n:'ੀ',s:'ਈ'},
  't':{n:'ੂ',s:'ਊ'},'y':{n:'ਬ',s:'ਭ'},'u':{n:'ਹ',s:'ਙ'},'i':{n:'ਗ',s:'ਘ'},
  'o':{n:'ਦ',s:'ਧ'},'p':{n:'ਜ',s:'ਝ'},'[':{n:'ਡ',s:'ਢ'},']':{n:'਼',s:'ਞ'},
  'a':{n:'ੋ',s:'ਓ'},'s':{n:'ੇ',s:'ਏ'},'d':{n:'੍',s:'ਅ'},'f':{n:'ਿ',s:'ਇ'},
  'g':{n:'ੁ',s:'ਉ'},'h':{n:'ਪ',s:'ਫ'},'j':{n:'ਰ',s:'ੜ'},'k':{n:'ਕ',s:'ਖ'},
  'l':{n:'ਤ',s:'ਥ'},';':{n:'ਚ',s:'ਛ'},"'":{n:'ਟ',s:'ਠ'},
  'z':{n:'ੱ',s:'ਃ'},'x':{n:'ਂ',s:'ਁ'},'c':{n:'ਮ',s:'ਣ'},'v':{n:'ਨ',s:'ੲ'},
  'b':{n:'ਵ',s:'ੳ'},'n':{n:'ਲ',s:'ਲ਼'},'m':{n:'ਸ',s:'ਸ਼'},
  '/':{n:'ਯ',s:'?'},'.':{n:'.',s:'।'},',':{n:',',s:'<'},
  '1':{n:'੧',s:'!'},'2':{n:'੨',s:'@'},'3':{n:'੩',s:'#'},
  '4':{n:'੪',s:'$'},'5':{n:'੫',s:'%'},'6':{n:'੬',s:'^'},
  '7':{n:'੭',s:'&'},'8':{n:'੮',s:'*'},'9':{n:'੯',s:'('},
  '0':{n:'੦',s:')'},'-':{n:'-',s:'_'},'=':{n:'=',s:'+'},
  '\\':{n:'\\',s:'|'},'`':{n:'`',s:'~'},
};

// Reverse lookup: gurmukhi char → { physKey, needsShift }
const PA_REVERSE = {};
Object.entries(PA_MAP).forEach(([phys, { n, s }]) => {
  if (n && n.trim()) PA_REVERSE[n] = { physKey: phys, needsShift: false };
  if (s && s.trim()) PA_REVERSE[s] = { physKey: phys, needsShift: true  };
});

// English shift map: typed char → physical key
const EN_SHIFT_MAP = {
  '!':'1','@':'2','#':'3','$':'4','%':'5','^':'6','&':'7','*':'8','(':'9',')':'0',
  '_':'-','+':'=','{':'[','}':']','|':'\\',':':';','"':"'",'<':',','>':'.','?':'/','~':'`',
};

// ── Finger map ────────────────────────────────────────────────────────────────
const FINGER_MAP = {
  '`':'lp','1':'lp','q':'lp','a':'lp','z':'lp','TAB':'lp','CAPS':'lp','SHIFT_L':'lp',
  '2':'lr','w':'lr','s':'lr','x':'lr',
  '3':'lm','e':'lm','d':'lm','c':'lm',
  '4':'li','5':'li','r':'li','t':'li','f':'li','g':'li','v':'li','b':'li',
  '6':'ri','7':'ri','y':'ri','u':'ri','h':'ri','j':'ri','n':'ri','m':'ri',
  '8':'rm','i':'rm','k':'rm',',':'rm',
  '9':'rr','o':'rr','l':'rr','.':'rr',
  '0':'rp','-':'rp','=':'rp','p':'rp','[':'rp',']':'rp','\\':'rp',
  ';':'rp',"'":'rp','/':'rp','ENTER':'rp','BACKSPACE':'rp','SHIFT_R':'rp',
  ' ':'th','SPACE':'th',
};

const FINGER_LABEL = {
  lp:'Left Pinky', lr:'Left Ring', lm:'Left Middle', li:'Left Index',
  ri:'Right Index', rm:'Right Middle', rr:'Right Ring', rp:'Right Pinky', th:'Both Thumbs',
};

const FINGER_COLOR = {
  lp:'#ef4444', lr:'#f97316', lm:'#16a34a', li:'#3b82f6',
  ri:'#ca8a04', rm:'#16a34a', rr:'#f97316', rp:'#ef4444', th:'#7c3aed',
};

const SPECIALS = {
  BACKSPACE:'⌫', TAB:'Tab', CAPS:'Caps', ENTER:'↵',
  SHIFT_L:'⇧', SHIFT_R:'⇧', SPACE:'Space',
};

const KEY_WIDTHS = {
  BACKSPACE:'key-backspace', TAB:'key-tab', CAPS:'key-capslock',
  ENTER:'key-enter', SHIFT_L:'key-shift', SHIFT_R:'key-shift', SPACE:'key-space',
};

const KB_ROWS = [
  ['`','1','2','3','4','5','6','7','8','9','0','-','=','BACKSPACE'],
  ['TAB','q','w','e','r','t','y','u','i','o','p','[',']','\\'],
  ['CAPS','a','s','d','f','g','h','j','k','l',';',"'",'ENTER'],
  ['SHIFT_L','z','x','c','v','b','n','m',',','.','/', 'SHIFT_R'],
  ['SPACE'],
];

// ── Resolve activeKey → physKey + needsShift ──────────────────────────────────
function resolveActiveKey(activeKey, language) {
  if (!activeKey) return { physKey: null, needsShift: false };

  // Space
  if (activeKey === ' ') return { physKey: 'SPACE', needsShift: false };

  // Special keys pass through directly
  if (SPECIALS[activeKey] || FINGER_MAP[activeKey]) {
    return { physKey: activeKey, needsShift: false };
  }

  if (language === 'punjabi') {
    const found = PA_REVERSE[activeKey];
    if (found) return found;
    return { physKey: activeKey, needsShift: false };
  }

  // English: uppercase letters
  if (activeKey >= 'A' && activeKey <= 'Z') {
    return { physKey: activeKey.toLowerCase(), needsShift: true };
  }
  // English: shift symbols
  if (EN_SHIFT_MAP[activeKey]) {
    return { physKey: EN_SHIFT_MAP[activeKey], needsShift: true };
  }

  return { physKey: activeKey, needsShift: false };
}

// ── Compute fingers to highlight ──────────────────────────────────────────────
function getActiveFingers(physKey, needsShift) {
  if (!physKey) return { leftFingers: [], rightFingers: [], thumbActive: false };
  if (physKey === 'SPACE' || physKey === ' ') {
    return { leftFingers: [], rightFingers: [], thumbActive: true };
  }
  const f = FINGER_MAP[physKey] || '';
  if (f === 'th') return { leftFingers: [], rightFingers: [], thumbActive: true };
  const leftSide  = ['lp','lr','lm','li'];
  const rightSide = ['rp','rr','rm','ri'];
  let leftFingers  = leftSide.includes(f)  ? [f] : [];
  let rightFingers = rightSide.includes(f) ? [f] : [];
  // Shift: use OPPOSITE hand's shift key
  // key on left hand  → right shift = right pinky (rp)
  // key on right hand → left shift  = left pinky  (lp)
  if (needsShift) {
    if (leftSide.includes(f)) {
      if (!rightFingers.includes('rp')) rightFingers = ['rp', ...rightFingers];
    } else if (rightSide.includes(f)) {
      if (!leftFingers.includes('lp')) leftFingers = ['lp', ...leftFingers];
    }
  }
  return { leftFingers, rightFingers, thumbActive: false };
}

// ── Hand SVG ──────────────────────────────────────────────────────────────────
function buildHandSVG(side, leftFingers, rightFingers, thumbActive) {
  const mir   = side === 'right';
  const rToL  = { rp:'lp', rr:'lr', rm:'lm', ri:'li' };
  const actRaw = mir ? rightFingers : leftFingers;
  const act    = actRaw.map(f => mir ? (rToL[f] || f) : f);

  const base='#d4956a', hi='#edb48a', sh='#b07248', dk='#8a5230';
  const nail='#f5d8c0', nailE='#c09070';

  const F = [
    { id:'lp', cx:13, bot:72, top:34, wb:6,   wt:4.8 },
    { id:'lr', cx:31, bot:70, top:20, wb:6.8,  wt:5.2 },
    { id:'lm', cx:50, bot:68, top:12, wb:7.2,  wt:5.5 },
    { id:'li', cx:69, bot:70, top:22, wb:6.8,  wt:5.2 },
  ];

  let inner = '';
  F.forEach(f => {
    const on = act.includes(f.id);
    const { cx, bot, top, wb, wt } = f;
    const span   = bot - top;
    const fill   = on ? FINGER_COLOR[f.id] : base;
    const stroke = on ? FINGER_COLOR[f.id] : sh;
    const sw     = on ? 2 : 0.8;

    inner += `<path d="M${cx-wb} ${bot} C${cx-wb} ${bot-span*.28} ${cx-wt} ${top+9} ${cx-wt} ${top+5} Q${cx} ${top-1} ${cx+wt} ${top+5} C${cx+wt} ${top+9} ${cx+wb} ${bot-span*.28} ${cx+wb} ${bot}Z" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
    if (!on) inner += `<path d="M${cx-wb+2} ${bot-3} C${cx-wb+1.5} ${bot-span*.2} ${cx-wt+1} ${top+12} ${cx-wt+1} ${top+7}" stroke="${hi}" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.5"/>`;

    const k1 = bot - span * .30, k2 = bot - span * .57, kw = wt * .72;
    inner += `<line x1="${cx-kw}" y1="${k1}" x2="${cx+kw}" y2="${k1}" stroke="${dk}" stroke-width=".7" opacity="${on?.2:.4}" stroke-linecap="round"/>`;
    inner += `<line x1="${cx-kw*.7}" y1="${k2}" x2="${cx+kw*.7}" y2="${k2}" stroke="${dk}" stroke-width=".6" opacity="${on?.15:.3}" stroke-linecap="round"/>`;

    const nw = wt * .86, ny = top + 3;
    inner += `<rect x="${cx-nw}" y="${ny}" width="${nw*2}" height="5" rx="2.5" fill="${on?'rgba(255,255,255,.5)':nail}" stroke="${on?'rgba(255,255,255,.8)':nailE}" stroke-width=".5"/>`;
  });

  // Thumb — very broad, very short
  const tha = thumbActive;
  const tc = tha ? FINGER_COLOR.th : base;
  const ts = tha ? FINGER_COLOR.th : sh;
  inner += `<path d="M 77 74 C 80 70 88 63 94 61 Q 98 59 99 62 Q 100 65 96 67 C 90 70 82 74 79 76 Q 77 76 77 74 Z" fill="${tc}" stroke="${ts}" stroke-width="${tha?2:.8}"/>`;
  inner += `<ellipse cx="97" cy="63" rx="4.5" ry="2.2" transform="rotate(-20 97 63)" fill="${tha?'rgba(255,255,255,.55)':nail}" stroke="${tha?'rgba(255,255,255,.85)':nailE}" stroke-width=".5"/>`;
  if (!tha) inner += `<path d="M 79 73 C 83 69 90 64 95 62" stroke="${hi}" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.4"/>`;

  const flip = mir ? `scale(-1,1) translate(-112,0)` : '';
  return `<svg width="112" height="80" viewBox="0 0 112 80"><g transform="${flip}">${inner}</g></svg>`;
}

// ── Main Component ────────────────────────────────────────────────────────────
const VirtualKeyboard = ({ activeKey, isCorrect, targetKeys = [] }) => {
  const { language } = useLanguage();
  const isPunjabi = language === 'punjabi';

  const { physKey, needsShift } = useMemo(
    () => resolveActiveKey(activeKey, language),
    [activeKey, language]
  );

  const { leftFingers, rightFingers, thumbActive } = useMemo(
    () => getActiveFingers(physKey, needsShift),
    [physKey, needsShift]
  );

  const keyFinger   = physKey ? (FINGER_MAP[physKey] || '') : '';
  const fingerLabel = keyFinger ? (FINGER_LABEL[keyFinger] || '') : '';
  const isSpace     = physKey === 'SPACE' || physKey === ' ' || activeKey === ' ';

  // Display char in banner
  const displayChar = (() => {
    if (!activeKey) return null;
    if (isSpace) return 'Space';
    if (SPECIALS[activeKey]) return SPECIALS[activeKey];
    return activeKey;
  })();

  return (
    <div className="vk-container">
      {/* ── Info Banner ── */}
      <div className="vk-banner">
        <div
          className="vk-hand"
          dangerouslySetInnerHTML={{
            __html: buildHandSVG('left', leftFingers, rightFingers, thumbActive)
          }}
        />
        <div className="vk-divider" />

        <div className="vk-cards">
          {!displayChar && <span className="vk-idle">Start typing…</span>}
          {displayChar && (
            <>
              {/* Character to type */}
              <div className="vk-card">
                <span className={`vk-card-val${isPunjabi && !isSpace ? ' punjabi' : ''}`}>
                  {displayChar}
                </span>
              </div>

              {/* Shift indicator */}
              {needsShift && (
                <div className="vk-card vk-card-shift">
                  <span className="vk-card-sm">⇧ Shift +</span>
                </div>
              )}

              {/* English key card — Punjabi non-special only */}
              {isPunjabi && !SPECIALS[physKey] && !isSpace && physKey && (
                <div className="vk-card vk-card-eng">
                  <span className="vk-card-lbl">key</span>
                  <span className="vk-card-eng-val">{physKey}</span>
                </div>
              )}

              {/* Finger */}
              {fingerLabel && (
                <div className="vk-card">
                  {needsShift ? (
                    <span className="vk-card-sm">
                      {['lp','lr','lm','li'].includes(keyFinger) ? 'Right Pinky' : 'Left Pinky'}<br />+ {fingerLabel}
                    </span>
                  ) : (
                    <span className="vk-card-sm">{fingerLabel}</span>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <div className="vk-divider" />
        <div
          className="vk-hand"
          dangerouslySetInnerHTML={{
            __html: buildHandSVG('right', leftFingers, rightFingers, thumbActive)
          }}
        />
      </div>

      {/* ── Keyboard ── */}
      <div className="vk-keyboard">
        {KB_ROWS.map((row, ri) => (
          <div key={ri} className="vk-row">
            {row.map((key) => {
              const finger   = FINGER_MAP[key] || '';
              const isSpec   = !!SPECIALS[key];
              const paData   = isPunjabi ? PA_MAP[key] : null;
              const isActive = physKey === key;
              const shiftIsRight = needsShift && ['lp','lr','lm','li'].includes(FINGER_MAP[physKey] || '');
              const isShiftKey = needsShift && (shiftIsRight ? key === 'SHIFT_R' : key === 'SHIFT_L');
              const isTarget = targetKeys.includes(key);

              let cls = `vk-key ${finger} ${KEY_WIDTHS[key] || ''}`;
              if (isActive)    cls += ' vk-key-active';
              if (isShiftKey)  cls += ' vk-key-shift-highlight';
              if (isTarget)    cls += ' vk-key-target';

              return (
                <div key={key} className={cls.trim()}>
                  {isSpec ? (
                    <span className="vk-key-spec">{SPECIALS[key]}</span>
                  ) : isPunjabi && paData ? (
                    <div className="vk-key-inner">
                      <div className="vk-key-top-row">
                        <span className="vk-key-shift-char">{paData.s || ''}</span>
                        <span className="vk-key-en-corner">{key}</span>
                      </div>
                      <span className="vk-key-main-char">{paData.n || key}</span>
                    </div>
                  ) : (
                    <span className="vk-key-en">{key}</span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VirtualKeyboard;

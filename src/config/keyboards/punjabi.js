// Punjabi (Gurmukhi) Inscript Keyboard Layout - Raavi Font
// Standard Indian Government Inscript layout

export const punjabiKeyboardLayout = [
  // Row 1 — Number row
  [
    { key: '`',         display: '`',  shift: '~'  },
    { key: '1',         display: '੧',  shift: '!'  },
    { key: '2',         display: '੨',  shift: '@'  },
    { key: '3',         display: '੩',  shift: '#'  },
    { key: '4',         display: '੪',  shift: '$'  },
    { key: '5',         display: '੫',  shift: '%'  },
    { key: '6',         display: '੬',  shift: '^'  },
    { key: '7',         display: '੭',  shift: '&'  },
    { key: '8',         display: '੮',  shift: '*'  },
    { key: '9',         display: '੯',  shift: '('  },
    { key: '0',         display: '੦',  shift: ')'  },
    { key: '-',         display: '-',  shift: '_'  },
    { key: '=',         display: '=',  shift: '+'  },
    { key: 'Backspace', display: '⌫',  wide: true  }
  ],

  // Row 2 — QWERTY row  (LEFT = matras, RIGHT = consonants)
  [
    { key: 'Tab',  display: 'Tab', wide: true },
    { key: 'q',  display: 'ੌ',  shift: 'ਔ' },   // au matra  / AU vowel
    { key: 'w',  display: 'ੈ',  shift: 'ਐ' },   // ai matra  / AI vowel
    { key: 'e',  display: 'ਾ',  shift: 'ਆ' },   // aa matra  / AA vowel
    { key: 'r',  display: 'ੀ',  shift: 'ਈ' },   // ii matra  / II vowel
    { key: 't',  display: 'ੂ',  shift: 'ਊ' },   // uu matra  / UU vowel
    { key: 'y',  display: 'ਬ',  shift: 'ਭ' },   // BA / BHA
    { key: 'u',  display: 'ਹ',  shift: 'ਙ' },   // HA / NGA
    { key: 'i',  display: 'ਗ',  shift: 'ਘ' },   // GA / GHA
    { key: 'o',  display: 'ਦ',  shift: 'ਧ' },   // DA / DHA
    { key: 'p',  display: 'ਜ',  shift: 'ਝ' },   // JA / JHA
    { key: '[',  display: 'ਡ',  shift: 'ਢ' },   // DDA / DDHA
    { key: ']',  display: '਼',  shift: 'ਞ' },   // Nukta / NYA
    { key: '\\', display: '\\', shift: '|'  }
  ],

  // Row 3 — Home row  (LEFT = matras, RIGHT = consonants)
  [
    { key: 'CapsLock', display: 'Caps', wide: true },
    { key: 'a',  display: 'ੋ',  shift: 'ਓ' },   // o matra  / O vowel
    { key: 's',  display: 'ੇ',  shift: 'ਏ' },   // e matra  / E vowel
    { key: 'd',  display: '੍',  shift: 'ਅ' },   // Halant   / A vowel
    { key: 'f',  display: 'ਿ',  shift: 'ਇ' },   // i matra  / I vowel
    { key: 'g',  display: 'ੁ',  shift: 'ਉ' },   // u matra  / U vowel
    { key: 'h',  display: 'ਪ',  shift: 'ਫ' },   // PA / PHA
    { key: 'j',  display: 'ਰ',  shift: 'ੜ' },   // RA / RRA
    { key: 'k',  display: 'ਕ',  shift: 'ਖ' },   // KA / KHA
    { key: 'l',  display: 'ਤ',  shift: 'ਥ' },   // TA / THA
    { key: ';',  display: 'ਚ',  shift: 'ਛ' },   // CHA / CHHA
    { key: "'",  display: 'ਟ',  shift: 'ਠ' },   // TTA / TTHA
    { key: 'Enter', display: '↵', wide: true }
  ],

  // Row 4 — Bottom row
  [
    { key: 'ShiftLeft', display: '⇧', wide: true },
    { key: 'z',  display: 'ੱ',  shift: 'ਃ' },   // Addak    / Visarga
    { key: 'x',  display: 'ਂ',  shift: 'ਁ' },   // Bindi    / Udaat
    { key: 'c',  display: 'ਮ',  shift: 'ਣ' },   // MA / NNA
    { key: 'v',  display: 'ਨ',  shift: 'ੲ' },   // NA / IRI
    { key: 'b',  display: 'ਵ',  shift: 'ੳ' },   // VA / URA
    { key: 'n',  display: 'ਲ',  shift: 'ਲ਼' },  // LA / LLA
    { key: 'm',  display: 'ਸ',  shift: 'ਸ਼' },  // SA / SHA
    { key: ',',  display: ',',  shift: '<'  },
    { key: '.',  display: '.',  shift: '।' },    // Period / Danda
    { key: '/',  display: 'ਯ',  shift: '?'  },   // YA
    { key: 'ShiftRight', display: '⇧', wide: true }
  ],

  // Row 5 — Space row
  [
    { key: ' ', display: 'Space', wide: true }
  ]
];

// ── Finger map — same physical positions as English QWERTY ────────────────
export const punjabiFingerMap = {
  // Left Pinky
  '`': 'left-pinky', '1': 'left-pinky', 'q': 'left-pinky',
  'a': 'left-pinky', 'z': 'left-pinky',
  'Tab': 'left-pinky', 'CapsLock': 'left-pinky', 'ShiftLeft': 'left-pinky',

  // Left Ring
  '2': 'left-ring', 'w': 'left-ring', 's': 'left-ring', 'x': 'left-ring',

  // Left Middle
  '3': 'left-middle', 'e': 'left-middle', 'd': 'left-middle', 'c': 'left-middle',

  // Left Index
  '4': 'left-index', '5': 'left-index',
  'r': 'left-index', 't': 'left-index',
  'f': 'left-index', 'g': 'left-index',
  'v': 'left-index', 'b': 'left-index',

  // Right Index
  '6': 'right-index', '7': 'right-index',
  'y': 'right-index', 'u': 'right-index',
  'h': 'right-index', 'j': 'right-index',
  'n': 'right-index', 'm': 'right-index',

  // Right Middle
  '8': 'right-middle', 'i': 'right-middle', 'k': 'right-middle', ',': 'right-middle',

  // Right Ring
  '9': 'right-ring', 'o': 'right-ring', 'l': 'right-ring', '.': 'right-ring',

  // Right Pinky
  '0': 'right-pinky', '-': 'right-pinky', '=': 'right-pinky',
  'p': 'right-pinky', '[': 'right-pinky', ']': 'right-pinky', '\\': 'right-pinky',
  ';': 'right-pinky', "'": 'right-pinky', '/': 'right-pinky',
  'Enter': 'right-pinky', 'Backspace': 'right-pinky', 'ShiftRight': 'right-pinky',

  // Thumbs
  ' ': 'thumb'
};

// ── Finger names in Punjabi ────────────────────────────────────────────────
export const punjabiFingerNames = {
  'left-pinky':   'ਖੱਬੀ ਕਾਨੀ',
  'left-ring':    'ਖੱਬੀ ਅਨਾਮਿਕਾ',
  'left-middle':  'ਖੱਬੀ ਵਿਚਕਾਰਲੀ',
  'left-index':   'ਖੱਬੀ ਤਰਜਨੀ',
  'right-index':  'ਸੱਜੀ ਤਰਜਨੀ',
  'right-middle': 'ਸੱਜੀ ਵਿਚਕਾਰਲੀ',
  'right-ring':   'ਸੱਜੀ ਅਨਾਮਿਕਾ',
  'right-pinky':  'ਸੱਜੀ ਕਾਨੀ',
  'thumb':        'ਅੰਗੂਠਾ'
};

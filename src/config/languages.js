/**
 * Language Configuration System
 * Add new languages here - all components will automatically adapt
 */

export const LANGUAGES = {
  english: {
    id: 'english',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
    description: 'Learn typing in English',
    font: "'Courier New', monospace",
    direction: 'ltr',
    keyboardLayout: 'qwerty',
    enabled: true
  },
  punjabi: {
    id: 'punjabi',
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    flag: '🇮🇳',
    description: 'ਪੰਜਾਬੀ ਵਿੱਚ ਟਾਈਪਿੰਗ ਸਿੱਖੋ',
    font: "'Raavi', 'Gurmukhi', sans-serif",
    direction: 'ltr',
    keyboardLayout: 'punjabi-gurmukhi',
    enabled: true
  },
  hindi: {
    id: 'hindi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
    description: 'हिन्दी में टाइपिंग सीखें',
    font: "'Mangal', 'Devanagari', sans-serif",
    direction: 'ltr',
    keyboardLayout: 'hindi-devanagari',
    enabled: false // Will enable when content is ready
  },
  marathi: {
    id: 'marathi',
    name: 'Marathi',
    nativeName: 'मराठी',
    flag: '🇮🇳',
    description: 'मराठीमध्ये टायपिंग शिका',
    font: "'Mangal', 'Devanagari', sans-serif",
    direction: 'ltr',
    keyboardLayout: 'marathi-devanagari',
    enabled: false
  },
  urdu: {
    id: 'urdu',
    name: 'Urdu',
    nativeName: 'اردو',
    flag: '🇵🇰',
    description: 'اردو میں ٹائپنگ سیکھیں',
    font: "'Jameel Noori Nastaleeq', 'Urdu', sans-serif",
    direction: 'rtl',
    keyboardLayout: 'urdu-nastaliq',
    enabled: false
  }
};

// Get only enabled languages
export const getEnabledLanguages = () => {
  return Object.values(LANGUAGES).filter(lang => lang.enabled);
};

// Get language config by ID
export const getLanguageConfig = (languageId) => {
  return LANGUAGES[languageId] || LANGUAGES.english;
};

// Check if language exists and is enabled
export const isLanguageEnabled = (languageId) => {
  return LANGUAGES[languageId]?.enabled || false;
};

import {
  englishKeyboardLayout,
  englishFingerMap,
  englishFingerNames
} from './keyboards/english';

import {
  punjabiKeyboardLayout,
  punjabiFingerMap,
  punjabiFingerNames
} from './keyboards/punjabi';

const keyboardConfigs = {
  english: {
    layout: englishKeyboardLayout,
    fingerMap: englishFingerMap,
    fingerNames: englishFingerNames
  },
  punjabi: {
    layout: punjabiKeyboardLayout,
    fingerMap: punjabiFingerMap,
    fingerNames: punjabiFingerNames
  }
};

export const getKeyboardConfig = (language) => {
  return keyboardConfigs[language] || keyboardConfigs['english'];
};

/**
 * English QWERTY Keyboard Layout
 */

export const englishKeyboardLayout = [
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'BACKSPACE'],
  ['TAB', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
  ['CAPS', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", 'ENTER'],
  ['SHIFT_L', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'SHIFT_R'],
  ['SPACE']
];

export const englishFingerMap = {
  '`': 'left-pinky', '1': 'left-pinky', 'q': 'left-pinky', 'a': 'left-pinky', 'z': 'left-pinky',
  '2': 'left-ring', 'w': 'left-ring', 's': 'left-ring', 'x': 'left-ring',
  '3': 'left-middle', 'e': 'left-middle', 'd': 'left-middle', 'c': 'left-middle',
  '4': 'left-index', '5': 'left-index', 'r': 'left-index', 't': 'left-index',
  'f': 'left-index', 'g': 'left-index', 'v': 'left-index', 'b': 'left-index',
  '6': 'right-index', '7': 'right-index', 'y': 'right-index', 'u': 'right-index',
  'h': 'right-index', 'j': 'right-index', 'n': 'right-index', 'm': 'right-index',
  '8': 'right-middle', 'i': 'right-middle', 'k': 'right-middle', ',': 'right-middle',
  '9': 'right-ring', 'o': 'right-ring', 'l': 'right-ring', '.': 'right-ring',
  '0': 'right-pinky', '-': 'right-pinky', '=': 'right-pinky',
  'p': 'right-pinky', '[': 'right-pinky', ']': 'right-pinky', '\\': 'right-pinky',
  ';': 'right-pinky', "'": 'right-pinky', '/': 'right-pinky'
};

export const englishFingerNames = {
  'left-pinky': 'Left Pinky',
  'left-ring': 'Left Ring',
  'left-middle': 'Left Middle',
  'left-index': 'Left Index',
  'right-index': 'Right Index',
  'right-middle': 'Right Middle',
  'right-ring': 'Right Ring',
  'right-pinky': 'Right Pinky',
  'thumbs': 'Both Thumbs'
};

export const NUMBER_KEYS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

export const ACTION_KEYS = [
  'Home',
  'End',
  'Backspace',
  'Enter',
  'ArrowLeft',
  'Left',
  'ArrowRight',
  'Right',
  'Tab',
  'Esc',
  'Escape',
  'Del',
  'Delete',
]

export const isCtrlOrCommandKey = (ev: KeyboardEvent) => ev.metaKey || ev.ctrlKey

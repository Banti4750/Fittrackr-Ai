// FitTrackr brand palette — matches the landing page.
// Single dark theme (lime + fire on near-black). Both `light` and `dark`
// resolve to the same values so the app looks identical regardless of
// the system color scheme.

const palette = {
  bg: '#0A0A0A',
  card: '#111111',
  surface2: '#1A1A1A',
  border: '#2A2A2A',
  text: '#FFFFFF',
  textMuted: '#888888',

  primary: '#C8FF00',
  primaryMuted: '#1F2900',
  onPrimary: '#000000',

  accentOrange: '#FF5C00',
  accentOrangeMuted: '#2A1300',

  success: '#C8FF00',
  successMuted: '#1F2900',
  warn: '#FF5C00',
  warnMuted: '#2A1300',
  danger: '#FF4D4D',
  dangerMuted: '#2D0A0A',
  flame: '#FF5C00',
  chartLine: '#C8FF00',

  beginner: '#4ADE80',
  beginnerMuted: '#0E2E18',
  intermediate: '#60A5FA',
  intermediateMuted: '#0E1E3A',
  elite: '#FF8A3D',
  eliteMuted: '#2A1300',
};

export const lightColors = palette;
export const darkColors: typeof lightColors = palette;

export type Palette = typeof lightColors;

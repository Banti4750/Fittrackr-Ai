import { darkColors, Palette } from './colors';

// FitTrackr is a dark-only brand — both light/dark resolve to the same palette.
export function useTheme(): { colors: Palette; isDark: boolean } {
  return { colors: darkColors, isDark: true };
}

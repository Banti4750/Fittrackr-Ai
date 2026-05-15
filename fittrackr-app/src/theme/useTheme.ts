import { useColorScheme } from 'react-native';
import { lightColors, darkColors, Palette } from './colors';

export function useTheme(): { colors: Palette; isDark: boolean } {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  return { colors: isDark ? darkColors : lightColors, isDark };
}

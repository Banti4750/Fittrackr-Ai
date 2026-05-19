import React from 'react';
import { Text, View, ViewStyle } from 'react-native';
import { useTheme } from '../theme/useTheme';

type LogoSize = 'sm' | 'md' | 'lg' | 'xl';

const SIZE_MAP: Record<LogoSize, { wordmark: number; pill: number; pillPadH: number; pillPadV: number; gap: number }> = {
  sm: { wordmark: 16, pill: 10, pillPadH: 5, pillPadV: 2, gap: 6 },
  md: { wordmark: 22, pill: 12, pillPadH: 7, pillPadV: 3, gap: 8 },
  lg: { wordmark: 32, pill: 14, pillPadH: 8, pillPadV: 4, gap: 10 },
  xl: { wordmark: 44, pill: 16, pillPadH: 9, pillPadV: 4, gap: 12 },
};

interface Props {
  size?: LogoSize;
  showAI?: boolean;
  style?: ViewStyle;
}

export function Logo({ size = 'md', showAI = true, style }: Props) {
  const { colors } = useTheme();
  const s = SIZE_MAP[size];

  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: s.gap }, style]}>
      <Text
        style={{
          fontSize: s.wordmark,
          fontWeight: '900',
          letterSpacing: 1,
          lineHeight: s.wordmark * 1.05,
        }}
      >
        <Text style={{ color: colors.primary }}>FIT</Text>
        <Text style={{ color: colors.text }}>TRACKR</Text>
      </Text>
      {showAI && (
        <View
          style={{
            backgroundColor: colors.accentOrangeMuted,
            borderColor: colors.accentOrange,
            borderWidth: 1,
            paddingHorizontal: s.pillPadH,
            paddingVertical: s.pillPadV,
            borderRadius: 999,
          }}
        >
          <Text
            style={{
              color: colors.accentOrange,
              fontSize: s.pill,
              fontWeight: '900',
              letterSpacing: 1.2,
            }}
          >
            AI
          </Text>
        </View>
      )}
    </View>
  );
}

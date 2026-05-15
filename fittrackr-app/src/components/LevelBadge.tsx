import React from 'react';
import { Text, View } from 'react-native';
import { Level } from '../types';
import { useTheme } from '../theme/useTheme';

export function LevelBadge({ level }: { level: Level }) {
  const { colors } = useTheme();
  const map = {
    beginner: { bg: colors.successMuted, fg: colors.beginner, label: 'Beginner' },
    intermediate: { bg: colors.primaryMuted, fg: colors.intermediate, label: 'Intermediate' },
    elite: { bg: colors.dangerMuted, fg: colors.elite, label: 'Elite' },
  } as const;
  const it = map[level];
  return (
    <View
      style={{
        backgroundColor: it.bg,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 999,
        alignSelf: 'flex-start',
      }}
    >
      <Text style={{ color: it.fg, fontSize: 11, fontWeight: '700', letterSpacing: 0.3 }}>
        {it.label.toUpperCase()}
      </Text>
    </View>
  );
}

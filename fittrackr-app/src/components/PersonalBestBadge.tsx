import React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '../theme/useTheme';

export function PersonalBestBadge() {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: colors.warnMuted,
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 3,
      }}
    >
      <Text style={{ fontSize: 12 }}>🏆</Text>
      <Text style={{ color: colors.warn, fontWeight: '700', fontSize: 11 }}>PR!</Text>
    </View>
  );
}

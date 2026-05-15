import React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '../theme/useTheme';

interface Props {
  label: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'flat';
}

export function BodyStatCard({ label, value, unit, trend }: Props) {
  const { colors } = useTheme();
  const arrow = trend === 'up' ? '▲' : trend === 'down' ? '▼' : '–';
  const arrowColor =
    trend === 'up' ? colors.success : trend === 'down' ? colors.danger : colors.textMuted;
  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: colors.border,
        flex: 1,
      }}
    >
      <Text style={{ color: colors.textMuted, fontSize: 12 }}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
        <Text style={{ color: colors.text, fontSize: 22, fontWeight: '800' }}>{value}</Text>
        {unit && <Text style={{ color: colors.textMuted }}>{unit}</Text>}
      </View>
      {trend ? (
        <Text style={{ color: arrowColor, fontSize: 12, marginTop: 4 }}>{arrow} trend</Text>
      ) : null}
    </View>
  );
}

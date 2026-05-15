import React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '../theme/useTheme';

interface Props {
  data: Array<{ date: string; count: number }>;
  weeks?: number;
}

export function CalendarHeatmap({ data, weeks = 12 }: Props) {
  const { colors } = useTheme();
  const map = new Map(data.map((d) => [d.date, d.count]));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cols: Array<Array<{ date: string; count: number }>> = [];
  const startDay = today.getDay(); // 0 = Sun
  const start = new Date(today);
  start.setDate(today.getDate() - (weeks * 7 - 1 - startDay));

  for (let c = 0; c < weeks; c++) {
    const col: Array<{ date: string; count: number }> = [];
    for (let r = 0; r < 7; r++) {
      const d = new Date(start);
      d.setDate(start.getDate() + c * 7 + r);
      const iso = d.toISOString().slice(0, 10);
      col.push({ date: iso, count: map.get(iso) ?? 0 });
    }
    cols.push(col);
  }

  const cell = (count: number) => {
    if (count <= 0) return colors.border;
    if (count === 1) return colors.successMuted;
    if (count === 2) return colors.beginner;
    return colors.success;
  };

  return (
    <View style={{ flexDirection: 'row', gap: 3 }}>
      {cols.map((col, ci) => (
        <View key={ci} style={{ gap: 3 }}>
          {col.map((c) => (
            <View
              key={c.date}
              style={{ width: 14, height: 14, borderRadius: 3, backgroundColor: cell(c.count) }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

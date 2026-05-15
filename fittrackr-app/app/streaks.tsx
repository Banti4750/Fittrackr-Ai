import React from 'react';
import { Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Screen } from '../src/components/Screen';
import { StreakFlame } from '../src/components/StreakFlame';
import { CalendarHeatmap } from '../src/components/CalendarHeatmap';
import { useTheme } from '../src/theme/useTheme';
import { getStreak } from '../src/api/streaks';

const MILESTONES = [7, 30, 100, 365];

export default function Streaks() {
  const { colors } = useTheme();
  const q = useQuery({ queryKey: ['streak'], queryFn: getStreak });
  const current = q.data?.streak?.currentStreak ?? 0;
  const longest = q.data?.streak?.longestStreak ?? 0;
  const total = q.data?.streak?.totalWorkouts ?? 0;

  return (
    <Screen>
      <StreakFlame days={current} />

      <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
        <Stat label="Current" value={current} />
        <Stat label="Longest" value={longest} />
        <Stat label="Total" value={total} />
      </View>

      <View
        style={{
          backgroundColor: colors.card,
          padding: 14,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <Text style={{ color: colors.text, fontWeight: '700', marginBottom: 8 }}>
          Last 12 weeks
        </Text>
        <CalendarHeatmap data={q.data?.heatmap ?? []} weeks={12} />
      </View>

      <View
        style={{
          backgroundColor: colors.card,
          padding: 14,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: colors.border,
          gap: 8,
        }}
      >
        <Text style={{ color: colors.text, fontWeight: '700' }}>Milestones</Text>
        {MILESTONES.map((m) => {
          const earned = longest >= m;
          return (
            <View
              key={m}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingVertical: 4,
              }}
            >
              <Text style={{ color: earned ? colors.text : colors.textMuted }}>
                {earned ? '🏅' : '🔒'} {m} day streak
              </Text>
              <Text style={{ color: earned ? colors.success : colors.textMuted }}>
                {earned ? 'Unlocked' : `${m - longest} to go`}
              </Text>
            </View>
          );
        })}
      </View>
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.card,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <Text style={{ color: colors.textMuted, fontSize: 11 }}>{label}</Text>
      <Text style={{ color: colors.text, fontSize: 20, fontWeight: '800', marginTop: 2 }}>{value}</Text>
    </View>
  );
}

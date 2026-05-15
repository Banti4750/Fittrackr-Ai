import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Screen } from '../../src/components/Screen';
import { ProgressChart } from '../../src/components/ProgressChart';
import { useTheme } from '../../src/theme/useTheme';
import { getVolume, getFrequency, getPersonalBests, getMuscleBreakdown } from '../../src/api/progress';
import { formatDate, formatVolume } from '../../src/utils/format';

type Tab = 'volume' | 'frequency' | 'body' | 'prs';

export default function Progress() {
  const { colors } = useTheme();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('volume');

  const volume = useQuery({ queryKey: ['volume', '30d'], queryFn: () => getVolume({ range: '30d' }) });
  const frequency = useQuery({ queryKey: ['frequency'], queryFn: () => getFrequency('90d') });
  const prs = useQuery({ queryKey: ['prs'], queryFn: getPersonalBests });
  const muscles = useQuery({ queryKey: ['muscles'], queryFn: () => getMuscleBreakdown('30d') });

  return (
    <Screen>
      <Text style={{ color: colors.text, fontSize: 24, fontWeight: '800' }}>Progress</Text>
      <View style={{ flexDirection: 'row', gap: 6 }}>
        {(['volume', 'frequency', 'body', 'prs'] as Tab[]).map((t) => (
          <Pressable
            key={t}
            onPress={() => setTab(t)}
            style={{
              flex: 1,
              alignItems: 'center',
              paddingVertical: 10,
              borderRadius: 10,
              backgroundColor: tab === t ? colors.primaryMuted : 'transparent',
            }}
          >
            <Text style={{ color: tab === t ? colors.primary : colors.text, fontWeight: '700', textTransform: 'capitalize' }}>
              {t}
            </Text>
          </Pressable>
        ))}
      </View>

      {tab === 'volume' && (
        <View style={{ backgroundColor: colors.card, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: colors.border }}>
          <ProgressChart
            title="Total volume (last 30 days)"
            data={(volume.data ?? []).map((p) => ({ label: formatDate(p.date), value: Math.round(p.volume) }))}
            type="line"
          />
          <Text style={{ color: colors.textMuted, marginTop: 8, fontSize: 12 }}>
            Volume = sum of weight × reps across all sets.
          </Text>
        </View>
      )}

      {tab === 'frequency' && (
        <View style={{ backgroundColor: colors.card, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: colors.border }}>
          <ProgressChart
            title="Workouts per week"
            data={(frequency.data?.points ?? []).map((p) => ({ label: p.weekStart.slice(5), value: p.count }))}
            type="bar"
          />
          <Text style={{ color: colors.textMuted, marginTop: 8, fontSize: 12 }}>
            {frequency.data?.totalWorkouts ?? 0} total workouts in this range.
          </Text>
        </View>
      )}

      {tab === 'body' && (
        <Pressable
          onPress={() => router.push('/bodystats')}
          style={{
            backgroundColor: colors.card,
            padding: 14,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16 }}>Body Stats</Text>
          <Text style={{ color: colors.textMuted, marginTop: 4 }}>
            Tap to log weight, measurements, and progress photos.
          </Text>
        </Pressable>
      )}

      {tab === 'prs' && (
        <View
          style={{
            backgroundColor: colors.card,
            padding: 14,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: colors.border,
            gap: 10,
          }}
        >
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16 }}>Personal Bests</Text>
          {prs.data?.length ? (
            prs.data.slice(0, 20).map((p) => (
              <View
                key={p.exercise._id}
                style={{ flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8 }}
              >
                <View>
                  <Text style={{ color: colors.text, fontWeight: '600' }}>{p.exercise.name}</Text>
                  <Text style={{ color: colors.textMuted, fontSize: 12 }}>{formatDate(p.date)}</Text>
                </View>
                <Text style={{ color: colors.primary, fontWeight: '700' }}>
                  {p.weight ? `${p.weight} kg × ${p.reps}` : `${p.reps} reps`}
                </Text>
              </View>
            ))
          ) : (
            <Text style={{ color: colors.textMuted }}>No PRs yet — log a workout to get started.</Text>
          )}
        </View>
      )}

      <Pressable
        onPress={() => router.push('/streaks')}
        style={{
          backgroundColor: colors.card,
          padding: 14,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <Text style={{ color: colors.text, fontWeight: '700' }}>🔥 View streak details</Text>
      </Pressable>

      <View
        style={{
          backgroundColor: colors.card,
          padding: 14,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: colors.border,
          gap: 6,
        }}
      >
        <Text style={{ color: colors.text, fontWeight: '700' }}>Muscle group breakdown (30 days)</Text>
        {muscles.data?.length ? (
          muscles.data.map((m) => (
            <View
              key={m.muscle}
              style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}
            >
              <Text style={{ color: colors.text, textTransform: 'capitalize' }}>{m.muscle}</Text>
              <Text style={{ color: colors.textMuted }}>{m.sets} sets</Text>
            </View>
          ))
        ) : (
          <Text style={{ color: colors.textMuted }}>No data yet.</Text>
        )}
      </View>
    </Screen>
  );
}

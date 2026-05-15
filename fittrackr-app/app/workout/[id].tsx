import React from 'react';
import { Alert, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Screen } from '../../src/components/Screen';
import { Button } from '../../src/components/Button';
import { PersonalBestBadge } from '../../src/components/PersonalBestBadge';
import { useTheme } from '../../src/theme/useTheme';
import { deleteWorkout, getWorkout } from '../../src/api/workouts';
import { formatDate, formatDuration, formatVolume } from '../../src/utils/format';
import { Exercise } from '../../src/types';

export default function WorkoutDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const { colors } = useTheme();

  const q = useQuery({ queryKey: ['workout', id], queryFn: () => getWorkout(id!) });
  const del = useMutation({
    mutationFn: () => deleteWorkout(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workouts'] });
      router.back();
    },
  });

  if (q.isLoading || !q.data) return <Screen><Text style={{ color: colors.textMuted }}>Loading…</Text></Screen>;
  const s = q.data;

  return (
    <Screen>
      <Text style={{ color: colors.text, fontSize: 24, fontWeight: '800' }}>
        {s.title ?? 'Workout'}
      </Text>
      <Text style={{ color: colors.textMuted }}>{formatDate(s.date)}</Text>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Stat label="Exercises" value={String(s.exercises.length)} />
        <Stat label="Volume" value={formatVolume(s.totalVolume)} />
        <Stat label="Duration" value={formatDuration(s.totalDuration)} />
      </View>

      {s.exercises.map((ex, i) => {
        const exObj = ex.exerciseId as unknown as Exercise;
        return (
          <View
            key={i}
            style={{
              backgroundColor: colors.card,
              padding: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
              gap: 6,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16 }}>
                {exObj?.name ?? 'Exercise'}
              </Text>
              {ex.personalBest ? <PersonalBestBadge /> : null}
            </View>
            {ex.sets.map((set, j) => (
              <View key={j} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: colors.textMuted }}>Set {j + 1}</Text>
                <Text style={{ color: colors.text }}>
                  {set.weight != null ? `${set.weight} kg × ${set.reps ?? 0}` : `${set.reps ?? 0} reps`}
                  {set.isPersonalBest ? '  🏆' : ''}
                </Text>
              </View>
            ))}
          </View>
        );
      })}

      {s.notes ? (
        <View style={{ backgroundColor: colors.card, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ color: colors.textMuted, fontSize: 12 }}>Notes</Text>
          <Text style={{ color: colors.text, marginTop: 4 }}>{s.notes}</Text>
        </View>
      ) : null}

      <Button
        title="Delete workout"
        variant="danger"
        onPress={() =>
          Alert.alert('Delete this workout?', 'This cannot be undone.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => del.mutate() },
          ])
        }
      />
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.card, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.border }}>
      <Text style={{ color: colors.textMuted, fontSize: 11 }}>{label}</Text>
      <Text style={{ color: colors.text, fontSize: 18, fontWeight: '800', marginTop: 2 }}>{value}</Text>
    </View>
  );
}

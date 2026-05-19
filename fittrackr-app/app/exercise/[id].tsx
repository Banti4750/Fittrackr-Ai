import React from 'react';
import { Image, Linking, Pressable, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Screen } from '../../src/components/Screen';
import { Button } from '../../src/components/Button';
import { LevelBadge } from '../../src/components/LevelBadge';
import { useTheme } from '../../src/theme/useTheme';
import { getExercise } from '../../src/api/exercises';
import { getVolume } from '../../src/api/progress';
import { ProgressChart } from '../../src/components/ProgressChart';
import { useWorkoutStore } from '../../src/stores/useWorkoutStore';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { formatDate } from '../../src/utils/format';

// Rough per-set duration in seconds: ~8 reps × 4s + ~60s rest. Used only for
// the "estimated burn" chip on the detail page; the real workout uses the
// actual logged rep/duration/rest values for the MET calculation.
const ASSUMED_SET_SECONDS = 90;

function estimatePerSetCalories(metValue: number | undefined, bodyWeightKg: number): number {
  const met = metValue ?? 4.5;
  return Math.round(met * bodyWeightKg * (ASSUMED_SET_SECONDS / 3600) * 10) / 10;
}

export default function ExerciseDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const addExercise = useWorkoutStore((s) => s.addExercise);
  const user = useAuthStore((s) => s.user);
  const bodyWeightKg = user?.weight ?? 70;

  const ex = useQuery({ queryKey: ['exercise', id], queryFn: () => getExercise(id!) });
  const history = useQuery({
    queryKey: ['exercise-history', id],
    queryFn: () => getVolume({ exercise: id, range: '90d' }),
    enabled: !!id,
  });

  if (ex.isLoading || !ex.data) {
    return <Screen><Text style={{ color: colors.textMuted }}>Loading…</Text></Screen>;
  }
  const e = ex.data;

  return (
    <Screen>
      <Image source={{ uri: e.imageUrl }} style={{ width: '100%', height: 220, borderRadius: 14 }} />
      <Text style={{ color: colors.text, fontSize: 26, fontWeight: '800' }}>{e.name}</Text>
      <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
        <Tag>{e.muscleGroup.primary}</Tag>
        {e.muscleGroup.secondary.map((s) => (
          <Tag key={s}>{s}</Tag>
        ))}
        <LevelBadge level={e.difficulty} />
      </View>

      {(() => {
        const perSet = estimatePerSetCalories(e.metValue, bodyWeightKg);
        const forFour = Math.round(perSet * 4 * 10) / 10;
        return (
          <View
            style={{
              backgroundColor: colors.accentOrangeMuted,
              borderColor: colors.accentOrange,
              borderWidth: 1,
              borderRadius: 999,
              paddingHorizontal: 12,
              paddingVertical: 6,
              alignSelf: 'flex-start',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Text style={{ fontSize: 12 }}>🔥</Text>
            <Text style={{ color: colors.accentOrange, fontSize: 12, fontWeight: '700' }}>
              ~{perSet} kcal/set · ~{forFour} kcal for 4 sets
            </Text>
          </View>
        );
      })()}

      <Text style={{ color: colors.textMuted }}>{e.description}</Text>

      <Pressable
        onPress={() => Linking.openURL(e.videoUrl)}
        style={{
          backgroundColor: colors.card,
          borderRadius: 12,
          padding: 12,
          borderWidth: 1,
          borderColor: colors.border,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <Text style={{ fontSize: 28 }}>▶️</Text>
        <Text style={{ color: colors.primary, fontWeight: '700' }}>Watch tutorial on YouTube</Text>
      </Pressable>

      <Section title="Instructions">
        {e.instructions.map((s, i) => (
          <Text key={i} style={{ color: colors.text, marginBottom: 4 }}>
            {i + 1}. {s}
          </Text>
        ))}
      </Section>

      {e.tips?.length ? (
        <Section title="Tips">
          {e.tips.map((t, i) => (
            <Text key={i} style={{ color: colors.text, marginBottom: 4 }}>
              • {t}
            </Text>
          ))}
        </Section>
      ) : null}

      {e.equipment?.length ? (
        <Section title="Equipment">
          <Text style={{ color: colors.text }}>{e.equipment.join(', ')}</Text>
        </Section>
      ) : null}

      <Section title="Your volume history (90d)">
        <ProgressChart
          data={(history.data ?? []).map((p) => ({ label: formatDate(p.date), value: Math.round(p.volume) }))}
          type="line"
          height={180}
        />
      </Section>

      <Button
        title="Add to workout"
        onPress={() => {
          addExercise(e);
          router.push('/workout/active');
        }}
      />
    </Screen>
  );
}

function Tag({ children }: { children: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ backgroundColor: colors.primaryMuted, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 }}>
      <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '600', textTransform: 'capitalize' }}>
        {children}
      </Text>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        backgroundColor: colors.card,
        padding: 14,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.border,
        gap: 4,
      }}
    >
      <Text style={{ color: colors.text, fontWeight: '700', marginBottom: 4 }}>{title}</Text>
      {children}
    </View>
  );
}

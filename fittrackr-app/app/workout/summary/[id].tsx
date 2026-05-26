import React from 'react';
import { Pressable, Share, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Screen } from '../../../src/components/Screen';
import { Button } from '../../../src/components/Button';
import { Logo } from '../../../src/components/Logo';
import { useTheme } from '../../../src/theme/useTheme';
import { getWorkout } from '../../../src/api/workouts';
import { formatVolume } from '../../../src/utils/format';
import { useWeightUnit } from '../../../src/stores/useAuthStore';
import { formatWeight } from '../../../src/utils/units';

export default function WorkoutSummary() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const unit = useWeightUnit();

  const q = useQuery({
    queryKey: ['workout', id, 'summary'],
    queryFn: () => getWorkout(id!),
    enabled: !!id,
  });

  if (q.isLoading || !q.data) {
    return (
      <Screen>
        <Text style={{ color: colors.textMuted, textAlign: 'center', paddingVertical: 32 }}>
          Loading summary…
        </Text>
      </Screen>
    );
  }

  const s = q.data;
  const prs = s.exercises.filter((ex) => ex.personalBest);
  const totalSets = s.exercises.reduce((sum, ex) => sum + (ex.sets?.length ?? 0), 0);

  const onShare = async () => {
    const lines = [
      `🔥 Just crushed a workout on FitTrackr AI`,
      `${s.caloriesBurned} kcal burned · ${formatVolume(s.totalVolume, unit)} volume`,
      `${s.exercises.length} exercises · ${totalSets} sets · ${s.totalDuration}min`,
      prs.length > 0 ? `🏆 ${prs.length} new personal best${prs.length > 1 ? 's' : ''}!` : '',
    ].filter(Boolean);
    await Share.share({ message: lines.join('\n') });
  };

  return (
    <Screen>
      <View style={{ alignItems: 'center', paddingVertical: 12, gap: 6 }}>
        <Text style={{ fontSize: 56 }}>🎉</Text>
        <Text style={{ color: colors.text, fontSize: 28, fontWeight: '900', letterSpacing: 1 }}>
          WORKOUT COMPLETE
        </Text>
        <Logo size="sm" />
      </View>

      {/* Hero: calories */}
      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: 18,
          padding: 24,
          borderWidth: 1,
          borderColor: colors.accentOrange + '55',
          alignItems: 'center',
        }}
      >
        <Text style={{ color: colors.textMuted, fontSize: 11, letterSpacing: 2, fontWeight: '700' }}>
          CALORIES BURNED
        </Text>
        <Text
          style={{
            color: colors.accentOrange,
            fontSize: 84,
            fontWeight: '900',
            letterSpacing: 1,
            lineHeight: 88,
            marginTop: 4,
          }}
        >
          {s.caloriesBurned}
        </Text>
        <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 2 }}>kcal</Text>
      </View>

      {/* Stats grid */}
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <SummaryTile label="Time" value={`${s.totalDuration}`} unit="min" />
        <SummaryTile label="Volume" value={formatVolume(s.totalVolume, unit)} unit="" />
        <SummaryTile label="Exercises" value={String(s.exercises.length)} unit="" />
        <SummaryTile label="Sets" value={String(totalSets)} unit="" />
      </View>

      {/* PRs */}
      {prs.length > 0 ? (
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 14,
            padding: 14,
            borderWidth: 1,
            borderColor: colors.primary,
            gap: 8,
          }}
        >
          <Text style={{ color: colors.primary, fontWeight: '900', fontSize: 13, letterSpacing: 1.5 }}>
            🏆 {prs.length} NEW PERSONAL BEST{prs.length > 1 ? 'S' : ''}
          </Text>
          {prs.map((ex, i) => {
            const name =
              typeof ex.exerciseId === 'string' ? 'Exercise' : ex.exerciseId.name;
            const bestSet = ex.sets.find((set) => set.isPersonalBest);
            return (
              <View
                key={i}
                style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <Text style={{ color: colors.text, fontWeight: '700' }}>{name}</Text>
                <Text style={{ color: colors.primary, fontWeight: '700' }}>
                  {bestSet?.weight ? `${formatWeight(bestSet.weight, unit)} × ${bestSet.reps}` : `${bestSet?.reps ?? 0} reps`}
                </Text>
              </View>
            );
          })}
        </View>
      ) : null}

      {/* Exercise breakdown */}
      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: 14,
          padding: 14,
          borderWidth: 1,
          borderColor: colors.border,
          gap: 10,
        }}
      >
        <Text style={{ color: colors.text, fontWeight: '800', fontSize: 14 }}>
          Exercises completed
        </Text>
        {s.exercises.map((ex, i) => {
          const name = typeof ex.exerciseId === 'string' ? 'Exercise' : ex.exerciseId.name;
          const setCount = ex.sets?.length ?? 0;
          return (
            <View
              key={i}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: i === 0 ? 0 : 8,
                borderTopWidth: i === 0 ? 0 : 1,
                borderTopColor: colors.border,
              }}
            >
              <Text style={{ color: colors.text }} numberOfLines={1}>
                {name}
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                {setCount} {setCount === 1 ? 'set' : 'sets'}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={{ gap: 10, marginTop: 4 }}>
        <Pressable
          onPress={onShare}
          style={{
            backgroundColor: colors.surface2,
            borderRadius: 999,
            paddingVertical: 14,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text style={{ color: colors.text, fontWeight: '700' }}>📤 Share</Text>
        </Pressable>
        <Button title="Done" onPress={() => router.replace('/(tabs)/home')} />
      </View>
    </Screen>
  );
}

function SummaryTile({ label, value, unit }: { label: string; value: string; unit: string }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
      }}
    >
      <Text style={{ color: colors.text, fontWeight: '900', fontSize: 18 }}>{value}</Text>
      {unit ? <Text style={{ color: colors.textMuted, fontSize: 10 }}>{unit}</Text> : null}
      <Text style={{ color: colors.textMuted, fontSize: 10, marginTop: 2, letterSpacing: 1, fontWeight: '700' }}>
        {label.toUpperCase()}
      </Text>
    </View>
  );
}

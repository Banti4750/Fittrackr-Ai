import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Screen } from '../../src/components/Screen';
import { WorkoutCard } from '../../src/components/WorkoutCard';
import { AIInsightCard } from '../../src/components/AIInsightCard';
import { BodyHeatmap } from '../../src/components/BodyHeatmap';
import { useTheme } from '../../src/theme/useTheme';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { listWorkouts } from '../../src/api/workouts';
import { latestInsights } from '../../src/api/ai';
import { getStreak } from '../../src/api/streaks';
import { getMuscleHeatmap } from '../../src/api/progress';
import { greeting, formatVolume } from '../../src/utils/format';

export default function Home() {
  const router = useRouter();
  const { colors } = useTheme();
  const user = useAuthStore((s) => s.user);

  const workouts = useQuery({ queryKey: ['workouts', 'home'], queryFn: () => listWorkouts({ page: 1 }) });
  const insights = useQuery({ queryKey: ['insights', 'latest'], queryFn: latestInsights });
  const streak = useQuery({ queryKey: ['streak'], queryFn: getStreak });
  const heatmap = useQuery({ queryKey: ['muscle-heatmap', '7d'], queryFn: () => getMuscleHeatmap('7d') });

  const recent = workouts.data?.sessions?.slice(0, 3) ?? [];
  const weekSessions =
    workouts.data?.sessions?.filter((s) => {
      const days = (Date.now() - new Date(s.date).getTime()) / 86_400_000;
      return days <= 7;
    }) ?? [];
  const weekVolume = weekSessions.reduce((sum, s) => sum + (s.totalVolume ?? 0), 0);
  const topInsight = insights.data?.[0];

  return (
    <Screen>
      <View>
        <Text style={{ color: colors.textMuted, fontSize: 14 }}>{greeting()},</Text>
        <Text style={{ color: colors.text, fontSize: 28, fontWeight: '800' }}>
          {user?.name?.split(' ')[0] ?? 'Athlete'} 💪
        </Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <StatTile label="Workouts" value={String(weekSessions.length)} sub="this week" />
        <StatTile label="Volume" value={formatVolume(weekVolume)} sub="this week" />
        <StatTile
          label="Streak"
          value={String(streak.data?.streak?.currentStreak ?? 0)}
          sub="days"
        />
      </View>

      <Pressable
        onPress={() => router.push('/workout/active')}
        style={{
          backgroundColor: colors.primary,
          padding: 18,
          borderRadius: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View>
          <Text style={{ color: colors.onPrimary, fontSize: 16, fontWeight: '800' }}>Start a workout</Text>
          <Text style={{ color: 'rgba(0,0,0,0.7)', marginTop: 2, fontWeight: '500' }}>
            Tap to log sets, reps, weight
          </Text>
        </View>
        <Text style={{ fontSize: 32 }}>➕</Text>
      </Pressable>

      {heatmap.data && heatmap.data.heatmap.length > 0 ? (
        <BodyHeatmap data={heatmap.data.heatmap} rangeDays={heatmap.data.rangeDays} />
      ) : null}

      {topInsight ? (
        <Pressable onPress={() => router.push('/insights')}>
          <AIInsightCard insight={topInsight} />
        </Pressable>
      ) : (
        <Pressable
          onPress={() => router.push('/insights')}
          style={{
            backgroundColor: colors.card,
            borderRadius: 14,
            padding: 14,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text style={{ color: colors.primary, fontWeight: '700' }}>✨ Get your first AI insight</Text>
          <Text style={{ color: colors.textMuted, marginTop: 4 }}>
            Log a few workouts and let our trainer AI find your patterns.
          </Text>
        </Pressable>
      )}

      <View>
        <Text style={{ color: colors.text, fontWeight: '700', marginBottom: 8 }}>
          Recent workouts
        </Text>
        {recent.length === 0 ? (
          <Text style={{ color: colors.textMuted }}>No workouts logged yet.</Text>
        ) : (
          recent.map((s) => (
            <WorkoutCard key={s._id} session={s} onPress={() => router.push(`/workout/${s._id}`)} />
          ))
        )}
      </View>
    </Screen>
  );
}

function StatTile({ label, value, sub }: { label: string; value: string; sub: string }) {
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
      }}
    >
      <Text style={{ color: colors.textMuted, fontSize: 11 }}>{label}</Text>
      <Text style={{ color: colors.text, fontSize: 20, fontWeight: '800', marginTop: 2 }}>{value}</Text>
      <Text style={{ color: colors.textMuted, fontSize: 11 }}>{sub}</Text>
    </View>
  );
}

import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Screen } from '../src/components/Screen';
import { CalorieRing } from '../src/components/CalorieRing';
import { Button } from '../src/components/Button';
import { useTheme } from '../src/theme/useTheme';
import {
  getCaloriesMonthly,
  getCaloriesSummary,
  getCaloriesWeekly,
  getCalorieSessions,
} from '../src/api/calories';
import { updateProfile } from '../src/api/users';
import { useAuthStore } from '../src/stores/useAuthStore';
import { formatDate } from '../src/utils/format';

type Range = 'weekly' | 'monthly';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CaloriesScreen() {
  const { colors } = useTheme();
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [range, setRange] = useState<Range>('weekly');
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState('');

  const summary = useQuery({ queryKey: ['calories', 'summary'], queryFn: getCaloriesSummary });
  const weekly = useQuery({ queryKey: ['calories', 'weekly'], queryFn: getCaloriesWeekly });
  const monthly = useQuery({
    queryKey: ['calories', 'monthly'],
    queryFn: getCaloriesMonthly,
    enabled: range === 'monthly',
  });
  const sessions = useQuery({
    queryKey: ['calories', 'sessions', range === 'weekly' ? 7 : 30],
    queryFn: () => getCalorieSessions(range === 'weekly' ? 7 : 30),
  });

  const saveGoal = useMutation({
    mutationFn: (goal: number) => updateProfile({ dailyCalorieGoal: goal }),
    onSuccess: (u) => {
      setUser(u);
      qc.invalidateQueries({ queryKey: ['calories'] });
      setEditingGoal(false);
    },
    onError: (e: any) =>
      Alert.alert('Failed', e?.response?.data?.error ?? e?.message ?? 'Could not save goal'),
  });

  return (
    <Screen>
      {/* Header total */}
      <View style={{ alignItems: 'center', paddingVertical: 8 }}>
        <Text style={{ color: colors.textMuted, fontSize: 11, letterSpacing: 2, fontWeight: '700' }}>
          {range === 'weekly' ? 'BURNED THIS WEEK' : 'BURNED THIS MONTH'}
        </Text>
        <Text
          style={{
            color: colors.primary,
            fontSize: 56,
            fontWeight: '900',
            letterSpacing: 1,
            marginTop: 4,
          }}
        >
          {range === 'weekly' ? summary.data?.thisWeek ?? 0 : summary.data?.thisMonth ?? 0}
        </Text>
        <Text style={{ color: colors.textMuted, fontSize: 12 }}>kcal</Text>
      </View>

      {/* Range toggle */}
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: colors.card,
          borderRadius: 999,
          padding: 4,
          borderWidth: 1,
          borderColor: colors.border,
          alignSelf: 'center',
        }}
      >
        {(['weekly', 'monthly'] as Range[]).map((r) => (
          <Pressable
            key={r}
            onPress={() => setRange(r)}
            style={{
              paddingHorizontal: 22,
              paddingVertical: 8,
              borderRadius: 999,
              backgroundColor: range === r ? colors.primary : 'transparent',
            }}
          >
            <Text
              style={{
                color: range === r ? colors.onPrimary : colors.text,
                fontWeight: '700',
                fontSize: 13,
                textTransform: 'capitalize',
              }}
            >
              {r}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Weekly bars or monthly mini-line */}
      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: 16,
          padding: 16,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        {range === 'weekly' ? (
          <WeeklyBars data={weekly.data ?? []} goal={summary.data?.goal ?? 400} />
        ) : (
          <MonthlyLine data={monthly.data ?? []} goal={summary.data?.goal ?? 400} />
        )}
      </View>

      {/* Stats row */}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <StatTile label="Today" value={summary.data?.today ?? 0} />
        <StatTile label="Week" value={summary.data?.thisWeek ?? 0} highlight />
        <StatTile label="Month" value={summary.data?.thisMonth ?? 0} />
        <StatTile label="All time" value={summary.data?.allTime ?? 0} />
      </View>

      {/* Goal editor */}
      <Pressable
        onPress={() => {
          setGoalInput(String(summary.data?.goal ?? user?.dailyCalorieGoal ?? 400));
          setEditingGoal(true);
        }}
        style={{
          backgroundColor: colors.card,
          borderRadius: 14,
          padding: 14,
          borderWidth: 1,
          borderColor: colors.border,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <View>
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15 }}>🎯 Daily burn goal</Text>
          <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>
            Tap to change your daily target
          </Text>
        </View>
        <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 18 }}>
          {summary.data?.goal ?? 400} <Text style={{ color: colors.textMuted, fontSize: 12 }}>kcal</Text>
        </Text>
      </Pressable>

      {editingGoal ? (
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 14,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.primary,
            gap: 10,
          }}
        >
          <Text style={{ color: colors.text, fontWeight: '700' }}>Set daily calorie goal</Text>
          <TextInput
            value={goalInput}
            onChangeText={setGoalInput}
            keyboardType="number-pad"
            placeholderTextColor={colors.textMuted}
            placeholder="e.g. 400"
            style={{
              backgroundColor: colors.surface2,
              color: colors.text,
              borderRadius: 10,
              paddingHorizontal: 12,
              paddingVertical: 10,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button title="Cancel" variant="ghost" onPress={() => setEditingGoal(false)} style={{ flex: 1 }} />
            <Button
              title="Save"
              onPress={() => {
                const n = parseInt(goalInput, 10);
                if (!Number.isFinite(n) || n < 50 || n > 5000) {
                  Alert.alert('Invalid goal', 'Enter a value between 50 and 5000 kcal');
                  return;
                }
                saveGoal.mutate(n);
              }}
              loading={saveGoal.isPending}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      ) : null}

      {/* Session breakdown */}
      <View style={{ gap: 8 }}>
        <Text style={{ color: colors.text, fontWeight: '800', fontSize: 16 }}>
          {range === 'weekly' ? 'This week' : 'This month'}
        </Text>
        {sessions.data?.length ? (
          sessions.data.map((s) => (
            <View
              key={s._id}
              style={{
                backgroundColor: colors.card,
                borderRadius: 12,
                padding: 12,
                borderWidth: 1,
                borderColor: colors.border,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontWeight: '700' }} numberOfLines={1}>
                  {s.title || 'Workout'}
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>
                  {formatDate(s.date)} · {s.totalDuration}min · {s.exerciseCount} exercises
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 18 }}>
                  {s.caloriesBurned}
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 10 }}>kcal</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={{ color: colors.textMuted, paddingVertical: 12, textAlign: 'center' }}>
            No workouts in this range.
          </Text>
        )}
      </View>
    </Screen>
  );
}

function StatTile({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 10,
        borderWidth: 1,
        borderColor: highlight ? colors.primary : colors.border,
        alignItems: 'center',
      }}
    >
      <Text style={{ color: highlight ? colors.primary : colors.text, fontWeight: '900', fontSize: 18 }}>
        {value}
      </Text>
      <Text style={{ color: colors.textMuted, fontSize: 10, marginTop: 2, letterSpacing: 1, fontWeight: '700' }}>
        {label.toUpperCase()}
      </Text>
    </View>
  );
}

function WeeklyBars({
  data,
  goal,
}: {
  data: Array<{ date: string; calories: number }>;
  goal: number;
}) {
  const { colors } = useTheme();
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const max = Math.max(goal, ...data.map((d) => d.calories), 1);

  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 160 }}>
        {data.map((d) => {
          const isToday = d.date === today;
          const isFuture = d.date > today;
          const ratio = d.calories / max;
          const dayName = DAY_LABELS[new Date(d.date + 'T00:00:00').getDay()];
          return (
            <View key={d.date} style={{ flex: 1, alignItems: 'center', gap: 6 }}>
              <Text style={{ color: colors.textMuted, fontSize: 10, fontWeight: '600' }}>
                {d.calories || ''}
              </Text>
              <View
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'transparent',
                  justifyContent: 'flex-end',
                  borderRadius: 8,
                  overflow: 'hidden',
                }}
              >
                {isFuture ? (
                  <View
                    style={{
                      height: '20%',
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderStyle: 'dashed',
                    }}
                  />
                ) : (
                  <View
                    style={{
                      height: `${Math.max(4, ratio * 100)}%`,
                      backgroundColor: isToday ? colors.primary : colors.surface2,
                      borderTopLeftRadius: 8,
                      borderTopRightRadius: 8,
                      borderWidth: isToday ? 0 : 1,
                      borderColor: colors.border,
                    }}
                  />
                )}
              </View>
              <Text
                style={{
                  color: isToday ? colors.primary : colors.textMuted,
                  fontSize: 11,
                  fontWeight: '700',
                }}
              >
                {dayName}
              </Text>
            </View>
          );
        })}
      </View>
      <View
        style={{
          marginTop: 12,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <View style={{ width: 16, height: 3, backgroundColor: colors.primary, borderRadius: 2 }} />
        <Text style={{ color: colors.textMuted, fontSize: 11 }}>Today</Text>
        <View style={{ width: 16, height: 3, backgroundColor: colors.surface2, borderRadius: 2, marginLeft: 12 }} />
        <Text style={{ color: colors.textMuted, fontSize: 11 }}>Past</Text>
      </View>
    </View>
  );
}

function MonthlyLine({
  data,
  goal,
}: {
  data: Array<{ date: string; calories: number }>;
  goal: number;
}) {
  const { colors } = useTheme();
  const max = Math.max(goal, ...data.map((d) => d.calories), 1);
  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 160, gap: 4 }}>
          {data.map((d) => {
            const ratio = d.calories / max;
            return (
              <View
                key={d.date}
                style={{
                  width: 8,
                  height: `${Math.max(2, ratio * 100)}%`,
                  backgroundColor: d.calories > 0 ? colors.primary : colors.surface2,
                  borderRadius: 4,
                }}
              />
            );
          })}
        </View>
      </ScrollView>
      <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 12 }}>
        Last 30 days · goal {goal} kcal/day
      </Text>
    </View>
  );
}

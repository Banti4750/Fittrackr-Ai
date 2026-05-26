import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { WorkoutSession } from '../types';
import { useTheme } from '../theme/useTheme';
import { formatDate, formatDuration, formatVolume } from '../utils/format';
import { useWeightUnit } from '../stores/useAuthStore';

export function WorkoutCard({ session, onPress }: { session: WorkoutSession; onPress?: () => void }) {
  const { colors } = useTheme();
  const unit = useWeightUnit();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: colors.card,
        padding: 14,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 10,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>
          {session.title ?? 'Workout'}
        </Text>
        <Text style={{ color: colors.textMuted, fontSize: 12 }}>{formatDate(session.date)}</Text>
      </View>
      <View style={{ flexDirection: 'row', gap: 14, marginTop: 8 }}>
        <Stat label="Exercises" value={String(session.exercises.length)} />
        <Stat label="Volume" value={formatVolume(session.totalVolume, unit)} />
        <Stat label="Duration" value={formatDuration(session.totalDuration)} />
      </View>
    </Pressable>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View>
      <Text style={{ color: colors.textMuted, fontSize: 11 }}>{label}</Text>
      <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600' }}>{value}</Text>
    </View>
  );
}

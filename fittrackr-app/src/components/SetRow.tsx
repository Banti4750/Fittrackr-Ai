import React from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { WorkoutSet } from '../types';
import { useWeightUnit } from '../stores/useAuthStore';
import { fromKg, toKg, unitLabel } from '../utils/units';
import { PersonalBestBadge } from './PersonalBestBadge';

interface Props {
  index: number;
  set: WorkoutSet;
  previous?: WorkoutSet;
  onChange: (patch: Partial<WorkoutSet>) => void;
  onRemove: () => void;
  onComplete?: () => void;
}

export function SetRow({ index, set, previous, onChange, onRemove, onComplete }: Props) {
  const { colors } = useTheme();
  const unit = useWeightUnit();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: 14,
          backgroundColor: colors.primaryMuted,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ color: colors.primary, fontWeight: '700' }}>{index + 1}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.textMuted, fontSize: 11, marginBottom: 2 }}>
          {previous?.reps != null && previous?.weight != null
            ? `Last: ${fromKg(previous.weight, unit)}${unitLabel(unit)} × ${previous.reps}`
            : ' '}
        </Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TextInput
            placeholder={unitLabel(unit)}
            placeholderTextColor={colors.textMuted}
            keyboardType="decimal-pad"
            value={set.weight != null ? String(fromKg(set.weight, unit)) : ''}
            onChangeText={(t) =>
              onChange({ weight: t === '' ? undefined : toKg(parseFloat(t), unit) })
            }
            style={{
              flex: 1,
              backgroundColor: colors.bg,
              color: colors.text,
              borderRadius: 8,
              paddingHorizontal: 10,
              paddingVertical: 8,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          />
          <TextInput
            placeholder="reps"
            placeholderTextColor={colors.textMuted}
            keyboardType="number-pad"
            value={set.reps != null ? String(set.reps) : ''}
            onChangeText={(t) => onChange({ reps: t === '' ? undefined : parseInt(t, 10) })}
            style={{
              flex: 1,
              backgroundColor: colors.bg,
              color: colors.text,
              borderRadius: 8,
              paddingHorizontal: 10,
              paddingVertical: 8,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          />
        </View>
      </View>
      {set.isPersonalBest ? <PersonalBestBadge /> : null}
      {onComplete && (
        <Pressable
          onPress={onComplete}
          style={{
            backgroundColor: colors.success,
            paddingHorizontal: 10,
            paddingVertical: 8,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: colors.onPrimary, fontWeight: '700' }}>✓</Text>
        </Pressable>
      )}
      <Pressable onPress={onRemove} style={{ padding: 6 }}>
        <Text style={{ color: colors.danger, fontSize: 18 }}>×</Text>
      </Pressable>
    </View>
  );
}

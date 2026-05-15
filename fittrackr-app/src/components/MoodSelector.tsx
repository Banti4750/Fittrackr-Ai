import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Mood } from '../types';
import { useTheme } from '../theme/useTheme';

const MOODS: Array<{ value: Mood; emoji: string; label: string }> = [
  { value: 'great', emoji: '🔥', label: 'Great' },
  { value: 'okay', emoji: '🙂', label: 'Okay' },
  { value: 'tired', emoji: '😩', label: 'Tired' },
];

export function MoodSelector({ value, onChange }: { value?: Mood; onChange: (m: Mood) => void }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: 10 }}>
      {MOODS.map((m) => {
        const selected = value === m.value;
        return (
          <Pressable
            key={m.value}
            onPress={() => onChange(m.value)}
            style={{
              flex: 1,
              backgroundColor: selected ? colors.primaryMuted : colors.card,
              borderColor: selected ? colors.primary : colors.border,
              borderWidth: 1,
              borderRadius: 12,
              padding: 12,
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Text style={{ fontSize: 28 }}>{m.emoji}</Text>
            <Text style={{ color: selected ? colors.primary : colors.text, fontWeight: '600' }}>
              {m.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

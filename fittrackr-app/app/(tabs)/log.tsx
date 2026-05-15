import React from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../src/components/Screen';
import { Button } from '../../src/components/Button';
import { useTheme } from '../../src/theme/useTheme';
import { useWorkoutStore } from '../../src/stores/useWorkoutStore';

const TEMPLATES = [
  { name: 'Push Day', emoji: '💥', sub: 'Chest, shoulders, triceps' },
  { name: 'Pull Day', emoji: '🪢', sub: 'Back & biceps' },
  { name: 'Leg Day', emoji: '🦵', sub: 'Lower body strength' },
  { name: 'Upper Body', emoji: '🏋️', sub: 'Full upper body' },
  { name: 'Full Body', emoji: '⚡', sub: 'Compound focus' },
];

export default function Log() {
  const { colors } = useTheme();
  const router = useRouter();
  const start = useWorkoutStore((s) => s.start);
  const setTitle = useWorkoutStore((s) => s.setTitle);

  const startTemplate = (name: string) => {
    start();
    setTitle(name);
    router.push('/workout/active');
  };

  return (
    <Screen>
      <Text style={{ color: colors.text, fontSize: 24, fontWeight: '800' }}>Log a workout</Text>
      <Text style={{ color: colors.textMuted }}>Start fresh or use a template.</Text>

      <Button
        title="Start blank workout"
        onPress={() => {
          start();
          router.push('/workout/active');
        }}
        style={{ marginTop: 8 }}
      />

      <Text style={{ color: colors.text, fontWeight: '700', marginTop: 12 }}>Templates</Text>
      <View style={{ gap: 10 }}>
        {TEMPLATES.map((t) => (
          <View
            key={t.name}
            style={{
              backgroundColor: colors.card,
              borderRadius: 14,
              padding: 14,
              borderWidth: 1,
              borderColor: colors.border,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <Text style={{ fontSize: 28 }}>{t.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>{t.name}</Text>
              <Text style={{ color: colors.textMuted }}>{t.sub}</Text>
            </View>
            <Button title="Start" variant="secondary" onPress={() => startTemplate(t.name)} />
          </View>
        ))}
      </View>
    </Screen>
  );
}

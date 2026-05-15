import React, { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Screen } from '../../src/components/Screen';
import { Button } from '../../src/components/Button';
import { useTheme } from '../../src/theme/useTheme';
import { Level } from '../../src/types';
import { updateLevel as updateLevelApi } from '../../src/api/users';
import { useAuthStore } from '../../src/stores/useAuthStore';

const LEVELS: Array<{ value: Level; emoji: string; title: string; sub: string }> = [
  { value: 'beginner', emoji: '🌱', title: 'Beginner', sub: 'Less than 6 months of training' },
  { value: 'intermediate', emoji: '💪', title: 'Intermediate', sub: '6 months to 2 years in the gym' },
  { value: 'elite', emoji: '🔥', title: 'Elite', sub: '2+ years, serious about gains' },
];

export default function Onboarding() {
  const router = useRouter();
  const { colors } = useTheme();
  const setUser = useAuthStore((s) => s.setUser);
  const [selected, setSelected] = useState<Level>('beginner');
  const [loading, setLoading] = useState(false);

  const onContinue = async () => {
    setLoading(true);
    try {
      const user = await updateLevelApi(selected);
      setUser(user);
      router.replace('/(tabs)/home');
    } catch (e: any) {
      Alert.alert('Failed to set level', e?.message ?? 'Try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Text style={{ color: colors.text, fontSize: 28, fontWeight: '800' }}>Your experience</Text>
      <Text style={{ color: colors.textMuted }}>
        We'll tailor workouts and AI insights to your level.
      </Text>
      <View style={{ gap: 12, marginTop: 16 }}>
        {LEVELS.map((l) => (
          <LevelCard
            key={l.value}
            level={l}
            selected={selected === l.value}
            onPress={() => setSelected(l.value)}
          />
        ))}
      </View>
      <Button title="Continue" onPress={onContinue} loading={loading} style={{ marginTop: 16 }} />
    </Screen>
  );
}

function LevelCard({
  level,
  selected,
  onPress,
}: {
  level: (typeof LEVELS)[number];
  selected: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const scale = useSharedValue(selected ? 1.02 : 1);
  React.useEffect(() => {
    scale.value = withSpring(selected ? 1.03 : 1, { damping: 14 });
  }, [selected]);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const borderColor =
    level.value === 'beginner' ? colors.beginner : level.value === 'intermediate' ? colors.intermediate : colors.elite;

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={onPress}
        style={{
          backgroundColor: selected ? colors.primaryMuted : colors.card,
          borderColor: selected ? borderColor : colors.border,
          borderWidth: selected ? 2 : 1,
          borderRadius: 16,
          padding: 16,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <Text style={{ fontSize: 36 }}>{level.emoji}</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: '800' }}>{level.title}</Text>
          <Text style={{ color: colors.textMuted, marginTop: 2 }}>{level.sub}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '../theme/useTheme';

export function StreakFlame({ days }: { days: number }) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.08, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={{ alignItems: 'center', gap: 4 }}>
      <Animated.View style={animStyle}>
        <Text style={{ fontSize: 96 }}>🔥</Text>
      </Animated.View>
      <Text style={{ color: colors.flame, fontSize: 36, fontWeight: '800' }}>{days}</Text>
      <Text style={{ color: colors.textMuted, fontSize: 13 }}>day streak</Text>
    </View>
  );
}

import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../theme/useTheme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface Props {
  calories: number;
  goal: number;
  size?: number;
  strokeWidth?: number;
  centerLabel?: string;
}

export function CalorieRing({
  calories,
  goal,
  size = 180,
  strokeWidth = 14,
  centerLabel = 'kcal',
}: Props) {
  const { colors } = useTheme();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const safeGoal = Math.max(1, goal);
  const ratio = Math.max(0, Math.min(1.5, calories / safeGoal));

  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withTiming(ratio, { duration: 900, easing: Easing.out(Easing.cubic) });
  }, [ratio]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - Math.min(1, progress.value)),
  }));

  const remaining = Math.max(0, goal - calories);
  const overGoal = calories >= goal;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Defs>
          <LinearGradient id="ringFill" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={colors.primary} stopOpacity="1" />
            <Stop offset="100%" stopColor={overGoal ? colors.accentOrange : colors.primary} stopOpacity="0.85" />
          </LinearGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.surface2}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#ringFill)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
        />
      </Svg>
      <View style={{ position: 'absolute', alignItems: 'center' }}>
        <Text style={{ color: colors.text, fontSize: size * 0.22, fontWeight: '900', letterSpacing: 0.5 }}>
          {Math.round(calories)}
        </Text>
        <Text style={{ color: colors.textMuted, fontSize: 11, letterSpacing: 1.5, fontWeight: '700' }}>
          {centerLabel.toUpperCase()}
        </Text>
        <Text
          style={{
            color: overGoal ? colors.accentOrange : colors.textMuted,
            fontSize: 11,
            marginTop: 4,
            fontWeight: '600',
          }}
        >
          {overGoal ? `+${calories - goal} over goal` : `${remaining} to goal`}
        </Text>
      </View>
    </View>
  );
}

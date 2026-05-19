import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Logo } from './Logo';
import { useTheme } from '../theme/useTheme';

interface Props {
  visible: boolean;
  onFadedOut?: () => void;
}

export function SplashScreen({ visible, onFadedOut }: Props) {
  const { colors } = useTheme();

  const containerOpacity = useSharedValue(1);
  const dumbbellScale = useSharedValue(0.6);
  const dumbbellOpacity = useSharedValue(0);
  const haloScale = useSharedValue(0.9);
  const haloOpacity = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const logoTranslate = useSharedValue(20);
  const taglineOpacity = useSharedValue(0);
  const dot1 = useSharedValue(0.3);
  const dot2 = useSharedValue(0.3);
  const dot3 = useSharedValue(0.3);

  useEffect(() => {
    dumbbellOpacity.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) });
    dumbbellScale.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.back(1.4)) });

    haloOpacity.value = withDelay(150, withTiming(1, { duration: 700 }));
    haloScale.value = withRepeat(
      withTiming(1.15, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );

    logoOpacity.value = withDelay(350, withTiming(1, { duration: 500 }));
    logoTranslate.value = withDelay(350, withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }));
    taglineOpacity.value = withDelay(700, withTiming(1, { duration: 500 }));

    const dotConfig = { duration: 400, easing: Easing.inOut(Easing.ease) };
    dot1.value = withDelay(900, withRepeat(withTiming(1, dotConfig), -1, true));
    dot2.value = withDelay(1050, withRepeat(withTiming(1, dotConfig), -1, true));
    dot3.value = withDelay(1200, withRepeat(withTiming(1, dotConfig), -1, true));

    return () => {
      cancelAnimation(haloScale);
      cancelAnimation(dot1);
      cancelAnimation(dot2);
      cancelAnimation(dot3);
    };
  }, []);

  useEffect(() => {
    if (visible) return;
    containerOpacity.value = withTiming(0, { duration: 400, easing: Easing.in(Easing.cubic) });
    const t = setTimeout(() => onFadedOut?.(), 450);
    return () => clearTimeout(t);
  }, [visible, onFadedOut]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));
  const dumbbellStyle = useAnimatedStyle(() => ({
    opacity: dumbbellOpacity.value,
    transform: [{ scale: dumbbellScale.value }],
  }));
  const haloStyle = useAnimatedStyle(() => ({
    opacity: haloOpacity.value * 0.55,
    transform: [{ scale: haloScale.value }],
  }));
  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ translateY: logoTranslate.value }],
  }));
  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
  }));
  const dot1Style = useAnimatedStyle(() => ({ opacity: dot1.value }));
  const dot2Style = useAnimatedStyle(() => ({ opacity: dot2.value }));
  const dot3Style = useAnimatedStyle(() => ({ opacity: dot3.value }));

  return (
    <Animated.View
      pointerEvents={visible ? 'auto' : 'none'}
      style={[StyleSheet.absoluteFill, { backgroundColor: colors.bg, zIndex: 1000 }, containerStyle]}
    >
      <LinearGradient
        colors={['rgba(200,255,0,0.10)', 'transparent', 'rgba(255,92,0,0.10)']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.center}>
        <View style={styles.glyphWrap}>
          <Animated.View
            style={[
              styles.halo,
              { backgroundColor: colors.primary, shadowColor: colors.primary },
              haloStyle,
            ]}
          />
          <Animated.View style={dumbbellStyle}>
            <Text style={styles.glyph}>💪</Text>
          </Animated.View>
        </View>

        <Animated.View style={[styles.logoWrap, logoStyle]}>
          <Logo size="xl" />
        </Animated.View>

        <Animated.Text
          style={[
            styles.tagline,
            { color: colors.textMuted },
            taglineStyle,
          ]}
        >
          YOUR AI TRAINING PARTNER
        </Animated.Text>
      </View>

      <View style={styles.dots}>
        <Animated.View style={[styles.dot, { backgroundColor: colors.primary }, dot1Style]} />
        <Animated.View style={[styles.dot, { backgroundColor: colors.primary }, dot2Style]} />
        <Animated.View style={[styles.dot, { backgroundColor: colors.primary }, dot3Style]} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  glyphWrap: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  halo: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    opacity: 0.3,
    shadowOpacity: 0.8,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 0 },
  },
  glyph: {
    fontSize: 92,
  },
  logoWrap: {
    alignItems: 'center',
  },
  tagline: {
    fontSize: 11,
    letterSpacing: 4,
    fontWeight: '700',
    marginTop: 4,
  },
  dots: {
    position: 'absolute',
    bottom: 64,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});

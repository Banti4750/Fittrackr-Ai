import React from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../../src/components/Button';
import { useTheme } from '../../src/theme/useTheme';

export default function Welcome() {
  const router = useRouter();
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <LinearGradient
        colors={['rgba(200,255,0,0.10)', 'rgba(255,92,0,0.06)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 380 }}
      />
      <View style={{ flex: 1, padding: 24, justifyContent: 'space-between' }}>
        <View style={{ marginTop: 96, alignItems: 'center', gap: 16 }}>
          <Text style={{ fontSize: 64 }}>💪</Text>
          <Text
            style={{
              fontSize: 48,
              fontWeight: '900',
              letterSpacing: 1,
              color: colors.text,
            }}
          >
            <Text style={{ color: colors.primary }}>FIT</Text>TRACKR
          </Text>
          <Text
            style={{
              color: colors.textMuted,
              fontSize: 16,
              textAlign: 'center',
              lineHeight: 24,
              maxWidth: 320,
            }}
          >
            Your AI-powered training partner. Track workouts, smash plateaus, see progress.
          </Text>
        </View>
        <View style={{ gap: 12, marginBottom: 40 }}>
          <Button title="Get Started" onPress={() => router.push('/(auth)/register')} />
          <Button
            title="I already have an account"
            variant="ghost"
            onPress={() => router.push('/(auth)/login')}
          />
          <Text
            style={{
              color: colors.textMuted,
              fontSize: 12,
              textAlign: 'center',
              marginTop: 4,
              letterSpacing: 0.5,
            }}
          >
            Free to download · No credit card
          </Text>
        </View>
      </View>
    </View>
  );
}

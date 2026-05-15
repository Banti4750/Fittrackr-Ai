import React from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../../src/components/Button';

export default function Welcome() {
  const router = useRouter();
  return (
    <LinearGradient
      colors={['#3c3489', '#6366f1', '#0f172a']}
      style={{ flex: 1, padding: 24, justifyContent: 'space-between' }}
    >
      <View style={{ marginTop: 80, alignItems: 'center', gap: 12 }}>
        <Text style={{ fontSize: 64 }}>💪</Text>
        <Text style={{ color: '#fff', fontSize: 40, fontWeight: '800' }}>FitTrackr</Text>
        <Text style={{ color: '#cfd1ff', fontSize: 16, textAlign: 'center' }}>
          Your AI-powered training partner. Track workouts, smash plateaus, see progress.
        </Text>
      </View>
      <View style={{ gap: 12, marginBottom: 40 }}>
        <Button title="Get Started" onPress={() => router.push('/(auth)/register')} />
        <Button title="I already have an account" variant="ghost" onPress={() => router.push('/(auth)/login')} />
      </View>
    </LinearGradient>
  );
}

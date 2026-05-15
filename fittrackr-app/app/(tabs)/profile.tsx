import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../src/components/Screen';
import { Button } from '../../src/components/Button';
import { LevelBadge } from '../../src/components/LevelBadge';
import { useTheme } from '../../src/theme/useTheme';
import { useAuthStore } from '../../src/stores/useAuthStore';

export default function Profile() {
  const { colors } = useTheme();
  const router = useRouter();
  const { user, signOut } = useAuthStore();

  return (
    <Screen>
      <View style={{ alignItems: 'center', gap: 8, marginTop: 12 }}>
        <View
          style={{
            width: 96,
            height: 96,
            borderRadius: 48,
            backgroundColor: colors.primaryMuted,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 40 }}>{user?.name?.[0]?.toUpperCase() ?? '👤'}</Text>
        </View>
        <Text style={{ color: colors.text, fontSize: 22, fontWeight: '800' }}>{user?.name}</Text>
        <Text style={{ color: colors.textMuted }}>{user?.email}</Text>
        {user?.level ? <LevelBadge level={user.level} /> : null}
      </View>

      <Row label="Streak" value={`${user?.streakCount ?? 0} days 🔥`} onPress={() => router.push('/streaks')} />
      <Row label="AI Insights" value="View →" onPress={() => router.push('/insights')} />
      <Row label="Body Stats" value="View →" onPress={() => router.push('/bodystats')} />
      <Row
        label="Change level"
        value={user?.level ?? '—'}
        onPress={() => router.push('/(auth)/onboarding')}
      />

      <Button title="Sign out" variant="danger" onPress={signOut} style={{ marginTop: 16 }} />
    </Screen>
  );
}

function Row({ label, value, onPress }: { label: string; value: string; onPress?: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: colors.border,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <Text style={{ color: colors.text, fontWeight: '600' }}>{label}</Text>
      <Text style={{ color: colors.textMuted }}>{value}</Text>
    </Pressable>
  );
}

import React from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../src/components/Screen';
import { Button } from '../../src/components/Button';
import { LevelBadge } from '../../src/components/LevelBadge';
import { useTheme } from '../../src/theme/useTheme';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { updateProfile } from '../../src/api/users';
import { WeightUnit } from '../../src/types';

export default function Profile() {
  const { colors } = useTheme();
  const router = useRouter();
  const { user, signOut, setUser } = useAuthStore();
  const unit: WeightUnit = user?.weightUnit ?? 'kg';

  const changeUnit = async (next: WeightUnit) => {
    if (!user || next === unit) return;
    const previous = user;
    setUser({ ...user, weightUnit: next }); // optimistic
    try {
      const fresh = await updateProfile({ weightUnit: next });
      setUser(fresh);
    } catch (e: any) {
      setUser(previous); // revert
      Alert.alert('Update failed', e?.response?.data?.error ?? e?.message ?? 'Unknown error');
    }
  };

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

      <View
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
        <Text style={{ color: colors.text, fontWeight: '600' }}>Weight unit</Text>
        <View style={{ flexDirection: 'row', backgroundColor: colors.bg, borderRadius: 999, padding: 3 }}>
          {(['kg', 'lbs'] as WeightUnit[]).map((u) => {
            const active = unit === u;
            return (
              <Pressable
                key={u}
                onPress={() => changeUnit(u)}
                style={{
                  paddingHorizontal: 18,
                  paddingVertical: 6,
                  borderRadius: 999,
                  backgroundColor: active ? colors.primary : 'transparent',
                }}
              >
                <Text style={{ color: active ? colors.onPrimary : colors.textMuted, fontWeight: '700' }}>
                  {u === 'kg' ? 'kg' : 'lb'}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

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

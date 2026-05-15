import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../src/components/Screen';
import { Button } from '../../src/components/Button';
import { useTheme } from '../../src/theme/useTheme';
import { useAuthStore } from '../../src/stores/useAuthStore';

export default function Login() {
  const router = useRouter();
  const { colors } = useTheme();
  const signIn = useAuthStore((s) => s.signIn);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!email || !password) return Alert.alert('Missing fields', 'Email and password are required');
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      router.replace('/(tabs)/home');
    } catch (e: any) {
      Alert.alert('Login failed', e?.response?.data?.error ?? e?.message ?? 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen>
        <Text style={{ color: colors.text, fontSize: 28, fontWeight: '800' }}>Welcome back</Text>
        <Text style={{ color: colors.textMuted }}>Sign in to keep your streak alive 🔥</Text>
        <View style={{ marginTop: 16, gap: 10 }}>
          <Field label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" />
          <Field label="Password" value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry />
        </View>
        <Button title="Sign in" onPress={onSubmit} loading={loading} style={{ marginTop: 16 }} />
        <Button title="Need an account? Sign up" variant="ghost" onPress={() => router.push('/(auth)/register')} />
      </Screen>
    </KeyboardAvoidingView>
  );
}

function Field(props: React.ComponentProps<typeof TextInput> & { label: string }) {
  const { colors } = useTheme();
  const { label, ...rest } = props;
  return (
    <View style={{ gap: 4 }}>
      <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: '600' }}>{label.toUpperCase()}</Text>
      <TextInput
        autoCapitalize="none"
        placeholderTextColor={colors.textMuted}
        {...rest}
        style={{
          backgroundColor: colors.card,
          color: colors.text,
          borderRadius: 10,
          paddingHorizontal: 12,
          paddingVertical: 12,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      />
    </View>
  );
}

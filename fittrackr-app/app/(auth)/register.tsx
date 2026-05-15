import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../src/components/Screen';
import { Button } from '../../src/components/Button';
import { useTheme } from '../../src/theme/useTheme';
import { useAuthStore } from '../../src/stores/useAuthStore';

export default function Register() {
  const router = useRouter();
  const { colors } = useTheme();
  const signUp = useAuthStore((s) => s.signUp);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!name || !email || !password) return Alert.alert('Missing fields', 'All fields are required');
    if (password.length < 6) return Alert.alert('Password too short', 'Use at least 6 characters');
    setLoading(true);
    try {
      await signUp({ name: name.trim(), email: email.trim(), password });
      router.replace('/(auth)/onboarding');
    } catch (e: any) {
      Alert.alert('Sign up failed', e?.response?.data?.error ?? e?.message ?? 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen>
        <Text style={{ color: colors.text, fontSize: 28, fontWeight: '800' }}>Create account</Text>
        <Text style={{ color: colors.textMuted }}>Start tracking smarter today.</Text>
        <View style={{ marginTop: 16, gap: 10 }}>
          <Field label="Name" value={name} onChangeText={setName} placeholder="Alex Trainer" />
          <Field label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" />
          <Field label="Password" value={password} onChangeText={setPassword} placeholder="At least 6 characters" secureTextEntry />
        </View>
        <Button title="Create account" onPress={onSubmit} loading={loading} style={{ marginTop: 16 }} />
        <Button title="I already have an account" variant="ghost" onPress={() => router.replace('/(auth)/login')} />
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

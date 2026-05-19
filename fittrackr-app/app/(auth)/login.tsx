import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { z } from 'zod';
import { Screen } from '../../src/components/Screen';
import { Button } from '../../src/components/Button';
import { useTheme } from '../../src/theme/useTheme';
import { useAuthStore } from '../../src/stores/useAuthStore';

const loginSchema = z.object({
  email: z.string({
    required_error: "Username is required"
  })
    .email('Invalid email formate')
    .min(5, "Username must contain at least 5 characters")
    .max(50, "Username can have max 50 characters"),

  password: z.string({
    required_error: "Password is required"
  })
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number")
    .min(5, "Password must contain at least 5 characters")
    .max(50, "Password can have max 50 characters"),
});

type FormErrors = Partial<Record<'email' | 'password', string>>;

export default function Login() {
  const router = useRouter();
  const { colors } = useTheme();
  const signIn = useAuthStore((s) => s.signIn);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const onSubmit = async () => {
    const result = loginSchema.safeParse({ email: email.trim(), password });

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      });
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      await signIn(result.data.email, result.data.password);
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
          <Field
            label="Email"
            value={email}
            onChangeText={(t) => { setEmail(t); setErrors((e) => ({ ...e, email: undefined })); }}
            placeholder="you@example.com"
            keyboardType="email-address"
            error={errors.email}
          />
          <Field
            label="Password"
            value={password}
            onChangeText={(t) => { setPassword(t); setErrors((e) => ({ ...e, password: undefined })); }}
            placeholder="••••••••"
            secureTextEntry
            error={errors.password}
          />
        </View>

        <Button title="Sign in" onPress={onSubmit} loading={loading} style={{ marginTop: 16 }} />
        <Button title="Need an account? Sign up" variant="ghost" onPress={() => router.push('/(auth)/register')} />
      </Screen>
    </KeyboardAvoidingView>
  );
}

function Field(props: React.ComponentProps<typeof TextInput> & { label: string; error?: string }) {
  const { colors } = useTheme();
  const { label, error, secureTextEntry, ...rest } = props;
  const [revealed, setRevealed] = useState(false);
  const isPassword = !!secureTextEntry;
  const hasToggle = isPassword;

  return (
    <View style={{ gap: 4 }}>
      <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: '600' }}>
        {label.toUpperCase()}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.card,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: error ? '#ef4444' : colors.border,
        }}
      >
        <TextInput
          autoCapitalize="none"
          placeholderTextColor={colors.textMuted}
          secureTextEntry={isPassword && !revealed}
          {...rest}
          style={{
            flex: 1,
            color: colors.text,
            paddingHorizontal: 12,
            paddingVertical: 12,
            paddingRight: hasToggle ? 4 : 12,
          }}
        />
        {hasToggle && (
          <Pressable
            onPress={() => setRevealed((v) => !v)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={revealed ? 'Hide password' : 'Show password'}
            style={({ pressed }) => ({
              paddingHorizontal: 12,
              paddingVertical: 12,
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <Text style={{ fontSize: 18 }}>{revealed ? '🙈' : '👁'}</Text>
          </Pressable>
        )}
      </View>
      {error && (
        <Text style={{ color: '#ef4444', fontSize: 12, marginTop: 2 }}>
          {error}
        </Text>
      )}
    </View>
  );
}
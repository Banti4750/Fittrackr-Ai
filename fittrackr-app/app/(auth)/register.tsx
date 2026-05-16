import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Text, TextInput, View ,Alert} from 'react-native';
import { useRouter } from 'expo-router';
import { z } from 'zod';
import { Screen } from '../../src/components/Screen';
import { Button } from '../../src/components/Button';
import { useTheme } from '../../src/theme/useTheme';
import { useAuthStore } from '../../src/stores/useAuthStore';

const registerSchema = z.object({
  name: z.string({
    required_error: "First name is required"
  }).min(3, "name must contain at least 3 characters")
    .max(50, "name must contain at most 50 characters"),

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

  level: z.enum(['beginner', 'intermediate', 'elite']).optional(),
});

type FormErrors = Partial<Record<'name' | 'email' | 'password', string>>;

export default function Register() {
  const router = useRouter();
  const { colors } = useTheme();
  const signUp = useAuthStore((s) => s.signUp);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const onSubmit = async () => {
    // Run Zod validation
    const result = registerSchema.safeParse({ name: name.trim(), email: email.trim(), password });

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        name: fieldErrors.name?.[0],
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      });
      return;
    }

    // Clear errors and submit
    setErrors({});
    setLoading(true);
    try {
      await signUp(result.data);
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
          <Field
            label="Name"
            value={name}
            onChangeText={(t) => { setName(t); setErrors((e) => ({ ...e, name: undefined })); }}
            placeholder="Alex Trainer"
            error={errors.name}
          />
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
            placeholder="Min 5 chars, 1 uppercase, 1 number"
            secureTextEntry
            error={errors.password}
          />
        </View>

        <Button title="Create account" onPress={onSubmit} loading={loading} style={{ marginTop: 16 }} />
        <Button title="I already have an account" variant="ghost" onPress={() => router.replace('/(auth)/login')} />
      </Screen>
    </KeyboardAvoidingView>
  );
}

function Field(props: React.ComponentProps<typeof TextInput> & { label: string; error?: string }) {
  const { colors } = useTheme();
  const { label, error, ...rest } = props;

  return (
    <View style={{ gap: 4 }}>
      <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: '600' }}>
        {label.toUpperCase()}
      </Text>
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
          // Red border when there's an error
          borderColor: error ? '#ef4444' : colors.border,
        }}
      />
      {/* Inline error message */}
      {error && (
        <Text style={{ color: '#ef4444', fontSize: 12, marginTop: 2 }}>
          {error}
        </Text>
      )}
    </View>
  );
}
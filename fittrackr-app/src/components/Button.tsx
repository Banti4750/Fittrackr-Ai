import React from 'react';
import { ActivityIndicator, Pressable, Text, ViewStyle } from 'react-native';
import { useTheme } from '../theme/useTheme';

interface Props {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({ title, onPress, variant = 'primary', loading, disabled, style }: Props) {
  const { colors } = useTheme();
  const styles: Record<string, { bg: string; fg: string; border: string }> = {
    primary: { bg: colors.primary, fg: '#ffffff', border: colors.primary },
    secondary: { bg: colors.card, fg: colors.primary, border: colors.primary },
    ghost: { bg: 'transparent', fg: colors.primary, border: 'transparent' },
    danger: { bg: colors.danger, fg: '#ffffff', border: colors.danger },
  };
  const s = styles[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        {
          backgroundColor: s.bg,
          borderColor: s.border,
          borderWidth: 1,
          borderRadius: 12,
          paddingVertical: 14,
          paddingHorizontal: 16,
          alignItems: 'center',
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={s.fg} />
      ) : (
        <Text style={{ color: s.fg, fontWeight: '700', fontSize: 16 }}>{title}</Text>
      )}
    </Pressable>
  );
}

import React from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Screen } from '../../src/components/Screen';
import { Button } from '../../src/components/Button';
import { useTheme } from '../../src/theme/useTheme';
import { useWorkoutStore } from '../../src/stores/useWorkoutStore';
import { deleteTemplate, listTemplates } from '../../src/api/templates';
import { WorkoutTemplate } from '../../src/types';

export default function Log() {
  const { colors } = useTheme();
  const router = useRouter();
  const qc = useQueryClient();
  const start = useWorkoutStore((s) => s.start);
  const loadFromTemplate = useWorkoutStore((s) => s.loadFromTemplate);

  const templates = useQuery({ queryKey: ['templates'], queryFn: listTemplates });
  const del = useMutation({
    mutationFn: deleteTemplate,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['templates'] }),
  });

  const startTemplate = (t: WorkoutTemplate) => {
    loadFromTemplate(t);
    router.push('/workout/active');
  };

  const confirmDelete = (t: WorkoutTemplate) => {
    Alert.alert('Delete template?', t.name, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => del.mutate(t._id) },
    ]);
  };

  return (
    <Screen>
      <Text style={{ color: colors.text, fontSize: 24, fontWeight: '800' }}>Log a workout</Text>
      <Text style={{ color: colors.textMuted }}>Start fresh or use a saved template.</Text>

      <Button
        title="Start blank workout"
        onPress={() => {
          start();
          router.push('/workout/active');
        }}
        style={{ marginTop: 8 }}
      />

      <Text style={{ color: colors.text, fontWeight: '700', marginTop: 12 }}>Your templates</Text>

      {templates.isLoading ? (
        <Text style={{ color: colors.textMuted }}>Loading…</Text>
      ) : (templates.data ?? []).length === 0 ? (
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 14,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text style={{ color: colors.textMuted, lineHeight: 20 }}>
            No templates yet. Build a workout, then tap{' '}
            <Text style={{ color: colors.text, fontWeight: '700' }}>Save as template</Text> on the
            active workout screen to reuse it next time.
          </Text>
        </View>
      ) : (
        <View style={{ gap: 10 }}>
          {(templates.data ?? []).map((t) => (
            <View
              key={t._id}
              style={{
                backgroundColor: colors.card,
                borderRadius: 14,
                padding: 14,
                borderWidth: 1,
                borderColor: colors.border,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>{t.name}</Text>
                <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                  {t.exercises.length} exercise{t.exercises.length === 1 ? '' : 's'} ·{' '}
                  {t.exercises.reduce((n, e) => n + e.sets.length, 0)} sets
                </Text>
              </View>
              <Pressable onPress={() => confirmDelete(t)} hitSlop={8}>
                <Text style={{ color: colors.danger, fontSize: 18, paddingHorizontal: 4 }}>×</Text>
              </Pressable>
              <Button title="Start" variant="secondary" onPress={() => startTemplate(t)} />
            </View>
          ))}
        </View>
      )}
    </Screen>
  );
}

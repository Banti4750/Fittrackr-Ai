import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Screen } from '../../src/components/Screen';
import { SetRow } from '../../src/components/SetRow';
import { RestTimer } from '../../src/components/RestTimer';
import { MoodSelector } from '../../src/components/MoodSelector';
import { Button } from '../../src/components/Button';
import { useTheme } from '../../src/theme/useTheme';
import { useWorkoutStore } from '../../src/stores/useWorkoutStore';
import { createWorkout } from '../../src/api/workouts';
import { listExercises } from '../../src/api/exercises';
import { Exercise } from '../../src/types';

export default function ActiveWorkout() {
  const router = useRouter();
  const qc = useQueryClient();
  const { colors } = useTheme();
  const {
    startedAt,
    title,
    exercises,
    mood,
    notes,
    setTitle,
    setMood,
    setNotes,
    addExercise,
    removeExercise,
    addSet,
    updateSet,
    removeSet,
    reset,
  } = useWorkoutStore();

  const [restingFor, setRestingFor] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    if (!startedAt) useWorkoutStore.getState().start();
  }, [startedAt]);

  const create = useMutation({
    mutationFn: createWorkout,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workouts'] });
      qc.invalidateQueries({ queryKey: ['streak'] });
      qc.invalidateQueries({ queryKey: ['volume'] });
      qc.invalidateQueries({ queryKey: ['prs'] });
      reset();
      router.replace('/(tabs)/home');
    },
    onError: (e: any) => Alert.alert('Save failed', e?.response?.data?.error ?? e?.message ?? 'Unknown error'),
  });

  const elapsedMin = useMemo(() => {
    if (!startedAt) return 0;
    return Math.round((Date.now() - startedAt) / 60_000);
  }, [startedAt, exercises]);

  const onSave = () => {
    if (exercises.length === 0) return Alert.alert('Add at least one exercise');
    create.mutate({
      title: title || undefined,
      mood,
      notes: notes || undefined,
      totalDuration: elapsedMin,
      exercises: exercises.map((ex) => ({
        exerciseId: ex.exercise._id,
        sets: ex.sets.filter((s) => s.reps != null || s.weight != null || s.duration != null),
      })),
    });
  };

  return (
    <Screen>
      <TextInput
        placeholder="Workout title (e.g. Push Day)"
        placeholderTextColor={colors.textMuted}
        value={title}
        onChangeText={setTitle}
        style={{
          backgroundColor: colors.card,
          color: colors.text,
          padding: 10,
          borderRadius: 10,
          fontSize: 16,
          fontWeight: '700',
          borderWidth: 1,
          borderColor: colors.border,
        }}
      />
      <Text style={{ color: colors.textMuted }}>Elapsed: {elapsedMin} min · {exercises.length} exercise(s)</Text>

      {exercises.map((ex) => (
        <View
          key={ex.exercise._id}
          style={{
            backgroundColor: colors.card,
            padding: 12,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: colors.border,
            gap: 6,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>{ex.exercise.name}</Text>
            <Pressable onPress={() => removeExercise(ex.exercise._id)}>
              <Text style={{ color: colors.danger, fontSize: 18 }}>×</Text>
            </Pressable>
          </View>
          {ex.sets.map((s, i) => (
            <SetRow
              key={i}
              index={i}
              set={s}
              previous={i > 0 ? ex.sets[i - 1] : undefined}
              onChange={(p) => updateSet(ex.exercise._id, i, p)}
              onRemove={() => removeSet(ex.exercise._id, i)}
              onComplete={() => setRestingFor(`${ex.exercise._id}-${i}`)}
            />
          ))}
          {restingFor?.startsWith(ex.exercise._id) && (
            <RestTimer active onComplete={() => setRestingFor(null)} />
          )}
          <Button title="+ Add set" variant="ghost" onPress={() => addSet(ex.exercise._id)} />
        </View>
      ))}

      <Button title="+ Add exercise" variant="secondary" onPress={() => setPickerOpen(true)} />

      <Text style={{ color: colors.text, fontWeight: '700', marginTop: 8 }}>How did it feel?</Text>
      <MoodSelector value={mood} onChange={setMood} />

      <TextInput
        placeholder="Notes (optional)"
        placeholderTextColor={colors.textMuted}
        value={notes}
        onChangeText={setNotes}
        multiline
        style={{
          backgroundColor: colors.card,
          color: colors.text,
          padding: 10,
          borderRadius: 10,
          minHeight: 80,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      />

      <Button title="Save workout" onPress={onSave} loading={create.isPending} />

      <ExercisePicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={(e) => {
          addExercise(e);
          setPickerOpen(false);
        }}
      />
    </Screen>
  );
}

function ExercisePicker({
  open,
  onClose,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (e: Exercise) => void;
}) {
  const { colors } = useTheme();
  const [search, setSearch] = useState('');
  const q = useQuery({
    queryKey: ['picker-exercises', search],
    queryFn: () => listExercises({ search: search || undefined }),
    enabled: open,
  });
  return (
    <Modal visible={open} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: colors.bg, padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
          <Text style={{ color: colors.text, fontSize: 20, fontWeight: '800' }}>Pick exercise</Text>
          <Pressable onPress={onClose}>
            <Text style={{ color: colors.danger, fontSize: 18 }}>Close</Text>
          </Pressable>
        </View>
        <TextInput
          placeholder="Search exercises..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
          style={{
            backgroundColor: colors.card,
            color: colors.text,
            padding: 10,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: colors.border,
            marginBottom: 8,
          }}
        />
        <ScrollView keyboardShouldPersistTaps="handled">
          {(q.data ?? []).map((e) => (
            <Pressable
              key={e._id}
              onPress={() => onPick(e)}
              style={{
                backgroundColor: colors.card,
                padding: 12,
                borderRadius: 10,
                marginBottom: 6,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text style={{ color: colors.text, fontWeight: '700' }}>{e.name}</Text>
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                {e.muscleGroup.primary} · {e.difficulty}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

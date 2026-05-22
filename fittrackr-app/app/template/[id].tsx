import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Screen } from '../../src/components/Screen';
import { Button } from '../../src/components/Button';
import { useTheme } from '../../src/theme/useTheme';
import { listTemplates, updateTemplate } from '../../src/api/templates';
import { listExercises } from '../../src/api/exercises';
import { Exercise, Location, WorkoutTemplate } from '../../src/types';

interface DraftRow {
  exercise: Exercise;
  setCount: number;
  reps?: number;
  weight?: number;
  duration?: number;
}

const PICKER_MUSCLES = ['all', 'chest', 'back', 'legs', 'quads', 'shoulders', 'biceps', 'triceps', 'core', 'cardio'];
const PICKER_LOCATIONS: Array<{ value: Location | 'all'; label: string }> = [
  { value: 'all', label: 'Anywhere' },
  { value: 'home', label: '🏠 Home' },
  { value: 'gym', label: '🏋️ Gym' },
];

export default function EditTemplate() {
  const router = useRouter();
  const qc = useQueryClient();
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();

  const templates = useQuery({ queryKey: ['templates'], queryFn: listTemplates });
  const original: WorkoutTemplate | undefined = templates.data?.find((t) => t._id === id);

  const [name, setName] = useState('');
  const [rows, setRows] = useState<DraftRow[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    if (!original) return;
    setName(original.name);
    setRows(
      original.exercises
        .map((te): DraftRow | null => {
          const ex = te.exerciseId;
          if (typeof ex === 'string' || !ex || !('_id' in ex)) return null;
          const first = te.sets[0];
          return {
            exercise: ex,
            setCount: te.sets.length || 1,
            reps: first?.reps,
            weight: first?.weight,
            duration: first?.duration,
          };
        })
        .filter((x): x is DraftRow => x !== null)
    );
  }, [original]);

  const save = useMutation({
    mutationFn: () =>
      updateTemplate(id, {
        name: name.trim(),
        exercises: rows.map((r) => ({
          exerciseId: r.exercise._id,
          sets: Array.from({ length: Math.max(1, r.setCount) }, () => ({
            reps: r.reps,
            weight: r.weight,
            duration: r.duration,
          })),
        })),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['templates'] });
      router.back();
    },
    onError: (e: any) =>
      Alert.alert('Save failed', e?.response?.data?.error ?? e?.message ?? 'Unknown error'),
  });

  const onSave = () => {
    if (!name.trim()) return Alert.alert('Name required');
    if (rows.length === 0) return Alert.alert('Add at least one exercise');
    save.mutate();
  };

  const addExercise = (e: Exercise) => {
    if (rows.some((r) => r.exercise._id === e._id)) {
      setPickerOpen(false);
      return;
    }
    setRows([...rows, { exercise: e, setCount: 3, reps: 8 }]);
    setPickerOpen(false);
  };

  if (templates.isLoading) {
    return (
      <Screen>
        <Text style={{ color: colors.textMuted }}>Loading…</Text>
      </Screen>
    );
  }
  if (!original) {
    return (
      <Screen>
        <Text style={{ color: colors.text, fontWeight: '700' }}>Template not found</Text>
        <Button title="Back" variant="ghost" onPress={() => router.back()} />
      </Screen>
    );
  }

  return (
    <Screen>
      <Text style={{ color: colors.text, fontSize: 22, fontWeight: '800' }}>Edit template</Text>

      <TextInput
        placeholder="Template name"
        placeholderTextColor={colors.textMuted}
        value={name}
        onChangeText={setName}
        style={{
          backgroundColor: colors.card,
          color: colors.text,
          padding: 12,
          borderRadius: 10,
          fontSize: 16,
          fontWeight: '700',
          borderWidth: 1,
          borderColor: colors.border,
        }}
      />

      {rows.length === 0 ? (
        <Text style={{ color: colors.textMuted }}>No exercises yet. Add one below.</Text>
      ) : (
        rows.map((r, idx) => (
          <View
            key={r.exercise._id}
            style={{
              backgroundColor: colors.card,
              padding: 12,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: colors.border,
              gap: 8,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontSize: 15, fontWeight: '700' }}>
                  {r.exercise.name}
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 11 }}>
                  {r.exercise.muscleGroup.primary}
                </Text>
              </View>
              <Pressable onPress={() => setRows(rows.filter((_, i) => i !== idx))} hitSlop={8}>
                <Text style={{ color: colors.danger, fontSize: 20, paddingHorizontal: 6 }}>×</Text>
              </Pressable>
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <NumField
                label="Sets"
                value={r.setCount}
                min={1}
                onChange={(v) =>
                  setRows(
                    rows.map((x, i) => (i === idx ? { ...x, setCount: Math.max(1, v ?? 1) } : x))
                  )
                }
              />
              <NumField
                label="Reps"
                value={r.reps}
                onChange={(v) =>
                  setRows(rows.map((x, i) => (i === idx ? { ...x, reps: v } : x)))
                }
              />
              <NumField
                label="Weight (kg)"
                value={r.weight}
                onChange={(v) =>
                  setRows(rows.map((x, i) => (i === idx ? { ...x, weight: v } : x)))
                }
              />
            </View>
          </View>
        ))
      )}

      <Button title="+ Add exercise" variant="secondary" onPress={() => setPickerOpen(true)} />

      <View style={{ flexDirection: 'row', gap: 8 }}>
        <View style={{ flex: 1 }}>
          <Button title="Cancel" variant="ghost" onPress={() => router.back()} />
        </View>
        <View style={{ flex: 2 }}>
          <Button title="Save changes" onPress={onSave} loading={save.isPending} />
        </View>
      </View>

      <ExercisePicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={addExercise}
      />
    </Screen>
  );
}

function NumField({
  label,
  value,
  min,
  onChange,
}: {
  label: string;
  value?: number;
  min?: number;
  onChange: (v: number | undefined) => void;
}) {
  const { colors } = useTheme();
  const [text, setText] = useState(value != null ? String(value) : '');
  useEffect(() => {
    setText(value != null ? String(value) : '');
  }, [value]);
  return (
    <View style={{ flex: 1, gap: 2 }}>
      <Text style={{ color: colors.textMuted, fontSize: 11 }}>{label}</Text>
      <TextInput
        keyboardType="decimal-pad"
        value={text}
        onChangeText={(t) => {
          setText(t);
          if (t.trim() === '') return onChange(undefined);
          const n = parseFloat(t);
          if (!isNaN(n) && (min == null || n >= min)) onChange(n);
        }}
        style={{
          backgroundColor: colors.bg,
          color: colors.text,
          borderRadius: 8,
          paddingHorizontal: 10,
          paddingVertical: 8,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      />
    </View>
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
  const [muscle, setMuscle] = useState('all');
  const [location, setLocation] = useState<Location | 'all'>('all');
  const q = useQuery({
    queryKey: ['picker-exercises', search, muscle, location],
    queryFn: () => listExercises({ search: search || undefined, muscle, location }),
    enabled: open,
  });
  const data = useMemo(() => q.data ?? [], [q.data]);

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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
          style={{ flexGrow: 0, marginBottom: 8 }}
        >
          {PICKER_MUSCLES.map((m) => {
            const active = muscle === m;
            return (
              <Pressable
                key={m}
                onPress={() => setMuscle(m)}
                style={{
                  backgroundColor: active ? colors.primary : colors.card,
                  borderColor: active ? colors.primary : colors.border,
                  borderWidth: 1,
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 999,
                }}
              >
                <Text
                  style={{
                    color: active ? '#fff' : colors.text,
                    fontWeight: '600',
                    textTransform: 'capitalize',
                  }}
                >
                  {m}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
          style={{ flexGrow: 0, marginBottom: 8 }}
        >
          {PICKER_LOCATIONS.map((loc) => {
            const active = location === loc.value;
            return (
              <Pressable
                key={loc.value}
                onPress={() => setLocation(loc.value)}
                style={{
                  backgroundColor: active ? colors.primary : colors.card,
                  borderColor: active ? colors.primary : colors.border,
                  borderWidth: 1,
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 999,
                }}
              >
                <Text style={{ color: active ? '#fff' : colors.text, fontWeight: '600' }}>
                  {loc.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
        <ScrollView keyboardShouldPersistTaps="handled">
          {q.isLoading ? (
            <Text style={{ color: colors.textMuted }}>Loading…</Text>
          ) : data.length ? (
            data.map((e) => (
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
            ))
          ) : (
            <Text style={{ color: colors.textMuted }}>No exercises match.</Text>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

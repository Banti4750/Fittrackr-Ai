import React, { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Screen } from '../../src/components/Screen';
import { ExerciseCard } from '../../src/components/ExerciseCard';
import { useTheme } from '../../src/theme/useTheme';
import { listExercises } from '../../src/api/exercises';
import { Level } from '../../src/types';

const MUSCLES = ['all', 'chest', 'back', 'legs', 'quads', 'shoulders', 'biceps', 'triceps', 'core', 'cardio'];
const LEVELS: Array<Level | 'all'> = ['all', 'beginner', 'intermediate', 'elite'];

export default function ExercisesTab() {
  const router = useRouter();
  const { colors } = useTheme();
  const [muscle, setMuscle] = useState('all');
  const [level, setLevel] = useState<Level | 'all'>('all');
  const [search, setSearch] = useState('');

  const q = useQuery({
    queryKey: ['exercises', muscle, level, search],
    queryFn: () => listExercises({ muscle, level, search: search || undefined }),
  });

  return (
    <Screen>
      <Text style={{ color: colors.text, fontSize: 24, fontWeight: '800' }}>Exercise Library</Text>
      <TextInput
        placeholder="Search exercises..."
        placeholderTextColor={colors.textMuted}
        value={search}
        onChangeText={setSearch}
        style={{
          backgroundColor: colors.card,
          color: colors.text,
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingVertical: 10,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {MUSCLES.map((m) => (
          <Chip key={m} label={m} active={muscle === m} onPress={() => setMuscle(m)} />
        ))}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {LEVELS.map((l) => (
          <Chip key={l} label={l} active={level === l} onPress={() => setLevel(l)} />
        ))}
      </ScrollView>
      <View>
        {q.isLoading ? (
          <Text style={{ color: colors.textMuted }}>Loading…</Text>
        ) : q.data?.length ? (
          q.data.map((e) => (
            <ExerciseCard key={e._id} exercise={e} onPress={() => router.push(`/exercise/${e._id}`)} />
          ))
        ) : (
          <Text style={{ color: colors.textMuted }}>No exercises match.</Text>
        )}
      </View>
    </Screen>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
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
        {label}
      </Text>
    </Pressable>
  );
}

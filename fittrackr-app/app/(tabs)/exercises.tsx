import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Screen } from '../../src/components/Screen';
import { ExerciseCard } from '../../src/components/ExerciseCard';
import { useTheme } from '../../src/theme/useTheme';
import { listExercises } from '../../src/api/exercises';
import { Exercise, Level } from '../../src/types';

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

  const renderItem = useCallback(
    ({ item }: { item: Exercise }) => (
      <ExerciseCard exercise={item} onPress={() => router.push(`/exercise/${item._id}`)} />
    ),
    [router],
  );

  const Header = (
    <View style={{ gap: 12, paddingBottom: 4 }}>
      <Text style={{ color: colors.text, fontSize: 28, fontWeight: '800', letterSpacing: 0.3 }}>
        Exercise Library
      </Text>
      <TextInput
        placeholder="Search exercises..."
        placeholderTextColor={colors.textMuted}
        value={search}
        onChangeText={setSearch}
        style={{
          backgroundColor: colors.card,
          color: colors.text,
          borderRadius: 12,
          paddingHorizontal: 14,
          paddingVertical: 12,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 8 }}>
        {MUSCLES.map((m) => (
          <Chip key={m} label={m} active={muscle === m} onPress={() => setMuscle(m)} />
        ))}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 8 }}>
        {LEVELS.map((l) => (
          <Chip key={l} label={l} active={level === l} onPress={() => setLevel(l)} />
        ))}
      </ScrollView>
      {q.data ? (
        <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>
          {q.data.length} {q.data.length === 1 ? 'exercise' : 'exercises'}
        </Text>
      ) : null}
    </View>
  );

  return (
    <Screen scroll={false} style={{ flex: 1 }}>
      <FlatList
        data={q.data ?? []}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        ListHeaderComponent={Header}
        ListEmptyComponent={
          q.isLoading ? (
            <View style={{ paddingVertical: 32, alignItems: 'center' }}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : (
            <Text style={{ color: colors.textMuted, paddingVertical: 16, textAlign: 'center' }}>
              No exercises match.
            </Text>
          )
        }
        contentContainerStyle={{ paddingBottom: 96, gap: 12 }}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={7}
      />
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
          color: active ? colors.onPrimary : colors.text,
          fontWeight: '700',
          textTransform: 'capitalize',
          letterSpacing: 0.3,
          fontSize: 13,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

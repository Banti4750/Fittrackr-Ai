import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { Exercise } from '../types';
import { useTheme } from '../theme/useTheme';
import { LevelBadge } from './LevelBadge';

export function ExerciseCard({
  exercise,
  onPress,
}: {
  exercise: Exercise;
  onPress?: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: colors.card,
        borderRadius: 14,
        overflow: 'hidden',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.border,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <Image source={{ uri: exercise.imageUrl }} style={{ width: '100%', height: 140 }} resizeMode="cover" />
      <View style={{ padding: 12, gap: 6 }}>
        <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }} numberOfLines={1}>
          {exercise.name}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <View
            style={{
              backgroundColor: colors.primaryMuted,
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 999,
            }}
          >
            <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '600' }}>
              {exercise.muscleGroup.primary}
            </Text>
          </View>
          <LevelBadge level={exercise.difficulty} />
        </View>
      </View>
    </Pressable>
  );
}

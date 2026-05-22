import React, { useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Exercise } from '../types';
import { useTheme } from '../theme/useTheme';
import { LevelBadge } from './LevelBadge';

const MUSCLE_TINT: Record<string, [string, string]> = {
  chest:     ['#2a1300', '#FF5C00'],
  back:      ['#0E1E3A', '#60A5FA'],
  legs:      ['#1F2900', '#C8FF00'],
  quads:     ['#1F2900', '#C8FF00'],
  shoulders: ['#2a1300', '#FF8A3D'],
  biceps:    ['#0E2E18', '#4ADE80'],
  triceps:   ['#0E2E18', '#4ADE80'],
  core:      ['#2D0A0A', '#FF4D4D'],
  cardio:    ['#2a1300', '#FF5C00'],
  default:   ['#1A1A1A', '#888888'],
};

function monogram(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function ExerciseCard({
  exercise,
  onPress,
}: {
  exercise: Exercise;
  onPress?: () => void;
}) {
  const { colors } = useTheme();
  const [imgError, setImgError] = useState(false);
  const showImage = !!exercise.imageUrl && !imgError;

  const muscleKey = exercise.muscleGroup?.primary?.toLowerCase() ?? 'default';
  const [tintBg, tintFg] = MUSCLE_TINT[muscleKey] ?? MUSCLE_TINT.default;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: colors.card,
        borderRadius: 18,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: pressed ? colors.primary : colors.border,
        transform: [{ scale: pressed ? 0.99 : 1 }],
      })}
    >
      <View style={{ height: 160, backgroundColor: tintBg, position: 'relative' }}>
        {showImage ? (
          <Image
            source={{ uri: exercise.imageUrl }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                backgroundColor: 'rgba(255,255,255,0.04)',
                borderWidth: 1,
                borderColor: tintFg + '55',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: tintFg, fontSize: 24, fontWeight: '900', letterSpacing: 1 }}>
                {monogram(exercise.name)}
              </Text>
            </View>
            <Text
              style={{
                color: tintFg,
                fontSize: 10,
                fontWeight: '700',
                letterSpacing: 2,
                textTransform: 'uppercase',
              }}
            >
              {muscleKey}
            </Text>
          </View>
        )}
        <LinearGradient
          colors={['transparent', 'rgba(10,10,10,0.85)']}
          style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 70 }}
          pointerEvents="none"
        />
        <View style={{ position: 'absolute', top: 10, right: 10, flexDirection: 'row', gap: 6 }}>
          {exercise.location === 'home' ? (
            <View
              style={{
                backgroundColor: 'rgba(10,10,10,0.7)',
                borderRadius: 999,
                paddingHorizontal: 9,
                paddingVertical: 4,
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>🏠 Home</Text>
            </View>
          ) : null}
          <LevelBadge level={exercise.difficulty} />
        </View>
        <View style={{ position: 'absolute', left: 12, right: 12, bottom: 10 }}>
          <Text
            style={{
              color: '#fff',
              fontSize: 17,
              fontWeight: '800',
              letterSpacing: 0.2,
              textShadowColor: 'rgba(0,0,0,0.6)',
              textShadowRadius: 4,
            }}
            numberOfLines={1}
          >
            {exercise.name}
          </Text>
        </View>
      </View>

      <View
        style={{
          paddingHorizontal: 12,
          paddingVertical: 10,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          flexWrap: 'wrap',
        }}
      >
        <View
          style={{
            backgroundColor: colors.primaryMuted,
            borderColor: colors.primary + '40',
            borderWidth: 1,
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 999,
          }}
        >
          <Text
            style={{
              color: colors.primary,
              fontSize: 11,
              fontWeight: '700',
              letterSpacing: 0.5,
              textTransform: 'uppercase',
            }}
          >
            {exercise.muscleGroup.primary}
          </Text>
        </View>
        {exercise.equipment?.[0] ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Text style={{ color: colors.textMuted, fontSize: 12 }}>·</Text>
            <Text
              style={{
                color: colors.textMuted,
                fontSize: 12,
                textTransform: 'capitalize',
                fontWeight: '500',
              }}
            >
              {exercise.equipment[0]}
            </Text>
          </View>
        ) : null}
        {exercise.caloriesPerMinute ? (
          <View
            style={{
              marginLeft: 'auto',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 3,
            }}
          >
            <Text style={{ fontSize: 12 }}>🔥</Text>
            <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: '600' }}>
              {exercise.caloriesPerMinute}/min
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

import React, { useState } from 'react';
import { Image, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { useTheme } from '../theme/useTheme';

interface Props {
  before?: { uri: string; date: string };
  after?: { uri: string; date: string };
}

export function PhotoCompareSlider({ before, after }: Props) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const [split, setSplit] = useState(0.5);
  const w = width - 40;
  const h = w * (4 / 3);

  if (!before || !after) {
    return (
      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: 12,
          padding: 24,
          borderWidth: 1,
          borderColor: colors.border,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: colors.textMuted }}>Upload two photos to compare</Text>
      </View>
    );
  }

  return (
    <View style={{ alignItems: 'center', gap: 8 }}>
      <View style={{ width: w, height: h, borderRadius: 12, overflow: 'hidden' }}>
        <Image source={{ uri: after.uri }} style={{ width: w, height: h, position: 'absolute' }} />
        <View style={{ width: w * split, height: h, overflow: 'hidden', position: 'absolute' }}>
          <Image source={{ uri: before.uri }} style={{ width: w, height: h }} />
        </View>
        <View
          style={{
            position: 'absolute',
            left: w * split - 1,
            top: 0,
            bottom: 0,
            width: 2,
            backgroundColor: '#fff',
          }}
        />
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Pressable
          onPress={() => setSplit(Math.max(0, split - 0.1))}
          style={{ padding: 10, backgroundColor: colors.card, borderRadius: 8 }}
        >
          <Text style={{ color: colors.text }}>◀ {before.date}</Text>
        </Pressable>
        <Pressable
          onPress={() => setSplit(Math.min(1, split + 0.1))}
          style={{ padding: 10, backgroundColor: colors.card, borderRadius: 8 }}
        >
          <Text style={{ color: colors.text }}>{after.date} ▶</Text>
        </Pressable>
      </View>
    </View>
  );
}

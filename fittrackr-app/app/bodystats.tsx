import React, { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Screen } from '../src/components/Screen';
import { Button } from '../src/components/Button';
import { BodyStatCard } from '../src/components/BodyStatCard';
import { PhotoCompareSlider } from '../src/components/PhotoCompareSlider';
import { ProgressChart } from '../src/components/ProgressChart';
import { useTheme } from '../src/theme/useTheme';
import { createBodyStats, getBodyStatsTrend, listBodyStats } from '../src/api/bodystats';
import { api } from '../src/api/client';
import { formatDate } from '../src/utils/format';

export default function BodyStatsScreen() {
  const { colors } = useTheme();
  const qc = useQueryClient();
  const trend = useQuery({ queryKey: ['bodystats-trend'], queryFn: getBodyStatsTrend });
  const list = useQuery({ queryKey: ['bodystats-list'], queryFn: listBodyStats });

  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [chest, setChest] = useState('');
  const [waist, setWaist] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);

  const create = useMutation({
    mutationFn: createBodyStats,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bodystats-trend'] });
      qc.invalidateQueries({ queryKey: ['bodystats-list'] });
      setWeight('');
      setBodyFat('');
      setChest('');
      setWaist('');
      setPhotos([]);
    },
    onError: (e: any) => Alert.alert('Save failed', e?.message ?? 'Error'),
  });

  const pickPhoto = async () => {
    if (photos.length >= 4) return Alert.alert('Max 4 photos per entry');
    const r = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });
    if (r.canceled) return;
    const asset = r.assets[0];
    try {
      const form = new FormData();
      form.append('file', { uri: asset.uri, name: 'photo.jpg', type: 'image/jpeg' } as any);
      const { data } = await api.post<{ url: string }>('/upload/photo', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setPhotos([...photos, data.url]);
    } catch (e: any) {
      Alert.alert('Upload failed', e?.response?.data?.error ?? e?.message ?? 'Cloudinary not configured?');
    }
  };

  const onSave = () => {
    const payload = {
      weight: weight ? parseFloat(weight) : undefined,
      bodyFat: bodyFat ? parseFloat(bodyFat) : undefined,
      measurements: {
        chest: chest ? parseFloat(chest) : undefined,
        waist: waist ? parseFloat(waist) : undefined,
      },
      photos,
    };
    create.mutate(payload);
  };

  const latest = list.data?.[0];
  const previous = list.data?.[1];
  const latestPhoto = latest?.photos?.[0];
  const previousPhoto = previous?.photos?.[0];

  const weightTrendDir =
    trend.data && trend.data.length >= 2 && trend.data[trend.data.length - 1].weight && trend.data[0].weight
      ? trend.data[trend.data.length - 1].weight! > trend.data[0].weight!
        ? 'up'
        : trend.data[trend.data.length - 1].weight! < trend.data[0].weight!
        ? 'down'
        : 'flat'
      : 'flat';

  return (
    <Screen>
      <Text style={{ color: colors.text, fontSize: 22, fontWeight: '800' }}>Body Stats</Text>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <BodyStatCard
          label="Weight"
          value={latest?.weight ?? '—'}
          unit="kg"
          trend={weightTrendDir as 'up' | 'down' | 'flat'}
        />
        <BodyStatCard label="BMI" value={latest?.bmi ?? '—'} />
        <BodyStatCard label="Body fat" value={latest?.bodyFat ?? '—'} unit="%" />
      </View>

      <View
        style={{
          backgroundColor: colors.card,
          padding: 14,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: colors.border,
          gap: 8,
        }}
      >
        <Text style={{ color: colors.text, fontWeight: '700' }}>New entry</Text>
        <Row>
          <Field label="Weight (kg)" value={weight} onChangeText={setWeight} />
          <Field label="Body fat (%)" value={bodyFat} onChangeText={setBodyFat} />
        </Row>
        <Row>
          <Field label="Chest (cm)" value={chest} onChangeText={setChest} />
          <Field label="Waist (cm)" value={waist} onChangeText={setWaist} />
        </Row>
        <ScrollView horizontal contentContainerStyle={{ gap: 8 }}>
          {photos.map((p) => (
            <Image key={p} source={{ uri: p }} style={{ width: 60, height: 60, borderRadius: 8 }} />
          ))}
          <Pressable
            onPress={pickPhoto}
            style={{
              width: 60,
              height: 60,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.border,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.bg,
            }}
          >
            <Text style={{ fontSize: 28, color: colors.textMuted }}>＋</Text>
          </Pressable>
        </ScrollView>
        <Button title="Save entry" onPress={onSave} loading={create.isPending} />
      </View>

      <View
        style={{
          backgroundColor: colors.card,
          padding: 14,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <ProgressChart
          title="Weight trend"
          data={(trend.data ?? [])
            .filter((p) => p.weight != null)
            .map((p) => ({ label: formatDate(p.date), value: p.weight! }))}
          type="line"
        />
      </View>

      {latestPhoto && previousPhoto ? (
        <View
          style={{
            backgroundColor: colors.card,
            padding: 14,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text style={{ color: colors.text, fontWeight: '700', marginBottom: 8 }}>Photo compare</Text>
          <PhotoCompareSlider
            before={{ uri: previousPhoto, date: formatDate(previous!.date) }}
            after={{ uri: latestPhoto, date: formatDate(latest!.date) }}
          />
        </View>
      ) : null}
    </Screen>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <View style={{ flexDirection: 'row', gap: 8 }}>{children}</View>;
}
function Field({
  label,
  value,
  onChangeText,
}: {
  label: string;
  value: string;
  onChangeText: (s: string) => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, gap: 2 }}>
      <Text style={{ color: colors.textMuted, fontSize: 11 }}>{label}</Text>
      <TextInput
        keyboardType="decimal-pad"
        value={value}
        onChangeText={onChangeText}
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

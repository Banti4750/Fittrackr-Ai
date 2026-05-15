import React, { useMemo, useState } from 'react';
import { Alert, Image, Modal, Pressable, ScrollView, Text, TextInput, View, useWindowDimensions } from 'react-native';
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
import { BodyStatsEntry } from '../src/types';

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

  const photoTimeline = useMemo(() => {
    const entries = list.data ?? [];
    const flat: Array<{ uri: string; entry: BodyStatsEntry; photoIndex: number }> = [];
    for (const entry of entries) {
      (entry.photos ?? []).forEach((uri, photoIndex) => {
        flat.push({ uri, entry, photoIndex });
      });
    }
    return flat.sort(
      (a, b) => new Date(a.entry.date).getTime() - new Date(b.entry.date).getTime()
    );
  }, [list.data]);

  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

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

      {photoTimeline.length > 0 ? (
        <View
          style={{
            backgroundColor: colors.card,
            padding: 14,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 8,
            }}
          >
            <Text style={{ color: colors.text, fontWeight: '700' }}>Progress photos</Text>
            <Text style={{ color: colors.textMuted, fontSize: 12 }}>
              {photoTimeline.length} photo{photoTimeline.length === 1 ? '' : 's'}
            </Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
            {photoTimeline.map((p, i) => (
              <Pressable key={`${p.entry._id}-${p.photoIndex}`} onPress={() => setViewerIndex(i)}>
                <Image
                  source={{ uri: p.uri }}
                  style={{
                    width: 90,
                    height: 120,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                />
                <Text
                  style={{
                    color: colors.textMuted,
                    fontSize: 11,
                    marginTop: 4,
                    textAlign: 'center',
                  }}
                >
                  {formatDate(p.entry.date)}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : null}

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

      <PhotoViewer
        photos={photoTimeline}
        index={viewerIndex}
        onClose={() => setViewerIndex(null)}
        onChange={setViewerIndex}
      />
    </Screen>
  );
}

function PhotoViewer({
  photos,
  index,
  onClose,
  onChange,
}: {
  photos: Array<{ uri: string; entry: BodyStatsEntry; photoIndex: number }>;
  index: number | null;
  onClose: () => void;
  onChange: (i: number) => void;
}) {
  const { colors } = useTheme();
  const { width, height } = useWindowDimensions();
  if (index == null) return null;
  const current = photos[index];
  if (!current) return null;
  const { entry } = current;
  const m = entry.measurements ?? {};
  const stats: Array<[string, string]> = [];
  if (entry.weight != null) stats.push(['Weight', `${entry.weight} kg`]);
  if (entry.bmi != null) stats.push(['BMI', `${entry.bmi}`]);
  if (entry.bodyFat != null) stats.push(['Body fat', `${entry.bodyFat}%`]);
  if (m.chest != null) stats.push(['Chest', `${m.chest} cm`]);
  if (m.waist != null) stats.push(['Waist', `${m.waist} cm`]);
  if (m.hips != null) stats.push(['Hips', `${m.hips} cm`]);
  if (m.bicep != null) stats.push(['Bicep', `${m.bicep} cm`]);
  if (m.thigh != null) stats.push(['Thigh', `${m.thigh} cm`]);

  const prev = index > 0 ? () => onChange(index - 1) : null;
  const next = index < photos.length - 1 ? () => onChange(index + 1) : null;

  return (
    <Modal visible animationType="fade" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.92)' }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingTop: 48,
            paddingBottom: 8,
          }}
        >
          <View>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>
              {formatDate(entry.date)}
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
              {index + 1} of {photos.length}
            </Text>
          </View>
          <Pressable onPress={onClose} hitSlop={12}>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>Close</Text>
          </Pressable>
        </View>

        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Image
            source={{ uri: current.uri }}
            style={{ width: width - 32, height: height * 0.6, borderRadius: 12 }}
            resizeMode="contain"
          />
          {prev ? (
            <Pressable
              onPress={prev}
              hitSlop={16}
              style={{
                position: 'absolute',
                left: 8,
                padding: 12,
                backgroundColor: 'rgba(255,255,255,0.15)',
                borderRadius: 999,
              }}
            >
              <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800' }}>‹</Text>
            </Pressable>
          ) : null}
          {next ? (
            <Pressable
              onPress={next}
              hitSlop={16}
              style={{
                position: 'absolute',
                right: 8,
                padding: 12,
                backgroundColor: 'rgba(255,255,255,0.15)',
                borderRadius: 999,
              }}
            >
              <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800' }}>›</Text>
            </Pressable>
          ) : null}
        </View>

        {stats.length > 0 ? (
          <View
            style={{
              padding: 16,
              backgroundColor: colors.card,
              margin: 16,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: colors.border,
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            {stats.map(([label, value]) => (
              <View key={label} style={{ minWidth: 80 }}>
                <Text style={{ color: colors.textMuted, fontSize: 11 }}>{label}</Text>
                <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15 }}>{value}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={{ padding: 16 }}>
            <Text style={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center' }}>
              No measurements logged for this entry
            </Text>
          </View>
        )}
      </View>
    </Modal>
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

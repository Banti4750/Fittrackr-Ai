import { api } from './client';
import { Exercise } from '../types';

export interface VolumePoint {
  date: string;
  volume: number;
  sets: number;
}

export async function getVolume(params: { exercise?: string; range?: string } = {}) {
  const { data } = await api.get<{ points: VolumePoint[] }>('/progress/volume', { params });
  return data.points;
}

export interface PRItem {
  exercise: Exercise;
  value: number;
  reps: number;
  weight: number;
  date: string;
}

export async function getPersonalBests() {
  const { data } = await api.get<{ personalBests: PRItem[] }>('/progress/personal-bests');
  return data.personalBests;
}

export async function getFrequency(range = '90d') {
  const { data } = await api.get<{
    points: Array<{ weekStart: string; count: number }>;
    totalWorkouts: number;
  }>('/progress/frequency', { params: { range } });
  return data;
}

export async function getMuscleBreakdown(range = '30d') {
  const { data } = await api.get<{ breakdown: Array<{ muscle: string; sets: number }> }>(
    '/progress/muscle-breakdown',
    { params: { range } }
  );
  return data.breakdown;
}

export interface MuscleHeatmapEntry {
  muscle: string;
  sets: number;
  volume: number;
  daysSinceLast: number | null;
}

export async function getMuscleHeatmap(range = '7d') {
  const { data } = await api.get<{ heatmap: MuscleHeatmapEntry[]; rangeDays: number }>(
    '/progress/muscle-heatmap',
    { params: { range } }
  );
  return data;
}

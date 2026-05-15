import { api } from './client';
import { BodyStatsEntry } from '../types';

export interface CreateBodyStatsInput {
  date?: string;
  weight?: number;
  bodyFat?: number;
  measurements?: {
    chest?: number;
    waist?: number;
    hips?: number;
    bicep?: number;
    thigh?: number;
  };
  photos?: string[];
}

export async function createBodyStats(input: CreateBodyStatsInput) {
  const { data } = await api.post<{ entry: BodyStatsEntry }>('/bodystats', input);
  return data.entry;
}

export async function listBodyStats() {
  const { data } = await api.get<{ entries: BodyStatsEntry[] }>('/bodystats');
  return data.entries;
}

export async function getBodyStatsTrend() {
  const { data } = await api.get<{
    points: Array<{ date: string; weight?: number; bodyFat?: number; bmi?: number }>;
  }>('/bodystats/trend');
  return data.points;
}

import { api } from './client';
import { StreakData } from '../types';

export async function getStreak() {
  const { data } = await api.get<{
    streak: StreakData;
    heatmap: Array<{ date: string; count: number }>;
  }>('/streaks');
  return data;
}

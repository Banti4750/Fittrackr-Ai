import { api } from './client';

export interface CaloriesToday {
  date: string;
  calories: number;
  goal: number;
  weightSet: boolean;
}

export interface CaloriesSeriesPoint {
  date: string;
  calories: number;
}

export interface CaloriesSummary {
  today: number;
  thisWeek: number;
  thisMonth: number;
  allTime: number;
  avgPerSession: number;
  sessionCount: number;
  goal: number;
  weightSet: boolean;
}

export interface CalorieSession {
  _id: string;
  date: string;
  title: string | null;
  totalDuration: number;
  caloriesBurned: number;
  exerciseCount: number;
}

export async function getCaloriesToday() {
  const { data } = await api.get<CaloriesToday>('/calories/today');
  return data;
}

export async function getCaloriesWeekly() {
  const { data } = await api.get<{ series: CaloriesSeriesPoint[] }>('/calories/weekly');
  return data.series;
}

export async function getCaloriesMonthly() {
  const { data } = await api.get<{ series: CaloriesSeriesPoint[] }>('/calories/monthly');
  return data.series;
}

export async function getCaloriesSummary() {
  const { data } = await api.get<CaloriesSummary>('/calories/summary');
  return data;
}

export async function getCalorieSessions(days = 7) {
  const { data } = await api.get<{ sessions: CalorieSession[] }>('/calories/sessions', {
    params: { days },
  });
  return data.sessions;
}

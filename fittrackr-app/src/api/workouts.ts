import { api } from './client';
import { Mood, WorkoutSession } from '../types';

export interface CreateWorkoutInput {
  date?: string;
  title?: string;
  exercises: Array<{
    exerciseId: string;
    sets: Array<{
      reps?: number;
      weight?: number;
      duration?: number;
      restSeconds?: number;
      notes?: string;
    }>;
  }>;
  totalDuration?: number;
  mood?: Mood;
  notes?: string;
}

export async function createWorkout(input: CreateWorkoutInput) {
  const { data } = await api.post<{ session: WorkoutSession }>('/workouts', input);
  return data.session;
}

export async function listWorkouts(params: { startDate?: string; endDate?: string; page?: number } = {}) {
  const { data } = await api.get<{ sessions: WorkoutSession[]; total: number }>('/workouts', { params });
  return data;
}

export async function getWorkout(id: string) {
  const { data } = await api.get<{ session: WorkoutSession }>(`/workouts/${id}`);
  return data.session;
}

export async function deleteWorkout(id: string) {
  await api.delete(`/workouts/${id}`);
}

export interface LastPerformedEntry {
  date: string;
  daysAgo: number;
  setCount: number;
  bestSet?: { weight?: number; reps?: number; duration?: number };
}

export async function getLastPerformed() {
  const { data } = await api.get<{ history: Record<string, LastPerformedEntry> }>(
    '/workouts/last-performed'
  );
  return data.history;
}

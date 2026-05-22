import { api } from './client';
import { Exercise } from '../types';

export interface ListFilters {
  muscle?: string;
  category?: string;
  level?: string;
  location?: string;
  search?: string;
}

export async function listExercises(filters: ListFilters = {}) {
  const { data } = await api.get<{ exercises: Exercise[] }>('/exercises', { params: filters });
  return data.exercises;
}

export async function getExercise(id: string) {
  const { data } = await api.get<{ exercise: Exercise }>(`/exercises/${id}`);
  return data.exercise;
}

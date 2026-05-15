import { api } from './client';
import { WorkoutTemplate } from '../types';

export interface CreateTemplateInput {
  name: string;
  exercises: Array<{
    exerciseId: string;
    sets: Array<{ reps?: number; weight?: number; duration?: number; restSeconds?: number }>;
  }>;
}

export async function listTemplates() {
  const { data } = await api.get<{ templates: WorkoutTemplate[] }>('/templates');
  return data.templates;
}

export async function createTemplate(input: CreateTemplateInput) {
  const { data } = await api.post<{ template: WorkoutTemplate }>('/templates', input);
  return data.template;
}

export async function deleteTemplate(id: string) {
  await api.delete(`/templates/${id}`);
}

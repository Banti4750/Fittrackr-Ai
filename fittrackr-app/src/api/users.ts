import { api } from './client';
import { Level, User } from '../types';

export async function updateProfile(input: Partial<User>) {
  const { data } = await api.put<{ user: User }>('/users/profile', input);
  return data.user;
}

export async function updateLevel(level: Level) {
  const { data } = await api.put<{ user: User }>('/users/level', { level });
  return data.user;
}

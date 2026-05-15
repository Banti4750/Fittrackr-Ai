import { api } from './client';
import { Level, User } from '../types';

export async function login(email: string, password: string) {
  const { data } = await api.post<{ user: User; token: string }>('/auth/login', { email, password });
  return data;
}

export async function register(input: {
  name: string;
  email: string;
  password: string;
  level?: Level;
}) {
  const { data } = await api.post<{ user: User; token: string }>('/auth/register', input);
  return data;
}

export async function me() {
  const { data } = await api.get<{ user: User }>('/auth/me');
  return data.user;
}

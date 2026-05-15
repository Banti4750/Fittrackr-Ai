import { api } from './client';
import { AIInsight } from '../types';

export async function generateInsights() {
  const { data } = await api.post<{ insight: AIInsight }>('/ai/insights');
  return data.insight;
}

export async function latestInsights() {
  const { data } = await api.get<{ insights: AIInsight[] }>('/ai/insights/latest');
  return data.insights;
}

import { WeightUnit } from '../types';
import { LB_PER_KG, unitLabel } from './units';

export function formatDate(iso: string | Date): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function formatDateTime(iso: string | Date): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export function formatVolume(v: number, unit: WeightUnit = 'kg'): string {
  const value = unit === 'lbs' ? v * LB_PER_KG : v;
  const label = unitLabel(unit);
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k ${label}`;
  return `${Math.round(value)} ${label}`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

export function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

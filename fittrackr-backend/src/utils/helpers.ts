import { ISet, IWorkoutExercise } from '../models/WorkoutSession';

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function calcVolume(exercises: IWorkoutExercise[]): number {
  let total = 0;
  for (const ex of exercises) {
    for (const s of ex.sets) {
      const reps = s.reps ?? 0;
      const weight = s.weight ?? 0;
      total += reps * weight;
    }
  }
  return Math.round(total * 10) / 10;
}

export function calcDuration(exercises: IWorkoutExercise[]): number {
  let seconds = 0;
  for (const ex of exercises) {
    for (const s of ex.sets) {
      seconds += s.duration ?? 0;
      seconds += s.restSeconds ?? 0;
      if (!s.duration) seconds += 30;
    }
  }
  return Math.round(seconds / 60);
}

export function calcCaloriesBurned(minutes: number, caloriesPerMinute = 6): number {
  return Math.round(minutes * caloriesPerMinute);
}

export function startOfDay(d: Date): Date {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

export function daysBetween(a: Date, b: Date): number {
  const ms = startOfDay(b).getTime() - startOfDay(a).getTime();
  return Math.round(ms / (24 * 60 * 60 * 1000));
}

export function bestSetValue(s: ISet): number {
  return (s.weight ?? 0) * (s.reps ?? 0);
}

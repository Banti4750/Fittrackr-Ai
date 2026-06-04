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

// Used when User.weight is not set — keeps calorie math working on a sensible baseline.
export const FALLBACK_BODYWEIGHT_KG = 70;

// MET values per Exercise.category, used when an individual exercise has no metValue.
const CATEGORY_MET: Record<string, number> = {
  strength: 5.0,
  HIIT: 8.0,
  cardio: 7.5,
  flexibility: 2.5,
};

export function metForCategory(category?: string): number {
  if (!category) return 4.5;
  return CATEGORY_MET[category] ?? 4.5;
}

/**
 * Estimates seconds spent on a single set:
 *  - explicit duration if given (e.g. cardio/timed work)
 *  - otherwise ~4s per rep + rest
 *  - fallback 30s of work if neither rep count nor duration was logged
 */
export function estimateSetSeconds(set: ISet): number {
  if (set.duration && set.duration > 0) {
    return set.duration + (set.restSeconds ?? 0);
  }
  if (set.reps && set.reps > 0) {
    return set.reps * 4 + (set.restSeconds ?? 0);
  }
  return 30 + (set.restSeconds ?? 0);
}

/**
 * MET-based calorie burn for a single exercise over a known span of time:
 *   calories = MET × bodyweight(kg) × hours
 */
export function calcExerciseCalories(opts: {
  met: number;
  bodyWeightKg: number;
  minutes: number;
}): number {
  const hours = opts.minutes / 60;
  return Math.round(opts.met * opts.bodyWeightKg * hours * 10) / 10;
}

/**
 * Distributes a session's calorie burn across its exercises.
 *
 * A strength MET (~5) already represents the average intensity of a whole
 * training session *including rest between sets*, so calories must be applied
 * to the real session duration — not just the few seconds spent lifting. We
 * split the session's total minutes across exercises in proportion to each
 * one's active work (reps/duration), then apply that exercise's own MET.
 */
export function calcSessionCalories(opts: {
  exercises: { met: number; sets: ISet[] }[];
  bodyWeightKg: number;
  totalMinutes: number;
}): { perExercise: number[]; total: number } {
  const workSeconds = opts.exercises.map((ex) =>
    ex.sets.reduce((sum, s) => sum + estimateSetSeconds(s), 0),
  );
  const totalWork = workSeconds.reduce((a, b) => a + b, 0);

  // Without a real duration (or no logged work to weight by) fall back to the
  // raw active-work estimate so we never divide by zero.
  if (!opts.totalMinutes || opts.totalMinutes <= 0 || totalWork <= 0) {
    const perExercise = opts.exercises.map((ex, i) =>
      calcExerciseCalories({
        met: ex.met,
        bodyWeightKg: opts.bodyWeightKg,
        minutes: workSeconds[i] / 60,
      }),
    );
    return { perExercise, total: Math.round(perExercise.reduce((a, b) => a + b, 0)) };
  }

  const perExercise = opts.exercises.map((ex, i) =>
    calcExerciseCalories({
      met: ex.met,
      bodyWeightKg: opts.bodyWeightKg,
      minutes: opts.totalMinutes * (workSeconds[i] / totalWork),
    }),
  );
  return { perExercise, total: Math.round(perExercise.reduce((a, b) => a + b, 0)) };
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

// PR metric: heaviest weight lifted in a single set, regardless of reps.
export function bestSetWeight(s: ISet): number {
  return s.weight ?? 0;
}

import mongoose from 'mongoose';
import { Exercise } from '../models/Exercise';
import { WorkoutTemplate } from '../models/WorkoutTemplate';

interface StarterExercise {
  name: string;
  sets: number;
  reps?: number;
  duration?: number;
  weight?: number;
}

interface StarterDef {
  name: string;
  exercises: StarterExercise[];
}

const STARTERS: StarterDef[] = [
  {
    name: 'Push Day',
    exercises: [
      { name: 'Barbell Bench Press', sets: 4, reps: 6 },
      { name: 'Incline Dumbbell Press', sets: 3, reps: 8 },
      { name: 'Overhead Barbell Press', sets: 3, reps: 8 },
      { name: 'Dumbbell Lateral Raise', sets: 3, reps: 12 },
      { name: 'Tricep Pushdown', sets: 3, reps: 12 },
      { name: 'Plank', sets: 3, duration: 60 },
    ],
  },
  {
    name: 'Pull Day',
    exercises: [
      { name: 'Pull-Up', sets: 4, reps: 8 },
      { name: 'Bent Over Barbell Row', sets: 4, reps: 8 },
      { name: 'Lat Pulldown', sets: 3, reps: 10 },
      { name: 'Face Pull', sets: 3, reps: 12 },
      { name: 'Barbell Curl', sets: 3, reps: 10 },
      { name: 'Hammer Curl', sets: 3, reps: 12 },
    ],
  },
  {
    name: 'Leg Day',
    exercises: [
      { name: 'Barbell Back Squat', sets: 4, reps: 6 },
      { name: 'Romanian Deadlift', sets: 3, reps: 8 },
      { name: 'Leg Press', sets: 3, reps: 10 },
      { name: 'Walking Lunge', sets: 3, reps: 12 },
      { name: 'Leg Curl', sets: 3, reps: 12 },
      { name: 'Standing Calf Raise', sets: 4, reps: 15 },
    ],
  },
  {
    name: 'Stronglifts 5×5 A',
    exercises: [
      { name: 'Barbell Back Squat', sets: 5, reps: 5 },
      { name: 'Barbell Bench Press', sets: 5, reps: 5 },
      { name: 'Bent Over Barbell Row', sets: 5, reps: 5 },
    ],
  },
  {
    name: 'Stronglifts 5×5 B',
    exercises: [
      { name: 'Barbell Back Squat', sets: 5, reps: 5 },
      { name: 'Overhead Barbell Press', sets: 5, reps: 5 },
      { name: 'Conventional Deadlift', sets: 1, reps: 5 },
    ],
  },
  {
    name: 'Upper Body',
    exercises: [
      { name: 'Barbell Bench Press', sets: 4, reps: 6 },
      { name: 'Bent Over Barbell Row', sets: 4, reps: 6 },
      { name: 'Overhead Barbell Press', sets: 3, reps: 8 },
      { name: 'Pull-Up', sets: 3, reps: 8 },
      { name: 'Barbell Curl', sets: 3, reps: 10 },
      { name: 'Tricep Pushdown', sets: 3, reps: 10 },
    ],
  },
  {
    name: 'Lower Body',
    exercises: [
      { name: 'Barbell Back Squat', sets: 4, reps: 6 },
      { name: 'Romanian Deadlift', sets: 4, reps: 8 },
      { name: 'Leg Press', sets: 3, reps: 10 },
      { name: 'Hip Thrust', sets: 3, reps: 10 },
      { name: 'Standing Calf Raise', sets: 4, reps: 15 },
    ],
  },
];

export async function seedStarterTemplates(userId: string | mongoose.Types.ObjectId): Promise<number> {
  const uid = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;

  const allNames = Array.from(new Set(STARTERS.flatMap((s) => s.exercises.map((e) => e.name))));
  const exercises = await Exercise.find({ name: { $in: allNames } }).select('name').lean();
  const byName = new Map(exercises.map((e) => [e.name, e._id]));

  const existingNames = new Set(
    (await WorkoutTemplate.find({ userId: uid }).select('name').lean()).map((t) => t.name)
  );

  let created = 0;
  for (const def of STARTERS) {
    if (existingNames.has(def.name)) continue;
    const built = def.exercises
      .map((e) => {
        const id = byName.get(e.name);
        if (!id) return null;
        const set: Record<string, number | undefined> = {};
        if (e.reps != null) set.reps = e.reps;
        if (e.weight != null) set.weight = e.weight;
        if (e.duration != null) set.duration = e.duration;
        return {
          exerciseId: id,
          sets: Array.from({ length: e.sets }, () => ({ ...set })),
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
    if (!built.length) continue;
    await WorkoutTemplate.create({ userId: uid, name: def.name, exercises: built });
    created += 1;
  }
  return created;
}

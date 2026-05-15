import { create } from 'zustand';
import { Exercise, Mood, WorkoutSet, WorkoutTemplate } from '../types';

export interface ActiveExercise {
  exercise: Exercise;
  sets: WorkoutSet[];
}

interface WorkoutState {
  startedAt: number | null;
  title: string;
  exercises: ActiveExercise[];
  mood?: Mood;
  notes: string;

  start: () => void;
  reset: () => void;
  setTitle: (t: string) => void;
  setMood: (m: Mood) => void;
  setNotes: (n: string) => void;

  addExercise: (e: Exercise) => void;
  removeExercise: (exerciseId: string) => void;

  addSet: (exerciseId: string, set?: WorkoutSet) => void;
  updateSet: (exerciseId: string, index: number, set: Partial<WorkoutSet>) => void;
  removeSet: (exerciseId: string, index: number) => void;

  loadFromTemplate: (template: WorkoutTemplate) => void;
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  startedAt: null,
  title: '',
  exercises: [],
  mood: undefined,
  notes: '',

  start: () => set({ startedAt: Date.now(), exercises: [], title: '', notes: '', mood: undefined }),
  reset: () => set({ startedAt: null, exercises: [], title: '', notes: '', mood: undefined }),
  setTitle: (title) => set({ title }),
  setMood: (mood) => set({ mood }),
  setNotes: (notes) => set({ notes }),

  addExercise: (e) => {
    const exists = get().exercises.some((x) => x.exercise._id === e._id);
    if (exists) return;
    set({
      exercises: [...get().exercises, { exercise: e, sets: [{ reps: undefined, weight: undefined }] }],
      startedAt: get().startedAt ?? Date.now(),
    });
  },

  removeExercise: (exerciseId) =>
    set({ exercises: get().exercises.filter((x) => x.exercise._id !== exerciseId) }),

  addSet: (exerciseId, s) =>
    set({
      exercises: get().exercises.map((x) =>
        x.exercise._id === exerciseId
          ? { ...x, sets: [...x.sets, s ?? { reps: x.sets[x.sets.length - 1]?.reps, weight: x.sets[x.sets.length - 1]?.weight }] }
          : x
      ),
    }),

  updateSet: (exerciseId, index, patch) =>
    set({
      exercises: get().exercises.map((x) => {
        if (x.exercise._id !== exerciseId) return x;
        const sets = x.sets.map((s, i) => (i === index ? { ...s, ...patch } : s));
        return { ...x, sets };
      }),
    }),

  removeSet: (exerciseId, index) =>
    set({
      exercises: get().exercises.map((x) =>
        x.exercise._id === exerciseId
          ? { ...x, sets: x.sets.filter((_, i) => i !== index) }
          : x
      ),
    }),

  loadFromTemplate: (template) => {
    const exercises: ActiveExercise[] = [];
    for (const te of template.exercises) {
      const ex = te.exerciseId;
      if (typeof ex === 'string' || !ex || !('_id' in ex)) continue;
      const sets: WorkoutSet[] = te.sets.length
        ? te.sets.map((s) => ({
            reps: s.reps,
            weight: s.weight,
            duration: s.duration,
            restSeconds: s.restSeconds,
          }))
        : [{ reps: undefined, weight: undefined }];
      exercises.push({ exercise: ex, sets });
    }
    set({
      startedAt: Date.now(),
      title: template.name,
      exercises,
      mood: undefined,
      notes: '',
    });
  },
}));

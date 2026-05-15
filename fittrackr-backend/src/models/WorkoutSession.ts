import { Schema, model, Document, Types } from 'mongoose';

export interface ISet {
  reps?: number;
  weight?: number;
  duration?: number;
  restSeconds?: number;
  notes?: string;
  isPersonalBest?: boolean;
}

export interface IWorkoutExercise {
  exerciseId: Types.ObjectId;
  sets: ISet[];
  personalBest: boolean;
}

export interface IWorkoutSession extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  date: Date;
  title?: string;
  exercises: IWorkoutExercise[];
  totalDuration: number;
  totalVolume: number;
  caloriesBurned: number;
  mood?: 'great' | 'okay' | 'tired';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const setSchema = new Schema<ISet>(
  {
    reps: Number,
    weight: Number,
    duration: Number,
    restSeconds: Number,
    notes: String,
    isPersonalBest: { type: Boolean, default: false },
  },
  { _id: false }
);

const workoutExerciseSchema = new Schema<IWorkoutExercise>(
  {
    exerciseId: { type: Schema.Types.ObjectId, ref: 'Exercise', required: true },
    sets: { type: [setSchema], default: [] },
    personalBest: { type: Boolean, default: false },
  },
  { _id: false }
);

const workoutSessionSchema = new Schema<IWorkoutSession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, required: true, default: Date.now, index: true },
    title: String,
    exercises: { type: [workoutExerciseSchema], default: [] },
    totalDuration: { type: Number, default: 0 },
    totalVolume: { type: Number, default: 0 },
    caloriesBurned: { type: Number, default: 0 },
    mood: { type: String, enum: ['great', 'okay', 'tired'] },
    notes: String,
  },
  { timestamps: true }
);

workoutSessionSchema.index({ userId: 1, date: -1 });

export const WorkoutSession = model<IWorkoutSession>('WorkoutSession', workoutSessionSchema);

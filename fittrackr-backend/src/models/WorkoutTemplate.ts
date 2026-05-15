import { Schema, model, Document, Types } from 'mongoose';

export interface ITemplateSet {
  reps?: number;
  weight?: number;
  duration?: number;
  restSeconds?: number;
}

export interface ITemplateExercise {
  exerciseId: Types.ObjectId;
  sets: ITemplateSet[];
}

export interface IWorkoutTemplate extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  name: string;
  exercises: ITemplateExercise[];
  createdAt: Date;
  updatedAt: Date;
}

const setSchema = new Schema<ITemplateSet>(
  {
    reps: Number,
    weight: Number,
    duration: Number,
    restSeconds: Number,
  },
  { _id: false }
);

const exerciseSchema = new Schema<ITemplateExercise>(
  {
    exerciseId: { type: Schema.Types.ObjectId, ref: 'Exercise', required: true },
    sets: { type: [setSchema], default: [] },
  },
  { _id: false }
);

const templateSchema = new Schema<IWorkoutTemplate>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true },
    exercises: { type: [exerciseSchema], default: [] },
  },
  { timestamps: true }
);

templateSchema.index({ userId: 1, updatedAt: -1 });

export const WorkoutTemplate = model<IWorkoutTemplate>('WorkoutTemplate', templateSchema);

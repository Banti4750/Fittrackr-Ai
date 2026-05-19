import { Schema, model, Document, Types } from 'mongoose';

export type Category = 'strength' | 'cardio' | 'flexibility' | 'HIIT';
export type Difficulty = 'beginner' | 'intermediate' | 'elite';

export interface IExercise extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  muscleGroup: { primary: string; secondary: string[] };
  category: Category;
  difficulty: Difficulty;
  description: string;
  instructions: string[];
  tips: string[];
  imageUrl: string;
  videoUrl: string;
  equipment: string[];
  caloriesPerMinute: number;
  metValue: number;
}

const exerciseSchema = new Schema<IExercise>(
  {
    name: { type: String, required: true, index: 'text' },
    slug: { type: String, required: true, unique: true, index: true },
    muscleGroup: {
      primary: { type: String, required: true, index: true },
      secondary: { type: [String], default: [] },
    },
    category: {
      type: String,
      enum: ['strength', 'cardio', 'flexibility', 'HIIT'],
      required: true,
      index: true,
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'elite'],
      default: 'beginner',
      index: true,
    },
    description: { type: String, default: '' },
    instructions: { type: [String], default: [] },
    tips: { type: [String], default: [] },
    imageUrl: { type: String, default: '' },
    videoUrl: { type: String, default: '' },
    equipment: { type: [String], default: [] },
    caloriesPerMinute: { type: Number, default: 5 },
    metValue: { type: Number, default: 4.5 },
  },
  { timestamps: true }
);

export const Exercise = model<IExercise>('Exercise', exerciseSchema);

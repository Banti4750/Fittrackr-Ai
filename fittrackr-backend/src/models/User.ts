import { Schema, model, Document, Types } from 'mongoose';

export type Level = 'beginner' | 'intermediate' | 'elite';
export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  level: Level;
  age?: number;
  weight?: number;
  height?: number;
  gender?: Gender;
  goals: string[];
  profilePhoto?: string;
  streakCount: number;
  lastWorkoutDate?: Date;
  dailyCalorieGoal: number;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'elite'],
      default: 'beginner',
    },
    age: Number,
    weight: Number,
    height: Number,
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_to_say'],
    },
    goals: { type: [String], default: [] },
    profilePhoto: String,
    streakCount: { type: Number, default: 0 },
    lastWorkoutDate: Date,
    dailyCalorieGoal: { type: Number, default: 400 },
  },
  { timestamps: true }
);

userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete (ret as any).passwordHash;
    delete (ret as any).__v;
    return ret;
  },
});

export const User = model<IUser>('User', userSchema);

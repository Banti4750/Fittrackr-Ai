import { Schema, model, Document, Types } from 'mongoose';

export interface IStreak extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  currentStreak: number;
  longestStreak: number;
  totalWorkouts: number;
  lastUpdated: Date;
}

const streakSchema = new Schema<IStreak>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    totalWorkouts: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Streak = model<IStreak>('Streak', streakSchema);

import { Schema, model, Document, Types } from 'mongoose';

export interface IBodyStats extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  date: Date;
  weight?: number;
  bodyFat?: number;
  bmi?: number;
  measurements?: {
    chest?: number;
    waist?: number;
    hips?: number;
    bicep?: number;
    thigh?: number;
  };
  photos: string[];
  createdAt: Date;
}

const bodyStatsSchema = new Schema<IBodyStats>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, default: Date.now, required: true, index: true },
    weight: Number,
    bodyFat: Number,
    bmi: Number,
    measurements: {
      chest: Number,
      waist: Number,
      hips: Number,
      bicep: Number,
      thigh: Number,
    },
    photos: {
      type: [String],
      default: [],
      validate: [(arr: string[]) => arr.length <= 4, 'Max 4 photos per entry'],
    },
  },
  { timestamps: true }
);

bodyStatsSchema.index({ userId: 1, date: -1 });

export const BodyStats = model<IBodyStats>('BodyStats', bodyStatsSchema);

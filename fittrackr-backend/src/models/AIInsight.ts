import { Schema, model, Document, Types } from 'mongoose';

export type InsightType =
  | 'weekly_summary'
  | 'improvement_tip'
  | 'plateau_alert'
  | 'overtraining_warning';

export interface IAIInsight extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  generatedAt: Date;
  type: InsightType;
  content: string;
  exercisesAnalyzed: string[];
  payload?: Record<string, unknown>;
  expiresAt: Date;
}

const aiInsightSchema = new Schema<IAIInsight>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    generatedAt: { type: Date, default: Date.now },
    type: {
      type: String,
      enum: ['weekly_summary', 'improvement_tip', 'plateau_alert', 'overtraining_warning'],
      required: true,
    },
    content: { type: String, required: true },
    exercisesAnalyzed: { type: [String], default: [] },
    payload: { type: Schema.Types.Mixed },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  { timestamps: true }
);

aiInsightSchema.index({ userId: 1, generatedAt: -1 });

export const AIInsight = model<IAIInsight>('AIInsight', aiInsightSchema);

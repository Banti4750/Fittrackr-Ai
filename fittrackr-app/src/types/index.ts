export type Level = 'beginner' | 'intermediate' | 'elite';
export type Category = 'strength' | 'cardio' | 'flexibility' | 'HIIT';
export type Mood = 'great' | 'okay' | 'tired';

export interface User {
  _id: string;
  name: string;
  email: string;
  level: Level;
  age?: number;
  weight?: number;
  height?: number;
  gender?: string;
  goals: string[];
  profilePhoto?: string;
  streakCount: number;
  lastWorkoutDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Exercise {
  _id: string;
  name: string;
  slug: string;
  muscleGroup: { primary: string; secondary: string[] };
  category: Category;
  difficulty: Level;
  description: string;
  instructions: string[];
  tips: string[];
  imageUrl: string;
  videoUrl: string;
  equipment: string[];
  caloriesPerMinute: number;
}

export interface WorkoutSet {
  reps?: number;
  weight?: number;
  duration?: number;
  restSeconds?: number;
  notes?: string;
  isPersonalBest?: boolean;
}

export interface WorkoutExercise {
  exerciseId: string | Exercise;
  sets: WorkoutSet[];
  personalBest?: boolean;
}

export interface WorkoutSession {
  _id: string;
  userId: string;
  date: string;
  title?: string;
  exercises: WorkoutExercise[];
  totalDuration: number;
  totalVolume: number;
  caloriesBurned: number;
  mood?: Mood;
  notes?: string;
  createdAt: string;
}

export interface WorkoutTemplate {
  _id: string;
  name: string;
  exercises: Array<{
    exerciseId: Exercise | string;
    sets: Array<{ reps?: number; weight?: number; duration?: number; restSeconds?: number }>;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface BodyStatsEntry {
  _id: string;
  date: string;
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
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalWorkouts: number;
  lastUpdated: string;
}

export interface AIInsightPayload {
  weeklyInsight: string;
  improvements: string[];
  concerns: string[];
  suggestedNextWorkout: {
    exercises: Array<{ name: string; sets: number; reps: number; weight?: number }>;
  };
  motivationalMessage: string;
  derivedSignals?: {
    plateauedExercises: string[];
    overtrainingRisk: boolean;
    consecutiveWorkoutDays: number;
    progressiveOverload: boolean;
  };
}

export interface AIInsight {
  _id: string;
  generatedAt: string;
  type: 'weekly_summary' | 'improvement_tip' | 'plateau_alert' | 'overtraining_warning';
  content: string;
  exercisesAnalyzed: string[];
  payload?: AIInsightPayload;
  expiresAt: string;
}

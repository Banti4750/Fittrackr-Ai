import { Streak } from '../models/Streak';
import { User } from '../models/User';
import { startOfDay, daysBetween } from '../utils/helpers';

export async function updateStreakOnWorkout(userId: string, workoutDate: Date): Promise<void> {
  let streak = await Streak.findOne({ userId });
  if (!streak) streak = await Streak.create({ userId });

  const today = startOfDay(workoutDate);
  const last = streak.lastUpdated ? startOfDay(streak.lastUpdated) : null;
  const user = await User.findById(userId);

  if (!last) {
    streak.currentStreak = 1;
  } else {
    const gap = daysBetween(last, today);
    if (gap === 0) {
      // Same day — no streak change
    } else if (gap === 1) {
      streak.currentStreak += 1;
    } else if (gap > 1) {
      streak.currentStreak = 1;
    }
  }

  streak.longestStreak = Math.max(streak.longestStreak, streak.currentStreak);
  streak.totalWorkouts += 1;
  streak.lastUpdated = today;
  await streak.save();

  if (user) {
    user.streakCount = streak.currentStreak;
    user.lastWorkoutDate = today;
    await user.save();
  }
}

/**
 * One-off migration: re-flag isPersonalBest / personalBest on every existing
 * WorkoutSession using the new rule (heaviest weight per exercise) instead of
 * the old volume-based rule (weight × reps).
 *
 * Usage:
 *   npm run reflag-prs            # dry run — reports what would change
 *   npm run reflag-prs -- --apply # writes the updated flags back to MongoDB
 */
import { connectDB, disconnectDB } from '../config/db';
import { WorkoutSession } from '../models/WorkoutSession';
import { bestSetWeight } from '../utils/helpers';

async function main() {
  const apply = process.argv.includes('--apply');
  await connectDB();
  console.log(`[reflag-prs] connected — mode: ${apply ? 'APPLY' : 'dry-run'}`);

  const userIds: any[] = await WorkoutSession.distinct('userId');
  console.log(`[reflag-prs] users with sessions: ${userIds.length}`);

  let scannedSessions = 0;
  let changedSessions = 0;
  let flippedSetFlags = 0;
  let flippedExerciseFlags = 0;

  for (const userId of userIds) {
    const sessions = await WorkoutSession.find({ userId }).sort({ date: 1 });
    const maxByExercise = new Map<string, number>();

    for (const session of sessions) {
      scannedSessions += 1;
      let sessionMutated = false;

      for (const ex of session.exercises) {
        const exId = ex.exerciseId.toString();
        let exerciseHadPR = false;

        for (const set of ex.sets) {
          const weight = bestSetWeight(set);
          const prevMax = maxByExercise.get(exId) ?? 0;
          const shouldBePR = weight > prevMax;

          if (shouldBePR) {
            maxByExercise.set(exId, weight);
            exerciseHadPR = true;
          }

          if (Boolean(set.isPersonalBest) !== shouldBePR) {
            set.isPersonalBest = shouldBePR;
            flippedSetFlags += 1;
            sessionMutated = true;
          }
        }

        if (Boolean(ex.personalBest) !== exerciseHadPR) {
          ex.personalBest = exerciseHadPR;
          flippedExerciseFlags += 1;
          sessionMutated = true;
        }
      }

      if (sessionMutated) {
        changedSessions += 1;
        if (apply) {
          // exercises is a nested array of subdocs — tell Mongoose it changed.
          session.markModified('exercises');
          await session.save();
        }
      }
    }
  }

  console.log('[reflag-prs] summary');
  console.log(`  sessions scanned:       ${scannedSessions}`);
  console.log(`  sessions changed:       ${changedSessions}`);
  console.log(`  set PR flags flipped:   ${flippedSetFlags}`);
  console.log(`  exercise PR flags flipped: ${flippedExerciseFlags}`);
  if (!apply) console.log('[reflag-prs] dry-run only — re-run with --apply to persist.');

  await disconnectDB();
  console.log('[reflag-prs] done');
}

main().catch(async (err) => {
  console.error('[reflag-prs] failed:', err);
  await disconnectDB();
  process.exit(1);
});

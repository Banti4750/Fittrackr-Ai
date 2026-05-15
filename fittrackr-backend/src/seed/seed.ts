import { connectDB, disconnectDB } from '../config/db';
import { Exercise } from '../models/Exercise';
import { seedExercises, withDerivedFields, seedTemplates } from './exercises';

async function main() {
  await connectDB();
  console.log('[seed] connected');

  const docs = seedExercises.map(withDerivedFields);
  console.log(`[seed] upserting ${docs.length} exercises...`);

  for (const d of docs) {
    await Exercise.updateOne({ slug: d.slug }, { $set: d }, { upsert: true });
  }
  const count = await Exercise.countDocuments();
  console.log(`[seed] exercises in DB: ${count}`);

  console.log('[seed] workout templates ready:');
  for (const t of seedTemplates) {
    console.log(`  - ${t.name}: ${t.exerciseNames.length} exercises`);
  }

  await disconnectDB();
  console.log('[seed] done');
}

main().catch(async (err) => {
  console.error('[seed] failed:', err);
  await disconnectDB();
  process.exit(1);
});

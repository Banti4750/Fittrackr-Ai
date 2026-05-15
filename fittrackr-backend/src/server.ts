import { createApp } from './app';
import { connectDB } from './config/db';
import { env } from './config/env';

async function main() {
  await connectDB();
  const app = createApp();
  app.listen(env.port, () => {
    console.log(`[api] FitTrackr listening on http://localhost:${env.port}`);
  });
}

main().catch((err) => {
  console.error('[fatal]', err);
  process.exit(1);
});

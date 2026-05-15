import mongoose from 'mongoose';
import { env } from './env';

export async function connectDB(): Promise<void> {
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.mongoUri);
  console.log(`[db] connected: ${mongoose.connection.host}/${mongoose.connection.name}`);

  mongoose.connection.on('error', (err) => console.error('[db] error:', err));
  mongoose.connection.on('disconnected', () => console.warn('[db] disconnected'));
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
}

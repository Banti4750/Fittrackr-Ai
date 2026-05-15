import dotenv from 'dotenv';
dotenv.config();

function required(key: string, fallback?: string): string {
  const v = process.env[key] ?? fallback;
  if (v === undefined || v === '') {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return v;
}

export const env = {
  port: Number(process.env.PORT ?? 5000),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  mongoUri: required('MONGODB_URI', 'mongodb://127.0.0.1:27017/fittrackr'),
  jwtSecret: required('JWT_SECRET', 'dev-only-insecure-secret-change-me'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '30d',
  claudeApiKey: process.env.CLAUDE_API_KEY ?? '',
  claudeModel: process.env.CLAUDE_MODEL ?? 'claude-sonnet-4-20250514',
  openaiApiKey: process.env.OPENAI_API_KEY ?? '',
  openaiModel: process.env.OPENAI_MODEL ?? 'gpt-4o',
  geminiApiKey: process.env.GEMINI_API_KEY ?? '',
  geminiModel: process.env.GEMINI_MODEL ?? 'gemini-2.0-flash',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? '',
    apiKey: process.env.CLOUDINARY_API_KEY ?? '',
    apiSecret: process.env.CLOUDINARY_API_SECRET ?? '',
  },
};

export const hasAI = () => Boolean(env.claudeApiKey || env.openaiApiKey || env.geminiApiKey);
export const hasCloudinary = () =>
  Boolean(env.cloudinary.cloudName && env.cloudinary.apiKey && env.cloudinary.apiSecret);

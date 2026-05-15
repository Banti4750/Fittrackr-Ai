import { v2 as cloudinary } from 'cloudinary';
import { env, hasCloudinary } from '../config/env';

if (hasCloudinary()) {
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
  });
}

export async function uploadBufferToCloudinary(buffer: Buffer, folder: string): Promise<string> {
  if (!hasCloudinary()) {
    throw new Error('Cloudinary not configured. Set CLOUDINARY_* env vars.');
  }
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (err, result) => {
        if (err || !result) return reject(err ?? new Error('Cloudinary upload failed'));
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}

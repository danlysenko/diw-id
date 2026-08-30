import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import exifr from 'exifr';

// Deliberately outside public/ — files written here while the server is already running must be
// served by the app/uploads/[filename] route, not Next's public-folder static server, which can
// cache a 404 for a path it saw before the file existed.
export const UPLOAD_DIR = path.join(process.cwd(), 'data', 'uploads');
export const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;

export const UPLOAD_MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.heic': 'image/heic',
  '.heif': 'image/heif',
  '.webp': 'image/webp',
};

const ALLOWED_MIME: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/heic': '.heic',
  'image/heif': '.heif',
  'image/webp': '.webp',
};

export type StoredPhoto = {
  publicPath: string;
  sha256: string;
  hasExif: boolean;
  capturedAt: string | null;
  cameraMake: string | null;
  bytes: number;
  mime: string;
};

export type UploadError = { error: string };

export async function storePhoto(file: File, prefix: string): Promise<StoredPhoto | UploadError> {
  const ext = ALLOWED_MIME[file.type];
  if (!ext) return { error: 'Unsupported image format. Use JPEG, PNG, HEIC or WebP.' };
  if (file.size > MAX_UPLOAD_BYTES) return { error: 'Image is larger than 12 MB.' };
  if (file.size === 0) return { error: 'Image is empty.' };

  const buffer = Buffer.from(await file.arrayBuffer());
  const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');

  let exif: Record<string, unknown> | null = null;
  try {
    exif = (await exifr.parse(buffer, { tiff: true, exif: true })) ?? null;
  } catch {
    exif = null;
  }

  const capturedAtRaw = exif?.DateTimeOriginal ?? exif?.CreateDate ?? null;
  const capturedAt =
    capturedAtRaw instanceof Date ? capturedAtRaw.toISOString() : (capturedAtRaw as string) ?? null;
  const cameraMake = (exif?.Make as string | undefined) ?? null;

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const filename = `${prefix}-${sha256.slice(0, 16)}${ext}`;
  await fs.writeFile(path.join(UPLOAD_DIR, filename), buffer);

  return {
    publicPath: `/uploads/${filename}`,
    sha256,
    hasExif: Boolean(capturedAt || cameraMake),
    capturedAt,
    cameraMake,
    bytes: buffer.byteLength,
    mime: file.type,
  };
}

export function isUploadError(value: StoredPhoto | UploadError): value is UploadError {
  return 'error' in value;
}

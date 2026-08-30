import fs from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { UPLOAD_DIR, UPLOAD_MIME } from '@/lib/uploads';

export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;

  // Uploaded files are always a flat name with no path separators — reject anything else
  // outright so this can never be used to read files outside UPLOAD_DIR.
  if (!filename || filename.includes('/') || filename.includes('..')) {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  }

  const mime = UPLOAD_MIME[path.extname(filename).toLowerCase()];
  if (!mime) return NextResponse.json({ error: 'Not found.' }, { status: 404 });

  try {
    const buffer = await fs.readFile(path.join(UPLOAD_DIR, filename));
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': mime,
        'Cache-Control': 'private, no-store',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  }
}

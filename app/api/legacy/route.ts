import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isUploadError, storePhoto } from '@/lib/uploads';

export const dynamic = 'force-dynamic';

const MAX_PHOTOS = 6;

export async function POST(request: Request) {
  const form = await request.formData();

  const model = String(form.get('model') ?? '').trim();
  const approxYear = String(form.get('approxYear') ?? '').trim();
  const purchaseLocation = String(form.get('purchaseLocation') ?? '').trim();
  const originalSerial = String(form.get('originalSerial') ?? '').trim() || null;
  const contactEmail = String(form.get('contactEmail') ?? '').trim() || null;

  if (!model || !approxYear || !purchaseLocation) {
    return NextResponse.json(
      { error: 'Model, approximate year and place of purchase are required.' },
      { status: 400 },
    );
  }

  const files = form.getAll('photos').filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) {
    return NextResponse.json({ error: 'Attach at least one photograph.' }, { status: 400 });
  }
  if (files.length > MAX_PHOTOS) {
    return NextResponse.json({ error: `Attach at most ${MAX_PHOTOS} photographs.` }, { status: 400 });
  }

  const id = crypto.randomUUID();
  const paths: string[] = [];
  for (const [index, file] of files.entries()) {
    const stored = await storePhoto(file, `legacy-${id}-${index}`);
    if (isUploadError(stored)) {
      return NextResponse.json({ error: stored.error }, { status: 400 });
    }
    paths.push(stored.publicPath);
  }

  db.prepare(
    `INSERT INTO legacy_submissions
       (id, model, approx_year, purchase_location, original_serial, contact_email, photo_paths)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).run(id, model, approxYear, purchaseLocation, originalSerial, contactEmail, JSON.stringify(paths));

  return NextResponse.json({ caseId: id });
}

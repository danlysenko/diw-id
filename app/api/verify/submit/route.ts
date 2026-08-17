import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { runChecks } from '@/lib/checks';
import { isUploadError, storePhoto } from '@/lib/uploads';
import { findWatch, getSession, issueVerificationLink, recordPhotoHashes } from '@/lib/sessions';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const form = await request.formData();
  const sessionId = form.get('sessionId');
  const watchFile = form.get('watchPhoto');
  const idFile = form.get('idPhoto');

  if (typeof sessionId !== 'string' || !(watchFile instanceof File) || !(idFile instanceof File)) {
    return NextResponse.json({ error: 'Both photos are required.' }, { status: 400 });
  }

  const session = getSession(sessionId);
  if (!session) {
    return NextResponse.json({ error: 'Verification session not found.' }, { status: 404 });
  }
  if (session.status !== 'pending_challenge') {
    return NextResponse.json(
      { error: 'This verification has already been submitted.' },
      { status: 409 },
    );
  }

  const watchPhoto = await storePhoto(watchFile, `${sessionId}-watch`);
  if (isUploadError(watchPhoto)) {
    return NextResponse.json({ error: `Watch photo: ${watchPhoto.error}` }, { status: 400 });
  }

  const idPhoto = await storePhoto(idFile, `${sessionId}-id`);
  if (isUploadError(idPhoto)) {
    return NextResponse.json({ error: `DiW ID photo: ${idPhoto.error}` }, { status: 400 });
  }

  if (watchPhoto.sha256 === idPhoto.sha256) {
    return NextResponse.json(
      { error: 'The same image was uploaded twice. Send one photo of the dial and one of the DiW ID.' },
      { status: 400 },
    );
  }

  const watch = findWatch(session.diw_id);
  const outcome = await runChecks({ session, watch, watchPhoto, idPhoto });

  db.prepare(
    `UPDATE verification_sessions SET
       status = ?,
       watch_photo_path = ?,
       watch_photo_hash = ?,
       watch_photo_has_exif = ?,
       id_photo_path = ?,
       id_photo_hash = ?,
       id_photo_has_exif = ?,
       checks_json = ?,
       fail_reason = ?,
       verified_at = ?
     WHERE id = ?`,
  ).run(
    outcome.status,
    watchPhoto.publicPath,
    watchPhoto.sha256,
    watchPhoto.hasExif ? 1 : 0,
    idPhoto.publicPath,
    idPhoto.sha256,
    idPhoto.hasExif ? 1 : 0,
    JSON.stringify(outcome.checks),
    outcome.failReason,
    outcome.status === 'passed' ? new Date().toISOString() : null,
    sessionId,
  );

  recordPhotoHashes(sessionId, [watchPhoto.sha256, idPhoto.sha256]);

  if (outcome.status === 'passed') issueVerificationLink(sessionId);

  return NextResponse.json({ status: outcome.status });
}

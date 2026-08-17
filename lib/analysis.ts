import type { StoredPhoto } from './uploads';
import type { Watch } from './db';

export type ImageVerdict = 'match' | 'mismatch' | 'inconclusive';

export type ImageAnalysis = {
  handPosition: ImageVerdict;
  readDiwId: ImageVerdict;
  modelMatch: ImageVerdict;
  archiveConfigMatch: ImageVerdict;
  notes: string[];
};

export type AnalyzerInput = {
  watch: Watch;
  challenge: { hour: number; minute: number };
  watchPhoto: StoredPhoto;
  idPhoto: StoredPhoto;
};

/**
 * Vision-dependent checks (hand position, DiW ID legibility, model + archive config match)
 * need a real image model. This module is the seam where that provider plugs in.
 *
 * DIW_ANALYZER controls the built-in behaviour:
 *   'manual' (default) — never auto-decides; every submission reaches a DiW reviewer.
 *   'demo'             — auto-passes so the full flow can be walked end to end.
 */
export async function analyzePhotos(input: AnalyzerInput): Promise<ImageAnalysis> {
  const mode = process.env.DIW_ANALYZER ?? 'manual';

  if (mode === 'demo') {
    return {
      handPosition: 'match',
      readDiwId: 'match',
      modelMatch: 'match',
      archiveConfigMatch: 'match',
      notes: ['DIW_ANALYZER=demo — image checks auto-passed without a vision model.'],
    };
  }

  const notes = [
    'No vision provider configured; image content routed to a DiW reviewer.',
    `Requested hand position: ${String(input.challenge.hour).padStart(2, '0')}:${String(
      input.challenge.minute,
    ).padStart(2, '0')}.`,
    `Archive record: ${input.watch.collection} on ${input.watch.base_watch}.`,
  ];
  if (!input.watchPhoto.hasExif) notes.push('Watch photo carries no capture metadata.');
  if (!input.idPhoto.hasExif) notes.push('DiW ID photo carries no capture metadata.');

  return {
    handPosition: 'inconclusive',
    readDiwId: 'inconclusive',
    modelMatch: 'inconclusive',
    archiveConfigMatch: 'inconclusive',
    notes,
  };
}

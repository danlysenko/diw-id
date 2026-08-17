import type { Watch } from '@/lib/db';

type Props = {
  watch: Watch;
  verifiedAt?: string | null;
  possessionVerified?: boolean;
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line/60 py-3 last:border-0">
      <dt className="text-xs uppercase tracking-widest2 text-neutral-500">{label}</dt>
      <dd className={accent ? 'text-sm text-good' : 'text-sm text-neutral-100'}>{value}</dd>
    </div>
  );
}

export default function WatchCard({ watch, verifiedAt, possessionVerified }: Props) {
  return (
    <section className="panel overflow-hidden">
      <div className="grid gap-0 md:grid-cols-[1fr_1.2fr]">
        <div className="flex items-center justify-center border-b border-line/60 bg-ink/60 p-8 md:border-b-0 md:border-r">
          {watch.archive_photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={watch.archive_photo_url}
              alt={`${watch.collection} archive photograph`}
              className="max-h-64 w-full max-w-[16rem] object-contain"
            />
          ) : (
            <div className="text-xs uppercase tracking-widest2 text-neutral-600">
              No archive image
            </div>
          )}
        </div>

        <div className="p-8">
          <p className="eyebrow">Instance record</p>
          <h2 className="mt-2 font-display text-2xl text-neutral-50">{watch.collection}</h2>

          <dl className="mt-6">
            <Row label="DiW ID" value={watch.diw_id} />
            <Row label="Collection" value={watch.collection} />
            <Row label="Base watch" value={watch.base_watch} />
            <Row label="Materials" value={watch.materials} />
            <Row label="Production year" value={String(watch.production_year)} />
            <Row label="Status" value={watch.status} accent={watch.status === 'Authentic'} />
            {possessionVerified && <Row label="Physical possession" value="Verified" accent />}
            {verifiedAt && <Row label="Verification date" value={formatDate(verifiedAt)} />}
          </dl>

          <p className="mt-6 text-xs leading-relaxed text-neutral-600">
            DiW never publishes owner identity, contact details or transaction history on an
            instance record.
          </p>
        </div>
      </div>
    </section>
  );
}

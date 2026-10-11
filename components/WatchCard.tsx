import type { Watch } from '@/lib/db';
import { DATE_CLASS, formatDateOnly } from '@/lib/formatDate';

type Props = {
  watch: Watch;
  verifiedAt?: string | null;
  possessionVerified?: boolean;
};

function Row({
  label,
  value,
  accent,
  className = '',
}: {
  label: string;
  value: string;
  accent?: boolean;
  className?: string;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line/60 py-3 last:border-0">
      <dt className="text-xs uppercase tracking-widest2 text-neutral-600">{label}</dt>
      <dd className={`text-base ${accent ? 'text-good' : 'text-neutral-100'} ${className}`}>{value}</dd>
    </div>
  );
}

export default function WatchCard({ watch, verifiedAt, possessionVerified }: Props) {
  return (
    <section className="panel overflow-hidden">
      <div className="grid grid-cols-1 gap-0 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="flex items-center justify-center border-b border-line/60 bg-ink/60 p-6 sm:p-8 md:border-b-0 md:border-r">
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

        <div className="p-5 sm:p-8">
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
            {verifiedAt && (
              <Row label="Verification date" value={formatDateOnly(verifiedAt)} className={DATE_CLASS} />
            )}
          </dl>

          <p className="mt-6 text-sm leading-relaxed text-neutral-500">
            DiW never publishes owner identity, contact details or transaction history on an
            instance record.
          </p>
        </div>
      </div>
    </section>
  );
}

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="panel p-8">
      <p className="eyebrow text-neutral-500">Not found</p>
      <h1 className="mt-3 font-display text-3xl text-neutral-50">Nothing here</h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-neutral-400">
        This verification does not exist, has already been replaced, or the link was mistyped.
      </p>
      <Link href="/verify" className="btn-primary mt-8">
        Check My DiW
      </Link>
    </div>
  );
}

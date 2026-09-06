import Link from 'next/link';

export default function ChooseWatchTypePage() {
  return (
    <div className="-mt-8">
      <p className="eyebrow text-center">Verify My DiW</p>
      <h1 className="mt-8 font-display text-3xl text-neutral-50">
        When was your DiW produced?
      </h1>
      <p className="mt-4 max-w-2xl text-neutral-600">
        Watches produced from 2026 onwards carry a unique DiW ID and can be verified instantly.
        Earlier pieces are handled through the DiW archive by our authentication team.
      </p>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        <Link href="/verify/new" className="panel group flex flex-col p-8 transition hover:border-gold">
          <p className="eyebrow">Instant</p>
          <h2 className="mt-3 font-display text-2xl text-neutral-50">DiW 2026 or newer</h2>
          <p className="mt-3 text-sm leading-relaxed text-neutral-500">
            Your watch has a DiW ID engraved on the rehaut at 6 o’clock, in the format 26-00483.
            Verification takes a few minutes and ends with a shareable proof link.
          </p>
          <span className="mt-auto inline-block self-start pt-6 text-sm text-gold transition group-hover:text-goldSoft">
            Start live verification →
          </span>
        </Link>

        <Link href="/verify/legacy" className="panel group flex flex-col p-8 transition hover:border-gold">
          <p className="eyebrow">Archive review</p>
          <h2 className="mt-3 font-display text-2xl text-neutral-50">DiW Legacy — before 2026</h2>
          <p className="mt-3 text-sm leading-relaxed text-neutral-500">
            No DiW ID on the case. You submit the model, approximate production year, where the
            watch was bought and photographs; DiW matches it against the build archive by hand.
          </p>
          <span className="mt-auto inline-block self-start pt-6 text-sm text-gold transition group-hover:text-goldSoft">
            Open a Legacy case →
          </span>
        </Link>
      </div>
    </div>
  );
}

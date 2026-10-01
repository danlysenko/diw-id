import Link from 'next/link';
import { CHALLENGE_WINDOW_TEXT } from '@/lib/challenge';

const STEPS = [
  { title: 'Enter your DiW ID', body: 'The number engraved at 6 o’clock on the rehaut.' },
  { title: 'Receive a live challenge', body: `DiW names a random hand position, valid for ${CHALLENGE_WINDOW_TEXT}.` },
  { title: 'Set the hands', body: 'Physically move the watch to the requested time.' },
  { title: 'Send two photos', body: 'The dial at the requested time, and the DiW ID.' },
  { title: 'Get a proof link', body: 'A verified result any buyer can open on designa-individual.com for 24 hours.' },
];

export default function HomePage() {
  return (
    // From `lg`: a compact two-column hero (pitch beside "How it works"), with the buyer and
    // dealer panels directly beneath it.
    <div>
      <p className="eyebrow text-center">Check My DiW</p>

      <section className="mt-6 grid grid-cols-1 items-center gap-10 md:mt-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:py-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] xl:gap-16">
        <div>
          <h1 className="font-display text-[2rem] leading-tight text-neutral-50 sm:text-4xl xl:text-5xl">
            Prove the watch is authentic.
          </h1>
          <p className="mt-5 max-w-xl text-neutral-600 xl:text-lg">
            A photograph proves nothing — anyone can forward one. Live Verification asks for a hand
            position invented in the moment, proof the watch is in your hands right now.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
            <Link href="/verify" className="btn-primary">
              Verify my watch
            </Link>
            <Link href="/dealer" className="btn-ghost">
              I’m a dealer
            </Link>
          </div>
        </div>

        <section className="panel panel-pad">
          <h2 className="font-display text-xl text-neutral-100">How it works</h2>
          <ol className="mt-4 divide-y divide-black/10">
            {STEPS.map((step, index) => (
              <li key={step.title} className="flex gap-4 py-3 last:pb-0">
                <span className="w-5 shrink-0 font-display text-base leading-5 text-gold">{index + 1}.</span>
                <div>
                  <h3 className="text-base text-neutral-100">{step.title}</h3>
                  <p className="mt-0.5 text-sm leading-relaxed text-neutral-600">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </section>

      <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 xl:gap-6">
        <section className="panel panel-pad">
          <h2 className="font-display text-xl text-neutral-100">Buying on the secondary market?</h2>
          <p className="mt-2 max-w-xl text-base leading-relaxed text-neutral-600">
            Ask for a DiW verification link, not photographs. Issued by DiW and valid 24 hours, it
            can’t be recycled from an old sale — read the result here, not on trust.
          </p>
        </section>

        <Link href="/dealer" className="panel panel-pad group flex flex-col transition hover:border-gold">
          <h2 className="font-display text-xl text-neutral-100">Selling as a dealer?</h2>
          <p className="mt-2 max-w-xl text-base leading-relaxed text-neutral-600">
            Run the same live verification and send the buyer a DiW link — proof they read at the
            source instead of taking your photographs on trust.
          </p>
          <span className="mt-auto inline-block self-start pt-3 text-sm text-gold transition group-hover:text-goldSoft">
            For dealers →
          </span>
        </Link>
      </div>
    </div>
  );
}

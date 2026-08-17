import Link from 'next/link';
import ClockFace from '@/components/ClockFace';

const STEPS = [
  { n: '01', title: 'Enter your DiW ID', body: 'The number engraved at 6 o’clock on the rehaut.' },
  { n: '02', title: 'Receive a live challenge', body: 'DiW names a random hand position, valid for 20 minutes.' },
  { n: '03', title: 'Set the hands', body: 'Physically move the watch to the requested time.' },
  { n: '04', title: 'Send two photos', body: 'The dial at the requested time, and the DiW ID.' },
  { n: '05', title: 'Get a proof link', body: 'A verified result any buyer can open on diw.com for 24 hours.' },
];

export default function HomePage() {
  return (
    <div className="space-y-20">
      <section className="grid items-center gap-12 md:grid-cols-[1.3fr_1fr]">
        <div>
          <p className="eyebrow">Check My DiW</p>
          <h1 className="mt-4 font-display text-4xl leading-tight text-neutral-50 md:text-5xl">
            Prove the watch is real — and that it is in your hands right now.
          </h1>
          <p className="mt-6 max-w-xl text-neutral-400">
            A photograph proves nothing on its own; anyone can forward one. DiW Live Verification
            asks for a hand position that only exists after we ask for it, so a passing result
            means someone held that specific watch within the last twenty minutes.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Link href="/verify" className="btn-primary">
              Verify my watch
            </Link>
            <Link href="/dealer" className="btn-ghost">
              I’m a dealer
            </Link>
          </div>
        </div>

        <div className="flex justify-center">
          <ClockFace hour={8} minute={43} size={280} />
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl text-neutral-100">How it works</h2>
        <ol className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((step) => (
            <li key={step.n} className="panel p-6">
              <span className="font-display text-sm text-gold">{step.n}</span>
              <h3 className="mt-3 text-neutral-100">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-500">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="panel p-8">
        <h2 className="font-display text-xl text-neutral-100">Buying on the secondary market?</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-neutral-400">
          Ask the seller for a DiW verification link instead of photographs. The link is generated
          by DiW, not by the seller, and it expires after 24 hours — so it cannot be recycled from
          an older sale. You read the result on this site, so there is nothing to take on trust.
        </p>
      </section>
    </div>
  );
}

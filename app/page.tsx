import Link from 'next/link';

const STEPS = [
  { n: '01', title: 'Enter your DiW ID', body: 'The number engraved at 6 o’clock on the rehaut.' },
  { n: '02', title: 'Receive a live challenge', body: 'DiW names a random hand position, valid for 20 minutes.' },
  { n: '03', title: 'Set the hands', body: 'Physically move the watch to the requested time.' },
  { n: '04', title: 'Send two photos', body: 'The dial at the requested time, and the DiW ID.' },
  { n: '05', title: 'Get a proof link', body: 'A verified result any buyer can open on designa-individual.com for 24 hours.' },
];

export default function HomePage() {
  return (
    <div>
      <section className="-mt-8">
        <p className="eyebrow text-center">Check My DiW</p>
        <h1 className="mt-8 max-w-2xl font-display text-2xl leading-tight text-neutral-50 md:text-3xl">
          Prove the watch is authentic.
        </h1>
        <p className="mt-6 max-w-xl text-neutral-600">
          A photograph proves nothing — anyone can forward one. Live Verification asks for a hand
          position invented in the moment, proof the watch is in your hands right now.
        </p>
        <div className="mt-9 flex flex-wrap gap-4">
          <Link href="/verify" className="btn-primary">
            Verify my watch
          </Link>
          <Link href="/dealer" className="btn-ghost">
            I’m a dealer
          </Link>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl text-neutral-100">How it works</h2>
        <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map((step) => (
            <li key={step.n} className="panel p-4">
              <span className="font-display text-xs text-gold">{step.n}</span>
              <h3 className="mt-2 text-sm text-neutral-100">{step.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-neutral-600">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="panel mt-20 p-8">
        <h2 className="font-display text-xl text-neutral-100">Buying on the secondary market?</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-neutral-600">
          Ask for a DiW verification link, not photographs. Issued by DiW and valid 24 hours, it
          can’t be recycled from an old sale — read the result here, not on trust.
        </p>
      </section>
    </div>
  );
}

import Link from 'next/link';

const DEALER_STEPS = [
  'Enter the DiW ID of the watch you are selling.',
  'DiW returns a random hand position — for example 11:37.',
  'Set the hands on the watch to that time.',
  'Photograph the dial front on.',
  'Photograph the DiW ID on the rehaut.',
  'Upload both images.',
  'DiW confirms the verification.',
  'You receive a link that is valid for 24 hours.',
  'Send the link to the buyer.',
];

export default function DealerPage() {
  return (
    <div>
      <p className="eyebrow">For dealers</p>
      <h1 className="mt-4 font-display text-3xl text-neutral-50">
        Give buyers proof they don’t have to take on trust
      </h1>
      <p className="mt-4 max-w-2xl text-neutral-400">
        A buyer has no way to judge photographs you send them — they could be of any watch, taken at
        any time. A DiW verification link is issued by DiW and read on this site, so the buyer sees
        the confirmation at the source.
      </p>

      <div className="mt-10 grid gap-8 md:grid-cols-[1.1fr_1fr]">
        <ol className="panel space-y-4 p-8">
          {DEALER_STEPS.map((step, index) => (
            <li key={step} className="flex gap-4 text-sm text-neutral-300">
              <span className="w-5 shrink-0 font-display text-gold">{index + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>

        <div className="space-y-5">
          <div className="panel p-8">
            <h2 className="font-display text-lg text-neutral-100">What the buyer sees</h2>
            <p className="mt-3 text-sm leading-relaxed text-neutral-500">
              The date of the live verification, the collection, the base watch, materials, the DiW
              ID and the current status — with the archive photograph of that exact instance. No
              owner or dealer identity appears anywhere on the page.
            </p>
          </div>

          <div className="panel p-8">
            <h2 className="font-display text-lg text-neutral-100">Why 24 hours</h2>
            <p className="mt-3 text-sm leading-relaxed text-neutral-500">
              A short-lived link cannot be saved and reused for a different sale months later. If a
              deal takes longer, run the verification again — it takes a couple of minutes.
            </p>
          </div>

          <Link href="/verify/new?flow=dealer" className="btn-primary w-full">
            Start a dealer verification
          </Link>
        </div>
      </div>
    </div>
  );
}

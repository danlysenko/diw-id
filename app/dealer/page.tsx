import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import { CHALLENGE_WINDOW_TEXT } from '@/lib/challenge';

const DEALER_STEPS = [
  { title: 'Enter the DiW ID', body: 'The number on the rehaut of the watch you are selling.' },
  { title: 'Receive a live challenge', body: `DiW shows a random hand position, valid for ${CHALLENGE_WINDOW_TEXT}.` },
  { title: 'Set the hands', body: 'Physically move the watch to the requested time.' },
  { title: 'Photograph and upload', body: 'The dial at the requested time, and the DiW ID on the rehaut.' },
  {
    title: 'Await DiW confirmation',
    body: 'DiW Authentication verifies your submission against the official build archive.',
  },
  { title: 'Send the link to the buyer', body: 'Valid for 24 hours. The buyer reads the result from DiW, not from you.' },
];

export default function DealerPage() {
  return (
    <div>
      {/* The CTA sits in the header so it's visible straight away on phones. */}
      <PageHeader
        eyebrow="For dealers"
        title="Give buyers proof they don’t have to take on trust"
        actions={
          <Link href="/verify/new?flow=dealer" className="btn-primary">
            Start a dealer verification
          </Link>
        }
      >
        <p>
          A buyer has no way to judge photographs you send them — they could be of any watch, taken
          at any time. A DiW verification link is issued by DiW and read on this site, so the buyer
          sees the confirmation at the source.
        </p>
      </PageHeader>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] xl:gap-8">
        {/* Same numbered-list card as "How it works" on the homepage. */}
        <section className="panel panel-pad">
          <h2 className="font-display text-xl text-neutral-100">How it works</h2>
          <ol className="mt-4 divide-y divide-black/10">
            {DEALER_STEPS.map((step, index) => (
              <li key={step.title} className="flex gap-4 py-3 last:pb-0">
                <span className="w-5 shrink-0 font-display text-sm leading-5 text-gold">{index + 1}.</span>
                <div>
                  <h3 className="text-sm text-neutral-100">{step.title}</h3>
                  <p className="mt-0.5 text-xs leading-relaxed text-neutral-600">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <div className="space-y-6">
          <div className="panel panel-pad">
            <h2 className="font-display text-lg text-neutral-100">What the buyer sees</h2>
            <p className="mt-3 text-sm leading-relaxed text-neutral-500">
              The date of the live verification, the collection, the base watch, materials, the DiW
              ID and the current status — with the archive photograph of that exact instance. No
              owner or dealer identity appears anywhere on the page.
            </p>
          </div>

          <div className="panel panel-pad">
            <h2 className="font-display text-lg text-neutral-100">Why 24 hours</h2>
            <p className="mt-3 text-sm leading-relaxed text-neutral-500">
              A short-lived link cannot be saved and reused for a different sale months later. If a
              deal takes longer, run the verification again — it takes a couple of minutes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

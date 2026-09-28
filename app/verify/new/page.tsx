import PageHeader from '@/components/PageHeader';
import StepRail from '@/components/StepRail';
import { CHALLENGE_WINDOW_TEXT } from '@/lib/challenge';
import DiwIdForm from './DiwIdForm';

export default async function EnterDiwIdPage({
  searchParams,
}: {
  searchParams: Promise<{ flow?: string }>;
}) {
  const { flow: rawFlow } = await searchParams;
  const flow = rawFlow === 'dealer' ? 'dealer' : 'owner';

  return (
    <div>
      <StepRail current={1} />

      <PageHeader
        eyebrow={flow === 'dealer' ? 'Dealer verification' : 'Live verification'}
        title="Enter the DiW ID"
      >
        <p>
          The number is engraved on the rehaut at 6 o’clock. It looks like{' '}
          <span className="text-neutral-200">26-00483</span>.
        </p>
      </PageHeader>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,28rem)_minmax(0,1fr)] xl:gap-10">
        <div className="panel panel-pad">
          <DiwIdForm flow={flow} />
        </div>

        <aside className="space-y-4 text-sm leading-relaxed text-neutral-600 lg:pt-2">
          <p>
            <span className="text-neutral-100">What happens next.</span> DiW issues a random hand
            position for this watch. You have {CHALLENGE_WINDOW_TEXT} to set the hands and send two
            photos.
          </p>
          <p className="text-xs text-neutral-500">
            DiW does not display any details of the watch at this stage. A valid number alone proves
            nothing — the instance record opens only after live verification passes.
          </p>
        </aside>
      </div>
    </div>
  );
}

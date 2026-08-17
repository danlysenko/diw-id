import StepRail from '@/components/StepRail';
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

      <p className="eyebrow">{flow === 'dealer' ? 'Dealer verification' : 'Live verification'}</p>
      <h1 className="mt-4 font-display text-3xl text-neutral-50">Enter the DiW ID</h1>
      <p className="mt-4 max-w-2xl text-neutral-400">
        The number is engraved on the rehaut at 6 o’clock. It looks like{' '}
        <span className="text-neutral-200">26-00483</span>.
      </p>

      <div className="mt-10 max-w-md">
        <DiwIdForm flow={flow} />
      </div>

      <p className="mt-8 max-w-2xl text-xs leading-relaxed text-neutral-600">
        DiW does not display any details of the watch at this stage. A valid number alone proves
        nothing — the instance record opens only after live verification passes.
      </p>
    </div>
  );
}

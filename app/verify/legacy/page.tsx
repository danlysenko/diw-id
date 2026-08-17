import LegacyForm from './LegacyForm';

export default function LegacyPage() {
  return (
    <div>
      <p className="eyebrow">DiW Legacy — before 2026</p>
      <h1 className="mt-4 font-display text-3xl text-neutral-50">Open an archive case</h1>
      <p className="mt-4 max-w-2xl text-neutral-400">
        Watches built before 2026 do not carry a DiW ID, so there is nothing to look up
        automatically. Tell us what you have and DiW Authentication will match it against the build
        archive by hand.
      </p>

      <div className="mt-10 max-w-2xl">
        <LegacyForm />
      </div>
    </div>
  );
}

import PageHeader from '@/components/PageHeader';
import { createLegacyChallenge } from '@/lib/sessions';
import LegacyForm from './LegacyForm';

// Each visit issues a fresh, single-use hand position, so this page can never be cached.
export const dynamic = 'force-dynamic';

export default function LegacyPage() {
  const challenge = createLegacyChallenge();

  return (
    <div>
      <PageHeader eyebrow="DiW Legacy — before 2026" title="Open an archive case">
        <p>
          Watches built before 2026 do not carry a DiW ID, so there is nothing to look up
          automatically. Tell us what you have and DiW Authentication will match it against the
          build archive by hand.
        </p>
      </PageHeader>

      <LegacyForm
        challenge={{
          id: challenge.id,
          hour: challenge.challenge_hour,
          minute: challenge.challenge_minute,
          expiresAt: challenge.expires_at,
        }}
      />
    </div>
  );
}

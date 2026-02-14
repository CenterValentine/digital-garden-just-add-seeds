import { SectionShell } from '@/components/SectionShell';
import { requireProfile } from '@/lib/require-profile';

export default async function WatchPage() {
  await requireProfile();

  return (
    <SectionShell title="Watch">
      <div className="glass rounded-2xl p-6 shadow-glass">
        <h2 className="text-xl font-display text-ink">Garden Watch</h2>
        <p className="mt-2 text-sm text-ink/70">
          A live dashboard for climate, irrigation, and plant status will land here. This space will
          unify time-lapse views, sensor feeds, and map overlays.
        </p>
      </div>
    </SectionShell>
  );
}

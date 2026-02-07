import { MapCanvas } from '@/components/MapCanvas';
import { SectionShell } from '@/components/SectionShell';
import { requireProfile } from '@/lib/require-profile';

const areas = [
  { name: 'Area 1', status: 'Unlocked' },
  { name: 'Area 2', status: 'Locked after planting' }
];

export default async function PlanPage() {
  await requireProfile();

  return (
    <SectionShell title="Plan">
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="glass h-[520px] rounded-2xl p-3 shadow-glass">
          <MapCanvas />
        </div>
        <aside className="glass flex flex-col gap-4 rounded-2xl p-6 shadow-glass">
          <div>
            <h2 className="text-xl font-display text-ink">Property Setup</h2>
            <p className="mt-2 text-sm text-ink/70">
              Search your address, enhance the imagery, then trace your property with precise
              polygons. Areas lock after planting.
            </p>
          </div>
          <div className="rounded-2xl border border-ink/10 p-4">
            <p className="text-sm font-semibold text-ink">Enhance Imagery</p>
            <p className="mt-1 text-xs text-ink/60">7 attempts per day. Async processing.</p>
            <button className="mt-3 w-full rounded-full bg-ink px-4 py-2 text-sm text-white">
              Enhance Imagery
            </button>
            <button className="mt-2 w-full rounded-full border border-ink/20 px-4 py-2 text-sm">
              Bring Your Own Image
            </button>
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">Areas</p>
            <ul className="mt-2 space-y-2 text-sm">
              {areas.map((area) => (
                <li key={area.name} className="rounded-xl border border-ink/10 p-3">
                  <p className="font-medium text-ink">{area.name}</p>
                  <p className="text-xs text-ink/60">{area.status}</p>
                </li>
              ))}
            </ul>
            <button className="mt-3 w-full rounded-full border border-ink/20 px-4 py-2 text-sm">
              Add Area
            </button>
          </div>
        </aside>
      </div>
    </SectionShell>
  );
}

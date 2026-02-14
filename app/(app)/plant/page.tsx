import { MapCanvas } from '@/components/MapCanvas';
import { SectionShell } from '@/components/SectionShell';
import { requireProfile } from '@/lib/require-profile';

const categories = [
  { title: 'Plants', description: 'Flowers, vegetables, trees, herbs.' },
  { title: 'Irrigation', description: 'Ollas, drip lines, sprinklers.' },
  { title: 'Artifacts', description: 'Scarecrow, owl, gnome.' },
  { title: 'Furniture', description: 'Bench, picnic bench.' }
];

export default async function PlantPage() {
  await requireProfile();

  return (
    <SectionShell title="Plant">
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="glass h-[520px] rounded-2xl p-3 shadow-glass">
          <MapCanvas />
        </div>
        <aside className="glass flex flex-col gap-4 rounded-2xl p-6 shadow-glass">
          <div>
            <h2 className="text-xl font-display text-ink">Placement Palette</h2>
            <p className="mt-2 text-sm text-ink/70">
              Click the map to place a point, then choose what to plant or add. Plants are pulled from
              the catalog and create plant instances with rules.
            </p>
          </div>
          <div className="grid gap-3">
            {categories.map((category) => (
              <button
                key={category.title}
                className="rounded-2xl border border-ink/10 p-4 text-left transition hover:-translate-y-0.5"
              >
                <p className="text-sm font-semibold text-ink">{category.title}</p>
                <p className="mt-1 text-xs text-ink/60">{category.description}</p>
              </button>
            ))}
          </div>
          <div className="rounded-2xl border border-ink/10 p-4">
            <p className="text-sm font-semibold text-ink">Placed Items</p>
            <p className="mt-1 text-xs text-ink/60">No items yet. Start by clicking on the map.</p>
          </div>
        </aside>
      </div>
    </SectionShell>
  );
}

import { SectionShell } from '@/components/SectionShell';
import { requireProfile } from '@/lib/require-profile';

const tasks = [
  { title: 'Water tomatoes', due: 'Tomorrow' },
  { title: 'Check for aphids', due: 'In 4 days' }
];

const alerts = [
  { title: 'Heat wave incoming', level: 'Medium' },
  { title: 'Low moisture in Area 2', level: 'High' }
];

export default async function GrowPage() {
  await requireProfile();

  return (
    <SectionShell title="Grow">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <section className="glass rounded-2xl p-6 shadow-glass">
          <h2 className="text-xl font-display text-ink">Today’s Tasks</h2>
          <ul className="mt-4 space-y-3">
            {tasks.map((task) => (
              <li key={task.title} className="rounded-2xl border border-ink/10 p-4">
                <p className="text-sm font-semibold text-ink">{task.title}</p>
                <p className="text-xs text-ink/60">Due {task.due}</p>
              </li>
            ))}
          </ul>
        </section>
        <aside className="glass rounded-2xl p-6 shadow-glass">
          <h2 className="text-xl font-display text-ink">Alerts & Inbox</h2>
          <div className="mt-4 space-y-3">
            {alerts.map((alert) => (
              <div key={alert.title} className="rounded-2xl border border-ink/10 p-4">
                <p className="text-sm font-semibold text-ink">{alert.title}</p>
                <p className="text-xs text-ink/60">Severity: {alert.level}</p>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </SectionShell>
  );
}

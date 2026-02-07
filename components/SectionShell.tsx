import Link from 'next/link';

const nav = [
  { label: 'Plan', href: '/plan' },
  { label: 'Plant', href: '/plant' },
  { label: 'Grow', href: '/grow' },
  { label: 'Watch', href: '/watch' },
  { label: 'Settings', href: '/settings' }
];

export function SectionShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="min-h-screen px-6 py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="glass flex flex-wrap items-center justify-between gap-4 rounded-2xl px-6 py-4 shadow-glass">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-leaf">Garden Map</p>
            <h1 className="text-2xl font-display text-ink">{title}</h1>
          </div>
          <nav className="flex flex-wrap gap-2 text-sm">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full border border-ink/15 px-4 py-2 text-ink/70 hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        {children}
      </div>
    </main>
  );
}

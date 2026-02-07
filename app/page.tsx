import Link from 'next/link';

const sections = [
  { title: 'Plan', description: 'Trace your property and lock garden areas.', href: '/plan' },
  { title: 'Plant', description: 'Place plants, irrigation, and artifacts.', href: '/plant' },
  { title: 'Grow', description: 'See tasks, alerts, and harvest countdowns.', href: '/grow' },
  { title: 'Watch', description: 'Monitor your garden at a glance.', href: '/watch' }
];

export default function HomePage() {
  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <header className="glass rounded-3xl p-10 shadow-glass">
          <p className="text-sm uppercase tracking-[0.3em] text-leaf">Garden Map</p>
          <h1 className="mt-4 text-4xl font-display text-ink md:text-6xl">
            Design, plant, and nurture every bed from a living map.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-ink/70">
            A liquid-glass workspace that blends satellite imagery, AI enhancement, and intelligent
            planting rules. Start by outlining your property, then layer your plants and tasks in one
            coherent map.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/auth/sign-up" className="rounded-full bg-ink px-5 py-2 text-sm text-white">
              Create account
            </Link>
            <Link href="/auth/sign-in" className="rounded-full border border-ink/20 px-5 py-2 text-sm">
              Sign in
            </Link>
          </div>
        </header>

        <section className="mt-10 grid gap-4 md:grid-cols-2">
          {sections.map((section) => (
            <Link
              key={section.title}
              href={section.href}
              className="glass rounded-2xl p-6 shadow-glass transition hover:-translate-y-1"
            >
              <h2 className="text-2xl font-display text-ink">{section.title}</h2>
              <p className="mt-2 text-sm text-ink/70">{section.description}</p>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}

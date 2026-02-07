'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const [intents, setIntents] = useState('Vegetables');
  const [experience, setExperience] = useState('');
  const [climateZone, setClimateZone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  if (status === 'loading') {
    return <div className="min-h-screen px-6 py-12">Loading…</div>;
  }

  useEffect(() => {
    const checkProfile = async () => {
      const res = await fetch('/api/profile');
      if (!res.ok) return;
      const data = await res.json();
      if (data.user?.profile) {
        router.push('/plan');
      }
    };

    if (session?.user?.email) {
      checkProfile();
    }
  }, [router, session?.user?.email]);

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto flex max-w-xl flex-col gap-6">
        <header className="glass rounded-2xl p-6 shadow-glass">
          <p className="text-xs uppercase tracking-[0.3em] text-leaf">Garden Map</p>
          <h1 className="mt-2 text-2xl font-display text-ink">Onboarding</h1>
          <p className="mt-2 text-sm text-ink/70">
            Welcome{session?.user?.name ? `, ${session.user.name}` : ''}! Tell us about your garden
            goals.
          </p>
        </header>

        <section className="glass rounded-2xl p-6 shadow-glass">
          <form
            className="flex flex-col gap-3"
            onSubmit={async (event) => {
              event.preventDefault();
              if (!session?.user?.email) return;
              setSubmitting(true);
              setError(null);

              const res = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  name: session.user.name ?? 'Gardener',
                  intents: intents.split(',').map((item) => item.trim()).filter(Boolean),
                  experienceLevel: experience,
                  climateZone
                })
              });

              if (!res.ok) {
                const payload = await res.json().catch(() => null);
                setError(payload?.error ?? 'Unable to save onboarding.');
                setSubmitting(false);
                return;
              }

              router.push('/plan');
            }}
          >
            <input
              className="rounded-xl border border-ink/10 bg-white/60 px-4 py-2 text-sm"
              placeholder="Intents (comma-separated)"
              value={intents}
              onChange={(event) => setIntents(event.target.value)}
            />
            <input
              className="rounded-xl border border-ink/10 bg-white/60 px-4 py-2 text-sm"
              placeholder="Experience level"
              value={experience}
              onChange={(event) => setExperience(event.target.value)}
            />
            <input
              className="rounded-xl border border-ink/10 bg-white/60 px-4 py-2 text-sm"
              placeholder="Climate zone (optional)"
              value={climateZone}
              onChange={(event) => setClimateZone(event.target.value)}
            />
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <button className="rounded-full bg-ink px-4 py-2 text-sm text-white" type="submit">
              {submitting ? 'Saving…' : 'Save & Continue'}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

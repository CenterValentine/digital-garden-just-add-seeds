'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  INTENT_OPTIONS,
  EXPERIENCE_OPTIONS,
  CLIMATE_ZONE_OPTIONS
} from '@/lib/survey-options';

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const [intents, setIntents] = useState<string[]>(['Vegetables']);
  const [experience, setExperience] = useState('');
  const [climateZone, setClimateZone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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

  if (status === 'loading') {
    return <div className="min-h-screen px-6 py-12">Loading…</div>;
  }

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
                  intents,
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
            <div className="rounded-2xl border border-ink/10 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-ink/60">Intents</p>
              <div className="mt-3 grid gap-2">
                {INTENT_OPTIONS.map((intent) => (
                  <label key={intent} className="flex items-center gap-2 text-sm text-ink/80">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={intents.includes(intent)}
                      onChange={(event) => {
                        setIntents((prev) =>
                          event.target.checked
                            ? [...prev, intent]
                            : prev.filter((value) => value !== intent)
                        );
                      }}
                    />
                    {intent}
                  </label>
                ))}
              </div>
            </div>

            <label className="text-xs uppercase tracking-[0.2em] text-ink/60">Experience</label>
            <select
              className="rounded-xl border border-ink/10 bg-white/60 px-4 py-2 text-sm"
              value={experience}
              onChange={(event) => setExperience(event.target.value)}
            >
              <option value="">Select experience</option>
              {EXPERIENCE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <label className="text-xs uppercase tracking-[0.2em] text-ink/60">Climate Zone</label>
            <select
              className="rounded-xl border border-ink/10 bg-white/60 px-4 py-2 text-sm"
              value={climateZone}
              onChange={(event) => setClimateZone(event.target.value)}
            >
              <option value="">Select zone</option>
              {CLIMATE_ZONE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

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

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import {
  INTENT_OPTIONS,
  EXPERIENCE_OPTIONS,
  CLIMATE_ZONE_OPTIONS
} from '@/lib/survey-options';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [intents, setIntents] = useState<string[]>(['Vegetables']);
  const [experience, setExperience] = useState('');
  const [climateZone, setClimateZone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto flex max-w-md flex-col gap-6">
        <header className="glass rounded-2xl p-6 shadow-glass">
          <p className="text-xs uppercase tracking-[0.3em] text-leaf">Garden Map</p>
          <h1 className="mt-2 text-2xl font-display text-ink">Create your account</h1>
          <p className="mt-2 text-sm text-ink/70">
            Start with Google or create a local account and customize your gardening profile.
          </p>
        </header>

        <section className="glass rounded-2xl p-6 shadow-glass">
          <button
            className="w-full rounded-full bg-ink px-4 py-2 text-sm text-white"
            onClick={() => signIn('google', { callbackUrl: '/onboarding' })}
          >
            Continue with Google
          </button>
          <div className="my-4 text-center text-xs text-ink/50">or</div>
          <form
            className="flex flex-col gap-3"
            onSubmit={async (event) => {
              event.preventDefault();
              setSubmitting(true);
              setError(null);

              const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  email,
                  name,
                  password,
                  authProvider: 'EMAIL',
                  intents,
                  experienceLevel: experience,
                  climateZone
                })
              });

              if (!res.ok) {
                const payload = await res.json().catch(() => null);
                setError(payload?.error ?? 'Unable to create account.');
                setSubmitting(false);
                return;
              }

              await signIn('credentials', { email, password, callbackUrl: '/onboarding' });
            }}
          >
            <input
              className="rounded-xl border border-ink/10 bg-white/60 px-4 py-2 text-sm"
              placeholder="Name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <input
              className="rounded-xl border border-ink/10 bg-white/60 px-4 py-2 text-sm"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <input
              className="rounded-xl border border-ink/10 bg-white/60 px-4 py-2 text-sm"
              type="password"
              placeholder="Password (min 8 chars)"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />

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
            <button
              className="rounded-full bg-ink px-4 py-2 text-sm text-white"
              type="submit"
              disabled={submitting}
            >
              {submitting ? 'Creating…' : 'Create account'}
            </button>
          </form>
          <p className="mt-4 text-xs text-ink/60">
            Already have an account?{' '}
            <Link className="text-leaf" href="/auth/sign-in">
              Sign in
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [intents, setIntents] = useState('Vegetables');
  const [experience, setExperience] = useState('');
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
                  intents: intents.split(',').map((item) => item.trim()).filter(Boolean),
                  experienceLevel: experience
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
            <input
              className="rounded-xl border border-ink/10 bg-white/60 px-4 py-2 text-sm"
              placeholder="Intents (comma-separated)"
              value={intents}
              onChange={(event) => setIntents(event.target.value)}
            />
            <input
              className="rounded-xl border border-ink/10 bg-white/60 px-4 py-2 text-sm"
              placeholder="Experience level (optional)"
              value={experience}
              onChange={(event) => setExperience(event.target.value)}
            />
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

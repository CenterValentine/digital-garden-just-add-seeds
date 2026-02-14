'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import Link from 'next/link';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto flex max-w-md flex-col gap-6">
        <header className="glass rounded-2xl p-6 shadow-glass">
          <p className="text-xs uppercase tracking-[0.3em] text-leaf">Garden Map</p>
          <h1 className="mt-2 text-2xl font-display text-ink">Sign in</h1>
          <p className="mt-2 text-sm text-ink/70">
            Use Google or your email/password to access your garden workspace.
          </p>
        </header>

        <section className="glass rounded-2xl p-6 shadow-glass">
          <button
            className="w-full rounded-full bg-ink px-4 py-2 text-sm text-white"
            onClick={() => signIn('google')}
          >
            Continue with Google
          </button>
          <div className="my-4 text-center text-xs text-ink/50">or</div>
          <form
            className="flex flex-col gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              signIn('credentials', { email, password, callbackUrl: '/plan' });
            }}
          >
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
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <button className="rounded-full bg-ink px-4 py-2 text-sm text-white" type="submit">
              Sign in
            </button>
          </form>
          <p className="mt-4 text-xs text-ink/60">
            Need an account? Create one via the onboarding flow or API.
          </p>
          <Link className="mt-2 inline-block text-xs text-leaf" href="/">
            Back to home
          </Link>
        </section>
      </div>
    </main>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { SectionShell } from '@/components/SectionShell';

type ProfilePayload = {
  name: string;
  email: string;
  intents: string[];
  experienceLevel?: string | null;
  climateZone?: string | null;
};

export default function SettingsPage() {
  const [profile, setProfile] = useState<ProfilePayload | null>(null);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const res = await fetch('/api/profile');
      if (!res.ok) return;
      const data = await res.json();
      const user = data.user;
      setProfile({
        name: user.name,
        email: user.email,
        intents: user.profile?.intents ?? [],
        experienceLevel: user.profile?.experienceLevel ?? '',
        climateZone: user.profile?.climateZone ?? ''
      });
    };

    load();
  }, []);

  if (!profile) {
    return (
      <SectionShell title="Settings">
        <div className="glass rounded-2xl p-6 shadow-glass">Loading…</div>
      </SectionShell>
    );
  }

  return (
    <SectionShell title="Settings">
      <div className="glass rounded-2xl p-6 shadow-glass">
        <h2 className="text-xl font-display text-ink">Profile</h2>
        <p className="mt-1 text-sm text-ink/60">Update your gardening preferences.</p>
        <form
          className="mt-6 flex max-w-xl flex-col gap-3"
          onSubmit={async (event) => {
            event.preventDefault();
            setStatus('saving');
            setError(null);

            const res = await fetch('/api/profile', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: profile.name,
                intents: profile.intents,
                experienceLevel: profile.experienceLevel,
                climateZone: profile.climateZone
              })
            });

            if (!res.ok) {
              const payload = await res.json().catch(() => null);
              setError(payload?.error ?? 'Unable to save settings.');
              setStatus('error');
              return;
            }

            setStatus('saved');
          }}
        >
          <label className="text-xs uppercase tracking-[0.2em] text-ink/50">Name</label>
          <input
            className="rounded-xl border border-ink/10 bg-white/60 px-4 py-2 text-sm"
            value={profile.name}
            onChange={(event) => setProfile({ ...profile, name: event.target.value })}
          />

          <label className="text-xs uppercase tracking-[0.2em] text-ink/50">Email</label>
          <input
            className="rounded-xl border border-ink/10 bg-white/60 px-4 py-2 text-sm"
            value={profile.email}
            disabled
          />

          <label className="text-xs uppercase tracking-[0.2em] text-ink/50">Intents</label>
          <input
            className="rounded-xl border border-ink/10 bg-white/60 px-4 py-2 text-sm"
            value={profile.intents.join(', ')}
            onChange={(event) =>
              setProfile({
                ...profile,
                intents: event.target.value
                  .split(',')
                  .map((item) => item.trim())
                  .filter(Boolean)
              })
            }
          />

          <label className="text-xs uppercase tracking-[0.2em] text-ink/50">Experience</label>
          <input
            className="rounded-xl border border-ink/10 bg-white/60 px-4 py-2 text-sm"
            value={profile.experienceLevel ?? ''}
            onChange={(event) => setProfile({ ...profile, experienceLevel: event.target.value })}
          />

          <label className="text-xs uppercase tracking-[0.2em] text-ink/50">Climate Zone</label>
          <input
            className="rounded-xl border border-ink/10 bg-white/60 px-4 py-2 text-sm"
            value={profile.climateZone ?? ''}
            onChange={(event) => setProfile({ ...profile, climateZone: event.target.value })}
          />

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {status === 'saved' ? <p className="text-sm text-leaf">Saved.</p> : null}

          <button
            className="mt-2 w-fit rounded-full bg-ink px-5 py-2 text-sm text-white"
            type="submit"
            disabled={status === 'saving'}
          >
            {status === 'saving' ? 'Saving…' : 'Save settings'}
          </button>
        </form>
      </div>
    </SectionShell>
  );
}

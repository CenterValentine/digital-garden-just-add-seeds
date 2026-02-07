# Garden Map App

A Next.js application for planning and managing gardens directly on a map. This is the V1 infrastructure: data models, API routes, and liquid-glass UI placeholders for Plan, Plant, Grow, Watch, and Settings.

## Setup (pnpm)

```bash
pnpm install
```

Create a `.env` file (see `.env.example`).

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/garden_map"
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-google-maps-key"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="replace-with-32+-char-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

Run Prisma:

```bash
pnpm prisma:generate
pnpm prisma:migrate
```

Start the dev server:

```bash
pnpm dev
```

## Auth Notes
- Auth uses NextAuth with Google OAuth and Credentials (email/password).
- Sign in UI lives at `/auth/sign-in`. Sign up UI is at `/auth/sign-up`.
- The signup API at `/api/auth/signup` accepts `password` (min 8 chars) for email/password users and stores a bcrypt hash.
- Middleware protects `/plan`, `/plant`, `/grow`, `/watch`, `/onboarding`, and `/settings`.
- Onboarding gate: after auth, users without a profile are redirected to `/onboarding`.

## Notes
- API routes assume a database connection and minimal validation.
- AI enhancement is modeled as an async pipeline. The `/api/overlay/enhance` route enforces 7 attempts per day.
- BYOI overlays accept pre-aligned image URLs and calibration points.
- Rule factories live in `lib/rules/factories.ts` and are intended to be wired into a cron/scheduler.


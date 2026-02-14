import { z } from 'zod';
import { prisma } from '@/lib/db';
import { badRequest, json } from '@/lib/api';
import { hash } from 'bcryptjs';

const payloadSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  authProvider: z.enum(['GOOGLE', 'EMAIL']),
  password: z.string().min(8).optional(),
  intents: z.array(z.string()).default([]),
  experienceLevel: z.string().optional(),
  climateZone: z.string().optional()
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest('Invalid signup payload.');
  }

  const { email, name, authProvider, password, intents, experienceLevel, climateZone } = parsed.data;

  if (authProvider === 'EMAIL' && !password) {
    return badRequest('Password is required for email signup.');
  }

  const passwordHash = password ? await hash(password, 10) : undefined;

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      authProvider,
      ...(passwordHash ? { passwordHash } : {})
    },
    create: {
      email,
      name,
      authProvider,
      passwordHash,
      profile: { create: { intents, experienceLevel, climateZone } }
    },
    include: { profile: true }
  });

  return json({ user });
}

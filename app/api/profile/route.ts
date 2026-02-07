import { z } from 'zod';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { badRequest, json } from '@/lib/api';

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  intents: z.array(z.string()).optional(),
  experienceLevel: z.string().optional(),
  climateZone: z.string().optional()
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return badRequest('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { profile: true }
  });

  return json({ user });
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return badRequest('Unauthorized');
  }

  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest('Invalid profile payload.');
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    return badRequest('User not found.');
  }

  const { name, intents, experienceLevel, climateZone } = parsed.data;

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      ...(name ? { name } : {}),
      profile: {
        upsert: {
          create: {
            intents: intents ?? [],
            experienceLevel,
            climateZone
          },
          update: {
            ...(intents ? { intents } : {}),
            ...(experienceLevel ? { experienceLevel } : {}),
            ...(climateZone ? { climateZone } : {})
          }
        }
      }
    },
    include: { profile: true }
  });

  return json({ user: updated });
}

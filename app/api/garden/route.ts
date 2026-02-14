import { z } from 'zod';
import { prisma } from '@/lib/db';
import { badRequest, json } from '@/lib/api';

const payloadSchema = z.object({
  userId: z.string(),
  name: z.string().min(1),
  baseLocation: z.object({ lat: z.number(), lng: z.number() }),
  timezone: z.string().min(1)
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest('Invalid garden payload.');
  }

  const garden = await prisma.garden.create({
    data: {
      userId: parsed.data.userId,
      name: parsed.data.name,
      baseLocation: parsed.data.baseLocation,
      timezone: parsed.data.timezone
    }
  });

  return json({ garden });
}

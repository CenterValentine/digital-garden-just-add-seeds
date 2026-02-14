import { z } from 'zod';
import { prisma } from '@/lib/db';
import { badRequest, json } from '@/lib/api';

const payloadSchema = z.object({
  areaId: z.string()
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest('Invalid lock payload.');
  }

  const area = await prisma.gardenArea.update({
    where: { id: parsed.data.areaId },
    data: { isLocked: true }
  });

  return json({ area });
}

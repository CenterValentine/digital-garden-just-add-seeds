import { z } from 'zod';
import { prisma } from '@/lib/db';
import { badRequest, json } from '@/lib/api';

const payloadSchema = z.object({
  gardenId: z.string(),
  imageUrl: z.string().url().optional(),
  bounds: z.object({
    north: z.number(),
    south: z.number(),
    east: z.number(),
    west: z.number()
  }).optional(),
  opacity: z.number().min(0).max(1).optional()
});

function startOfTodayUtc() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest('Invalid enhancement payload.');
  }

  const { gardenId } = parsed.data;
  const start = startOfTodayUtc();
  const attemptsToday = await prisma.overlayEnhancementAttempt.count({
    where: { gardenId, createdAt: { gte: start } }
  });

  if (attemptsToday >= 7) {
    return badRequest('Daily enhancement limit reached.');
  }

  await prisma.overlayEnhancementAttempt.create({ data: { gardenId } });

  let overlay = null;
  if (parsed.data.imageUrl && parsed.data.bounds) {
    overlay = await prisma.mapOverlay.create({
      data: {
        gardenId,
        type: 'AI_ENHANCED',
        imageUrl: parsed.data.imageUrl,
        bounds: parsed.data.bounds,
        opacity: parsed.data.opacity ?? 0.75
      }
    });
  }

  return json({ status: 'QUEUED', attemptsToday: attemptsToday + 1, overlay });
}

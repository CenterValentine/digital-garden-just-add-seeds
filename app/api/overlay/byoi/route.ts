import { z } from 'zod';
import { prisma } from '@/lib/db';
import { badRequest, json } from '@/lib/api';

const payloadSchema = z.object({
  gardenId: z.string(),
  imageUrl: z.string().url(),
  bounds: z.object({
    north: z.number(),
    south: z.number(),
    east: z.number(),
    west: z.number()
  }),
  alignmentPoints: z.array(z.object({ lat: z.number(), lng: z.number() })).min(2).max(4),
  opacity: z.number().min(0).max(1).optional()
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest('Invalid BYOI payload.');
  }

  const overlay = await prisma.mapOverlay.create({
    data: {
      gardenId: parsed.data.gardenId,
      type: 'BYOI',
      imageUrl: parsed.data.imageUrl,
      bounds: parsed.data.bounds,
      alignmentPoints: parsed.data.alignmentPoints,
      opacity: parsed.data.opacity ?? 0.75
    }
  });

  return json({ overlay });
}

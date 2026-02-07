import { z } from 'zod';
import { prisma } from '@/lib/db';
import { badRequest, json } from '@/lib/api';

const payloadSchema = z.object({
  gardenId: z.string(),
  gardenAreaId: z.string().optional(),
  catalogItemId: z.string(),
  location: z.object({ lat: z.number(), lng: z.number() }),
  rotation: z.number().optional(),
  plantedAt: z.string().datetime().optional(),
  overrides: z.record(z.any()).optional()
});

const ruleRefSchema = z.array(
  z.object({
    ruleTemplateId: z.string(),
    paramsOverride: z.record(z.any()).optional()
  })
);

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest('Invalid item payload.');
  }

  const { gardenId, gardenAreaId, catalogItemId, location, rotation, plantedAt, overrides } = parsed.data;

  const catalogItem = await prisma.catalogItem.findUnique({
    where: { id: catalogItemId },
    include: { plantCatalog: true }
  });
  if (!catalogItem) {
    return badRequest('Catalog item not found.');
  }

  if (catalogItem.type === 'PLANT' && !gardenAreaId) {
    return badRequest('Planting areas are required for plants.');
  }

  const item = await prisma.gardenItem.create({
    data: {
      gardenId,
      gardenAreaId: gardenAreaId ?? null,
      catalogItemId,
      type: catalogItem.type,
      location,
      rotation
    }
  });

  let plantInstance = null;
  if (catalogItem.type === 'PLANT') {
    const defaultRules = ruleRefSchema.safeParse(catalogItem.plantCatalog?.defaultRules ?? []);
    plantInstance = await prisma.plantInstance.create({
      data: {
        gardenItemId: item.id,
        plantedAt: plantedAt ? new Date(plantedAt) : new Date(),
        status: 'PLANTED',
        overrides: overrides ?? {},
        assignments: {
          create: defaultRules.success
            ? defaultRules.data.map((rule) => ({
                ruleTemplateId: rule.ruleTemplateId,
                paramsOverride: rule.paramsOverride ?? {}
              }))
            : []
        }
      },
      include: { assignments: true }
    });

    // Plants belong to a planting area, but we do not lock areas anymore.
  }

  return json({ item, plantInstance });
}

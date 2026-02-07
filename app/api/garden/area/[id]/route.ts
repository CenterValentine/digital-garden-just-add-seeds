import { z } from 'zod';
import { prisma } from '@/lib/db';
import { badRequest, json } from '@/lib/api';
import { pointInPolygon, polygonWithinRadius, type LatLng } from '@/lib/geo';

const payloadSchema = z.object({
  polygonGeoJSON: z.object({
    type: z.literal('Polygon'),
    coordinates: z.array(z.array(z.tuple([z.number(), z.number()])))
  }),
  areaSqM: z.number().positive(),
  baseLocation: z.object({ lat: z.number(), lng: z.number() }),
  confirmDelete: z.boolean().optional().default(false)
});

function extractPoints(geojson: z.infer<typeof payloadSchema>['polygonGeoJSON']): LatLng[] {
  const ring = geojson.coordinates[0] ?? [];
  return ring.map(([lng, lat]) => ({ lat, lng }));
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json().catch(() => null);
  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest('Invalid area payload.');
  }

  const points = extractPoints(parsed.data.polygonGeoJSON);
  if (points.length < 3) {
    return badRequest('Polygon must have at least 3 points.');
  }

  const withinRadius = polygonWithinRadius(points, parsed.data.baseLocation, 1609.34);
  if (!withinRadius) {
    return badRequest('Area must be within 1 mile of the base location.');
  }

  const area = await prisma.gardenArea.findUnique({
    where: { id: params.id },
    include: {
      items: {
        where: { type: 'PLANT' },
        include: { catalogItem: true, plant: true }
      }
    }
  });

  if (!area) {
    return badRequest('Garden area not found.');
  }

  const outsidePlants = area.items.filter((item) => {
    const loc = item.location as { lat: number; lng: number } | null;
    if (!loc) return false;
    return !pointInPolygon({ lat: loc.lat, lng: loc.lng }, points);
  });

  if (outsidePlants.length > 0 && !parsed.data.confirmDelete) {
    return json(
      {
        requiresConfirmation: true,
        outsidePlants: outsidePlants.map((item) => ({
          id: item.id,
          name: item.catalogItem.name
        }))
      },
      { status: 409 }
    );
  }

  const outsideIds = outsidePlants.map((item) => item.id);

  const updated = await prisma.$transaction(async (tx) => {
    if (outsideIds.length > 0) {
      await tx.ruleAssignment.deleteMany({
        where: { plantInstance: { gardenItemId: { in: outsideIds } } }
      });
      await tx.task.deleteMany({
        where: { plantInstance: { gardenItemId: { in: outsideIds } } }
      });
      await tx.alert.deleteMany({
        where: { plantInstance: { gardenItemId: { in: outsideIds } } }
      });
      await tx.plantInstance.deleteMany({
        where: { gardenItemId: { in: outsideIds } }
      });
      await tx.gardenItem.deleteMany({ where: { id: { in: outsideIds } } });
    }

    return tx.gardenArea.update({
      where: { id: params.id },
      data: {
        polygonGeoJSON: parsed.data.polygonGeoJSON,
        areaSqM: parsed.data.areaSqM
      }
    });
  });

  return json({ area: updated, deletedPlantIds: outsideIds });
}

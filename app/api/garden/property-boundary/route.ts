import { z } from 'zod';
import { prisma } from '@/lib/db';
import { badRequest, json } from '@/lib/api';
import { polygonWithinRadius, type LatLng } from '@/lib/geo';

const payloadSchema = z.object({
  gardenId: z.string(),
  polygonGeoJSON: z.object({
    type: z.literal('Polygon'),
    coordinates: z.array(z.array(z.tuple([z.number(), z.number()])))
  }),
  areaSqM: z.number().positive(),
  baseLocation: z.object({ lat: z.number(), lng: z.number() })
});

function extractPoints(geojson: z.infer<typeof payloadSchema>['polygonGeoJSON']): LatLng[] {
  const ring = geojson.coordinates[0] ?? [];
  return ring.map(([lng, lat]) => ({ lat, lng }));
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest('Invalid property boundary payload.');
  }

  const points = extractPoints(parsed.data.polygonGeoJSON);
  if (points.length < 3) {
    return badRequest('Polygon must have at least 3 points.');
  }

  const withinRadius = polygonWithinRadius(points, parsed.data.baseLocation, 1609.34);
  if (!withinRadius) {
    return badRequest('Boundary must be within 1 mile of the base location.');
  }

  const garden = await prisma.garden.update({
    where: { id: parsed.data.gardenId },
    data: {
      propertyBoundaryGeoJSON: parsed.data.polygonGeoJSON,
      propertyBoundarySqM: parsed.data.areaSqM
    }
  });

  return json({ garden });
}

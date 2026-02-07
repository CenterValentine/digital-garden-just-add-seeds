import { prisma } from '@/lib/db';
import { badRequest, json } from '@/lib/api';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  if (!userId) {
    return badRequest('Missing userId.');
  }

  const alerts = await prisma.alert.findMany({
    where: {
      plantInstance: {
        gardenItem: { garden: { userId } }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return json({ alerts });
}

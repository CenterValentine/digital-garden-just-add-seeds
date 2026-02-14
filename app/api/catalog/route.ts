import { prisma } from '@/lib/db';
import { json } from '@/lib/api';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') ?? undefined;
  const categoryPath = searchParams.get('categoryPath') ?? undefined;

  const items = await prisma.catalogItem.findMany({
    where: {
      type: type as any,
      categoryPath: categoryPath ? { startsWith: categoryPath } : undefined
    },
    include: { plantCatalog: true }
  });

  return json({ items });
}

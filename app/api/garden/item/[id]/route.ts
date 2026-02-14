import { prisma } from '@/lib/db';
import { badRequest, json } from '@/lib/api';

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const item = await prisma.gardenItem.findUnique({
    where: { id: params.id },
    include: { plant: true }
  });

  if (!item) {
    return badRequest('Item not found.');
  }

  if (item.plant) {
    await prisma.ruleAssignment.deleteMany({ where: { plantInstanceId: item.plant.id } });
    await prisma.task.deleteMany({ where: { plantInstanceId: item.plant.id } });
    await prisma.alert.deleteMany({ where: { plantInstanceId: item.plant.id } });
    await prisma.plantInstance.delete({ where: { id: item.plant.id } });
  }

  await prisma.gardenItem.delete({ where: { id: params.id } });

  return json({ status: 'deleted' });
}

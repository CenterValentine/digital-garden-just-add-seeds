import { prisma } from '@/lib/db';

type TimeRuleParams = {
  intervalDays: number;
  title: string;
};

type GrowthRuleParams = {
  title: string;
};

export async function runTimeRuleFactory() {
  const assignments = await prisma.ruleAssignment.findMany({
    where: { enabled: true, ruleTemplate: { triggerType: 'TIME', outputType: 'TASK' } },
    include: { ruleTemplate: true, plantInstance: true }
  });

  const now = new Date();

  for (const assignment of assignments) {
    const params = {
      ...(assignment.ruleTemplate.defaultParams as Record<string, unknown>),
      ...(assignment.paramsOverride as Record<string, unknown>)
    } as TimeRuleParams;

    const intervalDays = Math.max(1, params.intervalDays ?? 3);
    const title = params.title ?? assignment.ruleTemplate.name;

    const lastTask = await prisma.task.findFirst({
      where: {
        plantInstanceId: assignment.plantInstanceId,
        sourceRuleId: assignment.ruleTemplateId
      },
      orderBy: { dueAt: 'desc' }
    });

    if (!lastTask || lastTask.dueAt <= now) {
      const dueAt = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);
      await prisma.task.create({
        data: {
          plantInstanceId: assignment.plantInstanceId,
          title,
          dueAt,
          status: 'OPEN',
          sourceRuleId: assignment.ruleTemplateId
        }
      });
    }
  }
}

export async function runGrowthRuleFactory() {
  const assignments = await prisma.ruleAssignment.findMany({
    where: { enabled: true, ruleTemplate: { triggerType: 'TIME', outputType: 'MESSAGE' } },
    include: {
      ruleTemplate: true,
      plantInstance: { include: { gardenItem: { include: { garden: true } } } }
    }
  });

  const now = new Date();

  for (const assignment of assignments) {
    const params = {
      ...(assignment.ruleTemplate.defaultParams as Record<string, unknown>),
      ...(assignment.paramsOverride as Record<string, unknown>)
    } as GrowthRuleParams;

    const plantedAt = assignment.plantInstance.plantedAt;
    const growthDays = (assignment.plantInstance.overrides as { growthDays?: number })?.growthDays ?? 60;
    const harvestDate = new Date(plantedAt.getTime() + growthDays * 24 * 60 * 60 * 1000);

    if (harvestDate < now) {
      continue;
    }

    const existing = await prisma.inboxMessage.findFirst({
      where: {
        userId: assignment.plantInstance.gardenItem.garden.userId,
        sourceRuleId: assignment.ruleTemplateId
      }
    });

    if (!existing && harvestDate.getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000) {
      await prisma.inboxMessage.create({
        data: {
          userId: assignment.plantInstance.gardenItem.garden.userId,
          title: params.title ?? 'Harvest window approaching',
          body: 'Your plant is nearing harvest. Plan a harvest day and check irrigation.',
          sourceRuleId: assignment.ruleTemplateId
        }
      });
    }
  }
}

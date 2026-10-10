'use server';

import { prisma } from '@/lib/db/prisma';
import { requireTenantAdmin } from '@/lib/auth/session';
import { revalidatePath } from 'next/cache';
import { writeLog } from '@/lib/logs';

export interface ParishGoalItem {
  electors: number;
  juntas: number;
  targetVotes: number;
  targetPct: number;
}

export interface RivalEstimateItem {
  candidate: string;
  party: string;
  estimatedVotes: number;
  estimatedPct: number;
}

export interface SaveScenarioInput {
  name: string;
  description?: string;
  expectedTurnoutRate: number;
  nullBlankRate: number;
  targetCandidateVotes: number;
  parishGoals: Record<string, ParishGoalItem>;
  rivalEstimates: RivalEstimateItem[];
  isDefault?: boolean;
}

export async function getCampaignScenariosAction() {
  try {
    const { tenantId } = await requireTenantAdmin();

    const scenarios = await prisma.campaignScenario.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });

    const recintos = await prisma.electoralRecinto.findMany({
      where: { tenantId },
      include: { juntas: true },
      orderBy: { electors: 'desc' },
    });

    return { success: true, scenarios, recintos };
  } catch (error: any) {
    console.error('Error fetching campaign scenarios:', error);
    return { success: false, error: error.message || 'Error al obtener escenarios' };
  }
}

export async function saveCampaignScenarioAction(input: SaveScenarioInput) {
  try {
    const { session, tenantId } = await requireTenantAdmin();

    if (input.isDefault) {
      await prisma.campaignScenario.updateMany({
        where: { tenantId },
        data: { isDefault: false },
      });
    }

    const scenario = await prisma.campaignScenario.create({
      data: {
        tenantId,
        name: input.name,
        description: input.description,
        expectedTurnoutRate: input.expectedTurnoutRate,
        nullBlankRate: input.nullBlankRate,
        targetCandidateVotes: input.targetCandidateVotes,
        parishGoals: input.parishGoals as any,
        rivalEstimates: input.rivalEstimates as any,
        isDefault: input.isDefault ?? true,
      },
    });

    writeLog('INFO', tenantId, session.email || session.id, `Escenario de Umbral de Victoria guardado: "${scenario.name}" con meta de ${scenario.targetCandidateVotes} votos`);

    revalidatePath('/admin/calculadora-victoria');
    return { success: true, scenario };
  } catch (error: any) {
    console.error('Error saving campaign scenario:', error);
    return { success: false, error: error.message || 'Error al guardar escenario' };
  }
}

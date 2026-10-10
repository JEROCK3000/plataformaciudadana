'use server';

import { prisma } from '@/lib/db/prisma';
import { requireTenantAdmin } from '@/lib/auth/session';
import { revalidatePath } from 'next/cache';
import { writeLog } from '@/lib/logs';
import { CommitmentLevel, JuntaGender } from '@prisma/client';

export interface CreateVoterInput {
  cedula: string;
  fullName: string;
  parish: string;
  recintoId?: string;
  juntaId?: string;
  juntaNumber?: number;
  gender?: JuntaGender;
  phone?: string;
  neighborhood?: string;
  commitmentLevel?: CommitmentLevel;
  needsTransport?: boolean;
  transportAddress?: string;
  volunteerAssigned?: string;
  notes?: string;
}

export interface VoterFilterInput {
  parish?: string;
  recintoId?: string;
  hasVoted?: boolean;
  commitmentLevel?: CommitmentLevel;
  needsTransport?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
}

export async function getVotersAction(filters: VoterFilterInput = {}) {
  try {
    const { tenantId } = await requireTenantAdmin();

    const page = filters.page || 1;
    const pageSize = filters.pageSize || 50;
    const skip = (page - 1) * pageSize;

    const where: any = { tenantId };

    if (filters.parish && filters.parish !== 'TODAS') {
      where.parish = filters.parish;
    }
    if (filters.recintoId && filters.recintoId !== 'TODOS') {
      where.recintoId = filters.recintoId;
    }
    if (filters.hasVoted !== undefined) {
      where.hasVoted = filters.hasVoted;
    }
    if (filters.commitmentLevel) {
      where.commitmentLevel = filters.commitmentLevel;
    }
    if (filters.needsTransport !== undefined) {
      where.needsTransport = filters.needsTransport;
    }
    if (filters.search && filters.search.trim() !== '') {
      const q = filters.search.trim();
      where.OR = [
        { fullName: { contains: q } },
        { cedula: { contains: q } },
        { phone: { contains: q } },
        { neighborhood: { contains: q } },
      ];
    }

    const [voters, totalCount, totalVotedCount, recintos] = await Promise.all([
      prisma.voterRoll.findMany({
        where,
        include: { recinto: true, junta: true },
        orderBy: [{ parish: 'asc' }, { fullName: 'asc' }],
        skip,
        take: pageSize,
      }),
      prisma.voterRoll.count({ where: { tenantId } }),
      prisma.voterRoll.count({ where: { tenantId, hasVoted: true } }),
      prisma.electoralRecinto.findMany({
        where: { tenantId },
        include: { juntas: true },
        orderBy: { electors: 'desc' },
      }),
    ]);

    // Resumen por parroquia de votos registrados
    const statsByParish = await prisma.voterRoll.groupBy({
      by: ['parish', 'hasVoted'],
      where: { tenantId },
      _count: { id: true },
    });

    return {
      success: true,
      voters,
      totalCount,
      totalVotedCount,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: page,
      recintos,
      statsByParish,
    };
  } catch (error: any) {
    console.error('Error fetching voters:', error);
    return { success: false, error: error.message || 'Error al obtener padrón de votantes' };
  }
}

export async function toggleVoterCheckAction(id: string) {
  try {
    const { session, tenantId } = await requireTenantAdmin();

    const existing = await prisma.voterRoll.findUnique({
      where: { id, tenantId },
    });

    if (!existing) {
      return { success: false, error: 'Votante no encontrado' };
    }

    const newHasVoted = !existing.hasVoted;
    const updated = await prisma.voterRoll.update({
      where: { id, tenantId },
      data: {
        hasVoted: newHasVoted,
        votedAt: newHasVoted ? new Date() : null,
      },
    });

    writeLog('INFO', tenantId, session.email || session.id, `Chequeo de voto Día D: ${existing.fullName} (${existing.cedula}) -> ${newHasVoted ? 'YA VOTÓ' : 'DESMARCADO'}`);

    revalidatePath('/admin/padron-electoral');
    return { success: true, voter: updated };
  } catch (error: any) {
    console.error('Error toggling voter status:', error);
    return { success: false, error: error.message || 'Error al cambiar estado de voto' };
  }
}

export async function createVoterAction(input: CreateVoterInput) {
  try {
    const { session, tenantId } = await requireTenantAdmin();

    const existing = await prisma.voterRoll.findUnique({
      where: {
        tenantId_cedula: {
          tenantId,
          cedula: input.cedula.trim(),
        },
      },
    });

    if (existing) {
      return { success: false, error: 'Ya existe un elector registrado con esta cédula' };
    }

    const voter = await prisma.voterRoll.create({
      data: {
        tenantId,
        cedula: input.cedula.trim(),
        fullName: input.fullName.trim(),
        parish: input.parish,
        recintoId: input.recintoId,
        juntaId: input.juntaId,
        juntaNumber: input.juntaNumber,
        gender: input.gender,
        phone: input.phone?.trim(),
        neighborhood: input.neighborhood?.trim(),
        commitmentLevel: input.commitmentLevel || CommitmentLevel.SEGURO,
        needsTransport: input.needsTransport || false,
        transportAddress: input.transportAddress,
        volunteerAssigned: input.volunteerAssigned,
        notes: input.notes,
      },
    });

    writeLog('INFO', tenantId, session.email || session.id, `Elector comprometido registrado: ${voter.fullName} (${voter.cedula}) en ${voter.parish}`);

    revalidatePath('/admin/padron-electoral');
    return { success: true, voter };
  } catch (error: any) {
    console.error('Error creating voter:', error);
    return { success: false, error: error.message || 'Error al registrar votante' };
  }
}

export async function deleteVoterAction(id: string) {
  try {
    const { session, tenantId } = await requireTenantAdmin();

    await prisma.voterRoll.delete({
      where: { id, tenantId },
    });

    writeLog('INFO', tenantId, session.email || session.id, `Elector eliminado del padrón ID: ${id}`);

    revalidatePath('/admin/padron-electoral');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting voter:', error);
    return { success: false, error: error.message || 'Error al eliminar votante' };
  }
}

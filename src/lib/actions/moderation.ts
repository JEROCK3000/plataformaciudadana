'use server';

import { prisma } from '@/lib/db/prisma';
import { requireTenantAdmin } from '@/lib/auth/session';
import { writeLog } from '@/lib/logs';
import { revalidatePath } from 'next/cache';
import { ModerationStatus } from '@prisma/client';

/**
 * Actualiza el estado de moderación de un reporte
 */
export async function updateModerationStatus(
  reportId: string,
  status: ModerationStatus,
  notes?: string
) {
  try {
    const { session, tenantId } = await requireTenantAdmin();

    const report = await prisma.report.findFirst({
      where: { id: reportId, tenantId },
      include: { tenant: true },
    });

    if (!report) {
      return { success: false, error: 'Reporte no encontrado' };
    }

    const updated = await prisma.report.update({
      where: { id: reportId },
      data: {
        moderationStatus: status,
        moderationNotes: notes !== undefined ? notes : report.moderationNotes,
      },
    });

    writeLog(
      'AUDIT',
      report.tenant.slug,
      session.id,
      `Reporte ${report.ticketCode || report.id} moderado a estado: ${status}${notes ? ` (Notas: ${notes})` : ''}`
    );

    revalidatePath('/admin');
    revalidatePath('/admin/war-room');
    revalidatePath(`/${report.tenant.slug}`);
    revalidatePath('/');

    return { success: true, report: updated };
  } catch (error: any) {
    console.error('Error al moderar reporte:', error);
    return { success: false, error: error.message || 'Error en el servidor' };
  }
}

/**
 * Fusiona un reporte secundario dentro de un caso principal existente
 * (Deduplicación & Agrupación de Casos Comunitarios)
 */
export async function mergeReport(childReportId: string, parentReportId: string) {
  try {
    const { session, tenantId } = await requireTenantAdmin();

    if (childReportId === parentReportId) {
      return { success: false, error: 'No se puede fusionar un reporte consigo mismo.' };
    }

    const [child, parent] = await Promise.all([
      prisma.report.findFirst({
        where: { id: childReportId, tenantId },
        include: { tenant: true },
      }),
      prisma.report.findFirst({
        where: { id: parentReportId, tenantId },
      }),
    ]);

    if (!child || !parent) {
      return { success: false, error: 'Uno de los reportes no existe en este cantón.' };
    }

    // Actualizar el reporte hijo como fusionado
    await prisma.report.update({
      where: { id: childReportId },
      data: {
        parentReportId: parent.id,
        moderationStatus: 'MERGED',
        moderationNotes: `Fusionado como duplicado del caso principal ${parent.ticketCode || parent.title}`,
      },
    });

    // Incrementar contadores en el reporte padre
    const supportToAdd = child.supportCount > 0 ? child.supportCount : 1;
    const updatedParent = await prisma.report.update({
      where: { id: parentReportId },
      data: {
        duplicateCount: { increment: 1 },
        supportCount: { increment: supportToAdd },
        votes: { increment: child.votes > 0 ? child.votes : 1 },
      },
    });

    writeLog(
      'AUDIT',
      child.tenant.slug,
      session.id,
      `Deduplicación: Reporte ${child.ticketCode || child.id} fusionado como duplicado de Caso Principal ${parent.ticketCode || parent.id}`
    );

    revalidatePath('/admin');
    revalidatePath('/admin/war-room');
    revalidatePath(`/${child.tenant.slug}`);
    revalidatePath('/');

    return {
      success: true,
      parent: updatedParent,
      message: `Reporte ${child.ticketCode || ''} vinculado exitosamente al caso principal ${parent.ticketCode || ''}.`,
    };
  } catch (error: any) {
    console.error('Error al fusionar reporte:', error);
    return { success: false, error: error.message || 'Error al procesar la fusión' };
  }
}

/**
 * Desvincula un reporte previamente fusionado y lo restituye como independiente
 */
export async function unmergeReport(childReportId: string) {
  try {
    const { session, tenantId } = await requireTenantAdmin();

    const child = await prisma.report.findFirst({
      where: { id: childReportId, tenantId },
      include: { tenant: true },
    });

    if (!child || !child.parentReportId) {
      return { success: false, error: 'El reporte no se encuentra vinculado a ningún caso principal.' };
    }

    const parentId = child.parentReportId;

    // Desvincular hijo
    await prisma.report.update({
      where: { id: childReportId },
      data: {
        parentReportId: null,
        moderationStatus: 'APPROVED',
        moderationNotes: 'Desvinculado y restituido como caso independiente',
      },
    });

    // Decrementar en padre
    const supportToSubtract = child.supportCount > 0 ? child.supportCount : 1;
    await prisma.report.update({
      where: { id: parentId },
      data: {
        duplicateCount: { decrement: 1 },
        supportCount: { decrement: supportToSubtract },
      },
    });

    writeLog(
      'AUDIT',
      child.tenant.slug,
      session.id,
      `Deduplicación: Reporte ${child.ticketCode || child.id} desvinculado de su caso principal.`
    );

    revalidatePath('/admin');
    revalidatePath('/admin/war-room');
    revalidatePath(`/${child.tenant.slug}`);
    revalidatePath('/');

    return { success: true };
  } catch (error: any) {
    console.error('Error al desvincular reporte:', error);
    return { success: false, error: error.message || 'Error al desvincular' };
  }
}

/**
 * Busca candidatos a duplicados / reportes similares en la misma zona
 */
export async function findSimilarReports(reportId: string) {
  try {
    const { tenantId } = await requireTenantAdmin();

    const target = await prisma.report.findFirst({
      where: { id: reportId, tenantId },
    });

    if (!target) return [];

    // Buscar reportes en el mismo cantón, misma parroquia, mismo barrio o categoría
    const candidates = await prisma.report.findMany({
      where: {
        tenantId,
        id: { not: target.id },
        parish: target.parish,
        // No incluir reportes que ya son hijos de otro
        parentReportId: null,
        OR: [
          { neighborhood: target.neighborhood },
          { category: target.category },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 8,
      select: {
        id: true,
        ticketCode: true,
        title: true,
        category: true,
        parish: true,
        neighborhood: true,
        status: true,
        moderationStatus: true,
        duplicateCount: true,
        supportCount: true,
        createdAt: true,
      },
    });

    return candidates;
  } catch (error) {
    console.error('Error al buscar reportes similares:', error);
    return [];
  }
}

/**
 * Acción pública ciudadana: Vecino se suma al reporte ("+1 Yo también tengo este problema")
 */
export async function addCitizenSupport(reportId: string) {
  try {
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: { tenant: true },
    });

    if (!report) {
      return { success: false, error: 'Reporte no encontrado' };
    }

    const updated = await prisma.report.update({
      where: { id: reportId },
      data: {
        supportCount: { increment: 1 },
        votes: { increment: 1 },
      },
    });

    revalidatePath('/');
    if (report.tenant?.slug) {
      revalidatePath(`/${report.tenant.slug}`);
    }
    revalidatePath(`/report/${reportId}`);

    return { success: true, newCount: updated.supportCount, newVotes: updated.votes };
  } catch (error: any) {
    console.error('Error al sumar apoyo ciudadano:', error);
    return { success: false, error: 'No se pudo registrar tu apoyo en este momento.' };
  }
}

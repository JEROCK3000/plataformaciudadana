'use server';

import { prisma } from '@/lib/db/prisma';
import { requireTenantAdmin } from '@/lib/auth/session';
import { revalidatePath } from 'next/cache';
import { writeLog } from '@/lib/logs';
import { ActivityType, ActivityStatus, Category } from '@prisma/client';

export interface CreateActivityInput {
  title: string;
  type: ActivityType;
  parish: string;
  sector: string;
  date: string; // ISO date string
  status?: ActivityStatus;
  responsibleName?: string;
  responsiblePhone?: string;
  meetingPoint?: string;
  estimatedAttendees?: number;
  logisticsNotes?: string;
  speechFocus?: string;
  relatedCategory?: Category;
}

export interface UpdateActivityInput extends Partial<CreateActivityInput> {
  id: string;
  actualAttendees?: number;
  notes?: string;
}

export async function getCampaignActivitiesAction(filterParish?: string, filterStatus?: ActivityStatus) {
  try {
    const { tenantId } = await requireTenantAdmin();

    const where: any = { tenantId };
    if (filterParish && filterParish !== 'TODAS') {
      where.parish = filterParish;
    }
    if (filterStatus) {
      where.status = filterStatus;
    }

    const activities = await prisma.campaignActivity.findMany({
      where,
      orderBy: { date: 'asc' },
    });

    // También recopilamos reportes ciudadanos de la zona para cruzar con necesidades
    const topReportsByParish = await prisma.report.groupBy({
      by: ['parish', 'category'],
      where: { tenantId },
      _count: { id: true },
      _sum: { votes: true },
    });

    return { success: true, activities, topReportsByParish };
  } catch (error: any) {
    console.error('Error fetching activities:', error);
    return { success: false, error: error.message || 'Error al obtener actividades' };
  }
}

export async function createCampaignActivityAction(input: CreateActivityInput) {
  try {
    const { session, tenantId } = await requireTenantAdmin();

    const activity = await prisma.campaignActivity.create({
      data: {
        tenantId,
        title: input.title,
        type: input.type,
        parish: input.parish,
        sector: input.sector,
        date: new Date(input.date),
        status: input.status || ActivityStatus.PLANIFICADA,
        responsibleName: input.responsibleName,
        responsiblePhone: input.responsiblePhone,
        meetingPoint: input.meetingPoint,
        estimatedAttendees: input.estimatedAttendees || 0,
        logisticsNotes: input.logisticsNotes,
        speechFocus: input.speechFocus,
        relatedCategory: input.relatedCategory,
      },
    });

    writeLog('INFO', tenantId, session.email || session.id, `Actividad territorial creada: "${activity.title}" en ${activity.parish} (${activity.sector})`);

    revalidatePath('/admin/agenda-territorial');
    return { success: true, activity };
  } catch (error: any) {
    console.error('Error creating activity:', error);
    return { success: false, error: error.message || 'Error al crear actividad' };
  }
}

export async function updateCampaignActivityStatusAction(id: string, status: ActivityStatus, actualAttendees?: number) {
  try {
    const { session, tenantId } = await requireTenantAdmin();

    const updated = await prisma.campaignActivity.update({
      where: { id, tenantId },
      data: {
        status,
        ...(actualAttendees !== undefined ? { actualAttendees } : {}),
      },
    });

    writeLog('INFO', tenantId, session.email || session.id, `Estado de actividad actualizado: "${updated.title}" -> ${status}`);

    revalidatePath('/admin/agenda-territorial');
    return { success: true, activity: updated };
  } catch (error: any) {
    console.error('Error updating activity status:', error);
    return { success: false, error: error.message || 'Error al actualizar estado' };
  }
}

export async function deleteCampaignActivityAction(id: string) {
  try {
    const { session, tenantId } = await requireTenantAdmin();

    await prisma.campaignActivity.delete({
      where: { id, tenantId },
    });

    writeLog('INFO', tenantId, session.email || session.id, `Actividad territorial eliminada ID: ${id}`);

    revalidatePath('/admin/agenda-territorial');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting activity:', error);
    return { success: false, error: error.message || 'Error al eliminar actividad' };
  }
}

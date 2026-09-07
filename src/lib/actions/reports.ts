"use server";

import { prisma } from "@/lib/db/prisma";
import { writeLog } from "@/lib/logs";
import { Category, Urgency, ReportStatus, Department } from "@prisma/client";
import { revalidatePath } from "next/cache";

const CATEGORY_TO_DEPARTMENT: Record<Category, Department> = {
  INFRASTRUCTURE: 'OBRAS_PUBLICAS',
  WATER: 'AGUA_SANEAMIENTO',
  SERVICES: 'SERVICIOS_PUBLICOS',
  SECURITY: 'SEGURIDAD_CIUDADANA',
  ENVIRONMENT: 'PLANIFICACION_AMBIENTE',
  EDUCATION: 'OTRO',
  OTHER: 'OTRO',
};

export async function updateReportStatus(reportId: string, status: ReportStatus) {
  try {
    const isResolved = status === 'RESOLVED';
    const report = await prisma.report.update({
      where: { id: reportId },
      data: {
        status,
        ...(isResolved ? { resolvedAt: new Date() } : {}),
      },
      select: { id: true, title: true, parish: true, ticketCode: true, tenant: { select: { slug: true } } },
    });
    const tenantSlug = report.tenant?.slug || 'GLOBAL';
    writeLog('AUDIT', tenantSlug, 'ADMIN', `Estado actualizado → ${status}: ticket ${report.ticketCode || report.id} (${report.title}) [${report.parish}]`);
    revalidatePath('/admin');
    revalidatePath('/admin/stats');
    revalidatePath(`/admin/report/${reportId}`);
    return { success: true };
  } catch (error) {
    writeLog('ERROR', 'GLOBAL', 'SYSTEM', `Error al actualizar estado: ${error}`);
    return { success: false };
  }
}

export async function updateReportResolution(
  reportId: string,
  data: {
    status: ReportStatus;
    department?: Department;
    resolutionNotes?: string;
    resolutionPhotos?: string[];
  }
) {
  try {
    const isResolved = data.status === 'RESOLVED';
    const report = await prisma.report.update({
      where: { id: reportId },
      data: {
        status: data.status,
        department: data.department,
        resolutionNotes: data.resolutionNotes,
        resolutionPhotos: data.resolutionPhotos,
        resolvedAt: isResolved ? new Date() : null,
      },
      select: { id: true, ticketCode: true, tenant: { select: { slug: true } } },
    });

    const tenantSlug = report.tenant?.slug || 'GLOBAL';
    writeLog(
      'AUDIT',
      tenantSlug,
      'ADMIN',
      `Cierre técnico actualizado para ticket ${report.ticketCode || report.id}: estado=${data.status}, notas=${Boolean(data.resolutionNotes)}, fotos=${data.resolutionPhotos?.length || 0}`
    );

    revalidatePath('/admin');
    revalidatePath('/admin/stats');
    revalidatePath(`/admin/report/${reportId}`);
    if (report.tenant?.slug) {
      revalidatePath(`/${report.tenant.slug}`);
    }
    return { success: true };
  } catch (error) {
    console.error('Error al actualizar cierre técnico:', error);
    return { success: false, error: 'No se pudo guardar el cierre técnico' };
  }
}

export async function createReport(data: {
  tenantId?: string;
  tenantSlug?: string;
  title: string;
  category: Category;
  department?: Department;
  parish: string;
  neighborhood: string;
  description: string;
  urgency: Urgency;
  citizenName?: string;
  citizenContact?: string;
  privacyAccepted: boolean;
  photos?: string[];
}) {
  try {
    let tenantId = data.tenantId;

    if (!tenantId && data.tenantSlug) {
      const tenant = await prisma.tenant.findUnique({ where: { slug: data.tenantSlug } });
      if (!tenant || !tenant.isActive) {
        return { success: false, error: 'Municipio no válido o inactivo.' };
      }
      tenantId = tenant.id;
    }

    // Fallback al tenant por defecto si no se especificó
    if (!tenantId) {
      const defaultTenant = await prisma.tenant.findFirst({ where: { isActive: true } });
      if (!defaultTenant) {
        return { success: false, error: 'No hay municipios configurados.' };
      }
      tenantId = defaultTenant.id;
    }

    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) return { success: false, error: 'Municipio no encontrado' };

    // Generar código de ticket único y amigable (ej. QUI-2026-0004)
    const count = await prisma.report.count({ where: { tenantId } });
    const prefix = tenant.slug.substring(0, 3).toUpperCase();
    const year = new Date().getFullYear();
    const ticketCode = `${prefix}-${year}-${String(count + 1).padStart(4, '0')}`;

    // Asignar Dirección por defecto según categoría
    const department = data.department || CATEGORY_TO_DEPARTMENT[data.category] || 'OBRAS_PUBLICAS';

    const report = await prisma.report.create({
      data: {
        tenantId,
        ticketCode,
        title: data.title,
        category: data.category,
        department,
        parish: data.parish,
        neighborhood: data.neighborhood,
        description: data.description,
        urgency: data.urgency,
        citizenName: data.citizenName || null,
        citizenContact: data.citizenContact || null,
        privacyAccepted: data.privacyAccepted,
        photos: data.photos || [],
      },
      include: {
        tenant: { select: { slug: true } },
      },
    });

    const tenantSlug = report.tenant?.slug || 'GLOBAL';
    writeLog('INFO', tenantSlug, 'ANON_USER', `Reporte ciudadano creado: ticket ${report.ticketCode} (${report.title}) [${report.parish}]`);
    
    revalidatePath('/');
    if (report.tenant?.slug) {
      revalidatePath(`/${report.tenant.slug}`);
    }
    revalidatePath('/admin');
    revalidatePath('/admin/stats');
    
    return { success: true, report };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    writeLog('ERROR', 'GLOBAL', 'SYSTEM', `Error al crear reporte: ${msg}`);
    return { success: false, error: 'No se pudo guardar el reporte' };
  }
}

export async function voteReport(reportId: string) {
  try {
    const report = await prisma.report.update({
      where: { id: reportId },
      data: { votes: { increment: 1 } },
      select: { id: true, ticketCode: true, tenant: { select: { slug: true } } },
    });
    
    const tenantSlug = report.tenant?.slug || 'GLOBAL';
    writeLog('INFO', tenantSlug, 'ANON_USER', `Voto registrado para ticket: ${report.ticketCode || report.id}`);
    return { success: true };
  } catch (error) {
    console.error("Error al votar:", error);
    return { success: false, error: 'No se pudo registrar el voto' };
  }
}

export async function getReportByTicket(ticketCode: string, tenantSlug?: string) {
  try {
    const cleanCode = ticketCode.trim().toUpperCase();
    return await prisma.report.findFirst({
      where: {
        ticketCode: cleanCode,
        ...(tenantSlug ? { tenant: { slug: tenantSlug } } : {}),
      },
      include: {
        tenant: { select: { name: true, canton: true, slug: true } },
      },
    });
  } catch (error) {
    console.error("Error al buscar por ticket:", error);
    return null;
  }
}

"use server";

import { prisma } from "@/lib/db/prisma";
import { writeLog } from "@/lib/logs";
import { Category, Urgency, ReportStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function updateReportStatus(reportId: string, status: ReportStatus) {
  try {
    const report = await prisma.report.update({
      where: { id: reportId },
      data: { status },
      select: { id: true, title: true, parish: true, tenant: { select: { slug: true } } },
    });
    const tenantSlug = report.tenant?.slug || 'GLOBAL';
    writeLog('AUDIT', tenantSlug, 'ADMIN', `Estado actualizado → ${status}: reporte ${report.id} (${report.title}) [${report.parish}]`);
    revalidatePath('/admin');
    revalidatePath('/admin/stats');
    revalidatePath(`/admin/report/${reportId}`);
    return { success: true };
  } catch (error) {
    writeLog('ERROR', 'GLOBAL', 'SYSTEM', `Error al actualizar estado: ${error}`);
    return { success: false };
  }
}

export async function createReport(data: {
  tenantId?: string;
  tenantSlug?: string;
  title: string;
  category: Category;
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

    const report = await prisma.report.create({
      data: {
        tenantId,
        title: data.title,
        category: data.category,
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
    writeLog('INFO', tenantSlug, 'ANON_USER', `Reporte ciudadano creado: ${report.id} (${report.title}) [${report.parish}]`);
    
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
      select: { id: true, tenant: { select: { slug: true } } },
    });
    
    const tenantSlug = report.tenant?.slug || 'GLOBAL';
    writeLog('INFO', tenantSlug, 'ANON_USER', `Voto registrado para reporte: ${report.id}`);
    return { success: true };
  } catch (error) {
    console.error("Error al votar:", error);
    return { success: false, error: 'No se pudo registrar el voto' };
  }
}

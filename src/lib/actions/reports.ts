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
      select: { id: true, title: true, parish: true },
    });
    writeLog('AUDIT', 'SYSTEM', 'ADMIN', `Estado actualizado → ${status}: reporte ${report.id} (${report.title}) [${report.parish}]`);
    revalidatePath('/admin');
    revalidatePath('/admin/stats');
    revalidatePath(`/admin/report/${reportId}`);
    return { success: true };
  } catch (error) {
    writeLog('ERROR', 'SYSTEM', 'SYSTEM', `Error al actualizar estado: ${error}`);
    return { success: false };
  }
}

export async function createReport(data: {
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
    const report = await prisma.report.create({
      data: {
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
      }
    });

    writeLog('INFO', 'SYSTEM', 'ANON_USER', `Reporte ciudadano creado: ${report.id} (${report.title})`);
    return { success: true, report };
  } catch (error) {
    writeLog('ERROR', 'SYSTEM', 'SYSTEM', `Error al crear reporte: ${error}`);
    return { success: false, error: 'No se pudo guardar el reporte' };
  }
}

export async function voteReport(reportId: string) {
  try {
    const report = await prisma.report.update({
      where: { id: reportId },
      data: { votes: { increment: 1 } },
      select: { id: true }
    });
    
    writeLog('INFO', 'SYSTEM', 'ANON_USER', `Voto registrado para reporte: ${report.id}`);
    return { success: true };
  } catch (error) {
    console.error("Error al votar:", error);
    return { success: false, error: 'No se pudo registrar el voto' };
  }
}

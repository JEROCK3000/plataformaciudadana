"use server";

import { prisma } from "@/lib/db/prisma";
import { writeLog } from "@/lib/logs";
import { Category, Urgency, ReportStatus, Department } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import crypto from "crypto";

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

// Validación del algoritmo Módulo 10 del Registro Civil del Ecuador
export async function isValidEcuadorianCedula(cedula: string): Promise<boolean> {
  if (!/^\d{10}$/.test(cedula)) return false;
  const prov = parseInt(cedula.substring(0, 2), 10);
  if ((prov < 1 || prov > 24) && prov !== 30) return false;
  const tercerDigito = parseInt(cedula[2], 10);
  if (tercerDigito >= 6) return false;
  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let suma = 0;
  for (let i = 0; i < 9; i++) {
    let val = parseInt(cedula[i], 10) * coeficientes[i];
    if (val >= 10) val -= 9;
    suma += val;
  }
  const digitoVerificador = parseInt(cedula[9], 10);
  const decenaSuperior = Math.ceil(suma / 10) * 10;
  let resultado = decenaSuperior - suma;
  if (resultado === 10) resultado = 0;
  return resultado === digitoVerificador;
}

// Obtener huella anónima de dispositivo (Cookie HTTP-Only + IP)
async function getVoterIdentifier(): Promise<{ citizenVid: string; ip: string; voterHash: string }> {
  const cookieStore = await cookies();
  let citizenVid = cookieStore.get('citizen_vid')?.value;
  if (!citizenVid) {
    citizenVid = crypto.randomUUID();
    cookieStore.set('citizen_vid', citizenVid, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 365 * 24 * 3600,
    });
  }
  const headerList = await headers();
  const forwarded = headerList.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : (headerList.get('x-real-ip') || '127.0.0.1');
  const voterHash = crypto.createHash('sha256').update(`${citizenVid}_${ip}`).digest('hex');
  return { citizenVid, ip, voterHash };
}

// Acción de Apoyar / Quitar Apoyo (Toggle con blindaje único)
export async function toggleVoteReport(reportId: string, cedula?: string) {
  try {
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      select: {
        id: true,
        ticketCode: true,
        votes: true,
        tenant: { select: { slug: true, requireCedulaForVotes: true } },
      },
    });

    if (!report) {
      return { success: false, error: 'Reporte no encontrado' };
    }

    let voterHash: string;

    // Si el municipio tiene activada la validación estricta por cédula
    if (report.tenant?.requireCedulaForVotes) {
      if (!cedula || !cedula.trim()) {
        return {
          success: false,
          requireCedula: true,
          error: 'Este municipio exige ingresar un número de cédula válido para registrar apoyos.',
        };
      }
      const cleanCedula = cedula.trim();
      const validCed = await isValidEcuadorianCedula(cleanCedula);
      if (!validCed) {
        return {
          success: false,
          requireCedula: true,
          error: 'El número de cédula ingresado no es válido (Registro Civil).',
        };
      }
      voterHash = crypto.createHash('sha256').update(`cedula_${cleanCedula}`).digest('hex');
    } else {
      const ident = await getVoterIdentifier();
      voterHash = ident.voterHash;
    }

    // Verificar si ya existe el voto
    const existingVote = await prisma.reportVote.findUnique({
      where: {
        reportId_voterHash: {
          reportId,
          voterHash,
        },
      },
    });

    const tenantSlug = report.tenant?.slug || 'GLOBAL';

    if (existingVote) {
      // Toggle OFF: Retirar apoyo
      await prisma.reportVote.delete({
        where: { id: existingVote.id },
      });
      const updated = await prisma.report.update({
        where: { id: reportId },
        data: { votes: { decrement: 1 } },
        select: { votes: true },
      });
      const safeVotes = Math.max(0, updated.votes);
      writeLog('INFO', tenantSlug, 'ANON_USER', `Apoyo retirado para ticket: ${report.ticketCode || reportId}`);
      revalidatePath('/');
      return { success: true, voted: false, votes: safeVotes };
    } else {
      // Toggle ON: Registrar apoyo
      await prisma.reportVote.create({
        data: {
          reportId,
          voterHash,
          cedula: cedula ? cedula.trim() : null,
        },
      });
      const updated = await prisma.report.update({
        where: { id: reportId },
        data: { votes: { increment: 1 } },
        select: { votes: true },
      });
      writeLog('INFO', tenantSlug, 'ANON_USER', `Apoyo registrado para ticket: ${report.ticketCode || reportId}`);
      revalidatePath('/');
      return { success: true, voted: true, votes: updated.votes };
    }
  } catch (error) {
    console.error("Error al procesar apoyo:", error);
    return { success: false, error: 'No se pudo procesar el apoyo a la iniciativa.' };
  }
}

// Consultar qué reportes han sido apoyados por el dispositivo actual
export async function getUserVotedReportIds(reportIds: string[]): Promise<string[]> {
  try {
    if (!reportIds || reportIds.length === 0) return [];
    const ident = await getVoterIdentifier();
    const votes = await prisma.reportVote.findMany({
      where: {
        reportId: { in: reportIds },
        voterHash: ident.voterHash,
      },
      select: { reportId: true },
    });
    return votes.map(v => v.reportId);
  } catch (e) {
    return [];
  }
}

// Alias de compatibilidad
export async function voteReport(reportId: string, cedula?: string) {
  return await toggleVoteReport(reportId, cedula);
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

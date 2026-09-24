"use server";

import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import { requireTenantAdmin, requireAuth } from "@/lib/auth/session";
import { writeLog } from "@/lib/logs";

const DEFAULT_AI_PROMPT = `Actúa como un Consultor Experto en Smart Cities y Políticas Públicas para el Gobierno Autónomo Descentralizado local en Ecuador.
Contexto Actual: Año 2026. Basa tus recomendaciones de presupuesto y normativas en la realidad y leyes actualizadas vigentes para el 2026.`;

export async function getSettings() {
  let settings = await prisma.systemSettings.findUnique({
    where: { id: "global" }
  });

  if (!settings) {
    settings = await prisma.systemSettings.create({
      data: {
        id: "global",
        platformName: "Plataforma Ciudadana SaaS",
        aiPromptMaster: DEFAULT_AI_PROMPT,
      }
    });
  }

  return settings;
}

export async function getTenantSettings() {
  const { tenantId } = await requireTenantAdmin();
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  const globalSettings = await getSettings();

  return {
    platformName: tenant?.name || globalSettings.platformName,
    aiPromptMaster: tenant?.aiPromptMaster || globalSettings.aiPromptMaster,
    canton: tenant?.canton || '',
    province: tenant?.province || '',
    slug: tenant?.slug || '',
    plan: tenant?.plan || 'PRO',
    requireCedulaForVotes: tenant?.requireCedulaForVotes || false,
    campaignMode: tenant?.campaignMode || false,
    candidateName: tenant?.candidateName || '',
    campaignSlogan: tenant?.campaignSlogan || '',
    campaignListNumber: tenant?.campaignListNumber || '',
  };
}

export async function updateTenantSettings(formData: FormData) {
  const { session, tenantId } = await requireTenantAdmin();

  const platformName = (formData.get("platformName") as string)?.trim();
  const aiPromptMaster = (formData.get("aiPromptMaster") as string)?.trim();
  const requireCedulaForVotes = formData.get("requireCedulaForVotes") === "on";
  
  // Modo Campaña Política
  const campaignMode = formData.get("campaignMode") === "on";
  const candidateName = (formData.get("candidateName") as string)?.trim() || null;
  const campaignSlogan = (formData.get("campaignSlogan") as string)?.trim() || null;
  const campaignListNumber = (formData.get("campaignListNumber") as string)?.trim() || null;

  if (!platformName || !aiPromptMaster) {
    return { success: false, error: "Todos los campos son obligatorios." };
  }

  try {
    const updated = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        name: platformName,
        aiPromptMaster,
        requireCedulaForVotes,
        campaignMode,
        candidateName,
        campaignSlogan,
        campaignListNumber,
      },
    });

    writeLog(
      'AUDIT', 
      updated.slug, 
      session.id, 
      `Configuración del tenant actualizada (Campaña: ${campaignMode ? 'ACTIVADA' : 'DESACTIVADA'}, Exigir cédula: ${requireCedulaForVotes})`
    );
    revalidatePath("/admin/settings");
    revalidatePath("/admin");
    revalidatePath("/admin/war-room");
    revalidatePath("/admin/qr-codes");
    revalidatePath(`/${updated.slug}`);
    return { success: true };
  } catch (error) {
    console.error("Error al guardar configuración del tenant:", error);
    return { success: false, error: "Ocurrió un error al guardar la configuración." };
  }
}

export async function updateSettings(formData: FormData) {
  const session = await requireAuth(['SUPERADMIN']);
  const platformName = (formData.get("platformName") as string)?.trim();
  const aiPromptMaster = (formData.get("aiPromptMaster") as string)?.trim();

  if (!platformName || !aiPromptMaster) {
    return { success: false, error: "Todos los campos son obligatorios." };
  }

  try {
    await prisma.systemSettings.upsert({
      where: { id: "global" },
      update: { platformName, aiPromptMaster },
      create: {
        id: "global",
        platformName,
        aiPromptMaster,
      }
    });

    writeLog('AUDIT', 'GLOBAL', session.id, `Configuración global del SaaS actualizada`);
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Error al guardar configuración global:", error);
    return { success: false, error: "Ocurrió un error al guardar la configuración." };
  }
}

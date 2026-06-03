"use server";

import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";

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
        platformName: "Plataforma Ciudadana",
        aiPromptMaster: DEFAULT_AI_PROMPT,
      }
    });
  }

  return settings;
}

export async function updateSettings(formData: FormData) {
  const platformName = formData.get("platformName") as string;
  const aiPromptMaster = formData.get("aiPromptMaster") as string;

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

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Error al guardar configuración:", error);
    return { success: false, error: "Ocurrió un error al guardar la configuración." };
  }
}

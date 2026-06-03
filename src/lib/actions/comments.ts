"use server";

import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";

// Lista básica de moderación (palabras prohibidas)
const badWords = [
  "idiota", "estupido", "estúpido", "imbecil", "imbécil", "basura", 
  "mierda", "puta", "puto", "cabron", "cabrón", "pendejo"
];

export async function createComment(reportId: string, citizenName: string, text: string) {
  if (!text || text.trim() === '') {
    return { success: false, error: "El comentario no puede estar vacío." };
  }

  // Filtro de moderación simple
  const lowerText = text.toLowerCase();
  const containsBadWords = badWords.some(word => lowerText.includes(word));

  if (containsBadWords) {
    return { success: false, error: "Tu comentario contiene lenguaje inapropiado y no puede ser publicado." };
  }

  try {
    await prisma.comment.create({
      data: {
        reportId,
        citizenName: citizenName || "Ciudadano Anónimo",
        text,
        status: "APPROVED"
      }
    });

    // Revalidar la vista del reporte para que aparezca el nuevo comentario
    revalidatePath(`/report/${reportId}`);
    return { success: true };
  } catch (error) {
    console.error("Error al crear comentario:", error);
    return { success: false, error: "Hubo un error al guardar el comentario." };
  }
}

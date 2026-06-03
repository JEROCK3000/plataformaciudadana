"use server";

import { prisma } from "@/lib/db/prisma";
import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function generateActionPlan() {
  if (!process.env.GEMINI_API_KEY) {
    return { 
      success: false, 
      error: 'Falta configurar GEMINI_API_KEY en las variables de entorno.',
      content: null
    };
  }

  try {
    // 1. Obtener todos los reportes no resueltos
    const reports = await prisma.report.findMany({
      where: {
        status: { notIn: ['RESOLVED', 'REJECTED'] }
      },
      select: {
        title: true,
        category: true,
        urgency: true,
        parish: true,
        neighborhood: true,
        description: true,
        votes: true
      }
    });

    if (reports.length === 0) {
      return { 
        success: false, 
        error: 'No hay reportes activos suficientes para generar un plan de acción.',
        content: null
      };
    }

    // 2. Preparar el resumen estadístico para la IA
    const summaryData = JSON.stringify(reports);

    // 3. Prompt para la IA
    const prompt = `
    Actúa como un Consultor Experto en Smart Cities y Políticas Públicas para el Gobierno Autónomo Descentralizado local en Ecuador.
    Contexto Actual: Año 2026. Basa tus recomendaciones de presupuesto y normativas en la realidad y leyes actualizadas vigentes para el 2026.
    
    A continuación tienes un listado en JSON de los reportes y quejas ciudadanas recientes:
    ${summaryData}

    Por favor, analiza estos datos y genera un "Plan Estratégico de Gobierno" en formato Markdown (MD) que contenga:
    1. **Resumen Ejecutivo**: Principales dolores o urgencias del municipio basándote en la frecuencia y nivel de urgencia.
    2. **Análisis por Categoría**: Qué sectores están más afectados (ej. Infraestructura vs Seguridad).
    3. **Lluvia de Ideas y Soluciones Rápidas (Quick Wins)**: Proyectos pequeños de alto impacto para las próximas 2 semanas basados en lo que pide la gente.
    4. **Plan de Inversión a Mediano Plazo**: Qué proyectos estructurales deberían presupuestarse según estos datos.

    Tu respuesta debe ser estrictamente Markdown bien formateado, muy profesional y orientada a la acción ejecutiva del Alcalde.
    `;

    // 4. Llamada a Gemini
    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      prompt: prompt,
      temperature: 0.7,
    });

    return { success: true, content: text };

  } catch (error) {
    console.error("Error al generar IA:", error);
    return { success: false, error: 'Hubo un error al comunicarse con el proveedor de Inteligencia Artificial.', content: null };
  }
}

export async function analyzeSingleReport(reportId: string) {
  if (!process.env.GEMINI_API_KEY) {
    return { 
      success: false, 
      error: 'Falta configurar GEMINI_API_KEY en las variables de entorno.',
      content: null
    };
  }

  try {
    const report = await prisma.report.findUnique({
      where: { id: reportId }
    });

    if (!report) {
      return { success: false, error: 'Reporte no encontrado.', content: null };
    }

    const prompt = `
    Actúa como un Experto en Administración Pública, Ley Orgánica de Contratación Pública y COOTAD (Ecuador).
    
    Contexto Actual: Estamos en el año 2026. Ha habido cambios recientes (aprox. abril 2026) en el COOTAD respecto a competencias de GADs y montos obligatorios de inversión pública, así como actualizaciones en la Ínfima Cuantía.
    POR FAVOR, USA TU CAPACIDAD DE BÚSQUEDA (Google Search) para buscar y confirmar las leyes vigentes en Ecuador para 2026 antes de responder. No uses datos desactualizados de 2024.

    Tienes la siguiente petición o problema ciudadano:
    Título: ${report.title}
    Categoría: ${report.category}
    Urgencia: ${report.urgency}
    Descripción: ${report.description}

    Por favor, analiza este caso particular y responde en formato Markdown:
    1. **Viabilidad Legal (Actualizada al 2026)**: Bajo qué normativas de la administración pública (como el COOTAD reformado o leyes locales recientes) tiene competencia el GAD municipal para actuar en este tema. Menciona los cambios recientes si aplican.
    2. **Mecanismo de Ejecución Recomendado**: ¿Debería hacerse por administración directa, ínfima cuantía (usa el monto oficial actualizado al 2026 que encuentres en tu búsqueda, el cual ronda los $10,000 o más), licitación o alianza público-privada? Explica brevemente por qué.
    3. **Pasos Inmediatos Sugeridos**: 3 acciones rápidas que la autoridad debería tomar para empezar a solucionar esto.
    
    Sé muy profesional, claro, al grano y asegúrate de basarte en leyes de Ecuador actualizadas al año 2026.
    `;

    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      prompt: prompt,
      temperature: 0.7,
    });

    await prisma.report.update({
      where: { id: reportId },
      data: { aiAnalysis: text }
    });

    return { success: true, content: text };

  } catch (error) {
    console.error("Error al generar IA individual:", error);
    return { success: false, error: 'Hubo un error al generar el análisis.', content: null };
  }
}

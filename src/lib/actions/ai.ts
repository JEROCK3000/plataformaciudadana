"use server";

import { prisma } from "@/lib/db/prisma";
import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { getSettings } from "@/lib/actions/settings";
import { writeLog } from "@/lib/logs";

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

    const settings = await getSettings();

    // 2. Preparar el resumen estadístico para la IA
    const summaryData = JSON.stringify(reports);

    // 3. Prompt para la IA
    const prompt = `
    ${settings.aiPromptMaster}
    
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
      model: google('gemini-3.5-flash'),
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

    const settings = await getSettings();

    const categoryLabels: Record<string, string> = {
      INFRASTRUCTURE: 'Infraestructura',
      SECURITY: 'Seguridad Ciudadana',
      WATER: 'Agua y Saneamiento',
      SERVICES: 'Servicios Públicos',
      ENVIRONMENT: 'Medio Ambiente',
      EDUCATION: 'Educación',
      OTHER: 'Otros',
    };
    const urgencyLabels: Record<string, string> = {
      LOW: 'Baja',
      MEDIUM: 'Media',
      HIGH: 'Alta',
    };

    const fechaActual = new Date().toLocaleDateString('es-EC', { year: 'numeric', month: 'long', day: 'numeric' });

    const prompt = `
${settings.aiPromptMaster}

FECHA ACTUAL DEL SISTEMA: ${fechaActual}. Estamos en el año 2026.

Eres un experto jurídico en Derecho Público ecuatoriano especializado en GADs municipales.

═══ PASO 1 — BUSCA ANTES DE RESPONDER ═══
Usa Google Search AHORA para obtener:

A) El valor del PRESUPUESTO GENERAL DEL ESTADO (PGE) de Ecuador para el año 2026.
   Busca: "Presupuesto General del Estado Ecuador 2026 aprobado"
   Fuentes confiables: Ministerio de Finanzas (finanzas.gob.ec), Asamblea Nacional Ecuador.

B) Los umbrales de contratación pública vigentes del SERCOP para 2026.
   Busca: "SERCOP resolución umbrales contratación 2026 Ecuador ínfima cuantía"
   Fuente: sercop.gob.ec

C) Cómo se calculan los umbrales (fórmula legal de la LOSNCP):
   - Ínfima Cuantía = 0,0000002 × PGE
   - Menor Cuantía Bienes/Servicios = 0,000002 × PGE
   - Menor Cuantía Obras = 0,00002 × PGE
   - Cotización = 0,000015 × PGE
   Una vez que encuentres el PGE 2026, aplica estas fórmulas para obtener los montos exactos vigentes.

D) Reformas o actualizaciones al COOTAD en 2025-2026 que afecten competencias municipales.

═══ PASO 2 — RESPONDE CON DATOS REALES ═══
CONTEXTO DEL GAD:
- Tipo: GAD Municipal (Gobierno Autónomo Descentralizado Municipal)
- Cantón: Quijos, Provincia de Napo, Ecuador

REPORTE CIUDADANO A ANALIZAR:
- Título: ${report.title}
- Categoría: ${categoryLabels[report.category] ?? report.category}
- Nivel de Urgencia: ${urgencyLabels[report.urgency] ?? report.urgency}
- Descripción: ${report.description}

RESPONDE EN FORMATO MARKDOWN con las siguientes secciones:

## 1. Competencia Municipal (COOTAD)
Indica el artículo específico del COOTAD que faculta al GAD de Quijos para actuar. Especifica si es competencia exclusiva, concurrente o adicional. Si debe coordinarse con la prefectura, gobierno central u otra entidad, indícalo con el artículo que lo sustenta.

## 2. Mecanismo de Contratación (LOSNCP)
Basándote en los montos vigentes 2026 que encontraste en el SERCOP, indica la modalidad más adecuada y por qué. Cita el monto exacto actualizado o indica dónde verificarlo si no lo encontraste.

## 3. Plan de Acción Inmediata (15 días)
3 pasos concretos, ordenados cronológicamente, que el Alcalde o Director puede ejecutar de inmediato.

## 4. Advertencias y Riesgos
Conflictos de competencia, requisitos previos, o riesgos legales relevantes. Si no pudiste confirmar algún dato legal mediante búsqueda, indícalo claramente.

REGLAS ABSOLUTAS — INCUMPLIRLAS INVALIDA EL ANÁLISIS:
1. NUNCA uses la palabra "simulado", "proyección", "estimación", "referencia 2024", "se estima", "asumiendo" o cualquier término que indique dato inventado.
2. Los montos de contratación DEBEN calcularse con la fórmula legal usando el PGE 2026 real que encontraste. Si no encontraste el PGE, escríbelo así: "⚠️ No pude obtener el PGE 2026 en esta búsqueda. El monto exacto debe calcularse con la fórmula [coeficiente] × PGE 2026 disponible en finanzas.gob.ec"
3. NUNCA menciones valores de años anteriores (2024, 2025) como referencia de montos de contratación.
4. Si encontraste la resolución SERCOP, cita su número.
`;

    // Google Search Grounding activo: Gemini consulta fuentes reales en tiempo real.
    // Intenta con gemini-3.5-flash (mayo 2026). Si está saturado, usa gemini-2.0-flash.
    const MODELS = ['gemini-3.5-flash', 'gemini-2.0-flash'];
    let text = '';
    let lastError: unknown;

    for (const modelId of MODELS) {
      try {
        const result = await generateText({
          model: google(modelId),
          prompt: prompt,
          temperature: 0.3,
          providerOptions: { google: { useSearchGrounding: true } },
        });
        text = result.text;
        writeLog('INFO', 'AI', 'SYSTEM', `Análisis generado con modelo: ${modelId}`);
        break;
      } catch (err) {
        lastError = err;
        const msg = err instanceof Error ? err.message : String(err);
        writeLog('WARN', 'AI', 'SYSTEM', `Modelo ${modelId} falló: ${msg}. Intentando siguiente...`);
      }
    }

    if (!text) throw lastError;

    await prisma.report.update({
      where: { id: reportId },
      data: { aiAnalysis: text }
    });

    return { success: true, content: text };

  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Error al generar IA individual:", msg);
    writeLog('ERROR', 'AI', 'SYSTEM', `analyzeSingleReport error: ${msg}`);
    return {
      success: false,
      error: `Error al generar el análisis: ${msg}`,
      content: null,
    };
  }
}

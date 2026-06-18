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

FECHA ACTUAL DEL SISTEMA: ${fechaActual}. Estamos en el año 2026. NO uses datos de años anteriores como si fueran proyecciones futuras — son datos del pasado. Busca información actualizada a 2026.

Eres un experto jurídico en Derecho Público ecuatoriano especializado en GADs municipales. Antes de responder, BUSCA EN GOOGLE las versiones vigentes del COOTAD y la LOSNCP para el año 2026, así como los montos actualizados del SERCOP.

CONTEXTO DEL GAD:
- Tipo: GAD Municipal (Gobierno Autónomo Descentralizado Municipal)
- Cantón: Quijos, Provincia de Napo, Ecuador

NORMATIVA CLAVE A CONSULTAR (busca la versión vigente 2026):
1. COOTAD (Código Orgánico de Organización Territorial, Autonomía y Descentralización):
   - Art. 55: Competencias exclusivas del GAD municipal (vías, agua, saneamiento, tránsito, planificación urbana, residuos, espacios públicos, actividades económicas, etc.)
   - Art. 54: Funciones del GAD municipal
   - Art. 57: Atribuciones del Concejo Municipal
   - Busca si hubo reformas al COOTAD en 2025-2026 que afecten competencias municipales.

2. LOSNCP (Ley Orgánica del Sistema Nacional de Contratación Pública) y su Reglamento:
   - Montos actualizados de ínfima cuantía, menor cuantía, cotización y licitación para el año 2026 (búscalos en www.sercop.gob.ec o resoluciones del SERCOP vigentes).
   - Modalidades: administración directa, catálogo electrónico, ínfima cuantía, menor cuantía, cotización, licitación.

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

REGLAS ESTRICTAS:
- NUNCA uses valores de años anteriores como referencia. Solo datos que encontraste ahora.
- Si no pudiste buscar o confirmar un monto del SERCOP, escribe exactamente: "⚠️ No pude verificar este valor en tiempo real. Consúltalo en www.sercop.gob.ec antes de ejecutar el proceso."
- NUNCA escribas frases como "proyección", "estimación", "referencia 2024", "asumiendo que". O encontraste el dato real o indicas que no lo encontraste.
- Cita el número de resolución del SERCOP si lo encontraste.
`;

    // Google Search Grounding activo: Gemini consulta fuentes reales en tiempo real.
    // gemini-3.5-flash (mayo 2026) con Google Search Grounding en tiempo real.
    const { text } = await generateText({
      model: google('gemini-3.5-flash'),
      prompt: prompt,
      temperature: 0.3,
      providerOptions: {
        google: {
          useSearchGrounding: true,
        },
      },
    });

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
      error: process.env.NODE_ENV === 'development'
        ? `Error IA: ${msg}`
        : 'Hubo un error al generar el análisis.',
      content: null,
    };
  }
}

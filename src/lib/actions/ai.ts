"use server";

import { prisma } from "@/lib/db/prisma";
import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { getSettings } from "@/lib/actions/settings";

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

    const settings = await getSettings();

    // Marco legal estático de referencia — actualizar si cambia la normativa
    const marcoLegal = `
MARCO LEGAL VIGENTE PARA GADs MUNICIPALES EN ECUADOR:
- COOTAD: competencias municipales en vías, agua potable, saneamiento, residuos sólidos, espacios públicos y seguridad ciudadana.
- LOSNCP y su Reglamento:
  • Ínfima Cuantía: hasta el coeficiente 0,0000002 del PGE vigente (verificar monto exacto en www.sercop.gob.ec antes de ejecutar; referencia orientativa: entre $7.000-$10.000 USD).
  • Catálogo Electrónico: bienes y servicios normalizados disponibles en el portal SERCOP.
  • Menor Cuantía Obras: hasta el coeficiente 0,000002 del PGE.
  • Administración Directa: cuando el GAD dispone de maquinaria, personal y materiales propios.
NOTA: Los montos exactos deben verificarse en www.sercop.gob.ec. Este análisis es orientativo.
`;

    const prompt = `
${settings.aiPromptMaster}

Actúa como experto en Administración Pública y Contratación Pública para GADs municipales de Ecuador.

${marcoLegal}

Reporte ciudadano registrado en la Plataforma del Cantón Quijos:
- Título: ${report.title}
- Categoría: ${report.category}
- Urgencia: ${report.urgency}
- Descripción: ${report.description}

Responde en formato Markdown estructurado:

1. **Competencia del GAD**: ¿El COOTAD faculta al GAD Municipal de Quijos para atender esto? ¿Es competencia exclusiva, concurrente o debe coordinarse con otra entidad?

2. **Mecanismo de Contratación**: Según la LOSNCP, ¿qué modalidad aplica (ínfima cuantía, catálogo electrónico, menor cuantía, administración directa)? Indica el rango orientativo de monto y recuerda verificar el valor exacto en el SERCOP.

3. **3 Acciones Inmediatas**: Pasos concretos ejecutables en los próximos 15 días.

4. **Riesgos o Advertencias**: Si hay competencias de otras entidades o riesgos legales, indícalos. Si no estás seguro de algún artículo o monto, dilo explícitamente en lugar de inventarlo.

Sé directo, profesional y orientado a la acción. No inventes montos ni artículos.
`;

    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      prompt: prompt,
      temperature: 0.4,
      // Habilita Google Search Grounding: Gemini busca en tiempo real
      // para obtener montos SERCOP, leyes y normativas actualizadas al 2026
      providerOptions: {
        google: { useSearchGrounding: true },
      },
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

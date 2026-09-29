import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireTenantAdmin } from '@/lib/auth/session';
import { generateTarimaPDF } from '@/lib/reports/tarimaPdf';
import { writeLog } from '@/lib/logs';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { session, tenantId } = await requireTenantAdmin();

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Municipio no encontrado' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const parish = searchParams.get('parish') || 'TODAS';

    // Obtener los reportes del cantón
    const reports = await prisma.report.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });

    // Generar buffer del PDF vectorial ejecutivo
    const buffer = generateTarimaPDF(tenant, reports, parish);

    const safeParish = parish.replace(/\s+/g, '_');
    const filename = `Ficha_Tarima_${tenant.slug}_${safeParish}_${new Date().toISOString().substring(0, 10)}.pdf`;

    writeLog(
      'INFO',
      tenant.slug,
      session.id,
      `Ficha Ejecutiva de Tarima PDF generada: ${filename} (Parroquia: ${parish}, ${reports.length} reportes base)`
    );

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${filename}"`,
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error: any) {
    console.error('Error generando Ficha de Tarima PDF:', error);
    return NextResponse.json(
      { error: 'Error al generar la Ficha de Tarima PDF: ' + (error?.message || 'Error interno') },
      { status: 500 }
    );
  }
}

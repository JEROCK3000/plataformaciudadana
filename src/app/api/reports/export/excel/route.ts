import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireTenantAdmin } from '@/lib/auth/session';
import { generateExcelReport } from '@/lib/reports/excel';
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
    const status = searchParams.get('status') || undefined;
    const parish = searchParams.get('parish') || undefined;
    const department = searchParams.get('department') || undefined;
    const urgency = searchParams.get('urgency') || undefined;

    const whereClause: any = {
      tenantId,
      ...(status ? { status } : {}),
      ...(parish ? { parish } : {}),
      ...(department ? { department } : {}),
      ...(urgency ? { urgency } : {}),
    };

    const reports = await prisma.report.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    const filterContext = [
      parish ? `Parroquia: ${parish}` : '',
      department ? `Dirección: ${department}` : '',
      status ? `Estado: ${status}` : '',
    ].filter(Boolean).join(' | ');

    const buffer = await generateExcelReport(tenant, reports, filterContext);

    const filename = `Reporte-${tenant.slug}-${new Date().toISOString().substring(0, 10)}.xlsx`;

    writeLog('INFO', tenant.slug, session.id, `Reporte XLSX generado correctamente: ${filename} (${reports.length} filas)`);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('Error generando Excel:', error);
    return NextResponse.json({ error: 'Error al generar el reporte Excel' }, { status: 500 });
  }
}

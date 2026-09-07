import ExcelJS from 'exceljs';
import { Report, Tenant } from '@prisma/client';

export const DEPARTMENT_LABELS: Record<string, string> = {
  OBRAS_PUBLICAS: 'Obras Públicas y Vialidad',
  AGUA_SANEAMIENTO: 'Agua Potable y Saneamiento',
  SERVICIOS_PUBLICOS: 'Servicios Públicos y Aseo',
  SEGURIDAD_CIUDADANA: 'Seguridad Ciudadana y Control',
  PLANIFICACION_AMBIENTE: 'Planificación y Gestión Ambiental',
  OTRO: 'Administración General / Otros',
};

export const CATEGORY_LABELS: Record<string, string> = {
  INFRASTRUCTURE: 'Infraestructura',
  SECURITY: 'Seguridad',
  WATER: 'Agua',
  SERVICES: 'Servicios',
  ENVIRONMENT: 'Medio Ambiente',
  EDUCATION: 'Educación',
  OTHER: 'Otro',
};

export const STATUS_LABELS: Record<string, string> = {
  RECEIVED: 'Recibido',
  IN_REVIEW: 'En revisión',
  IN_PROGRESS: 'En proceso',
  RESOLVED: 'Resuelto',
  REJECTED: 'Rechazado',
};

export const URGENCY_LABELS: Record<string, string> = {
  HIGH: 'Alta',
  MEDIUM: 'Media',
  LOW: 'Baja',
};

export async function generateExcelReport(
  tenant: Tenant,
  reports: Report[],
  filterContext?: string
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Plataforma Ciudadana SaaS';
  workbook.created = new Date();

  const fechaGeneracion = new Date().toLocaleDateString('es-EC', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // -------------------------------------------------------------
  // HOJA 1: RESUMEN EJECUTIVO
  // -------------------------------------------------------------
  const summarySheet = workbook.addWorksheet('Resumen Ejecutivo', {
    views: [{ showGridLines: true }],
  });

  // Estilos base
  const titleFill: ExcelJS.Fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF065F46' }, // Emerald 800
  };
  const titleFont: Partial<ExcelJS.Font> = {
    name: 'Segoe UI',
    size: 14,
    bold: true,
    color: { argb: 'FFFFFFFF' },
  };
  const headerFill: ExcelJS.Fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF047857' }, // Emerald 700
  };
  const headerFont: Partial<ExcelJS.Font> = {
    name: 'Segoe UI',
    size: 10,
    bold: true,
    color: { argb: 'FFFFFFFF' },
  };
  const borderThin: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
    left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
    bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
    right: { style: 'thin', color: { argb: 'FFE5E7EB' } },
  };

  // Encabezado
  summarySheet.mergeCells('B2:E2');
  const titleCell = summarySheet.getCell('B2');
  titleCell.value = tenant.name.toUpperCase();
  titleCell.fill = titleFill;
  titleCell.font = titleFont;
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  summarySheet.getRow(2).height = 30;

  summarySheet.mergeCells('B3:E3');
  const subCell = summarySheet.getCell('B3');
  subCell.value = `INFORME EJECUTIVO DE GESTIÓN TERRITORIAL • CANTÓN ${tenant.canton.toUpperCase()}`;
  subCell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF374151' } };
  subCell.alignment = { vertical: 'middle', horizontal: 'center' };

  summarySheet.getCell('B4').value = `Fecha de emisión: ${fechaGeneracion}`;
  summarySheet.getCell('B4').font = { name: 'Segoe UI', size: 9, italic: true, color: { argb: 'FF6B7280' } };
  if (filterContext) {
    summarySheet.getCell('D4').value = `Filtros: ${filterContext}`;
    summarySheet.getCell('D4').font = { name: 'Segoe UI', size: 9, italic: true, color: { argb: 'FF6B7280' } };
  }

  // Tabla KPIs Resumen
  summarySheet.getCell('B6').value = 'MÉTRICA / ESTADO';
  summarySheet.getCell('C6').value = 'CANTIDAD';
  summarySheet.getCell('B6').fill = headerFill;
  summarySheet.getCell('B6').font = headerFont;
  summarySheet.getCell('C6').fill = headerFill;
  summarySheet.getCell('C6').font = headerFont;
  summarySheet.getCell('C6').alignment = { horizontal: 'center' };

  const statusCounts = Object.keys(STATUS_LABELS).map((st) => ({
    label: STATUS_LABELS[st],
    count: reports.filter((r) => r.status === st).length,
  }));

  let curRow = 7;
  for (const item of statusCounts) {
    summarySheet.getCell(`B${curRow}`).value = item.label;
    summarySheet.getCell(`C${curRow}`).value = item.count;
    summarySheet.getCell(`B${curRow}`).border = borderThin;
    summarySheet.getCell(`C${curRow}`).border = borderThin;
    summarySheet.getCell(`C${curRow}`).alignment = { horizontal: 'center' };
    curRow++;
  }

  summarySheet.getCell(`B${curRow}`).value = 'TOTAL REPORTES REGISTRADOS';
  summarySheet.getCell(`C${curRow}`).value = reports.length;
  summarySheet.getCell(`B${curRow}`).font = { name: 'Segoe UI', bold: true };
  summarySheet.getCell(`C${curRow}`).font = { name: 'Segoe UI', bold: true };
  summarySheet.getCell(`B${curRow}`).border = borderThin;
  summarySheet.getCell(`C${curRow}`).border = borderThin;
  summarySheet.getCell(`C${curRow}`).alignment = { horizontal: 'center' };

  // Tabla por Direcciones Departamentales
  const deptStartRow = curRow + 3;
  summarySheet.getCell(`B${deptStartRow}`).value = 'DIRECCIÓN MUNICIPAL RESPONSABLE';
  summarySheet.getCell(`C${deptStartRow}`).value = 'REPORTES ATRIBUIDOS';
  summarySheet.getCell(`B${deptStartRow}`).fill = headerFill;
  summarySheet.getCell(`B${deptStartRow}`).font = headerFont;
  summarySheet.getCell(`C${deptStartRow}`).fill = headerFill;
  summarySheet.getCell(`C${deptStartRow}`).font = headerFont;
  summarySheet.getCell(`C${deptStartRow}`).alignment = { horizontal: 'center' };

  let deptRow = deptStartRow + 1;
  for (const [deptKey, deptLabel] of Object.entries(DEPARTMENT_LABELS)) {
    const count = reports.filter((r) => (r as any).department === deptKey).length;
    summarySheet.getCell(`B${deptRow}`).value = deptLabel;
    summarySheet.getCell(`C${deptRow}`).value = count;
    summarySheet.getCell(`B${deptRow}`).border = borderThin;
    summarySheet.getCell(`C${deptRow}`).border = borderThin;
    summarySheet.getCell(`C${deptRow}`).alignment = { horizontal: 'center' };
    deptRow++;
  }

  summarySheet.getColumn('B').width = 40;
  summarySheet.getColumn('C').width = 25;
  summarySheet.getColumn('D').width = 25;
  summarySheet.getColumn('E').width = 25;

  // -------------------------------------------------------------
  // HOJA 2: DETALLE DE REPORTES
  // -------------------------------------------------------------
  const detailSheet = workbook.addWorksheet('Detalle de Reportes', {
    views: [{ showGridLines: true }],
  });

  const columns = [
    { header: 'Ticket', key: 'ticketCode', width: 16 },
    { header: 'Fecha', key: 'createdAt', width: 14 },
    { header: 'Parroquia', key: 'parish', width: 22 },
    { header: 'Barrio / Sector', key: 'neighborhood', width: 22 },
    { header: 'Título / Necesidad', key: 'title', width: 35 },
    { header: 'Dirección Responsable', key: 'department', width: 32 },
    { header: 'Categoría', key: 'category', width: 20 },
    { header: 'Urgencia', key: 'urgency', width: 12 },
    { header: 'Estado', key: 'status', width: 16 },
    { header: 'Apoyos', key: 'votes', width: 10 },
    { header: 'Ciudadano', key: 'citizenName', width: 22 },
  ];

  detailSheet.columns = columns;

  // Estilo cabecera detalle
  const headerRow = detailSheet.getRow(1);
  headerRow.height = 25;
  headerRow.eachCell((cell) => {
    cell.fill = headerFill;
    cell.font = headerFont;
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = borderThin;
  });

  // Llenar datos
  for (const report of reports) {
    const row = detailSheet.addRow({
      ticketCode: (report as any).ticketCode || 'SIN-TICKET',
      createdAt: new Date(report.createdAt).toLocaleDateString('es-EC'),
      parish: report.parish,
      neighborhood: report.neighborhood,
      title: report.title,
      department: DEPARTMENT_LABELS[(report as any).department] || (report as any).department,
      category: CATEGORY_LABELS[report.category] || report.category,
      urgency: URGENCY_LABELS[report.urgency] || report.urgency,
      status: STATUS_LABELS[report.status] || report.status,
      votes: report.votes,
      citizenName: report.citizenName || 'Anónimo',
    });

    row.eachCell((cell) => {
      cell.border = borderThin;
      cell.font = { name: 'Segoe UI', size: 9 };
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

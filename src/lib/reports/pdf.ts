import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Report, Tenant } from '@prisma/client';
import { DEPARTMENT_LABELS, CATEGORY_LABELS, STATUS_LABELS, URGENCY_LABELS } from './excel';

export function generatePDFReport(
  tenant: Tenant,
  reports: Report[],
  filterContext?: string
): Buffer {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const fechaGeneracion = new Date().toLocaleDateString('es-EC', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // 1. Cabecera Institucional
  doc.setFillColor(6, 95, 70); // Emerald 800
  doc.rect(0, 0, 297, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(tenant.name.toUpperCase(), 14, 11);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`INFORME OFICIAL DE GESTIÓN TERRITORIAL • CANTÓN ${tenant.canton.toUpperCase()}, PROVINCIA DE ${tenant.province.toUpperCase()}`, 14, 18);

  // Fecha y Metadatos
  doc.setTextColor(55, 65, 81);
  doc.setFontSize(8.5);
  doc.text(`Fecha de corte: ${fechaGeneracion}`, 14, 30);
  if (filterContext) {
    doc.text(`Filtros aplicados: ${filterContext}`, 140, 30);
  }

  // 2. Resumen Métrico Rápido (Badges)
  const total = reports.length;
  const resueltos = reports.filter((r) => r.status === 'RESOLVED').length;
  const proceso = reports.filter((r) => r.status === 'IN_PROGRESS').length;
  const pendientes = reports.filter((r) => r.status === 'RECEIVED' || r.status === 'IN_REVIEW').length;

  doc.setDrawColor(229, 231, 235);
  doc.setFillColor(249, 250, 251);
  doc.roundedRect(14, 34, 269, 14, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(`Total Reportes: ${total}`, 22, 42.5);
  doc.setTextColor(16, 185, 129);
  doc.text(`Resueltos: ${resueltos}`, 95, 42.5);
  doc.setTextColor(59, 130, 246);
  doc.text(`En Proceso: ${proceso}`, 165, 42.5);
  doc.setTextColor(239, 68, 68);
  doc.text(`Pendientes: ${pendientes}`, 235, 42.5);

  // 3. Tabla Detallada con autoTable
  const tableData = reports.map((r) => [
    (r as any).ticketCode || '—',
    new Date(r.createdAt).toLocaleDateString('es-EC'),
    `${r.parish}\n${r.neighborhood}`,
    r.title,
    DEPARTMENT_LABELS[(r as any).department] || (r as any).department,
    URGENCY_LABELS[r.urgency] || r.urgency,
    STATUS_LABELS[r.status] || r.status,
  ]);

  autoTable(doc, {
    startY: 53,
    head: [['Ticket', 'Fecha', 'Ubicación', 'Problema Reportado', 'Dirección Asignada', 'Urgencia', 'Estado']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [4, 120, 87], // Emerald 700
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: 'bold',
      halign: 'center',
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      valign: 'middle',
      overflow: 'linebreak',
    },
    columnStyles: {
      0: { cellWidth: 26, fontStyle: 'bold', halign: 'center' },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 40 },
      3: { cellWidth: 70 },
      4: { cellWidth: 55 },
      5: { cellWidth: 20, halign: 'center' },
      6: { cellWidth: 24, halign: 'center' },
    },
    didDrawPage: (data) => {
      // Pie de página institucional
      const pageCount = (doc as any).internal.getNumberOfPages();
      const currentPage = (data as any).pageNumber;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(156, 163, 175);
      doc.text(
        `Plataforma Ciudadana SaaS • Reporte Oficial de Auditoría y Gestión Territorial • Página ${currentPage} de ${pageCount}`,
        14,
        203
      );
    },
  });

  const arrayBuffer = doc.output('arraybuffer');
  return Buffer.from(arrayBuffer);
}

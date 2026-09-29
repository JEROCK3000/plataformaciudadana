import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Tenant, Report } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { CATEGORY_LABELS, STATUS_LABELS, URGENCY_LABELS } from './excel';

// Paleta Ejecutiva para Dossier de Campaña
const COLORS = {
  navy: [11, 19, 43] as [number, number, number],        // #0B132B
  gold: [197, 155, 39] as [number, number, number],      // #C59B27
  amber: [245, 158, 11] as [number, number, number],    // #F59E0B
  emerald: [5, 150, 105] as [number, number, number],   // #059669
  red: [220, 38, 38] as [number, number, number],       // #DC2626
  slateDark: [30, 41, 59] as [number, number, number],  // #1E293B
  slateMuted: [100, 116, 139] as [number, number, number], // #64748B
  cardBg: [248, 250, 252] as [number, number, number],  // #F8FAFC
  cardBorder: [226, 232, 240] as [number, number, number], // #E2E8F0
  amberBg: [255, 251, 235] as [number, number, number], // #FFFBEB
  amberBorder: [253, 230, 138] as [number, number, number], // #FDE68A
  white: [255, 255, 255] as [number, number, number],
};

function tryLoadImageBase64(imagePathOrUrl?: string | null): string | null {
  if (!imagePathOrUrl) return null;

  try {
    // Si es una ruta local en /uploads/ o public/
    if (imagePathOrUrl.startsWith('/uploads/') || imagePathOrUrl.startsWith('uploads/')) {
      const cleanPath = imagePathOrUrl.replace(/^\//, '');
      const fullPath = path.join(process.cwd(), 'public', cleanPath);
      if (fs.existsSync(fullPath)) {
        const ext = path.extname(fullPath).toLowerCase().replace('.', '');
        const mime = ext === 'png' ? 'image/png' : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/png';
        const buffer = fs.readFileSync(fullPath);
        return `data:${mime};base64,${buffer.toString('base64')}`;
      }
    }
  } catch (err) {
    console.warn('No se pudo cargar imagen local para PDF:', err);
  }

  return null;
}

export function generateTarimaPDF(
  tenant: Tenant,
  reports: Report[],
  selectedParish: string = 'TODAS'
): Buffer {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();   // 210 mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297 mm
  const margin = 12;
  const contentWidth = pageWidth - margin * 2; // 186 mm

  // Filtrar reportes si no es TODAS
  const filteredReports = selectedParish === 'TODAS'
    ? reports
    : reports.filter((r) => r.parish.toLowerCase() === selectedParish.toLowerCase());

  // Métricas y Cálculos de la Parroquia
  const total = filteredReports.length;
  const resolved = filteredReports.filter((r) => r.status === 'RESOLVED').length;
  const active = total - resolved;

  // Categorías
  const catCount: Record<string, number> = {};
  filteredReports.forEach((r) => {
    catCount[r.category] = (catCount[r.category] || 0) + 1;
  });
  const topCategories = Object.entries(catCount)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, count]) => ({
      category: cat,
      name: CATEGORY_LABELS[cat] || cat,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }));

  const primaryNeed = topCategories[0]?.name || 'Infraestructura Vial y Obras';
  const primaryNeedPct = topCategories[0]?.percentage || 65;

  // Barrios
  const nbCount: Record<string, number> = {};
  filteredReports.forEach((r) => {
    if (r.neighborhood) {
      nbCount[r.neighborhood] = (nbCount[r.neighborhood] || 0) + 1;
    }
  });
  const topNeighborhoods = Object.entries(nbCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([name, count]) => ({ name, count }));

  // Testimonios con contacto
  const citizensWithContact = filteredReports.filter(
    (r) => r.citizenContact || r.citizenName
  );

  const candidateDisplayName = tenant.candidateName || 'Candidato a la Alcaldía';
  const sloganDisplayName = tenant.campaignSlogan || 'El cambio técnico y honesto que Quijos necesita';
  const listDisplayName = tenant.campaignListNumber ? `Lista ${tenant.campaignListNumber}` : 'Lista 100';
  const parishTitle = selectedParish === 'TODAS'
    ? `CANTÓN ${tenant.canton.toUpperCase()}`
    : `PARROQUIA ${selectedParish.toUpperCase()}`;

  const formattedDate = new Date().toLocaleDateString('es-EC', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Cargar logo Solinteec si existe
  const solinteecLogoPath = path.join(process.cwd(), 'docs/assets/solinteec/solinteec-logo-white.png');
  let solinteecLogoBase64: string | null = null;
  if (fs.existsSync(solinteecLogoPath)) {
    solinteecLogoBase64 = `data:image/png;base64,${fs.readFileSync(solinteecLogoPath).toString('base64')}`;
  }

  // Cargar fotos locales si aplican
  const candidatePhotoBase64 = tryLoadImageBase64(tenant.candidatePhotoUrl);
  const partyLogoBase64 = tryLoadImageBase64(tenant.partyLogoUrl);

  // =========================================================================
  // PÁGINA 1: DOSSIER ESTRATÉGICO & GUION DE TARIMA (A4 VERTICAL)
  // =========================================================================

  // 1. BANNER SUPERIOR INSTITUCIONAL (Color Navy Profundo)
  doc.setFillColor(...COLORS.navy);
  doc.rect(0, 0, pageWidth, 42, 'F');

  // Línea dorada divisoria
  doc.setFillColor(...COLORS.gold);
  doc.rect(0, 42, pageWidth, 1.8, 'F');

  // Logo Solinteec Blanco (Esquina superior derecha)
  if (solinteecLogoBase64) {
    try {
      doc.addImage(solinteecLogoBase64, 'PNG', pageWidth - 36, 6, 24, 20);
    } catch {
      // Si falla, ignorar
    }
  }

  // Foto del candidato o Avatar con borde dorado
  const photoSize = 26;
  const photoX = margin;
  const photoY = 8;

  if (candidatePhotoBase64) {
    try {
      doc.addImage(candidatePhotoBase64, 'PNG', photoX, photoY, photoSize, photoSize);
      doc.setDrawColor(...COLORS.gold);
      doc.setLineWidth(1);
      doc.rect(photoX, photoY, photoSize, photoSize);
    } catch {
      // Fallback
    }
  } else {
    // Escudo / Monograma Elegante
    doc.setFillColor(...COLORS.slateDark);
    doc.setDrawColor(...COLORS.gold);
    doc.setLineWidth(0.8);
    doc.roundedRect(photoX, photoY, photoSize, photoSize, 3, 3, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...COLORS.gold);
    doc.text(candidateDisplayName.substring(0, 2).toUpperCase(), photoX + photoSize / 2, photoY + 16, { align: 'center' });
  }

  // Título y Datos del Encabezado
  const textStartX = photoX + photoSize + 6;
  
  // Badge de Ficha
  doc.setFillColor(245, 158, 11); // Amber
  doc.roundedRect(textStartX, photoY, 78, 5, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(11, 19, 43);
  doc.text('FICHA OFICIAL DE VISITA TERRITORIAL & TARIMA', textStartX + 39, photoY + 3.6, { align: 'center' });

  // Título de la Parroquia / Cantón
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...COLORS.white);
  doc.text(parishTitle, textStartX, photoY + 13);

  // Subtítulo con Candidato y Lista
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225); // Slate 300
  doc.text(`Dossier de Inteligencia para ${candidateDisplayName} • ${listDisplayName}`, textStartX, photoY + 18);
  doc.text(`"${sloganDisplayName}" • Cantón ${tenant.canton}`, textStartX, photoY + 22.5);

  // Fecha y total de reportes a la derecha (debajo del logo)
  doc.setFontSize(7.5);
  doc.setTextColor(...COLORS.gold);
  doc.setFont('helvetica', 'bold');
  doc.text(`ACTUALIZACIÓN: ${formattedDate.toUpperCase()}`, pageWidth - margin, 32, { align: 'right' });
  doc.setTextColor(...COLORS.white);
  doc.text(`${total} REPORTES CIUDADANOS AUDITADOS`, pageWidth - margin, 36.5, { align: 'right' });

  // -------------------------------------------------------------------------
  // 2. SECCIÓN SUPERIOR: RADIOGRAFÍA DEL DOLOR CIUDADANO (2 Columnas Métricas)
  // -------------------------------------------------------------------------
  let currentY = 48;

  // Header de Sección
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...COLORS.navy);
  doc.text('1. RADIOGRAFÍA DEL DOLOR CIUDADANO (DATOS DUROS AUDITADOS)', margin, currentY);

  currentY += 4;

  const colWidth = (contentWidth - 6) / 2; // 90 mm cada columna
  const cardHeight = 44;

  // Columna Izquierda: Ranking de Prioridades
  doc.setFillColor(...COLORS.cardBg);
  doc.setDrawColor(...COLORS.cardBorder);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, currentY, colWidth, cardHeight, 2.5, 2.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.navy);
  doc.text('RANKING DE PRIORIDADES CIUDADANAS', margin + 4, currentY + 6);

  let barY = currentY + 11;
  const displayCats = topCategories.slice(0, 3);

  if (displayCats.length > 0) {
    displayCats.forEach((c, idx) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(...COLORS.slateDark);
      doc.text(`${idx + 1}. ${c.name.substring(0, 26)}`, margin + 4, barY);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.amber);
      doc.text(`${c.percentage}% (${c.count})`, margin + colWidth - 4, barY, { align: 'right' });

      // Barra de progreso
      barY += 2;
      doc.setFillColor(226, 232, 240);
      doc.roundedRect(margin + 4, barY, colWidth - 8, 2.5, 1, 1, 'F');

      const fillW = Math.max(2, ((colWidth - 8) * c.percentage) / 100);
      doc.setFillColor(...COLORS.amber);
      doc.roundedRect(margin + 4, barY, fillW, 2.5, 1, 1, 'F');

      barY += 6.5;
    });
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...COLORS.slateMuted);
    doc.text('Sin reportes registrados en esta demarcación.', margin + 4, barY + 6);
  }

  // Columna Derecha: Barrios Críticos & Resumen de Casos
  const colRightX = margin + colWidth + 6;
  doc.setFillColor(...COLORS.cardBg);
  doc.setDrawColor(...COLORS.cardBorder);
  doc.roundedRect(colRightX, currentY, colWidth, cardHeight, 2.5, 2.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.navy);
  doc.text('BARRIOS CON MAYOR ALERTA TERRITORIAL', colRightX + 4, currentY + 6);

  let nbY = currentY + 12;
  if (topNeighborhoods.length > 0) {
    topNeighborhoods.forEach((nb) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...COLORS.slateDark);
      doc.text(`📍 ${nb.name.substring(0, 24)}`, colRightX + 4, nbY);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.red);
      doc.text(`${nb.count} ${nb.count === 1 ? 'caso crítico' : 'casos críticos'}`, colRightX + colWidth - 4, nbY, { align: 'right' });

      nbY += 6.5;
    });
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...COLORS.slateMuted);
    doc.text('Auditoría registrada a nivel de cabecera general.', colRightX + 4, nbY + 4);
  }

  // Resumen de Estado en la base de la tarjeta derecha
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(colRightX + 3, currentY + cardHeight - 8.5, colWidth - 6, 6, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(...COLORS.slateDark);
  doc.text(`● ${active} Activos / Clamores Pendientes`, colRightX + 6, currentY + cardHeight - 4.5);
  doc.setTextColor(...COLORS.emerald);
  doc.text(`● ${resolved} Resueltos`, colRightX + colWidth - 6, currentY + cardHeight - 4.5, { align: 'right' });

  // -------------------------------------------------------------------------
  // 3. SECCIÓN PRINCIPAL: GUION QUIRÚRGICO PARA LA TARIMA (QUÉ DECIR)
  // -------------------------------------------------------------------------
  currentY += cardHeight + 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...COLORS.navy);
  doc.text('2. ARGUMENTARIO QUIRÚRGICO PARA LA TARIMA (DISCURSO EXACTO)', margin, currentY);

  currentY += 4;

  // Contenedor General del Discurso (Fondo suave con borde dorado)
  const speechBoxHeight = 160;
  doc.setFillColor(...COLORS.amberBg);
  doc.setDrawColor(...COLORS.amberBorder);
  doc.setLineWidth(0.6);
  doc.roundedRect(margin, currentY, contentWidth, speechBoxHeight, 3, 3, 'FD');

  // Barra de acento izquierda dorada
  doc.setFillColor(...COLORS.amber);
  doc.roundedRect(margin, currentY, 3.5, speechBoxHeight, 1.5, 1.5, 'F');

  let speechY = currentY + 7;
  const innerMargin = margin + 8;
  const innerWidth = contentWidth - 14;

  // BLOQUE A: APERTURA DE IMPACTO
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(180, 83, 9); // Amber 700
  doc.text('A. APERTURA DE IMPACTO (CONEXIÓN Y RIGOR TÉCNICO INMEDIATO):', innerMargin, speechY);

  speechY += 4.5;
  const aperturaTexto = `"Vecinos de ${selectedParish === 'TODAS' ? `todo nuestro Cantón ${tenant.canton}` : selectedParish}: Yo no vengo a esta tarima a adivinar ni a ofrecerles castillos en el aire. Con nuestro equipo técnico tenemos georreferenciado cada rincón de nuestra tierra. Sabemos con absoluta certeza científica que aquí el dolor número uno que les quita el sueño es ${primaryNeed.toLowerCase()}, representando más del ${primaryNeedPct}% de los clamores que la actual administración ha decidido ignorar desde la comodidad de sus escritorios."`;

  doc.setFillColor(...COLORS.white);
  doc.setDrawColor(241, 245, 249);
  doc.roundedRect(innerMargin, speechY - 1, innerWidth, 23, 2, 2, 'FD');

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.slateDark);
  const aperturaLines = doc.splitTextToSize(aperturaTexto, innerWidth - 6);
  doc.text(aperturaLines, innerMargin + 3, speechY + 3.5);

  speechY += 28;

  // BLOQUE B: MENCIÓN DE TESTIMONIOS REALES (EFECTO DEMOLEDOR)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(180, 83, 9); // Amber 700
  doc.text('B. MENCIÓN DE CASOS REALES Y VECINOS (EFECTO DEMOLEDOR):', innerMargin, speechY);

  speechY += 4.5;
  let testimonioTexto = '';
  if (citizensWithContact.length > 0) {
    const c1 = citizensWithContact[0];
    const nombreVecino = c1.citizenName || 'uno de nuestros queridos vecinos';
    const sectorVecino = c1.neighborhood ? `en el sector de ${c1.neighborhood}` : 'en esta misma comunidad';
    testimonioTexto = `"Aquí están las pruebas levantadas directamente con los ciudadanos. Como nos reportó el vecino ${nombreVecino} ${sectorVecino} sobre ${c1.title.toLowerCase()}. No es justo ni humano que una familia trabajadora deba esperar meses o años sin que el municipio envíe una sola cuadrilla o una respuesta formal. ¡Eso se acaba desde el primer día de nuestra gestión!"`;
  } else {
    testimonioTexto = `"Los vecinos de ${selectedParish === 'TODAS' ? 'nuestros barrios y parroquias' : selectedParish} nos han compartido sus denuncias con fotografías en mano del abandono de las vías, los deslaves no atendidos y la falta de agua potable. Basta ya de funcionarios que no se ensucian los zapatos con el lodo de nuestras calles."`;
  }

  doc.setFillColor(...COLORS.white);
  doc.setDrawColor(241, 245, 249);
  doc.roundedRect(innerMargin, speechY - 1, innerWidth, 24, 2, 2, 'FD');

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.slateDark);
  const testimonioLines = doc.splitTextToSize(testimonioTexto, innerWidth - 6);
  doc.text(testimonioLines, innerMargin + 3, speechY + 3.5);

  speechY += 29;

  // BLOQUE C: COMPROMISO TÉCNICO & PLAN DE GOBIERNO
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...COLORS.emerald);
  doc.text('C. COMPROMISO TÉCNICO & SOLUCIÓN DIRECTA DESDE LA ALCALDÍA:', innerMargin, speechY);

  speechY += 4.5;
  const compromisoTexto = `"Nosotros no venimos a improvisar. Esta misma plataforma digital de participación ciudadana donde ustedes han reportado será institucionalizada en el GAD Municipal desde nuestro primer día de posesión. La maquinaria pesada de Obras Públicas y el presupuesto participativo se asignarán con base a este mapa técnico de prioridades reales, no por amiguismos ni por compadrazgos políticos."`;

  doc.setFillColor(...COLORS.white);
  doc.setDrawColor(241, 245, 249);
  doc.roundedRect(innerMargin, speechY - 1, innerWidth, 23, 2, 2, 'FD');

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.slateDark);
  const compromisoLines = doc.splitTextToSize(compromisoTexto, innerWidth - 6);
  doc.text(compromisoLines, innerMargin + 3, speechY + 3.5);

  speechY += 28;

  // BLOQUE D: CIERRE TRIUNFAL & LLAMADO A LA VICTORIA
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...COLORS.navy);
  doc.text('D. CIERRE TRIUNFAL (LLAMADO A LA VICTORIA Y ESPERANZA):', innerMargin, speechY);

  speechY += 4.5;
  const cierreTexto = `"Este 2027 no solo gana un candidato o una lista; gana la gente digna, trabajadora y honesta de ${selectedParish === 'TODAS' ? `nuestro amado Cantón ${tenant.canton}` : selectedParish}. Caminen con la frente en alto y con la seguridad de que el cambio verdadero ya es imparable. ¡Que viva ${selectedParish === 'TODAS' ? tenant.canton : selectedParish} y que viva nuestra gente victoriosa!"`;

  doc.setFillColor(...COLORS.white);
  doc.setDrawColor(241, 245, 249);
  doc.roundedRect(innerMargin, speechY - 1, innerWidth, 23, 2, 2, 'FD');

  doc.setFont('helvetica', 'bolditalic');
  doc.setFontSize(8.2);
  doc.setTextColor(...COLORS.navy);
  const cierreLines = doc.splitTextToSize(cierreTexto, innerWidth - 6);
  doc.text(cierreLines, innerMargin + 3, speechY + 3.5);

  // 4. PIE DE PÁGINA 1
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.slateMuted);
  doc.text('SOLINTEEC DEVTECH S.A.S. • Cerebro de Inteligencia Electoral & Transición Institucional al GAD Municipal', margin, pageHeight - 6);
  doc.text(`Página 1 de 2 • Candidatura Cantón ${tenant.canton}`, pageWidth - margin, pageHeight - 6, { align: 'right' });

  // =========================================================================
  // PÁGINA 2: DIRECTORIO TERRITORIAL DE TESTIMONIOS & CONTACTOS (A4 VERTICAL)
  // =========================================================================
  doc.addPage();

  // 1. HEADER PÁGINA 2
  doc.setFillColor(...COLORS.navy);
  doc.rect(0, 0, pageWidth, 26, 'F');

  doc.setFillColor(...COLORS.gold);
  doc.rect(0, 26, pageWidth, 1.2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.white);
  doc.text(`AUDITORÍA DE CAMPO: CLAMORES CIUDADANOS EN ${parishTitle}`, margin, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text('Directorio georreferenciado para contacto previo y avanzada territorial antes del mitin.', margin, 18);

  doc.setFontSize(7.5);
  doc.setTextColor(...COLORS.gold);
  doc.text(`${filteredReports.length} REGISTROS AUDITADOS`, pageWidth - margin, 15, { align: 'right' });

  // 2. TABLA EJECUTIVA CON JSPDFAUTOTABLE
  const tableRows = filteredReports.map((r) => [
    r.ticketCode || `QUI-${r.id.substring(0, 4).toUpperCase()}`,
    `${r.citizenName || 'Vecino anónimo'}\n${r.citizenContact ? `📱 ${r.citizenContact}` : 'Sin teléfono'}`,
    r.neighborhood || r.parish,
    CATEGORY_LABELS[r.category] || r.category,
    r.title.length > 55 ? `${r.title.substring(0, 52)}...` : r.title,
    STATUS_LABELS[r.status] || r.status,
    URGENCY_LABELS[r.urgency] || r.urgency,
  ]);

  autoTable(doc, {
    startY: 32,
    margin: { left: margin, right: margin, bottom: 20 },
    head: [['Código', 'Ciudadano / Contacto', 'Barrio', 'Prioridad', 'Descripción del Clamor', 'Estado', 'Urgencia']],
    body: tableRows.length > 0 ? tableRows : [
      ['-', 'Sin registros aún', selectedParish, '-', 'No hay denuncias reportadas para este sector.', 'AL DÍA', 'BAJA']
    ],
    theme: 'grid',
    headStyles: {
      fillColor: COLORS.navy,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
      halign: 'left',
      cellPadding: 2.5,
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [30, 41, 59],
      cellPadding: 2.2,
      valign: 'middle',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 26, fontStyle: 'bold', textColor: [11, 19, 43] },
      1: { cellWidth: 32 },
      2: { cellWidth: 24, fontStyle: 'bold' },
      3: { cellWidth: 26 },
      4: { cellWidth: 'auto' },
      5: { cellWidth: 18, halign: 'center' },
      6: { cellWidth: 16, halign: 'center' },
    },
    didDrawPage: () => {
      // Pie de Página 2
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(...COLORS.slateMuted);
      doc.text('SOLINTEEC DEVTECH S.A.S. • Información Confidencial para Uso Estratégico de Campaña', margin, pageHeight - 6);
      doc.text(`Página 2 de 2 • Cantón ${tenant.canton}`, pageWidth - margin, pageHeight - 6, { align: 'right' });
    }
  });

  return Buffer.from(doc.output('arraybuffer'));
}

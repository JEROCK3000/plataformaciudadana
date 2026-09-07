import fs from 'fs';
import path from 'path';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Cargar logos oficiales de SOLINTEEC DEVTECH S.A.S.
const logoWhitePath = path.join(process.cwd(), 'docs/assets/solinteec/solinteec-logo-white.png');
const logoColorPath = path.join(process.cwd(), 'docs/assets/solinteec/solinteec-logo-color.png');
const logoBlackPath = path.join(process.cwd(), 'docs/assets/solinteec/solinteec-logo-black.png');

const logoWhiteB64 = 'data:image/png;base64,' + fs.readFileSync(logoWhitePath).toString('base64');
const logoColorB64 = 'data:image/png;base64,' + fs.readFileSync(logoColorPath).toString('base64');
const logoBlackB64 = 'data:image/png;base64,' + fs.readFileSync(logoBlackPath).toString('base64');

// Paleta Corporativa SOLINTEEC DEVTECH
const COLORS = {
  obsidian: [11, 15, 25],       // #0B0F19 Fondo oscuro ultra premium
  navy: [15, 23, 42],           // #0F172A
  slate: [30, 41, 59],          // #1E293B
  slateLight: [51, 65, 85],     // #334155
  gold: [197, 155, 39],         // #C59B27 Oro Solinteec
  goldLight: [234, 179, 8],     // #EAB308
  goldBg: [254, 252, 232],      // #FEFCE8
  emerald: [5, 150, 105],       // #059669 Éxito / Operación
  emeraldBg: [236, 253, 245],   // #ECFDF5
  blue: [37, 99, 235],          // #2563EB Tecnología / CRM
  blueBg: [239, 246, 255],      // #EFF6FF
  purple: [124, 58, 237],       // #7C3AED ERP / Finanzas
  purpleBg: [245, 243, 255],    // #F5F3FF
  bgLight: [248, 250, 252],     // #F8FAFC
  cardBg: [255, 255, 255],      // #FFFFFF
  border: [226, 232, 240],      // #E2E8F0
  textPrimary: [15, 23, 42],    // #0F172A
  textSecondary: [71, 85, 105], // #475569
  textMuted: [148, 163, 184],   // #94A3B8
  white: [255, 255, 255],
};

function createEnterprisePresentation(): jsPDF {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 297;
  const pageHeight = 210;
  const totalPages = 8;

  const drawFooter = (pageNum: number) => {
    doc.setDrawColor(COLORS.border[0], COLORS.border[1], COLORS.border[2]);
    doc.setLineWidth(0.3);
    doc.line(16, pageHeight - 12, pageWidth - 16, pageHeight - 12);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(COLORS.gold[0], COLORS.gold[1], COLORS.gold[2]);
    doc.text('SOLINTEEC DEVTECH S.A.S.', 16, pageHeight - 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
    doc.text('• Modernización, Gobernanza Digital y Soberanía Tecnológica para GADs Municipales', 64, pageHeight - 7);

    const pageStr = `Página ${pageNum} de ${totalPages} • Propuesta Estratégica Confidencial`;
    doc.text(pageStr, pageWidth - 16, pageHeight - 7, { align: 'right' });
  };

  const drawHeader = (category: string, title: string, subtitle: string) => {
    doc.setFillColor(COLORS.bgLight[0], COLORS.bgLight[1], COLORS.bgLight[2]);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Barra superior dorada / oscura
    doc.setFillColor(COLORS.obsidian[0], COLORS.obsidian[1], COLORS.obsidian[2]);
    doc.rect(0, 0, pageWidth, 4, 'F');
    doc.setFillColor(COLORS.gold[0], COLORS.gold[1], COLORS.gold[2]);
    doc.rect(0, 4, 180, 1.5, 'F');

    // Logo Solinteec original en la esquina superior derecha
    try {
      doc.addImage(logoColorB64, 'PNG', pageWidth - 44, 8, 28, 23.2);
    } catch (e) {
      console.warn('Error loading header logo:', e);
    }

    // Pill de categoría
    doc.setFillColor(COLORS.goldBg[0], COLORS.goldBg[1], COLORS.goldBg[2]);
    doc.setDrawColor(COLORS.gold[0], COLORS.gold[1], COLORS.gold[2]);
    doc.setLineWidth(0.4);
    doc.roundedRect(16, 9.5, 76, 6, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(COLORS.gold[0], COLORS.gold[1], COLORS.gold[2]);
    doc.text(category.toUpperCase(), 20, 13.8);

    // Título Principal de la Lámina
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(COLORS.textPrimary[0], COLORS.textPrimary[1], COLORS.textPrimary[2]);
    doc.text(title, 16, 22.5);

    // Subtítulo
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(COLORS.textSecondary[0], COLORS.textSecondary[1], COLORS.textSecondary[2]);
    doc.text(subtitle, 16, 28);

    // Línea sutil separadora
    doc.setDrawColor(COLORS.border[0], COLORS.border[1], COLORS.border[2]);
    doc.setLineWidth(0.4);
    doc.line(16, 31.5, pageWidth - 16, 31.5);
  };

  // ==========================================
  // PÁGINA 1: PORTADA EJECUTIVA ENTERPRISE
  // ==========================================
  doc.setFillColor(COLORS.obsidian[0], COLORS.obsidian[1], COLORS.obsidian[2]);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Acentos de fondo
  doc.setFillColor(COLORS.navy[0], COLORS.navy[1], COLORS.navy[2]);
  doc.rect(pageWidth - 95, 0, 95, pageHeight, 'F');
  doc.setFillColor(COLORS.slate[0], COLORS.slate[1], COLORS.slate[2]);
  doc.triangle(pageWidth - 95, 0, pageWidth, 0, pageWidth - 95, 80, 'F');

  // Barra de acento dorado vertical
  doc.setFillColor(COLORS.gold[0], COLORS.gold[1], COLORS.gold[2]);
  doc.rect(20, 0, 3, pageHeight, 'F');

  // Logo SOLINTEEC Blanco de alto contraste en portada
  try {
    doc.addImage(logoWhiteB64, 'PNG', 32, 20, 56, 46.4);
  } catch (e) {
    console.warn('Error portada logo:', e);
  }

  // Badge Dorado Superior
  doc.setFillColor(COLORS.gold[0], COLORS.gold[1], COLORS.gold[2]);
  doc.roundedRect(32, 74, 118, 7, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(COLORS.obsidian[0], COLORS.obsidian[1], COLORS.obsidian[2]);
  doc.text('DOCUMENTO ESTRATÉGICO INSTITUCIONAL | GOBIERNO DIGITAL 2026', 36, 78.8);

  // Título Principal
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(23);
  doc.setTextColor(COLORS.white[0], COLORS.white[1], COLORS.white[2]);
  doc.text('ARQUITECTURA DE MODERNIZACIÓN', 32, 94);
  doc.text('INSTITUCIONAL PARA GADs MUNICIPALES', 32, 104);

  // Destacado Dorado
  doc.setFontSize(14.5);
  doc.setTextColor(COLORS.gold[0], COLORS.gold[1], COLORS.gold[2]);
  doc.text('ECOSISTEMA INTEGRADO: PLATAFORMA CIUDADANA + G-CRM + G-ERP MUNICIPAL', 32, 115);

  // Subtítulo descriptivo
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text(
    'Modelo integral para transformar la queja y necesidad barrial en órdenes de trabajo automatizadas,',
    32,
    125
  );
  doc.text(
    'control riguroso de inventarios y cuadrillas, trazabilidad presupuestaria y transparencia pública absoluta.',
    32,
    131
  );

  // Tarjeta de Metadatos
  doc.setFillColor(COLORS.navy[0], COLORS.navy[1], COLORS.navy[2]);
  doc.setDrawColor(COLORS.slateLight[0], COLORS.slateLight[1], COLORS.slateLight[2]);
  doc.setLineWidth(0.5);
  doc.roundedRect(32, 147, 160, 44, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(COLORS.gold[0], COLORS.gold[1], COLORS.gold[2]);
  doc.text('PRESENTADO A:', 40, 155);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(COLORS.white[0], COLORS.white[1], COLORS.white[2]);
  doc.text('Alcaldía Municipal, Direcciones Departamentales y Concejo Cantonal', 40, 161);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(COLORS.gold[0], COLORS.gold[1], COLORS.gold[2]);
  doc.text('DESARROLLADO Y PRESENTADO POR:', 40, 171);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(COLORS.white[0], COLORS.white[1], COLORS.white[2]);
  doc.text('SOLINTEEC DEVTECH S.A.S.', 40, 177);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text('Ingeniería de Software Gubernamental • Arquitectura Cloud SaaS • Ciberseguridad', 40, 183);

  // Métricas en portada derecha
  const drawImpactMetric = (y: number, val: string, desc: string) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(COLORS.gold[0], COLORS.gold[1], COLORS.gold[2]);
    doc.text(val, pageWidth - 80, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(COLORS.white[0], COLORS.white[1], COLORS.white[2]);
    doc.text(desc, pageWidth - 80, y + 5);
  };

  drawImpactMetric(60, '-65%', 'Tiempo de respuesta a emergencias');
  drawImpactMetric(95, '100%', 'Trazabilidad de materiales y obras');
  drawImpactMetric(130, '0%', 'Pérdida de oficios o solicitudes');
  drawImpactMetric(165, '24 / 7', 'Canal activo ciudadano georreferenciado');

  // ==========================================
  // PÁGINA 2: DIAGNÓSTICO Y VISIÓN ESTRATÉGICA
  // ==========================================
  doc.addPage();
  drawHeader(
    'Diagnóstico Situacional',
    'La Realidad Actual vs. El Ecosistema Integrado SOLINTEEC',
    'Por qué los municipios tradicionales se estancan en la burocracia y cómo la digitalización unificada lo resuelve.'
  );

  // Columna Izquierda: El Reto Tradicional
  doc.setFillColor(COLORS.cardBg[0], COLORS.cardBg[1], COLORS.cardBg[2]);
  doc.setDrawColor(239, 68, 68);
  doc.setLineWidth(0.6);
  doc.roundedRect(16, 37, 128, 155, 3, 3, 'FD');

  doc.setFillColor(254, 242, 242);
  doc.roundedRect(16, 37, 128, 14, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(185, 28, 28);
  doc.text('[DIAGNÓSTICO]  EL MODELO MUNICIPAL TRADICIONAL (Fragmentado)', 22, 46);

  const painPoints = [
    {
      title: 'Oficios de papel y llamadas informales',
      desc: 'Las solicitudes ciudadanas llegan por ventanilla física, oficios que demoran semanas en ser remitidos, o mensajes personales que se extravían en el olvido.',
    },
    {
      title: 'Desconexión entre Direcciones Técnicas',
      desc: 'Obras Públicas no sabe qué tubería rompió Agua Potable; Servicios Públicos cambia luminarias sin registro geoespacial coordinado con Planificación.',
    },
    {
      title: 'Fuga silenciosa de materiales e insumos',
      desc: 'Salidas de bodega (cemento, asfalto, tubos PVC) sin correspondencia exacta con un ticket georreferenciado ni acta de entrega fotográfica auditada.',
    },
    {
      title: 'Cuadrillas sin control operativo en territorio',
      desc: 'El personal operativo carece de órdenes de trabajo digitales; la dirección desconoce tiempos muertos, rutas y estado real de cada labor.',
    },
    {
      title: 'Desconfianza ciudadana y desgaste político',
      desc: 'El ciudadano siente que sus impuestos caen en un "saco roto" al no recibir respuesta; las quejas estallan públicamente en redes sociales.',
    },
  ];

  let curY = 57;
  painPoints.forEach((p, idx) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(COLORS.textPrimary[0], COLORS.textPrimary[1], COLORS.textPrimary[2]);
    doc.text(`${idx + 1}. ${p.title}`, 22, curY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.2);
    doc.setTextColor(COLORS.textSecondary[0], COLORS.textSecondary[1], COLORS.textSecondary[2]);
    const lines = doc.splitTextToSize(p.desc, 116);
    doc.text(lines, 22, curY + 4.2);
    curY += 19.5;
  });

  // Columna Derecha: La Solución SOLINTEEC
  doc.setFillColor(COLORS.cardBg[0], COLORS.cardBg[1], COLORS.cardBg[2]);
  doc.setDrawColor(COLORS.emerald[0], COLORS.emerald[1], COLORS.emerald[2]);
  doc.setLineWidth(0.6);
  doc.roundedRect(153, 37, 128, 155, 3, 3, 'FD');

  doc.setFillColor(COLORS.emeraldBg[0], COLORS.emeraldBg[1], COLORS.emeraldBg[2]);
  doc.roundedRect(153, 37, 128, 14, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(COLORS.emerald[0], COLORS.emerald[1], COLORS.emerald[2]);
  doc.text('[SOLUCIÓN]  EL ECOSISTEMA SOLINTEEC (Conectado y Transparente)', 159, 46);

  const solutions = [
    {
      title: 'Sensor Ciudadano Georreferenciado 24/7',
      desc: 'Cualquier vecino sube una incidencia barrial con foto GPS en 30 segundos. Recibe de inmediato un código de trámite inviolable (ej. QUI-2026-0001).',
    },
    {
      title: 'Ruteo Algorítmico a la Dirección Técnica',
      desc: 'El sistema enruta el caso automáticamente a Obras Públicas, Agua Potable, Seguridad o Servicios Públicos, activando un SLA de respuesta obligatoria.',
    },
    {
      title: 'Trazabilidad Total de Inventarios y Bodega',
      desc: 'Cada metro de tubería o quintal de asfalto despachado queda atado al ticket del ciudadano. Cero desvíos, auditoría instantánea para Contraloría.',
    },
    {
      title: 'Órdenes de Trabajo Móviles con Evidencia',
      desc: 'La cuadrilla en territorio atiende la labor, toma la foto "Después" y el sistema genera automáticamente el acta técnica de cumplimiento.',
    },
    {
      title: 'Tablero del Alcalde y Confianza Vecinal',
      desc: 'La Alcaldía visualiza un mapa de calor en vivo de obras ejecutadas e inversión por parroquia. El vecino recibe su notificación de obra resuelta.',
    },
  ];

  curY = 57;
  solutions.forEach((s, idx) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(COLORS.emerald[0], COLORS.emerald[1], COLORS.emerald[2]);
    doc.text(`${idx + 1}. ${s.title}`, 159, curY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.2);
    doc.setTextColor(COLORS.textSecondary[0], COLORS.textSecondary[1], COLORS.textSecondary[2]);
    const lines = doc.splitTextToSize(s.desc, 116);
    doc.text(lines, 159, curY + 4.2);
    curY += 19.5;
  });

  drawFooter(2);

  // ==========================================
  // PÁGINA 3: SIMULACIÓN DE CONEXIONES Y ARQUITECTURA
  // ==========================================
  doc.addPage();
  drawHeader(
    'Arquitectura de Conexiones',
    'Flujo Integral de Datos: Del Territorio al Cierre Financiero',
    'Simulación paso a paso de cómo viaja la información entre la ciudadanía, las direcciones y el motor de decisión.'
  );

  const blocks = [
    {
      step: 'PASO 1',
      tag: 'TOMA DE DATOS',
      title: 'Sensor Ciudadano',
      color: COLORS.emerald,
      bgColor: COLORS.emeraldBg,
      items: [
        'Web móvil & Portal Ciudadano',
        'Foto del problema con geolocalización GPS',
        'Nivel de urgencia barrial',
        'Emisión de Código Ticket Único (ej. QUI-2026-0001)',
      ],
    },
    {
      step: 'PASO 2',
      tag: 'RUTEO INTELIGENTE',
      title: 'Despacho Municipal',
      color: COLORS.blue,
      bgColor: COLORS.blueBg,
      items: [
        'Clasificación automática por categoría',
        'Enrutamiento a Dirección Técnica competente',
        'Notificación instantánea al Director de Área',
        'Apertura de reloj de cumplimiento (SLA)',
      ],
    },
    {
      step: 'PASO 3',
      tag: 'G-CRM MUNICIPAL',
      title: 'Gestión Ciudadana',
      color: COLORS.gold,
      bgColor: COLORS.goldBg,
      items: [
        'Expediente digital consolidado del vecino',
        'Actualización automática de estado',
        'Notificación vía WhatsApp / Web tracker',
        'Historial unificado de trámites barriales',
      ],
    },
    {
      step: 'PASO 4',
      tag: 'G-ERP MUNICIPAL',
      title: 'Operación & Bodegas',
      color: COLORS.purple,
      bgColor: COLORS.purpleBg,
      items: [
        'Generación de Orden de Trabajo (OT)',
        'Despacho de Cuadrilla y Maquinaria',
        'Egreso de Bodega (tubería, asfalto, repuestos)',
        'Imputación de costo a la Parroquia / Presupuesto',
      ],
    },
    {
      step: 'PASO 5',
      tag: 'RESOLUCIÓN TÉCNICA',
      title: 'Transparencia & Cierre',
      color: COLORS.navy,
      bgColor: COLORS.cardBg,
      items: [
        'Subida de Evidencia Fotográfica "Después"',
        'Acta técnica firmada de entrega',
        'Cierre contable del material utilizado',
        'Actualización de KPIs en Tablero de Alcaldía',
      ],
    },
  ];

  const cardW = 50.8;
  const startX = 16;
  const cardH = 120;
  const topY = 37;

  blocks.forEach((b, idx) => {
    const x = startX + idx * (cardW + 3.8);

    doc.setFillColor(COLORS.cardBg[0], COLORS.cardBg[1], COLORS.cardBg[2]);
    doc.setDrawColor(b.color[0], b.color[1], b.color[2]);
    doc.setLineWidth(0.6);
    doc.roundedRect(x, topY, cardW, cardH, 3, 3, 'FD');

    doc.setFillColor(b.bgColor[0], b.bgColor[1], b.bgColor[2]);
    doc.roundedRect(x, topY, cardW, 20, 3, 3, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.setTextColor(b.color[0], b.color[1], b.color[2]);
    doc.text(b.step + ' • ' + b.tag, x + 3.5, topY + 6.5);

    doc.setFontSize(9.5);
    doc.setTextColor(COLORS.textPrimary[0], COLORS.textPrimary[1], COLORS.textPrimary[2]);
    doc.text(b.title, x + 3.5, topY + 14.5);

    let itemY = topY + 28;
    b.items.forEach((it) => {
      doc.setFillColor(b.color[0], b.color[1], b.color[2]);
      doc.circle(x + 5, itemY - 1, 1.2, 'F');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(COLORS.textSecondary[0], COLORS.textSecondary[1], COLORS.textSecondary[2]);
      const lines = doc.splitTextToSize(it, cardW - 10);
      doc.text(lines, x + 8.5, itemY);
      itemY += lines.length * 4.2 + 5.5;
    });

    if (idx < blocks.length - 1) {
      const arrowX = x + cardW + 0.8;
      doc.setFillColor(COLORS.gold[0], COLORS.gold[1], COLORS.gold[2]);
      doc.triangle(arrowX, topY + 58, arrowX + 2.2, topY + 60, arrowX, topY + 62, 'F');
    }
  });

  // Banner Inferior de Seguridad y Control
  doc.setFillColor(COLORS.obsidian[0], COLORS.obsidian[1], COLORS.obsidian[2]);
  doc.roundedRect(16, 163, pageWidth - 32, 29, 3, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(COLORS.gold[0], COLORS.gold[1], COLORS.gold[2]);
  doc.text('SEGURIDAD INSTITUCIONAL Y COMPATIBILIDAD CON SISTEMAS PREEXISTENTES', 22, 171.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.2);
  doc.setTextColor(COLORS.white[0], COLORS.white[1], COLORS.white[2]);
  doc.text(
    'El ecosistema no exige reemplazar bruscamente sistemas financieros heredados: actúa como una capa inteligente que conecta',
    22,
    178.5
  );
  doc.text(
    'las direcciones mediante APIs REST seguras, trazabilidad criptográfica inmutable y base de datos relacional MariaDB/MySQL.',
    22,
    184
  );

  drawFooter(3);

  // ==========================================
  // PÁGINA 4: MÓDULOS DEL G-CRM MUNICIPAL
  // ==========================================
  doc.addPage();
  drawHeader(
    'Módulos del G-CRM',
    'Gestión de Relación con el Ciudadano: Transparencia y Trámites Ágiles',
    'Especializado en reconstruir la confianza de los vecinos a través de trazabilidad, comunicación proactiva y cero filas.'
  );

  const crmCards = [
    {
      code: 'MÓDULO CRM-01',
      title: 'Ventanilla Única Digital & Mesa de Partes',
      badge: 'CERO PAPELEO',
      color: COLORS.blue,
      desc: 'Recepción y radicación digital de peticiones ciudadanas, permisos barriales, reclamos tributarios e inspecciones.',
      features: [
        'Numeración secuencial digital inalterable con sellado de tiempo',
        'Eliminación total del extravío físico de carpetas en escritorios',
        'Asignación directa al funcionario responsable con control de plazos',
        'Descarga de certificados y actas con código QR de verificación oficial',
      ],
    },
    {
      code: 'MÓDULO CRM-02',
      title: 'Geogestión de Incidencias Barriales',
      badge: 'MAPA DE CALOR 24/7',
      color: COLORS.emerald,
      desc: 'Consolidación de las necesidades urbanas y rurales en un mapa dinámico con capas temáticas por parroquia.',
      features: [
        'Detección y unificación de reportes duplicados de un mismo incidente',
        'Ponderación automática por nivel de riesgo vial, sanitario o de seguridad',
        'Filtro instantáneo por parroquia, barrio, tipo de daño y dirección a cargo',
        'Histórico georreferenciado para planificación de obras mayores',
      ],
    },
    {
      code: 'MÓDULO CRM-03',
      title: 'Omnicanalidad & Notificaciones en Tiempo Real',
      badge: 'COMUNICACIÓN ACTIVA',
      color: COLORS.gold,
      desc: 'El ciudadano nunca más tiene que ir al municipio a preguntar "¿cómo va mi trámite?". El sistema le informa activamente.',
      features: [
        'Rastreo público en web con su código de ticket (ej. QUI-2026-0001)',
        'Notificaciones de avance en 4 fases: Recibido → En Revisión → Obra → Resuelto',
        'Integración con canales masivos (WhatsApp Business API / SMS de alerta)',
        'Encuesta de satisfacción de 1 a 5 estrellas al concluir el trabajo',
      ],
    },
    {
      code: 'MÓDULO CRM-04',
      title: 'Presupuesto Participativo Basado en Evidencia',
      badge: 'DEMOCRACIA DIGITAL',
      color: COLORS.purple,
      desc: 'Herramienta para asambleas comunitarias y priorización democrática fundamentada en datos duros del territorio.',
      features: [
        'Registro de votación y respaldo vecinal por obra requerida',
        'Informe estadístico de las prioridades más urgentes por cada parroquia',
        'Justificación técnica transparente para asignación del presupuesto anual',
        'Rendición de cuentas pública accesible para asambleístas y cabildos',
      ],
    },
  ];

  const gridW = 128;
  const gridH = 74;

  crmCards.forEach((c, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = 16 + col * (gridW + 9);
    const y = 37 + row * (gridH + 7);

    doc.setFillColor(COLORS.cardBg[0], COLORS.cardBg[1], COLORS.cardBg[2]);
    doc.setDrawColor(COLORS.border[0], COLORS.border[1], COLORS.border[2]);
    doc.setLineWidth(0.6);
    doc.roundedRect(x, y, gridW, gridH, 3, 3, 'FD');

    // Barra superior
    doc.setFillColor(c.color[0], c.color[1], c.color[2]);
    doc.rect(x, y, gridW, 2.5, 'F');

    // Código y Badge
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(c.color[0], c.color[1], c.color[2]);
    doc.text(c.code, x + 6, y + 8);

    doc.setFillColor(c.color[0], c.color[1], c.color[2]);
    doc.roundedRect(x + gridW - 38, y + 4.5, 32, 5, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(COLORS.white[0], COLORS.white[1], COLORS.white[2]);
    doc.text(c.badge, x + gridW - 22, y + 8, { align: 'center' });

    // Título
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(COLORS.textPrimary[0], COLORS.textPrimary[1], COLORS.textPrimary[2]);
    doc.text(c.title, x + 6, y + 15);

    // Descripción
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(COLORS.textSecondary[0], COLORS.textSecondary[1], COLORS.textSecondary[2]);
    const descLines = doc.splitTextToSize(c.desc, gridW - 12);
    doc.text(descLines, x + 6, y + 20);

    // Línea separadora
    doc.setDrawColor(COLORS.border[0], COLORS.border[1], COLORS.border[2]);
    doc.setLineWidth(0.3);
    doc.line(x + 6, y + 27, x + gridW - 6, y + 27);

    // Bullets
    let featY = y + 33;
    c.features.forEach((f) => {
      doc.setFillColor(c.color[0], c.color[1], c.color[2]);
      doc.circle(x + 9, featY - 1, 1, 'F');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(COLORS.textPrimary[0], COLORS.textPrimary[1], COLORS.textPrimary[2]);
      const lines = doc.splitTextToSize(f, gridW - 18);
      doc.text(lines, x + 12, featY);
      featY += lines.length * 3.8 + 3.2;
    });
  });

  drawFooter(4);

  // ==========================================
  // PÁGINA 5: MÓDULOS DEL G-ERP MUNICIPAL
  // ==========================================
  doc.addPage();
  drawHeader(
    'Módulos del G-ERP',
    'Control Operativo, Cuadrillas, Bodegas y Fiscalización del Gasto',
    'El cerebro logístico interno para que cada centavo municipal y cada hora operativa queden registrados y auditados.'
  );

  const erpCards = [
    {
      code: 'MÓDULO ERP-01',
      title: 'Órdenes de Trabajo (OT) & Cuadrillas en Campo',
      badge: 'DESPACHO OPERATIVO',
      color: COLORS.purple,
      desc: 'Planificación, despacho y supervisión en tiempo real de cuadrillas técnicas y maquinaria pesada municipal.',
      features: [
        'Emisión de OT digital a partir del ticket ciudadano con 1 solo clic',
        'Asignación de cuadrilla, jefe de grupo, vehículo y maquinaria específica',
        'App móvil técnica para la cuadrilla con funcionamiento offline en campo',
        'Cierre de labor con captura in situ de fotografía de la obra terminada',
      ],
    },
    {
      code: 'MÓDULO ERP-02',
      title: 'Bodega Técnica, Insumos & Repuestos',
      badge: 'CONTROL DE BODEGA',
      color: COLORS.blue,
      desc: 'Inventario inteligente que descuenta automáticamente los insumos utilizados contra cada orden de trabajo.',
      features: [
        'Trazabilidad de tuberías, asfalto frío/caliente, válvulas, cables y luminarias',
        'Despacho exclusivo con autorización asociada a un número de OT oficial',
        'Alertas automáticas de stock mínimo para evitar desabastecimiento',
        'Reportes de consumo comparativo entre cuadrillas y parroquias',
      ],
    },
    {
      code: 'MÓDULO ERP-03',
      title: 'Costeo Exacto por Parroquia & Centro de Costos',
      badge: 'FINANZAS CLARAS',
      color: COLORS.gold,
      desc: 'Claridad financiera para saber con precisión matemática cuánto invierte el municipio en cada sector del cantón.',
      features: [
        'Imputación directa de costo de materiales, combustible y mano de obra',
        'Reportes ejecutivos de gasto real vs. presupuesto asignado por parroquia',
        'Eliminación de dudas de inequidad territorial en sesiones de concejo',
        'Histórico financiero auditable listo para informes a Contraloría',
      ],
    },
    {
      code: 'MÓDULO ERP-04',
      title: 'Monitoreo de Compras Públicas & PAC Municipal',
      badge: 'COMPRAS EFICIENTES',
      color: COLORS.emerald,
      desc: 'Articulación de los requerimientos de territorio con el Plan Anual de Contratación (PAC) y el SERCOP.',
      features: [
        'Detección de patrones de fallas para planificar compras consolidadas',
        'Ahorro por economías de escala al licitar insumos anuales recurrentes',
        'Evidencia fotográfica y técnica para justificar contrataciones ante el SERCOP',
        'Control de garantías técnicas y cumplimiento de contratistas externos',
      ],
    },
  ];

  erpCards.forEach((c, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = 16 + col * (gridW + 9);
    const y = 37 + row * (gridH + 7);

    doc.setFillColor(COLORS.cardBg[0], COLORS.cardBg[1], COLORS.cardBg[2]);
    doc.setDrawColor(COLORS.border[0], COLORS.border[1], COLORS.border[2]);
    doc.setLineWidth(0.6);
    doc.roundedRect(x, y, gridW, gridH, 3, 3, 'FD');

    doc.setFillColor(c.color[0], c.color[1], c.color[2]);
    doc.rect(x, y, gridW, 2.5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(c.color[0], c.color[1], c.color[2]);
    doc.text(c.code, x + 6, y + 8);

    doc.setFillColor(c.color[0], c.color[1], c.color[2]);
    doc.roundedRect(x + gridW - 38, y + 4.5, 32, 5, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(COLORS.white[0], COLORS.white[1], COLORS.white[2]);
    doc.text(c.badge, x + gridW - 22, y + 8, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(COLORS.textPrimary[0], COLORS.textPrimary[1], COLORS.textPrimary[2]);
    doc.text(c.title, x + 6, y + 15);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(COLORS.textSecondary[0], COLORS.textSecondary[1], COLORS.textSecondary[2]);
    const descLines = doc.splitTextToSize(c.desc, gridW - 12);
    doc.text(descLines, x + 6, y + 20);

    doc.setDrawColor(COLORS.border[0], COLORS.border[1], COLORS.border[2]);
    doc.setLineWidth(0.3);
    doc.line(x + 6, y + 27, x + gridW - 6, y + 27);

    let featY = y + 33;
    c.features.forEach((f) => {
      doc.setFillColor(c.color[0], c.color[1], c.color[2]);
      doc.circle(x + 9, featY - 1, 1, 'F');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(COLORS.textPrimary[0], COLORS.textPrimary[1], COLORS.textPrimary[2]);
      const lines = doc.splitTextToSize(f, gridW - 18);
      doc.text(lines, x + 12, featY);
      featY += lines.length * 3.8 + 3.2;
    });
  });

  drawFooter(5);

  // ==========================================
  // PÁGINA 6: CASO DE USO REAL SIMULADO
  // ==========================================
  doc.addPage();
  drawHeader(
    'Simulación Operativa',
    'Caso de Estudio: Rotura de Matriz de Agua y Bacheo en Vía Principal',
    'Cómo opera el ciclo completo de principio a fin, transformando un reclamo crítico en un caso de éxito documentado.'
  );

  autoTable(doc, {
    startY: 37,
    margin: { left: 16, right: 16 },
    theme: 'grid',
    head: [
      [
        'Fase',
        'Actor Responsable',
        'Acción en la Plataforma SOLINTEEC',
        'Impacto y Trazabilidad',
        'Tiempo',
      ],
    ],
    body: [
      [
        '1. Detección',
        'Ciudadano / Vecino barrial',
        'Fotografía la fuga de agua desde su teléfono móvil y envía el reporte con ubicación GPS exacta.',
        'El sistema genera el código de ticket AGU-2026-0042 y le entrega enlace de seguimiento.',
        '1 min',
      ],
      [
        '2. Ruteo',
        'Motor de Inteligencia',
        'El algoritmo clasifica urgencia ALTA y lo asigna a la Dirección de Agua Potable y Alcantarillado.',
        'Alerta automática en el panel del Director y notificación al supervisor de turno.',
        'Inmediato',
      ],
      [
        '3. Despacho',
        'Director / Inspector G-CRM',
        'Valida el caso, genera Orden de Trabajo (OT #104) y asigna a la Cuadrilla #2 de Agua.',
        'El ciudadano recibe notificación: "Tu reporte ha sido asignado a la Cuadrilla 2".',
        '15 min',
      ],
      [
        '4. Logística',
        'Bodega Técnica G-ERP',
        'La cuadrilla retira 6m de tubería PVC de 110mm y 2 uniones mediante la OT #104 digital.',
        'Bodega descuenta existencias en tiempo real e imputa el costo ($142.50) a la Parroquia.',
        '30 min',
      ],
      [
        '5. Ejecución',
        'Cuadrilla Técnica',
        'Repara la fuga, estabiliza el terreno, sella la calzada y toma la fotografía "Después".',
        'El sistema almacena la fotografía y firma digital del inspector de obra.',
        '3 horas',
      ],
      [
        '6. Cierre',
        'Alcaldía & Ciudadano',
        'El ticket pasa a estado RESUELTO. La web ciudadana muestra la comparativa Antes vs. Después.',
        'El vecino califica la atención (5★). El caso se suma al informe oficial de la Alcaldía.',
        'Total: 4h',
      ],
    ],
    headStyles: {
      fillColor: COLORS.obsidian as [number, number, number],
      textColor: COLORS.gold as [number, number, number],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'left',
    },
    bodyStyles: {
      textColor: COLORS.textPrimary as [number, number, number],
      fontSize: 8,
      cellPadding: 3.5,
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 26 },
      1: { fontStyle: 'bold', cellWidth: 42 },
      2: { cellWidth: 95 },
      3: { cellWidth: 80 },
      4: { fontStyle: 'bold', halign: 'center', cellWidth: 22 },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  const compY = 148;
  doc.setFillColor(COLORS.cardBg[0], COLORS.cardBg[1], COLORS.cardBg[2]);
  doc.setDrawColor(COLORS.gold[0], COLORS.gold[1], COLORS.gold[2]);
  doc.setLineWidth(0.6);
  doc.roundedRect(16, compY, pageWidth - 32, 44, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(COLORS.gold[0], COLORS.gold[1], COLORS.gold[2]);
  doc.text('COMPARATIVA DE RENDIMIENTO INSTITUCIONAL (Caso Rotura de Matriz)', 24, compY + 8);

  const kpis = [
    { label: 'Tiempo de Resolución', before: '15 a 21 días (oficios)', after: '4 horas (digital)', gain: '98% más veloz' },
    { label: 'Control de Materiales', before: 'Sin cruce con reclamo', after: '100% atado a la OT', gain: 'Cero fugas' },
    { label: 'Costo por Parroquia', before: 'Desconocido / Global', after: 'Detalle al centavo', gain: 'Transparente' },
    { label: 'Percepción Ciudadana', before: 'Frustración y quejas', after: 'Notificación + Foto', gain: 'Confianza y apoyo' },
  ];

  const kw = (pageWidth - 48) / 4;
  kpis.forEach((k, idx) => {
    const kx = 24 + idx * kw;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(COLORS.textPrimary[0], COLORS.textPrimary[1], COLORS.textPrimary[2]);
    doc.text(k.label, kx, compY + 17);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(185, 28, 28);
    doc.text('Antes: ' + k.before, kx, compY + 23);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(COLORS.emerald[0], COLORS.emerald[1], COLORS.emerald[2]);
    doc.text('Ahora: ' + k.after, kx, compY + 29);

    doc.setFillColor(COLORS.goldBg[0], COLORS.goldBg[1], COLORS.goldBg[2]);
    doc.roundedRect(kx, compY + 33, kw - 6, 6, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(COLORS.gold[0], COLORS.gold[1], COLORS.gold[2]);
    doc.text('Impacto: ' + k.gain, kx + 2, compY + 37.2);
  });

  drawFooter(6);

  // ==========================================
  // PÁGINA 7: HOJA DE RUTA (ROADMAP EN 4 FASES)
  // ==========================================
  doc.addPage();
  drawHeader(
    'Hoja de Ruta Estratégica',
    'Plan de Implementación Progresiva: Modernización sin Trauma Operativo',
    'Un despliegue escalonado en 4 fases que entrega resultados tangibles desde el primer día sin frenar el municipio.'
  );

  const roadmapPhases = [
    {
      phase: 'FASE 1',
      time: 'Semana 1 a 2',
      status: 'ACTIVA Y OPERATIVA HOY',
      color: COLORS.emerald,
      title: 'Sensor Ciudadano & Ruteo Departamental',
      deliverables: [
        'Plataforma Ciudadana SaaS multitenant en línea',
        'Códigos de ticket únicos secuenciales (ej. QUI-2026-0001)',
        'Ruteo automático a las 6 Direcciones Municipales',
        'Módulo de Cierre Técnico con Fotos Antes vs. Después',
        'Exportación de informes ejecutivos en Excel (.xlsx) y PDF',
      ],
    },
    {
      phase: 'FASE 2',
      time: 'Semana 3 a 6',
      status: 'SIGUIENTE PASO',
      color: COLORS.blue,
      title: 'G-CRM & Mesa de Partes Digital',
      deliverables: [
        'Ventanilla Única Digital para trámites y peticiones sin papel',
        'Bandeja unificada de expedientes y fiscalización de plazos (SLAs)',
        'Notificaciones omnicanal automáticas vía WhatsApp Bot y SMS',
        'Portal del Ciudadano con historial completo de requerimientos',
        'Integración con asambleas de presupuesto participativo',
      ],
    },
    {
      phase: 'FASE 3',
      time: 'Semana 7 a 12',
      status: 'DESPLIEGUE OPERATIVO',
      color: COLORS.purple,
      title: 'G-ERP Cuadrillas, Bodegas & Costos',
      deliverables: [
        'App móvil técnica para cuadrillas con funcionamiento offline',
        'Generación de Órdenes de Trabajo (OT) con geocerca territorial',
        'Módulo de Bodega Técnica con descarga automática por OT',
        'Costeo analítico de materiales y mano de obra por Parroquia',
        'Alertas de inventario y enlace técnico con PAC / SERCOP',
      ],
    },
    {
      phase: 'FASE 4',
      time: 'Semana 13 a 16',
      status: 'INTELIGENCIA ESTRATÉGICA',
      color: COLORS.gold,
      title: 'BI del Alcalde, Predicción IA & Transparencia',
      deliverables: [
        'Dashboard Ejecutivo para Alcaldía con KPIs en tiempo real',
        'Modelo predictivo de fallas viales e hídricas por temporada',
        'Portal Ciudadano de Datos Abiertos y Rendición de Cuentas',
        'Auditoría total inmutable para Contraloría y entes de control',
        'Certificación de Municipio Digital Inteligente y Sostenible',
      ],
    },
  ];

  const phaseW = 63;
  const phaseH = 145;

  roadmapPhases.forEach((rp, idx) => {
    const x = 16 + idx * (phaseW + 4.8);
    const y = 37;

    doc.setFillColor(COLORS.cardBg[0], COLORS.cardBg[1], COLORS.cardBg[2]);
    doc.setDrawColor(rp.color[0], rp.color[1], rp.color[2]);
    doc.setLineWidth(0.6);
    doc.roundedRect(x, y, phaseW, phaseH, 3, 3, 'FD');

    doc.setFillColor(rp.color[0], rp.color[1], rp.color[2]);
    doc.roundedRect(x, y, phaseW, 20, 3, 3, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(COLORS.white[0], COLORS.white[1], COLORS.white[2]);
    doc.text(rp.phase, x + 5, y + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text('Plazo: ' + rp.time, x + 5, y + 14);

    doc.setFillColor(COLORS.white[0], COLORS.white[1], COLORS.white[2]);
    doc.roundedRect(x + 5, y + 23, phaseW - 10, 6, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(rp.color[0], rp.color[1], rp.color[2]);
    doc.text(rp.status, x + phaseW / 2, y + 27.2, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(COLORS.textPrimary[0], COLORS.textPrimary[1], COLORS.textPrimary[2]);
    const titleLines = doc.splitTextToSize(rp.title, phaseW - 10);
    doc.text(titleLines, x + 5, y + 36);

    const lineY = y + 36 + titleLines.length * 4.5;
    doc.setDrawColor(COLORS.border[0], COLORS.border[1], COLORS.border[2]);
    doc.setLineWidth(0.3);
    doc.line(x + 5, lineY, x + phaseW - 5, lineY);

    let delivY = lineY + 6;
    rp.deliverables.forEach((d) => {
      doc.setFillColor(rp.color[0], rp.color[1], rp.color[2]);
      doc.circle(x + 7, delivY - 1, 1, 'F');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.2);
      doc.setTextColor(COLORS.textSecondary[0], COLORS.textSecondary[1], COLORS.textSecondary[2]);
      const lines = doc.splitTextToSize(d, phaseW - 14);
      doc.text(lines, x + 10, delivY);
      delivY += lines.length * 3.6 + 4.2;
    });
  });

  drawFooter(7);

  // ==========================================
  // PÁGINA 8: PROPUESTA DE VALOR Y RESPALDO
  // ==========================================
  doc.addPage();
  drawHeader(
    'Propuesta de Valor & Respaldo',
    'Soberanía Tecnológica y Alianza Estratégica con SOLINTEEC DEVTECH S.A.S.',
    'Por qué somos el socio tecnológico idóneo para acompañar al GAD en su transformación institucional.'
  );

  // Columna Izquierda: Retorno de Inversión y Beneficios
  doc.setFillColor(COLORS.cardBg[0], COLORS.cardBg[1], COLORS.cardBg[2]);
  doc.setDrawColor(COLORS.border[0], COLORS.border[1], COLORS.border[2]);
  doc.setLineWidth(0.6);
  doc.roundedRect(16, 37, 128, 155, 3, 3, 'FD');

  doc.setFillColor(COLORS.obsidian[0], COLORS.obsidian[1], COLORS.obsidian[2]);
  doc.roundedRect(16, 37, 128, 14, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(COLORS.gold[0], COLORS.gold[1], COLORS.gold[2]);
  doc.text('IMPACTO INSTITUCIONAL Y RETORNO DE INVERSIÓN (ROI)', 22, 46);

  const benefits = [
    {
      title: 'Transparencia Inviolable y Blindaje ante Contraloría',
      desc: 'Cada gasto, despacho de bodega y hora de cuadrilla queda atado a un código de trámite inmutable con fotos de respaldo y geolocalización.',
    },
    {
      title: 'Optimización del Gasto Corriente y Materiales',
      desc: 'Reducción de hasta un 30% en pérdidas o desvíos de materiales técnicos mediante la descarga automatizada por orden de trabajo.',
    },
    {
      title: 'Gobernanza con Datos Reales para la Alcaldía',
      desc: 'El Alcalde dispone en su despacho y en su teléfono móvil de métricas vivas de desempeño por Director, tiempos de resolución e inversión parroquial.',
    },
    {
      title: 'Respaldo Vecinal y Paz Social en Territorio',
      desc: 'La ciudadanía experimenta un municipio presente, ágil y transparente, neutralizando focos de conflicto barrial antes de que se vuelvan crisis.',
    },
    {
      title: 'Soberanía de Datos e Independencia Tecnológica',
      desc: 'Toda la información reside en bases de datos relacionales seguras (MariaDB/MySQL), con backups automáticos y propiedad exclusiva del GAD.',
    },
  ];

  let bY = 59;
  benefits.forEach((b, idx) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(COLORS.textPrimary[0], COLORS.textPrimary[1], COLORS.textPrimary[2]);
    doc.text(`${idx + 1}. ${b.title}`, 22, bY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.2);
    doc.setTextColor(COLORS.textSecondary[0], COLORS.textSecondary[1], COLORS.textSecondary[2]);
    const lines = doc.splitTextToSize(b.desc, 116);
    doc.text(lines, 22, bY + 4.2);
    bY += 21;
  });

  // Columna Derecha: Tarjeta Corporativa SOLINTEEC DEVTECH S.A.S.
  doc.setFillColor(COLORS.obsidian[0], COLORS.obsidian[1], COLORS.obsidian[2]);
  doc.roundedRect(153, 37, 128, 155, 3, 3, 'F');

  // Logo blanco de alto contraste en tarjeta corporativa
  try {
    doc.addImage(logoWhiteB64, 'PNG', 188, 45, 58, 48);
  } catch (e) {
    console.warn('Error logo corporate card:', e);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(COLORS.white[0], COLORS.white[1], COLORS.white[2]);
  doc.text('SOLINTEEC DEVTECH S.A.S.', 217, 104, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(COLORS.gold[0], COLORS.gold[1], COLORS.gold[2]);
  doc.text('INGENIERÍA DE SOFTWARE & TRANSFORMACIÓN DIGITAL', 217, 111, { align: 'center' });

  doc.setDrawColor(COLORS.slate[0], COLORS.slate[1], COLORS.slate[2]);
  doc.setLineWidth(0.5);
  doc.line(165, 117, 269, 117);

  const corpDetails = [
    { label: 'Especialidad', value: 'Plataformas SaaS Gubernamentales, ERP, CRM & Cloud' },
    { label: 'Soporte y Operación', value: 'Acompañamiento presencial y soporte técnico 24/7' },
    { label: 'Infraestructura', value: 'Servidores de alta disponibilidad, copias de seguridad continuas' },
    { label: 'Sitio Oficial', value: 'https://solinteec.com • https://plataforma.solinteec.com' },
    { label: 'Contacto Directo', value: 'contacto@solinteec.com • Área de Soluciones de Gobierno' },
  ];

  let cdY = 125;
  corpDetails.forEach((cd) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.8);
    doc.setTextColor(COLORS.gold[0], COLORS.gold[1], COLORS.gold[2]);
    doc.text(cd.label.toUpperCase() + ':', 165, cdY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.2);
    doc.setTextColor(COLORS.white[0], COLORS.white[1], COLORS.white[2]);
    const lines = doc.splitTextToSize(cd.value, 104);
    doc.text(lines, 165, cdY + 4.2);
    cdY += lines.length * 4 + 5.5;
  });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text('© 2026 SOLINTEEC DEVTECH S.A.S. • TODOS LOS DERECHOS RESERVADOS', 217, 185, { align: 'center' });

  drawFooter(8);

  return doc;
}

// Ejecución directa para generar y guardar el archivo PDF
const outputPath = path.join(process.cwd(), 'public/downloads/SOLINTEEC_Propuesta_G-CRM_G-ERP_Municipal.pdf');
const docsPath = path.join(process.cwd(), 'docs/SOLINTEEC_Propuesta_G-CRM_G-ERP_Municipal.pdf');

console.log('Generando documento ejecutivo PDF pulido...');
const pdfDoc = createEnterprisePresentation();
const pdfBuffer = Buffer.from(pdfDoc.output('arraybuffer'));

fs.writeFileSync(outputPath, pdfBuffer);
fs.writeFileSync(docsPath, pdfBuffer);

console.log(`✅ PDF generado exitosamente:`);
console.log(`- ${outputPath} (${(pdfBuffer.length / 1024).toFixed(1)} KB)`);
console.log(`- ${docsPath} (${(pdfBuffer.length / 1024).toFixed(1)} KB)`);

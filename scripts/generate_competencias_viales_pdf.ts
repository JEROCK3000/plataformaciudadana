import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as fs from 'fs';
import * as path from 'path';

// Cargar logos oficiales de SOLINTEEC DEVTECH S.A.S.
const logoWhitePath = path.join(process.cwd(), 'docs/assets/solinteec/solinteec-logo-white.png');
const logoColorPath = path.join(process.cwd(), 'docs/assets/solinteec/solinteec-logo-color.png');

const logoWhiteBase64 = fs.existsSync(logoWhitePath) 
  ? `data:image/png;base64,${fs.readFileSync(logoWhitePath).toString('base64')}`
  : null;
const logoColorBase64 = fs.existsSync(logoColorPath) 
  ? `data:image/png;base64,${fs.readFileSync(logoColorPath).toString('base64')}`
  : null;

// Paleta Corporativa SOLINTEEC DEVTECH
const colors: Record<string, [number, number, number]> = {
  navy: [11, 19, 43],           // #0B132B Azul Noche Institucional
  slate: [28, 37, 65],          // #1C2541 Azul Pizarra
  techBlue: [58, 80, 107],      // #3A506B Azul Técnico
  gold: [197, 155, 39],         // #C59B27 Oro Solinteec
  goldLight: [245, 158, 11],    // #F59E0B Ámbar Dorado
  emerald: [5, 150, 105],       // #059669 Verde Éxito
  rose: [225, 29, 72],          // #E11D48 Rosa Alerta
  redDark: [159, 18, 57],       // #9F1239 Rojo Contraloría
  cardBg: [248, 250, 252],      // #F8FAFC Fondo Tarjeta
  cardBorder: [226, 232, 240],  // #E2E8F0 Borde Suave
  textDark: [15, 23, 42],       // #0F172A Texto Principal
  textMuted: [71, 85, 105],     // #475569 Texto Secundario
  white: [255, 255, 255]
};

const doc = new jsPDF({
  orientation: 'landscape',
  unit: 'mm',
  format: 'a4'
});

const pageWidth = doc.internal.pageSize.getWidth();   // 297 mm
const pageHeight = doc.internal.pageSize.getHeight(); // 210 mm

// Encabezado estándar de diapositivas
function renderSlideHeader(
  title: string, 
  category: string = 'DICTAMEN TÉCNICO-JURÍDICO & PROTOCOLO OPERATIVO MUNICIPAL'
) {
  doc.setFillColor(colors.navy[0], colors.navy[1], colors.navy[2]);
  doc.rect(0, 0, pageWidth, 24, 'F');

  doc.setFillColor(colors.gold[0], colors.gold[1], colors.gold[2]);
  doc.rect(0, 24, pageWidth, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(colors.gold[0], colors.gold[1], colors.gold[2]);
  doc.text(category.toUpperCase(), 16, 10);

  doc.setFontSize(13);
  doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.text(title, 16, 18);

  if (logoWhiteBase64) {
    doc.addImage(logoWhiteBase64, 'PNG', pageWidth - 46, 5, 32, 14);
  }

  doc.setFillColor(colors.cardBorder[0], colors.cardBorder[1], colors.cardBorder[2]);
  doc.rect(16, pageHeight - 12, pageWidth - 32, 0.4, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
  doc.text('SOLINTEEC DEVTECH S.A.S. • Área de Desarrollo Corporativo y de Gobierno', 16, pageHeight - 6);
  doc.text('Dictamen de Competencias Viales (COOTAD) & Blindaje ante Contraloría (CGE)', pageWidth - 16, pageHeight - 6, { align: 'right' });
}

// ==========================================
// SLIDE 1: PORTADA EJECUTIVA ENTERPRISE
// ==========================================
doc.setFillColor(colors.navy[0], colors.navy[1], colors.navy[2]);
doc.rect(0, 0, pageWidth, pageHeight, 'F');

// Patrón de acento lateral y base
doc.setFillColor(colors.gold[0], colors.gold[1], colors.gold[2]);
doc.rect(0, 0, 10, pageHeight, 'F');
doc.rect(pageWidth - 10, 0, 10, pageHeight, 'F');
doc.rect(10, pageHeight - 6, pageWidth - 20, 6, 'F');

if (logoWhiteBase64) {
  doc.addImage(logoWhiteBase64, 'PNG', 28, 22, 60, 26);
}

// Badge superior
doc.setFillColor(colors.slate[0], colors.slate[1], colors.slate[2]);
doc.roundedRect(28, 58, 145, 8, 2, 2, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(8);
doc.setTextColor(colors.goldLight[0], colors.goldLight[1], colors.goldLight[2]);
doc.text('GESTIÓN PÚBLICA & FISCALIZACIÓN • MARCO COOTAD, CNC Y CGE', 32, 63.5);

// Título Principal
doc.setFont('helvetica', 'bold');
doc.setFontSize(22);
doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
doc.text('GESTIÓN DE COMPETENCIAS VIALES &', 28, 78);
doc.text('BLINDAJE LEGAL ANTE CONTRALORÍA', 28, 88);

// Subtítulo
doc.setFontSize(11);
doc.setTextColor(colors.gold[0], colors.gold[1], colors.gold[2]);
doc.text('Delimitación Competencial (MTOP - Prefecturas - Municipios), Geocercas Inteligentes,', 28, 99);
doc.text('Mitigación de Glosas a Fiscalizadores y Protocolo de Derivación Formal (Art. 55 COOTAD)', 28, 105);

// Tarjeta con 3 Pilares
doc.setFillColor(colors.slate[0], colors.slate[1], colors.slate[2]);
doc.roundedRect(28, 115, pageWidth - 56, 44, 3, 3, 'F');

const pillars = [
  {
    title: '1. El Límite de la Competencia (COOTAD)',
    desc: 'Diferenciación legal de la Red Vial Estatal (MTOP), Provincial (Prefectura) y Urbana Municipal para evitar la arrogación de funciones.'
  },
  {
    title: '2. Geocercas GIS de Detección Temprana',
    desc: 'Identificación geoespacial automática cuando el ciudadano reporta una vía estatal o provincial, emitiendo alertas preventivas.'
  },
  {
    title: '3. Derivación Formal & Blindaje a Fiscalizadores',
    desc: 'Botón de derivación en 1 clic, respuesta jurídica motivada al ciudadano y oficio automático de traslado institucional.'
  }
];

const colWidth = (pageWidth - 72) / 3;
pillars.forEach((p, idx) => {
  const colX = 34 + idx * (colWidth + 5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(colors.gold[0], colors.gold[1], colors.gold[2]);
  doc.text(p.title, colX, 125);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
  const splitText = doc.splitTextToSize(p.desc, colWidth - 4);
  doc.text(splitText, colX, 132);
});

// Pie de portada
doc.setFont('helvetica', 'bold');
doc.setFontSize(9.5);
doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
doc.text('SOLINTEEC DEVTECH S.A.S. • Área de Desarrollo Corporativo y de Gobierno', 28, 178);

doc.setFont('helvetica', 'normal');
doc.setFontSize(8.5);
doc.setTextColor(colors.gold[0], colors.gold[1], colors.gold[2]);
doc.text('Contacto: projects@solinteec.com • pquishpe@solinteec.com • https://solinteec.com', 28, 184);

// ==========================================
// SLIDE 2: EL DILEMA DEL FISCALIZADOR & RIESGO DE GLOSAS
// ==========================================
doc.addPage();
renderSlideHeader('El Dilema Operativo del Fiscalizador y el Riesgo de Glosas de Contraloría');

// Columna Izquierda: La Realidad de la Gestión Pública
doc.setFillColor(254, 242, 242);
doc.roundedRect(16, 32, 128, 158, 3, 3, 'F');
doc.setDrawColor(239, 68, 68);
doc.setLineWidth(0.8);
doc.roundedRect(16, 32, 128, 158, 3, 3, 'D');

// Cabecera Columna Izquierda
doc.setFillColor(220, 38, 38);
doc.roundedRect(16, 32, 128, 11, 3, 3, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(9);
doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
doc.text('[RIESGO CRÍTICO] La Trampa de las Vías Ajenas ante Contraloría (CGE)', 20, 39.5);

const riskPoints = [
  {
    title: '1. Asimetría de Conocimiento Ciudadano:',
    desc: 'El ciudadano no conoce el COOTAD. Si ve un bache en plena Troncal Amazónica (E45) o en un camino rural, le reclama y denuncia al Alcalde Municipal.'
  },
  {
    title: '2. El Peligro Penal y Civil de la "Buena Voluntad":',
    desc: 'Si el Alcalde o Director de Obras Públicas envía maquinaria municipal, asfalto o cuadrillas a una vía estatal o provincial sin convenio, Contraloría emite Glosa Solidaria por malversación de fondos públicos y arrogación de funciones.'
  },
  {
    title: '3. El Costo del Silencio Político:',
    desc: 'Si el municipio simplemente ignora o borra la queja ciudadana, el habitante asume que "el municipio no hace nada", desgastando la imagen del Alcalde y de la administración.'
  },
  {
    title: '4. La Necesidad Urgente del Fiscalizador:',
    desc: 'El equipo técnico requiere una herramienta digital que demuestre que el Municipio respondió formalmente, delimitó su competencia y trasladó la queja a la autoridad competente.'
  }
];

let rY = 48;
riskPoints.forEach((p) => {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(colors.redDark[0], colors.redDark[1], colors.redDark[2]);
  doc.text(p.title, 20, rY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
  const splitText = doc.splitTextToSize(p.desc, 120);
  doc.text(splitText, 20, rY + 4.5);
  rY += 28;
});

// Columna Derecha: Matriz Oficial de Competencias Viales (Ecuador)
doc.setFillColor(colors.cardBg[0], colors.cardBg[1], colors.cardBg[2]);
doc.roundedRect(150, 32, 131, 158, 3, 3, 'F');
doc.setDrawColor(colors.cardBorder[0], colors.cardBorder[1], colors.cardBorder[2]);
doc.setLineWidth(0.6);
doc.roundedRect(150, 32, 131, 158, 3, 3, 'D');

// Cabecera Columna Derecha
doc.setFillColor(colors.slate[0], colors.slate[1], colors.slate[2]);
doc.roundedRect(150, 32, 131, 11, 3, 3, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(9);
doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
doc.text('MARCO LEGAL: Matriz de Competencias Viales (COOTAD y CNC)', 154, 39.5);

autoTable(doc, {
  startY: 47,
  margin: { left: 153 },
  tableWidth: 125,
  styles: {
    font: 'helvetica',
    fontSize: 7.5,
    cellPadding: 2.2,
    textColor: colors.textDark,
  },
  headStyles: {
    fillColor: colors.navy,
    textColor: colors.white,
    fontStyle: 'bold',
    fontSize: 7.8,
  },
  alternateRowStyles: {
    fillColor: [241, 245, 249],
  },
  head: [['Nivel Vial', 'Entidad Competente', 'Sustento Legal', 'Intervención GAD']],
  body: [
    [
      'Red Vial Estatal (RVE)\n(Troncales, ej. E45)',
      'MTOP\n(Gobierno Central)',
      'Ley Sistema Nal. Infraestructura Vial',
      'PROHIBIDO gasto directo.\nRequiere Convenio Específico.'
    ],
    [
      'Red Vial Provincial\n(Vías rurales e interparroquiales)',
      'GAD Provincial\n(Prefectura de Napo)',
      'COOTAD Art. 42 (Competencia exclusiva)',
      'NO intervenir sin Convenio\nde Concurrencia (Art. 275).'
    ],
    [
      'Red Vial Urbana / Cantonal\n(Calles urbanas y cabeceras)',
      'GAD Municipal\n(Municipio de Quijos)',
      'COOTAD Arts. 54 y 55 (Planificar y mantener)',
      'COMPETENCIA DIRECTA.\nPlanificación y Obras Públicas.'
    ],
    [
      'Caminos Vecinales\n(Sectores rurales internos)',
      'GAD Parroquial\n(En concurrencia)',
      'COOTAD Art. 65\n(Coordinación provincial)',
      'Concurrente mediante mingas\no convenios parroquiales.'
    ]
  ]
});

// Mensaje de blindaje en pie de columna derecha
doc.setFillColor(254, 243, 199);
doc.roundedRect(153, 155, 125, 30, 2, 2, 'F');
doc.setDrawColor(217, 119, 6);
doc.roundedRect(153, 155, 125, 30, 2, 2, 'D');

doc.setFont('helvetica', 'bold');
doc.setFontSize(8);
doc.setTextColor(146, 64, 14);
doc.text('PRINCIPIO JURÍDICO CLAVE PARA EL FISCALIZADOR:', 156, 161);

doc.setFont('helvetica', 'normal');
doc.setFontSize(7.5);
doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
const alertLegal = doc.splitTextToSize(
  'El Artículo 260 de la Constitución y el Art. 55 del COOTAD prohíben expresamente el ejercicio de competencias ajenas sin delegación formal. Todo gasto municipal en vía no cantonal debe estar debidamente respaldado por Convenio de Concurrencia (Art. 275) bajo pena de glosa de la CGE.',
  119
);
doc.text(alertLegal, 156, 166);

// ==========================================
// SLIDE 3: ARQUITECTURA TÉCNICA - GEOFENCING Y FILTRO TEMPRANO
// ==========================================
doc.addPage();
renderSlideHeader('Arquitectura Técnica: Geocercas Inteligentes y Detección Temprana');

// Diagrama de 3 Capas de Protección
const layerCards = [
  {
    step: 'CAPA 1: DETECCIÓN GIS',
    title: 'Geocercas de Ejes Viales (Buffer GIS)',
    color: colors.techBlue,
    desc: 'La plataforma integra capas espaciales oficiales (capa de polígono urbano PUGS, capa de la Troncal Amazónica E45 MTOP y capa de vías secundarias provinciales). Al colocar el pin o escribir la dirección, el sistema calcula de forma instantánea el polígono de jurisdicción.'
  },
  {
    step: 'CAPA 2: ALERTA PREVENTIVA',
    title: 'Aviso Transparente al Ciudadano',
    color: colors.gold,
    desc: 'Si el reporte cae sobre la E45 o un eje provincial, el formulario no se bloquea pero emite una alerta pedagógica: "Aviso: Esta vía corresponde a la Red Estatal del MTOP / Provincial. Tu reporte será formalmente derivado a la autoridad competente".'
  },
  {
    step: 'CAPA 3: CLASIFICACIÓN',
    title: 'Etiquetado en Panel de Obras Públicas',
    color: colors.emerald,
    desc: 'En el panel del fiscalizador, el ticket no se mezcla con el bacheo municipal estándar. Entra pre-etiquetado con un badge de advertencia: [FUERA DE COMPETENCIA MUNICIPAL: MTOP / PREFECTURA] para su trámite de derivación inmediata.'
  }
];

layerCards.forEach((card, idx) => {
  const cX = 16 + idx * 89;
  doc.setFillColor(colors.cardBg[0], colors.cardBg[1], colors.cardBg[2]);
  doc.roundedRect(cX, 32, 85, 78, 3, 3, 'F');
  doc.setDrawColor(colors.cardBorder[0], colors.cardBorder[1], colors.cardBorder[2]);
  doc.roundedRect(cX, 32, 85, 78, 3, 3, 'D');

  doc.setFillColor(card.color[0], card.color[1], card.color[2]);
  doc.roundedRect(cX, 32, 85, 9, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.text(card.step, cX + 4, 38);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(colors.navy[0], colors.navy[1], colors.navy[2]);
  const splitTitle = doc.splitTextToSize(card.title, 78);
  doc.text(splitTitle, cX + 4, 48);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
  const splitDesc = doc.splitTextToSize(card.desc, 77);
  doc.text(splitDesc, cX + 4, 58);
});

// Sección Inferior: Flujograma del Ciclo del Reporte
doc.setFillColor(colors.slate[0], colors.slate[1], colors.slate[2]);
doc.roundedRect(16, 116, pageWidth - 32, 74, 3, 3, 'F');

doc.setFont('helvetica', 'bold');
doc.setFontSize(10);
doc.setTextColor(colors.gold[0], colors.gold[1], colors.gold[2]);
doc.text('FLUJOGRAMA OPERATIVO DE BLINDAJE JURÍDICO & ATENCIÓN CIUDADANA', 22, 124);

// 4 Bloques del Flujograma
const flowSteps = [
  {
    num: '1',
    title: 'Ingreso & Georreferencia',
    desc: 'Ciudadano marca el punto en el mapa (ej. Barrio San Francisco o E45).'
  },
  {
    num: '2',
    title: 'Validación de Competencia',
    desc: 'Motor GIS evalúa si es calle urbana municipal o eje estatal/provincial.'
  },
  {
    num: '3',
    title: 'Despacho del Fiscalizador',
    desc: 'Si es municipal: asigna cuadrilla. Si es externa: activa Derivación Art. 55.'
  },
  {
    num: '4',
    title: 'Notificación & Auditoría',
    desc: 'Ciudadano recibe respuesta motivada y se genera oficio formal a MTOP/Prefectura.'
  }
];

flowSteps.forEach((s, idx) => {
  const fX = 22 + idx * 64;
  doc.setFillColor(colors.navy[0], colors.navy[1], colors.navy[2]);
  doc.roundedRect(fX, 130, 58, 52, 2, 2, 'F');
  doc.setDrawColor(colors.gold[0], colors.gold[1], colors.gold[2]);
  doc.roundedRect(fX, 130, 58, 52, 2, 2, 'D');

  // Círculo con número
  doc.setFillColor(colors.gold[0], colors.gold[1], colors.gold[2]);
  doc.circle(fX + 8, 139, 5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(colors.navy[0], colors.navy[1], colors.navy[2]);
  doc.text(s.num, fX + 6.8, 142);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
  const splitFlowTitle = doc.splitTextToSize(s.title, 42);
  doc.text(splitFlowTitle, fX + 16, 139);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(colors.cardBorder[0], colors.cardBorder[1], colors.cardBorder[2]);
  const splitFlowDesc = doc.splitTextToSize(s.desc, 52);
  doc.text(splitFlowDesc, fX + 4, 153);
});

// ==========================================
// SLIDE 4: PROTOCOLO DE DESPACHO & RESPUESTA AUTOMATIZADA
// ==========================================
doc.addPage();
renderSlideHeader('Protocolo de Despacho, Derivación en 1 Clic y Respuestas Legales Oficiales');

// Columna Izquierda: Botón de Derivación y Convenios
doc.setFillColor(colors.cardBg[0], colors.cardBg[1], colors.cardBg[2]);
doc.roundedRect(16, 32, 128, 158, 3, 3, 'F');
doc.setDrawColor(colors.cardBorder[0], colors.cardBorder[1], colors.cardBorder[2]);
doc.roundedRect(16, 32, 128, 158, 3, 3, 'D');

doc.setFillColor(colors.navy[0], colors.navy[1], colors.navy[2]);
doc.roundedRect(16, 32, 128, 11, 3, 3, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(9);
doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
doc.text('HERRAMIENTAS DEL PANEL ADMINISTRATIVO', 20, 39.5);

const adminFeatures = [
  {
    title: 'Acción 1: Botón "Derivar por Competencia Externa"',
    desc: 'Con un solo clic desde la ficha del ticket, el fiscalizador o técnico selecciona la entidad rectora: [MTOP] (Red Vial Estatal), [Prefectura de Napo] (Red Provincial) o [Empresa Eléctrica / CNT]. El ticket queda automáticamente cerrado para el Municipio.'
  },
  {
    title: 'Acción 2: Generador Automático de Oficio de Traslado',
    desc: 'El sistema redacta en formato PDF oficial el oficio dirigido al Director Provincial del MTOP o al Prefecto Provincial, adjuntando la coordenada GPS exacta, fotografías del bache/deslave y la fecha del reporte ciudadano.'
  },
  {
    title: 'Acción 3: Excepción por Convenio de Concurrencia (Art. 275)',
    desc: 'Si el Municipio cuenta con un convenio vigente para intervenir un tramo estatal o provincial, el técnico marca: [✓ Atender bajo Convenio N.° XXXX]. Esto habilita legalmente el uso de combustible y horas-máquina municipal con pleno respaldo auditado.'
  }
];

let aY = 48;
adminFeatures.forEach((feat) => {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(colors.techBlue[0], colors.techBlue[1], colors.techBlue[2]);
  doc.text(feat.title, 20, aY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
  const splitFeat = doc.splitTextToSize(feat.desc, 120);
  doc.text(splitFeat, 20, aY + 4.5);
  aY += 36;
});

// Columna Derecha: Modelo de Plantilla Legal Oficial al Ciudadano
doc.setFillColor(colors.cardBg[0], colors.cardBg[1], colors.cardBg[2]);
doc.roundedRect(150, 32, 131, 158, 3, 3, 'F');
doc.setDrawColor(colors.cardBorder[0], colors.cardBorder[1], colors.cardBorder[2]);
doc.roundedRect(150, 32, 131, 158, 3, 3, 'D');

doc.setFillColor(colors.emerald[0], colors.emerald[1], colors.emerald[2]);
doc.roundedRect(150, 32, 131, 11, 3, 3, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(9);
doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
doc.text('PLANTILLA AUTOMATIZADA DE RESPUESTA MOTIVADA', 154, 39.5);

// Simulación de correo / comprobante institucional
doc.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
doc.roundedRect(154, 47, 123, 138, 2, 2, 'F');
doc.setDrawColor(colors.cardBorder[0], colors.cardBorder[1], colors.cardBorder[2]);
doc.roundedRect(154, 47, 123, 138, 2, 2, 'D');

doc.setFont('helvetica', 'bold');
doc.setFontSize(8.5);
doc.setTextColor(colors.navy[0], colors.navy[1], colors.navy[2]);
doc.text('GOBIERNO AUTÓNOMO DESCENTRALIZADO MUNICIPAL DE QUIJOS', 158, 54);
doc.setFontSize(7.5);
doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
doc.text('Notificación Oficial • Ticket: QUI-2026-0042 • Fecha: 08/Sept/2026', 158, 59);

doc.setFillColor(colors.cardBorder[0], colors.cardBorder[1], colors.cardBorder[2]);
doc.rect(158, 62, 115, 0.4, 'F');

doc.setFont('helvetica', 'bold');
doc.setFontSize(8);
doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
doc.text('Estimado(a) Ciudadano(a):', 158, 68);

doc.setFont('helvetica', 'normal');
doc.setFontSize(7.5);
doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
const legalResponse = doc.splitTextToSize(
  'Agradecemos su participación cívica al reportar la incidencia vial en el tramo [Ubicación / Vía E45].\n\n' +
  'Al respecto, en cumplimiento estricto de los Artículos 54 y 55 del Código Orgánico de Organización Territorial, Autonomía y Descentralización (COOTAD) y el Art. 130 del Sistema Nacional de Competencias, le informamos que el tramo vial indicado corresponde a la RED VIAL ESTATAL (administrada por el Ministerio de Transporte y Obras Públicas - MTOP) / RED PROVINCIAL (Prefectura de Napo).\n\n' +
  'En apego al principio de coordinación institucional, el GAD Municipal de Quijos ha emitido el OFICIO DE TRASLADO N.° GADMQ-OP-2026-0042 dirigido a la entidad rectora para su atención.\n\n' +
  'Estado del trámite: DERIVADO A ENTIDAD COMPETENTE (MTOP).\n' +
  'Este documento sirve de constancia de recepción y gestión municipal.',
  115
);
doc.text(legalResponse, 158, 74);

// Sello digital de blindaje
doc.setFillColor(240, 253, 244);
doc.roundedRect(158, 146, 115, 24, 2, 2, 'F');
doc.setDrawColor(34, 197, 94);
doc.roundedRect(158, 146, 115, 24, 2, 2, 'D');

doc.setFont('helvetica', 'bold');
doc.setFontSize(7.5);
doc.setTextColor(21, 128, 61);
doc.text('[CERTIFICADO] BLINDAJE AUDITABLE ANTE CONTRALORÍA (CGE)', 161, 152);

doc.setFont('helvetica', 'normal');
doc.setFontSize(7);
doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
doc.text('El GAD Municipal demuestra debida diligencia, tutela administrativa efectiva y', 161, 157);
doc.text('cero desvio de fondos publicos. Todo el registro queda almacenado en log forense.', 161, 162);

// ==========================================
// SLIDE 5: BENEFICIOS POR ACTOR & PRÓXIMOS PASOS
// ==========================================
doc.addPage();
renderSlideHeader('Valor Estratégico para la Administración Municipal y Próximos Pasos');

// 3 Tarjetas de Valor por Actor con Badges Ejecutivos
const actorCards = [
  {
    role: 'PARA EL ALCALDE',
    highlight: 'Liderazgo & Cero Desgaste',
    badge: '100% GESTIÓN TRASLADADA',
    color: colors.gold,
    desc: '• Demuestra gestión proactiva: no se lava las manos, traslada formalmente la queja al MTOP o Prefectura.\n• Protege su capital político y fortalece su postura de fiscalización ante el Gobierno Central y Provincial.\n• Evita el reclamo de vecinos de que el Municipio "no responde".\n• Genera indicadores públicos de gestión interinstitucional.'
  },
  {
    role: 'PARA EL FISCALIZADOR Y TÉCNICOS',
    highlight: 'Tranquilidad Jurídica & Cero Glosas',
    badge: '0% RIESGO DE GLOSA CGE',
    color: colors.techBlue,
    desc: '• Seguridad jurídica ante exámenes especiales de la Contraloría General del Estado (CGE).\n• Cada hora de motoniveladora y combustible queda respaldada exclusivamente en vías cantonales autorizadas.\n• Trazabilidad total mediante bitácora digital inalterable.\n• Respaldo normativo estricto bajo Arts. 54, 55 y 275 COOTAD.'
  },
  {
    role: 'PARA EL CIUDADANO',
    highlight: 'Respuesta Rápida y Transparente',
    badge: '< 2 MINUTOS DE RESPUESTA',
    color: colors.emerald,
    desc: '• En menos de 2 minutos sabe con certeza a quién le compete arreglar su vía.\n• Recibe el número de oficio con el que el Municipio exigió la intervención al MTOP o Prefectura.\n• Fomenta una cultura cívica informada y reduce el conflicto vecinal.\n• Acompañamiento municipal real hasta la resolución.'
  }
];

actorCards.forEach((act, idx) => {
  const aX = 16 + idx * 89;
  doc.setFillColor(colors.cardBg[0], colors.cardBg[1], colors.cardBg[2]);
  doc.roundedRect(aX, 32, 85, 96, 3, 3, 'F');
  doc.setDrawColor(colors.cardBorder[0], colors.cardBorder[1], colors.cardBorder[2]);
  doc.roundedRect(aX, 32, 85, 96, 3, 3, 'D');

  doc.setFillColor(act.color[0], act.color[1], act.color[2]);
  doc.roundedRect(aX, 32, 85, 11, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.text(act.role, aX + 4, 39.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(colors.navy[0], colors.navy[1], colors.navy[2]);
  doc.text(act.highlight, aX + 4, 50);

  // Badge métrico inferior
  doc.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.roundedRect(aX + 4, 53, 77, 6, 1.5, 1.5, 'F');
  doc.setDrawColor(act.color[0], act.color[1], act.color[2]);
  doc.roundedRect(aX + 4, 53, 77, 6, 1.5, 1.5, 'D');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(act.color[0], act.color[1], act.color[2]);
  doc.text(act.badge, aX + 6, 57.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.8);
  doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
  const splitActDesc = doc.splitTextToSize(act.desc, 77);
  doc.text(splitActDesc, aX + 4, 65);
});

// Sección de Hoja de Ruta de Implementación
doc.setFillColor(colors.navy[0], colors.navy[1], colors.navy[2]);
doc.roundedRect(16, 134, pageWidth - 32, 56, 3, 3, 'F');

doc.setFont('helvetica', 'bold');
doc.setFontSize(10.5);
doc.setTextColor(colors.gold[0], colors.gold[1], colors.gold[2]);
doc.text('HOJA DE RUTA: IMPLEMENTACIÓN DEL MÓDULO DE COMPETENCIAS VIALES', 24, 143);

const steps = [
  '1. Carga de Capas GIS: Digitalización de la franja de derecho de vía de la E45 (MTOP) y polígonos urbanos cantonales.',
  '2. Activación de Alertas Preventivas en el Formulario Ciudadano y estado DERIVADO_COMPETENCIA en el panel admin.',
  '3. Parametrización de Oficios Tipo para remisión automática a MTOP Napo y Dirección de Vialidad Provincial.'
];

steps.forEach((st, idx) => {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.text(st, 24, 152 + idx * 7.5);
});

// Firma institucional
doc.setFont('helvetica', 'bold');
doc.setFontSize(9);
doc.setTextColor(colors.gold[0], colors.gold[1], colors.gold[2]);
doc.text('SOLINTEEC DEVTECH S.A.S. — Tecnología y Marco Jurídico para Gobiernos Inteligentes', 24, 180);
doc.setFont('helvetica', 'normal');
doc.setFontSize(8);
doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
doc.text('Desarrollado para el GAD Municipal de Quijos • Contacto Directo: projects@solinteec.com • pquishpe@solinteec.com', 24, 185);

// Guardar archivo PDF
const outputDocsPath = path.join(process.cwd(), 'docs/SOLINTEEC_Gestion_Competencias_Viales_Blindaje_CGE.pdf');
const outputPublicDir = path.join(process.cwd(), 'public/downloads');
if (!fs.existsSync(outputPublicDir)) {
  fs.mkdirSync(outputPublicDir, { recursive: true });
}
const outputPublicPath = path.join(outputPublicDir, 'SOLINTEEC_Gestion_Competencias_Viales_Blindaje_CGE.pdf');

const pdfBytes = doc.output('arraybuffer');
fs.writeFileSync(outputDocsPath, Buffer.from(pdfBytes));
fs.writeFileSync(outputPublicPath, Buffer.from(pdfBytes));

console.log(`✅ PDF generado exitosamente:`);
console.log(`- ${outputDocsPath} (${(fs.statSync(outputDocsPath).size / 1024).toFixed(1)} KB)`);
console.log(`- ${outputPublicPath} (${(fs.statSync(outputPublicPath).size / 1024).toFixed(1)} KB)`);

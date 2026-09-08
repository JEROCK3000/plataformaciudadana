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

// Relación de aspecto real del logo (1024 x 849 píxeles -> ratio = 1.2061)
const LOGO_ASPECT_RATIO = 1024 / 849;

// Paleta Corporativa SOLINTEEC DEVTECH
const colors: Record<string, [number, number, number]> = {
  navy: [11, 19, 43],           // #0B132B Azul Noche Institucional
  slate: [28, 37, 65],          // #1C2541 Azul Pizarra
  techBlue: [58, 80, 107],      // #3A506B Azul Técnico
  gold: [197, 155, 39],         // #C59B27 Oro Solinteec
  goldLight: [245, 158, 11],    // #F59E0B Ámbar Dorado
  emerald: [5, 150, 105],       // #059669 Verde Éxito
  rose: [225, 29, 72],          // #E11D48 Rosa Alerta
  redDark: [159, 18, 57],       // #9F1239 Rojo Alerta CGE
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

// Encabezado estándar de diapositivas con logo sin distorsión
function renderSlideHeader(
  title: string, 
  category: string = 'DICTAMEN TÉCNICO-JURÍDICO & ESTRUCTURA ORGÁNICA MUNICIPAL'
) {
  doc.setFillColor(colors.navy[0], colors.navy[1], colors.navy[2]);
  doc.rect(0, 0, pageWidth, 24, 'F');

  doc.setFillColor(colors.gold[0], colors.gold[1], colors.gold[2]);
  doc.rect(0, 24, pageWidth, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(colors.gold[0], colors.gold[1], colors.gold[2]);
  doc.text(category.toUpperCase(), 16, 10);

  doc.setFontSize(12.5);
  doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.text(title, 16, 18);

  // Logo Solinteec con dimensiones estrictamente proporcionales (alto 13mm -> ancho = 13 * 1.206 = 15.68mm)
  if (logoWhiteBase64) {
    const h = 13;
    const w = h * LOGO_ASPECT_RATIO;
    doc.addImage(logoWhiteBase64, 'PNG', pageWidth - 16 - w, 5.5, w, h);
  }

  // Pie de página institucional
  doc.setFillColor(colors.cardBorder[0], colors.cardBorder[1], colors.cardBorder[2]);
  doc.rect(16, pageHeight - 11, pageWidth - 32, 0.4, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
  doc.text('SOLINTEEC DEVTECH S.A.S. • Área de Desarrollo Corporativo y de Gobierno', 16, pageHeight - 5.5);
  doc.text('Marco COOTAD, CNC y Normativa de Control CGE • Caso GAD Municipal de Quijos', pageWidth - 16, pageHeight - 5.5, { align: 'right' });
}

// ====================================================================
// SLIDE 1: PORTADA CORPORATIVA ENTERPRISE (LOGO PERFECTAMENTE CIRCULAR)
// ====================================================================
doc.setFillColor(colors.navy[0], colors.navy[1], colors.navy[2]);
doc.rect(0, 0, pageWidth, pageHeight, 'F');

// Marcos laterales y base en tono oro institucional
doc.setFillColor(colors.gold[0], colors.gold[1], colors.gold[2]);
doc.rect(0, 0, 10, pageHeight, 'F');
doc.rect(pageWidth - 10, 0, 10, pageHeight, 'F');
doc.rect(10, pageHeight - 5, pageWidth - 20, 5, 'F');

// Logo oficial proporcional en portada (alto 28mm -> ancho = 28 * 1.206 = 33.77mm)
if (logoWhiteBase64) {
  const hCover = 28;
  const wCover = hCover * LOGO_ASPECT_RATIO;
  doc.addImage(logoWhiteBase64, 'PNG', 28, 20, wCover, hCover);
}

// Badge superior de marco normativo
doc.setFillColor(colors.slate[0], colors.slate[1], colors.slate[2]);
doc.roundedRect(28, 56, 175, 8, 2, 2, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(7.5);
doc.setTextColor(colors.goldLight[0], colors.goldLight[1], colors.goldLight[2]);
doc.text('DICTAMEN DE DERECHO ADMINISTRATIVO, COMPETENCIAS VIALES Y CONTROL CGE', 32, 61.5);

// Título Principal
doc.setFont('helvetica', 'bold');
doc.setFontSize(22);
doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
doc.text('DELIMITACIÓN DE COMPETENCIAS VIALES &', 28, 76);
doc.text('BLINDAJE JURÍDICO OPERATIVO MUNICIPAL', 28, 86);

// Subtítulo descriptivo
doc.setFont('helvetica', 'normal');
doc.setFontSize(10.5);
doc.setTextColor(colors.gold[0], colors.gold[1], colors.gold[2]);
doc.text('Análisis Normativo del COOTAD (Arts. 54, 55, 130 y 275), Geocercas Inteligentes,', 28, 97);
doc.text('Prevención de Glosas ante Contraloría y Protocolo de Derivación Institucional (MTOP - Prefecturas)', 28, 103);

// Tarjeta con 3 Pilares Fundamentales
doc.setFillColor(colors.slate[0], colors.slate[1], colors.slate[2]);
doc.roundedRect(28, 114, pageWidth - 56, 46, 3, 3, 'F');

const pillars = [
  {
    title: '1. Principio de Legalidad y Competencia',
    desc: 'Constitución Art. 226 y COOTAD Arts. 54/55. Las entidades públicas solo pueden intervenir en bienes de su jurisdicción. El gasto en vías no cantonales sin convenio acarrea glosa directa.'
  },
  {
    title: '2. Geocercas GIS de Detección Temprana',
    desc: 'Capa espacial que cruza el inventario vial urbano (PUGS) contra la Troncal Amazónica (E45 MTOP) y vías secundarias de la Prefectura, alertando en tiempo real al ciudadano y al operador.'
  },
  {
    title: '3. Derivación Formal & Tutela Efectiva',
    desc: 'Protocolo de remisión interinstitucional en 1 clic. Notificación motivada al ciudadano y generación de oficio de traslado oficial a la autoridad competente sin comprometer recursos cantonales.'
  }
];

const colWidthPillar = (pageWidth - 76) / 3;
pillars.forEach((p, idx) => {
  const colX = 33 + idx * (colWidthPillar + 5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(colors.gold[0], colors.gold[1], colors.gold[2]);
  doc.text(p.title, colX, 123);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.8);
  doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
  const splitPillar = doc.splitTextToSize(p.desc, colWidthPillar - 2);
  doc.text(splitPillar, colX, 129);
});

// Pie de portada institucional
doc.setFont('helvetica', 'bold');
doc.setFontSize(9);
doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
doc.text('SOLINTEEC DEVTECH S.A.S. • Dirección de Modernización y Gobierno Digital', 28, 178);

doc.setFont('helvetica', 'normal');
doc.setFontSize(8);
doc.setTextColor(colors.gold[0], colors.gold[1], colors.gold[2]);
doc.text('Documento Técnico-Jurídico para Alcaldía, Planificación, Obras Públicas y Procuraduría Síndica', 28, 184);

// ====================================================================
// SLIDE 2: EL DILEMA DE COMPETENCIAS & MARCO SANCIONATORIO DE LA CGE
// ====================================================================
doc.addPage();
renderSlideHeader('El Dilema de Competencias Viales y el Marco Sancionatorio de la CGE');

// Columna Izquierda: El Riesgo Real para Alcaldes y Directores
doc.setFillColor(254, 242, 242);
doc.roundedRect(16, 30, 126, 160, 3, 3, 'F');
doc.setDrawColor(239, 68, 68);
doc.setLineWidth(0.8);
doc.roundedRect(16, 30, 126, 160, 3, 3, 'D');

// Cabecera Columna Izquierda
doc.setFillColor(220, 38, 38);
doc.roundedRect(16, 30, 126, 10, 3, 3, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(8.5);
doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
doc.text('[RIESGO AUDITABLE] Responsabilidad Legal y Peligro de Glosa (CGE)', 20, 37);

const legalRisks = [
  {
    title: '1. Desconocimiento Ciudadano vs. Presión Social:',
    desc: 'El ciudadano común desconoce los niveles de gobierno. Si existe un derrumbe o bache en la Troncal Amazónica (E45) o en una vía rural, le exige solución inmediata al Alcalde.'
  },
  {
    title: '2. Arrogación de Funciones y Desvío de Fondos Públicos:',
    desc: 'Si la Dirección de Obras Públicas destina maquinaria municipal (motoniveladoras, rodillos), combustible o asfalto en una vía estatal (MTOP) o provincial sin convenio, Contraloría emite Glosa Solidaria civil y administrativa contra el Alcalde y el Director de Obras Públicas (Ley Orgánica de la CGE, Arts. 52 y 53).'
  },
  {
    title: '3. El Rol Técnico vs. La Fiscalización de Obras:',
    desc: 'La fiscalización formal en el Ecuador opera bajo la LOSNCP para contratos adjudicados. En el mantenimiento diario por administración directa, el control interno recae en la Jefatura de Vialidad y la Dirección de Obras Públicas, quienes no pueden autorizar trabajos en ejes ajenos.'
  },
  {
    title: '4. El Costo del Silencio Administrativo:',
    desc: 'Ignorar o borrar la queja ciudadana destruye la imagen de la administración. Se requiere una respuesta legal motivada que demuestre tutela y canalización oficial.'
  }
];

let rY = 46;
legalRisks.forEach((p) => {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(colors.redDark[0], colors.redDark[1], colors.redDark[2]);
  doc.text(p.title, 20, rY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.3);
  doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
  const splitRisk = doc.splitTextToSize(p.desc, 118);
  doc.text(splitRisk, 20, rY + 4);
  rY += 27.5;
});

// Columna Derecha: Matriz Oficial de Competencias Viales
doc.setFillColor(colors.cardBg[0], colors.cardBg[1], colors.cardBg[2]);
doc.roundedRect(148, 30, 133, 160, 3, 3, 'F');
doc.setDrawColor(colors.cardBorder[0], colors.cardBorder[1], colors.cardBorder[2]);
doc.setLineWidth(0.6);
doc.roundedRect(148, 30, 133, 160, 3, 3, 'D');

// Cabecera Columna Derecha
doc.setFillColor(colors.navy[0], colors.navy[1], colors.navy[2]);
doc.roundedRect(148, 30, 133, 10, 3, 3, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(8.5);
doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
doc.text('MARCO LEGAL VIAL EN EL ECUADOR (CNC Y COOTAD)', 152, 37);

autoTable(doc, {
  startY: 44,
  margin: { left: 151 },
  tableWidth: 127,
  styles: {
    font: 'helvetica',
    fontSize: 7.2,
    cellPadding: 2,
    textColor: colors.textDark,
  },
  headStyles: {
    fillColor: colors.slate,
    textColor: colors.white,
    fontStyle: 'bold',
    fontSize: 7.5,
  },
  alternateRowStyles: {
    fillColor: [241, 245, 249],
  },
  head: [['Nivel de Red Vial', 'Entidad Titular', 'Fundamento Jurídico', 'Régimen Municipal']],
  body: [
    [
      'Red Vial Estatal (RVE)\n(E45 Troncal Amazónica)',
      'MTOP\n(Gobierno Nacional)',
      'Ley Sistema Nal. Infraestructura Vial',
      'PROHIBIDO gasto directo.\nRequiere Delegación MTOP.'
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
      'COMPETENCIA DIRECTA.\nObras Públicas y Planificación.'
    ],
    [
      'Caminos Vecinales\n(Sectores rurales comunitarios)',
      'GAD Parroquial\n(En concurrencia)',
      'COOTAD Art. 65\n(Coordinación provincial)',
      'Intervención concurrente\nbajo acuerdo parroquial.'
    ]
  ]
});

// Caja inferior de dictamen jurídico (calculada dinámicamente según la tabla)
const finalTableY = (doc as any).lastAutoTable?.finalY ?? 136;
doc.setFillColor(254, 243, 199);
doc.roundedRect(151, finalTableY + 4, 127, 26, 2, 2, 'F');
doc.setDrawColor(217, 119, 6);
doc.roundedRect(151, finalTableY + 4, 127, 26, 2, 2, 'D');

doc.setFont('helvetica', 'bold');
doc.setFontSize(7.5);
doc.setTextColor(146, 64, 14);
doc.text('FUNDAMENTO NORMATIVO PARA EVITAR GLOSAS (CGE):', 154, finalTableY + 10);

doc.setFont('helvetica', 'normal');
doc.setFontSize(7);
doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
const alertLegal = doc.splitTextToSize(
  'El Artículo 260 de la Constitución y el Art. 55 literal c) del COOTAD delimitan la competencia vial cantonal al ámbito urbano. Cualquier salida de maquinaria u orden de compra de material pétreo/asfalto para vías no cantonales debe contar con el Convenio de Concurrencia (Art. 275) suscrito con MTOP o Prefectura, protocolizado y registrado.',
  121
);
doc.text(alertLegal, 154, finalTableY + 14.5);

// ====================================================================
// SLIDE 3: ARQUITECTURA TÉCNICA - GEOFENCING Y FILTRO TEMPRANO
// ====================================================================
doc.addPage();
renderSlideHeader('Arquitectura Técnica: Geocercas Inteligentes y Detección Temprana');

// 3 Capas de Protección Tecnológica
const layerCards = [
  {
    step: 'CAPA 1: DETECCIÓN GEOESPACIAL',
    title: 'Geocercas de Ejes Viales (Buffer GIS)',
    badge: 'MOTOR GIS AUTOMÁTICO',
    color: colors.techBlue,
    desc: 'La plataforma integra las coordenadas del Inventario Vial Oficial (PUGS cantonal, franja de derecho de vía de la Troncal E45 del MTOP y vías de la Prefectura). Al marcar el reporte en el mapa o ingresar la dirección, el sistema calcula de forma instantánea el polígono jurisdiccional.'
  },
  {
    step: 'CAPA 2: PEDAGOGÍA CIUDADANA',
    title: 'Aviso Transparente Preventivo',
    badge: 'CERO CONFLICTO VECINAL',
    color: colors.gold,
    desc: 'Si la incidencia se localiza en una vía estatal o provincial, el formulario no se bloquea pero despliega una alerta clara: "Aviso de Jurisdicción: Este tramo corresponde a la Red Estatal del MTOP / Provincial. Tu requerimiento será canalizado formalmente ante la entidad titular".'
  },
  {
    step: 'CAPA 3: GESTIÓN INTERNA',
    title: 'Clasificación en Obras Públicas',
    badge: 'FILTRO PARA DIRECTORES',
    color: colors.emerald,
    desc: 'En la consola de la Dirección de Obras Públicas y Planificación, el ticket no se mezcla con el bacheo municipal ordinario. Ingresa etiquetado automáticamente con el indicador: [ALERTA DE COMPETENCIA EXTERNA: MTOP / PREFECTURA] para su trámite de derivación inmediata.'
  }
];

layerCards.forEach((card, idx) => {
  const cX = 16 + idx * 89;
  doc.setFillColor(colors.cardBg[0], colors.cardBg[1], colors.cardBg[2]);
  doc.roundedRect(cX, 30, 85, 76, 3, 3, 'F');
  doc.setDrawColor(colors.cardBorder[0], colors.cardBorder[1], colors.cardBorder[2]);
  doc.roundedRect(cX, 30, 85, 76, 3, 3, 'D');

  doc.setFillColor(card.color[0], card.color[1], card.color[2]);
  doc.roundedRect(cX, 30, 85, 9, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.text(card.step, cX + 4, 36);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(colors.navy[0], colors.navy[1], colors.navy[2]);
  doc.text(card.title, cX + 4, 46);

  // Badge descriptivo
  doc.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.roundedRect(cX + 4, 49, 77, 5, 1.5, 1.5, 'F');
  doc.setDrawColor(card.color[0], card.color[1], card.color[2]);
  doc.roundedRect(cX + 4, 49, 77, 5, 1.5, 1.5, 'D');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(card.color[0], card.color[1], card.color[2]);
  doc.text(card.badge, cX + 6, 52.8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
  const splitDesc = doc.splitTextToSize(card.desc, 77);
  doc.text(splitDesc, cX + 4, 59);
});

// Sección Inferior: Flujograma Operativo Municipal
doc.setFillColor(colors.slate[0], colors.slate[1], colors.slate[2]);
doc.roundedRect(16, 112, pageWidth - 32, 78, 3, 3, 'F');

doc.setFont('helvetica', 'bold');
doc.setFontSize(9.5);
doc.setTextColor(colors.gold[0], colors.gold[1], colors.gold[2]);
doc.text('FLUJOGRAMA OPERATIVO DE ATENCIÓN, FILTRADO Y DERIVACIÓN INSTITUCIONAL', 22, 120);

// 4 Fases del Flujograma
const flowSteps = [
  {
    num: '1',
    title: 'Ingreso & Georreferencia',
    entity: 'Ciudadano / Ventanilla Única',
    desc: 'Se marca el incidente con fotografía y coordenada GPS (ej. Barrio San Francisco o margen E45).'
  },
  {
    num: '2',
    title: 'Determinación Espacial',
    entity: 'Motor GIS / Planificación Territorial',
    desc: 'El sistema valida si el punto interseca con la red cantonal o si pertenece a la red estatal/provincial.'
  },
  {
    num: '3',
    title: 'Despacho & Asignación',
    entity: 'Dirección de Obras Públicas',
    desc: 'Vía Cantonal: despacha cuadrilla municipal. Vía Externa: activa protocolo de derivación formal Art. 55.'
  },
  {
    num: '4',
    title: 'Notificación & Remisión',
    entity: 'Secretaría General / Alcaldía',
    desc: 'Emite respuesta legal motivada al ciudadano y genera oficio automático de traslado a MTOP/Prefectura.'
  }
];

flowSteps.forEach((s, idx) => {
  const fX = 22 + idx * 64;
  doc.setFillColor(colors.navy[0], colors.navy[1], colors.navy[2]);
  doc.roundedRect(fX, 126, 58, 58, 2, 2, 'F');
  doc.setDrawColor(colors.gold[0], colors.gold[1], colors.gold[2]);
  doc.roundedRect(fX, 126, 58, 58, 2, 2, 'D');

  // Círculo indicador
  doc.setFillColor(colors.gold[0], colors.gold[1], colors.gold[2]);
  doc.circle(fX + 8, 134, 4.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(colors.navy[0], colors.navy[1], colors.navy[2]);
  doc.text(s.num, fX + 7, 136.8);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
  const splitFlowTitle = doc.splitTextToSize(s.title, 42);
  doc.text(splitFlowTitle, fX + 15, 135);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(colors.gold[0], colors.gold[1], colors.gold[2]);
  const splitEntity = doc.splitTextToSize(s.entity, 52);
  doc.text(splitEntity, fX + 4, 146);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(colors.cardBorder[0], colors.cardBorder[1], colors.cardBorder[2]);
  const splitFlowDesc = doc.splitTextToSize(s.desc, 51);
  doc.text(splitFlowDesc, fX + 4, 156);
});

// ====================================================================
// SLIDE 4: PROTOCOLO DE DESPACHO & RESPUESTA AUTOMATIZADA
// ====================================================================
doc.addPage();
renderSlideHeader('Protocolo de Despacho, Derivación en 1 Clic y Respuestas Legales Oficiales');

// Columna Izquierda: Herramientas del Panel de Obras Públicas y Planificación
doc.setFillColor(colors.cardBg[0], colors.cardBg[1], colors.cardBg[2]);
doc.roundedRect(16, 30, 126, 160, 3, 3, 'F');
doc.setDrawColor(colors.cardBorder[0], colors.cardBorder[1], colors.cardBorder[2]);
doc.roundedRect(16, 30, 126, 160, 3, 3, 'D');

doc.setFillColor(colors.navy[0], colors.navy[1], colors.navy[2]);
doc.roundedRect(16, 30, 126, 10, 3, 3, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(8.5);
doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
doc.text('HERRAMIENTAS PARA DIRECTORES Y TÉCNICOS MUNICIPALES', 20, 37);

const adminFeatures = [
  {
    title: '1. Botón "Derivar por Competencia Externa"',
    desc: 'Desde la consola de gestión, el Director de Obras Públicas o técnico asignado selecciona la entidad responsable: [MTOP] (Red Estatal), [Prefectura de Napo] (Red Provincial) o [Empresa Eléctrica / CNT]. El ticket concluye en el ámbito municipal sin saldo pendiente.'
  },
  {
    title: '2. Generación Automática de Oficio de Traslado',
    desc: 'El sistema redacta de forma automatizada el Oficio de Remisión dirigido al Director Distrital del MTOP o al Prefecto Provincial, incorporando folio institucional, coordenadas GPS, registro fotográfico y fecha de solicitud ciudadana para firma de la Alcaldía/Secretaría.'
  },
  {
    title: '3. Habilitación por Convenio de Concurrencia (Art. 275)',
    desc: 'En caso de que el GAD Municipal mantenga un Convenio Bipartito de Delegación de Competencias, el técnico marca: [✓ Atender bajo Convenio N.° XXXX]. Esto legitima formalmente el parte de trabajo de maquinaria y combustible ante el examen de la Contraloría.'
  }
];

let aY = 46;
adminFeatures.forEach((feat) => {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.2);
  doc.setTextColor(colors.techBlue[0], colors.techBlue[1], colors.techBlue[2]);
  doc.text(feat.title, 20, aY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.4);
  doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
  const splitFeat = doc.splitTextToSize(feat.desc, 118);
  doc.text(splitFeat, 20, aY + 4);
  aY += 37;
});

// Columna Derecha: Modelo de Plantilla Legal Motivada al Ciudadano
doc.setFillColor(colors.cardBg[0], colors.cardBg[1], colors.cardBg[2]);
doc.roundedRect(148, 30, 133, 160, 3, 3, 'F');
doc.setDrawColor(colors.cardBorder[0], colors.cardBorder[1], colors.cardBorder[2]);
doc.roundedRect(148, 30, 133, 160, 3, 3, 'D');

doc.setFillColor(colors.emerald[0], colors.emerald[1], colors.emerald[2]);
doc.roundedRect(148, 30, 133, 10, 3, 3, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(8.5);
doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
doc.text('PLANTILLA AUTOMATIZADA DE RESPUESTA MOTIVADA', 152, 37);

// Comprobante / Simulación de Respuesta Institucional
doc.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
doc.roundedRect(152, 44, 125, 142, 2, 2, 'F');
doc.setDrawColor(colors.cardBorder[0], colors.cardBorder[1], colors.cardBorder[2]);
doc.roundedRect(152, 44, 125, 142, 2, 2, 'D');

doc.setFont('helvetica', 'bold');
doc.setFontSize(8);
doc.setTextColor(colors.navy[0], colors.navy[1], colors.navy[2]);
doc.text('GAD MUNICIPAL DEL CANTÓN QUIJOS', 156, 50);
doc.setFontSize(7);
doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
doc.text('Notificación Institucional • Trámite N.° QUI-2026-0042 • Fecha: 08/Sept/2026', 156, 54.5);

doc.setFillColor(colors.cardBorder[0], colors.cardBorder[1], colors.cardBorder[2]);
doc.rect(156, 57, 117, 0.4, 'F');

doc.setFont('helvetica', 'bold');
doc.setFontSize(7.5);
doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
doc.text('Estimado(a) Ciudadano(a):', 156, 63);

doc.setFont('helvetica', 'normal');
doc.setFontSize(7.1);
doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
const legalResponse = doc.splitTextToSize(
  'Agradecemos su reporte ciudadano sobre la afectación vial en el sector indicado.\n\n' +
  'En cumplimiento estricto de los Artículos 54 y 55 literal c) del Código Orgánico de Organización Territorial, Autonomía y Descentralización (COOTAD) y el Art. 130 de la Ley del Sistema Nacional de Competencias, le informamos que el tramo reportado corresponde a la RED VIAL ESTATAL (administrada por el MTOP) / RED PROVINCIAL (Prefectura de Napo).\n\n' +
  'En apego al principio constitucional de coordinación y tutela administrativa (Art. 260 CRE), el GAD Municipal de Quijos ha emitido formalmente el OFICIO DE TRASLADO N.° GADMQ-OP-2026-0042 dirigido a la autoridad rectora competente para su debida atención e intervención.\n\n' +
  'Estado: DERIVADO FORMALMENTE A ENTIDAD COMPETENTE (MTOP).\n' +
  'Esta notificación constituye constancia legal de gestión municipal oportuna.',
  117
);
doc.text(legalResponse, 156, 68);

// Sello de blindaje legal sin caracteres corruptos
doc.setFillColor(240, 253, 244);
doc.roundedRect(156, 152, 117, 28, 2, 2, 'F');
doc.setDrawColor(34, 197, 94);
doc.roundedRect(156, 152, 117, 28, 2, 2, 'D');

doc.setFont('helvetica', 'bold');
doc.setFontSize(7.5);
doc.setTextColor(21, 128, 61);
doc.text('[DICTAMEN] BLINDAJE AUDITABLE ANTE CONTRALORÍA (CGE)', 159, 158.5);

doc.setFont('helvetica', 'normal');
doc.setFontSize(6.8);
doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
const stampText = doc.splitTextToSize(
  'El Municipio demuestra debida diligencia administrativa, oportuna información al ciudadano y cero afectación al erario cantonal. Toda la trazabilidad queda registrada con hash inalterable en la bitácora de auditoría digital.',
  112
);
doc.text(stampText, 159, 164);

// ====================================================================
// SLIDE 5: VALOR ESTRATÉGICO INSTITUCIONAL Y HOJA DE RUTA
// ====================================================================
doc.addPage();
renderSlideHeader('Valor Estratégico Institucional y Hoja de Ruta de Implementación');

// 3 Tarjetas de Valor por Unidad de Gobierno
const actorCards = [
  {
    role: 'PARA EL ALCALDE',
    highlight: 'Liderazgo & Blindaje Político',
    badge: '100% GESTIÓN TRASLADADA',
    color: colors.gold,
    desc: '• Demuestra gestión activa: no evade la queja, traslada formalmente el reclamo al MTOP o Prefectura con número de oficio.\n• Fortalece su posicionamiento de fiscalización y reclamo ante el Gobierno Central y Provincial.\n• Evita el descontento de la ciudadanía por supuesta "falta de atención".\n• Consolida métricas de gestión interinstitucional auditables.'
  },
  {
    role: 'PARA DIRECCIONES TÉCNICAS',
    highlight: 'Tranquilidad Jurídica & Cero Glosas',
    badge: '0% RIESGO ANTE EXÁMENES CGE',
    color: colors.techBlue,
    desc: '• Seguridad jurídica para la Dirección de Obras Públicas y Planificación.\n• Cada hora de máquina y consumo de combustible queda estrictamente justificada en vías de inventario municipal.\n• Registro formal para sustentar exámenes especiales de la Contraloría (CGE).\n• Cero riesgo de responsabilidades civiles o administrativas.'
  },
  {
    role: 'PARA LA COMUNIDAD Y CIUDADANOS',
    highlight: 'Certeza & Atención Oportuna',
    badge: '< 2 MINUTOS DE RESPUESTA',
    color: colors.emerald,
    desc: '• El vecino conoce con claridad a qué nivel de gobierno le compete solucionar el daño de su sector.\n• Recibe el número de oficio con el que el GAD Municipal exigió la intervención a la entidad competente.\n• Fomenta una cultura ciudadana informada y reduce la conflictividad barrial.\n• Seguimiento digital transparente hasta el cierre.'
  }
];

actorCards.forEach((act, idx) => {
  const aX = 16 + idx * 89;
  doc.setFillColor(colors.cardBg[0], colors.cardBg[1], colors.cardBg[2]);
  doc.roundedRect(aX, 30, 85, 96, 3, 3, 'F');
  doc.setDrawColor(colors.cardBorder[0], colors.cardBorder[1], colors.cardBorder[2]);
  doc.roundedRect(aX, 30, 85, 96, 3, 3, 'D');

  doc.setFillColor(act.color[0], act.color[1], act.color[2]);
  doc.roundedRect(aX, 30, 85, 9.5, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.text(act.role, aX + 4, 36.8);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(colors.navy[0], colors.navy[1], colors.navy[2]);
  doc.text(act.highlight, aX + 4, 46.5);

  // Badge métrico
  doc.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.roundedRect(aX + 4, 49.5, 77, 5.5, 1.5, 1.5, 'F');
  doc.setDrawColor(act.color[0], act.color[1], act.color[2]);
  doc.roundedRect(aX + 4, 49.5, 77, 5.5, 1.5, 1.5, 'D');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(act.color[0], act.color[1], act.color[2]);
  doc.text(act.badge, aX + 6, 53.6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.4);
  doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
  const splitActDesc = doc.splitTextToSize(act.desc, 77);
  doc.text(splitActDesc, aX + 4, 61);
});

// Sección de Hoja de Ruta Municipal
doc.setFillColor(colors.navy[0], colors.navy[1], colors.navy[2]);
doc.roundedRect(16, 132, pageWidth - 32, 58, 3, 3, 'F');

doc.setFont('helvetica', 'bold');
doc.setFontSize(10);
doc.setTextColor(colors.gold[0], colors.gold[1], colors.gold[2]);
doc.text('HOJA DE RUTA DE IMPLEMENTACIÓN DEL MÓDULO DE COMPETENCIAS VIALES', 24, 141);

const roadmap = [
  '1. Carga de Capas GIS: Mapeo de la franja de derecho de vía de la Troncal Amazónica (E45 MTOP) y polígonos urbanos (PUGS).',
  '2. Activación del Motor de Geocercas: Advertencias preventivas al ciudadano y estado DERIVADO_COMPETENCIA en consola.',
  '3. Parametrización de Oficios Tipo y Convenios Art. 275: Plantillas con fundamentación legal para remisión formal a MTOP y Prefectura.'
];

roadmap.forEach((st, idx) => {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.2);
  doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.text(st, 24, 150 + idx * 7.5);
});

// Firma y contacto institucional oficial
doc.setFont('helvetica', 'bold');
doc.setFontSize(8.8);
doc.setTextColor(colors.gold[0], colors.gold[1], colors.gold[2]);
doc.text('SOLINTEEC DEVTECH S.A.S. — Tecnología y Marco Jurídico para Gobiernos Autónomos Inteligentes', 24, 178);
doc.setFont('helvetica', 'normal');
doc.setFontSize(7.8);
doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
doc.text('Propuesta para el GAD Municipal de Quijos • Contacto: projects@solinteec.com • pquishpe@solinteec.com • https://solinteec.com', 24, 183.5);

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

console.log(`✅ PDF regenerado exitosamente con proporciones exactas:`);
console.log(`- ${outputDocsPath} (${(fs.statSync(outputDocsPath).size / 1024).toFixed(1)} KB)`);
console.log(`- ${outputPublicPath} (${(fs.statSync(outputPublicPath).size / 1024).toFixed(1)} KB)`);

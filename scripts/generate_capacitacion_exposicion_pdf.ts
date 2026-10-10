import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as fs from 'fs';
import * as path from 'path';

// Cargar logo oficial de SOLINTEEC DEVTECH S.A.S.
const logoWhitePath = path.join(process.cwd(), 'docs/assets/solinteec/solinteec-logo-white.png');
const logoWhiteBase64 = fs.existsSync(logoWhitePath) 
  ? `data:image/png;base64,${fs.readFileSync(logoWhitePath).toString('base64')}`
  : null;

const LOGO_ASPECT_RATIO = 1024 / 849;

// Paleta Corporativa SOLINTEEC DEVTECH
const colors: Record<string, [number, number, number]> = {
  navy: [11, 19, 43],           // #0B132B Azul Noche Institucional
  slate: [28, 37, 65],          // #1C2541 Azul Pizarra
  techBlue: [58, 80, 107],      // #3A506B Azul Técnico
  gold: [197, 155, 39],         // #C59B27 Oro Solinteec
  goldLight: [245, 158, 11],    // #F59E0B Ámbar Dorado
  emerald: [5, 150, 105],       // #059669 Verde Éxito
  cyan: [8, 145, 178],          // #0891B2 Cian Estratégico
  rose: [225, 29, 72],          // #E11D48 Rosa Alerta
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

// Encabezado estándar para diapositivas ejecutivas
function renderSlideHeader(
  title: string, 
  category: string = 'PROGRAMA DE CAPACITACIÓN & SOPORTE E-ELECTORAL'
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
  doc.text('SOLINTEEC DEVTECH S.A.S. • Protocolo de Capacitación & Soporte Territorial Quijos 2026', 16, pageHeight - 5.5);
  doc.text('Candidatura Brandon Aliaga • PSC 6 - PK 18', pageWidth - 16, pageHeight - 5.5, { align: 'right' });
}

// ====================================================================
// SLIDE 1: PORTADA ENTERPRISE
// ====================================================================
doc.setFillColor(colors.navy[0], colors.navy[1], colors.navy[2]);
doc.rect(0, 0, pageWidth, pageHeight, 'F');

// Marcos laterales en tono oro institucional
doc.setFillColor(colors.gold[0], colors.gold[1], colors.gold[2]);
doc.rect(0, 0, 10, pageHeight, 'F');
doc.rect(pageWidth - 10, 0, 10, pageHeight, 'F');
doc.rect(10, pageHeight - 5, pageWidth - 20, 5, 'F');

// Logo oficial en portada
if (logoWhiteBase64) {
  const hCover = 28;
  const wCover = hCover * LOGO_ASPECT_RATIO;
  doc.addImage(logoWhiteBase64, 'PNG', 28, 20, wCover, hCover);
}

// Badge de Capacitación y Despliegue
doc.setFillColor(colors.slate[0], colors.slate[1], colors.slate[2]);
doc.roundedRect(28, 56, 215, 8, 2, 2, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(7.5);
doc.setTextColor(colors.goldLight[0], colors.goldLight[1], colors.goldLight[2]);
doc.text('PROGRAMA OFICIAL DE CAPACITACIÓN, DESPLIEGUE & SOPORTE TÉCNICO • QUIJOS 2026', 32, 61.5);

// Título Principal
doc.setFont('helvetica', 'bold');
doc.setFontSize(22);
doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
doc.text('MANUAL OPERATIVO & PROTOCOLO DE DESPLIEGUE', 28, 77);

doc.setFontSize(16);
doc.setTextColor(colors.gold[0], colors.gold[1], colors.gold[2]);
doc.text('Ecosistema Tecnológico de Inteligencia Territorial & Control Electoral Día D', 28, 87);

// Descripción ejecutiva
doc.setFont('helvetica', 'normal');
doc.setFontSize(10);
doc.setTextColor(colors.cardBorder[0], colors.cardBorder[1], colors.cardBorder[2]);
const descCover = [
  'Guía integral de inducción y transferencia tecnológica para el comando de campaña, coordinadores',
  'de avanzada territorial y los 20 delegados de mesa en los 6 recintos electorales del Cantón Quijos.',
  'Incluye simulación matemática del umbral de victoria, sincronización de discursos y plan de contingencia Día D.'
];
doc.text(descCover, 28, 98);

// Ficha de Proyecto en Portada
doc.setFillColor(colors.slate[0], colors.slate[1], colors.slate[2]);
doc.roundedRect(28, 120, pageWidth - 56, 44, 3, 3, 'F');

const colW = (pageWidth - 56) / 4;
const metaCover = [
  { label: 'CANDIDATURA OFICIAL', val: 'Brandon Steev Aliaga Buitrón', sub: 'Alcaldía de Quijos 2026' },
  { label: 'ALIANZA POLÍTICA', val: 'PSC 6 - Pachakutik 18', sub: 'Lista de Unidad Cantonal' },
  { label: 'COBERTURA TERRITORIAL', val: '5,738 Electores • 20 JRVs', sub: 'Baeza, Borja, Papallacta, Cuyuja, Cosanga, Sumaco' },
  { label: 'DESARROLLADO POR', val: 'SOLINTEEC DEVTECH S.A.S.', sub: 'División GovTech & E-Electoral' }
];

metaCover.forEach((m, idx) => {
  const x = 34 + (idx * colW);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(colors.goldLight[0], colors.goldLight[1], colors.goldLight[2]);
  doc.text(m.label, x, 130);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.text(m.val, x, 140);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(colors.cardBorder[0], colors.cardBorder[1], colors.cardBorder[2]);
  doc.text(m.sub, x, 148);
});

// Pie de portada
doc.setFont('helvetica', 'bold');
doc.setFontSize(8.5);
doc.setTextColor(colors.gold[0], colors.gold[1], colors.gold[2]);
doc.text('DOCUMENTO ENTERPRISE DE USO EXCLUSIVO PARA EL COMANDO DE CAMPAÑA • CONFIDENCIAL', pageWidth / 2, 192, { align: 'center' });

// ====================================================================
// SLIDE 2: ARQUITECTURA DEL ECOSISTEMA (3 CAPAS DE VICTORIA)
// ====================================================================
doc.addPage();
renderSlideHeader('Arquitectura del Ecosistema: Las 3 Capas de la Victoria Electoral');

const cardW3 = (pageWidth - 32 - 16) / 3;

// Capa 1: Escucha Activa
doc.setFillColor(colors.cardBg[0], colors.cardBg[1], colors.cardBg[2]);
doc.setDrawColor(colors.cyan[0], colors.cyan[1], colors.cyan[2]);
doc.roundedRect(16, 32, cardW3, 140, 3, 3, 'FD');

doc.setFillColor(colors.cyan[0], colors.cyan[1], colors.cyan[2]);
doc.roundedRect(20, 36, cardW3 - 8, 8, 2, 2, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(8);
doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
doc.text('CAPA 1: ESCUCHA CIUDADANA & QR', 24, 41.5);

doc.setFont('helvetica', 'bold');
doc.setFontSize(12);
doc.setTextColor(colors.navy[0], colors.navy[1], colors.navy[2]);
doc.text('Captura y Mapeo Barrial', 24, 52);

doc.setFont('helvetica', 'normal');
doc.setFontSize(8.5);
doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
const c1Text = [
  '• Generación masiva de volantes con códigos QR',
  '  georreferenciados para cada parroquia.',
  '• El ciudadano escanea y reporta necesidades',
  '  sin descargar apps pesadas (PWA Web).',
  '• Captura voluntaria de número WhatsApp para',
  '  crear la base de votantes afines.',
  '• Mapa de calor con alertas en tiempo real de',
  '  las prioridades vecinales por sector.'
];
doc.text(c1Text, 24, 62);

// Capa 2: Despliegue de Avanzada
doc.setFillColor(colors.cardBg[0], colors.cardBg[1], colors.cardBg[2]);
doc.setDrawColor(colors.gold[0], colors.gold[1], colors.gold[2]);
doc.roundedRect(16 + cardW3 + 8, 32, cardW3, 140, 3, 3, 'FD');

doc.setFillColor(colors.gold[0], colors.gold[1], colors.gold[2]);
doc.roundedRect(24 + cardW3, 36, cardW3 - 8, 8, 2, 2, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(8);
doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
doc.text('CAPA 2: AVANZADA & DISCURSO', 28 + cardW3, 41.5);

doc.setFont('helvetica', 'bold');
doc.setFontSize(12);
doc.setTextColor(colors.navy[0], colors.navy[1], colors.navy[2]);
doc.text('Agenda Táctica & War Room', 28 + cardW3, 52);

doc.setFont('helvetica', 'normal');
doc.setFontSize(8.5);
doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
const c2Text = [
  '• Calculadora matemática del umbral de victoria',
  '  fijando metas claras por parroquia.',
  '• Planificación de caminatas y mítines con',
  '  enfoque de propuestas por sector.',
  '• El candidato llega a la tarima conociendo',
  '  exactamente el reclamo más votado.',
  '• Checklist de insumos de brigada (banderas,',
  '  megáfonos, folletería y transporte).'
];
doc.text(c2Text, 28 + cardW3, 62);

// Capa 3: Día D
doc.setFillColor(colors.cardBg[0], colors.cardBg[1], colors.cardBg[2]);
doc.setDrawColor(colors.rose[0], colors.rose[1], colors.rose[2]);
doc.roundedRect(16 + (cardW3 * 2) + 16, 32, cardW3, 140, 3, 3, 'FD');

doc.setFillColor(colors.rose[0], colors.rose[1], colors.rose[2]);
doc.roundedRect(32 + (cardW3 * 2), 36, cardW3 - 8, 8, 2, 2, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(8);
doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
doc.text('CAPA 3: DÍA D & CONTROL DE URNAS', 36 + (cardW3 * 2), 41.5);

doc.setFont('helvetica', 'bold');
doc.setFontSize(12);
doc.setTextColor(colors.navy[0], colors.navy[1], colors.navy[2]);
doc.text('Conteo Rápido & Remolque', 36 + (cardW3 * 2), 52);

doc.setFont('helvetica', 'normal');
doc.setFontSize(8.5);
doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
const c3Text = [
  '• Padrón digital con chequeo de asistencia a 1 clic',
  '  en las 20 Juntas Receptoras del Voto.',
  '• Alerta a las 13:00 de simpatizantes pendientes',
  '  para activar movilización y camionetas.',
  '• Cierre de urnas: digitación de votos y subida',
  '  fotográfica del acta oficial suscrita.',
  '• Detección inmediata de inconsistencias CNE.'
];
doc.text(c3Text, 36 + (cardW3 * 2), 62);

// Banner inferior
doc.setFillColor(colors.slate[0], colors.slate[1], colors.slate[2]);
doc.roundedRect(16, 178, pageWidth - 32, 16, 2, 2, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(9);
doc.setTextColor(colors.goldLight[0], colors.goldLight[1], colors.goldLight[2]);
doc.text('PRINCIPIO DOCTRINARIO: "CERO IMPROVISACIÓN, CERO VOTOS PERDIDOS"', 24, 186);
doc.setFont('helvetica', 'normal');
doc.setFontSize(8);
doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
doc.text('La tecnología transforma la intuición política en certeza operativa medible desde la primera caminata hasta la última acta.', 24, 190.5);

// ====================================================================
// SLIDE 3: CAPACITACIÓN MÓDULO 1 - CALCULADORA DE VICTORIA
// ====================================================================
doc.addPage();
renderSlideHeader('Módulo 1: Calculadora del Umbral de Victoria Cantonal');

autoTable(doc, {
  startY: 32,
  head: [['PARROQUIA', 'RECINTO ELECTORAL', 'JRVS', 'PADRÓN CNE', 'META DE VOTOS', 'CUOTA META', 'ESTRATEGIA RECOMENDADA']],
  body: [
    ['Baeza', 'Unidad Educativa Baeza', '7', '1,980', '660 votos', '39.0%', 'Capital cantonal: Voto de opinión y gremios comerciales'],
    ['San Francisco de Borja', 'U.E. Juan Bautista Montini', '6', '1,720', '580 votos', '39.4%', 'Bastión lechero: Alianzas ganaderas y vialidad rural'],
    ['Papallacta', 'Unidad Educativa Quisquis', '2', '680', '220 votos', '37.8%', 'Corredor turístico: Emprendedores y transportistas'],
    ['Cuyuja', 'Escuela Manuel Villavicencio', '2', '520', '165 votos', '37.2%', 'Conectividad interoceánica y seguridad vial comunitaria'],
    ['Cosanga', 'Escuela Gil Ramírez Dávalos', '2', '510', '155 votos', '35.6%', 'Comunidad ecológica: Juventud, deporte y turismo verde'],
    ['Sumaco', 'Escuela Mixta Quijos (GAD)', '1', '328', '110 votos', '39.1%', 'Parroquia histórica: Movilización garantizada en Salahonda'],
    ['TOTAL CANTONAL', '6 Recintos Electorales', '20', '5,738', '1,890 votos', '43.3% (Válidos)', 'VICTORIA ASEGURADA: Colchón de +495 votos sobre 2do lugar']
  ],
  theme: 'grid',
  headStyles: { fillColor: colors.navy, textColor: colors.goldLight, fontStyle: 'bold', fontSize: 8 },
  bodyStyles: { fontSize: 8, textColor: colors.textDark },
  columnStyles: {
    0: { fontStyle: 'bold', cellWidth: 32 },
    1: { cellWidth: 55 },
    2: { halign: 'center', cellWidth: 14 },
    3: { halign: 'right', fontStyle: 'bold', cellWidth: 24 },
    4: { halign: 'right', fontStyle: 'bold', textColor: colors.emerald, cellWidth: 26 },
    5: { halign: 'center', fontStyle: 'bold', cellWidth: 26 },
    6: { cellWidth: 'auto' }
  }
});

const finalY3 = (doc as any).lastAutoTable.finalY || 130;

// Panel instructivo
doc.setFillColor(colors.cardBg[0], colors.cardBg[1], colors.cardBg[2]);
doc.setDrawColor(colors.gold[0], colors.gold[1], colors.gold[2]);
doc.roundedRect(16, finalY3 + 6, pageWidth - 32, 45, 3, 3, 'FD');

doc.setFont('helvetica', 'bold');
doc.setFontSize(10);
doc.setTextColor(colors.navy[0], colors.navy[1], colors.navy[2]);
doc.text('Instrucciones Operativas para el Comando de Campaña:', 22, finalY3 + 14);

doc.setFont('helvetica', 'normal');
doc.setFontSize(8.5);
doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
const insSim = [
  '1. Ajuste de Participación: Mover el slider de participación si llueve intensamente el día electoral (la participación baja de 85% a 78%).',
  '2. Regla de Oro Cantonal: Baeza y Borja representan el 64.5% del electorado. Si la candidatura supera el 39% en ambas, la elección está ganada.',
  '3. Monitoreo de Rivales: Renán Balladares (ADN 7) y Kerlyn Ruiz (Alianza 3-8) fragmentan el voto opositor. La calculadora alerta automáticamente',
  '   si la ventaja cae por debajo de 150 votos para redireccionar recursos de publicidad y brigadas de inmediato hacia el recinto débil.'
];
doc.text(insSim, 22, finalY3 + 22);

// ====================================================================
// SLIDE 4: CAPACITACIÓN MÓDULO 2 - AGENDA TERRITORIAL
// ====================================================================
doc.addPage();
renderSlideHeader('Módulo 2: Agenda Táctica de Territorio y Caminatas');

const wLeft = (pageWidth - 32 - 12) * 0.55;
const wRight = (pageWidth - 32 - 12) * 0.45;

// Columna Izquierda: Protocolo de Avanzada
doc.setFillColor(colors.cardBg[0], colors.cardBg[1], colors.cardBg[2]);
doc.setDrawColor(colors.cardBorder[0], colors.cardBorder[1], colors.cardBorder[2]);
doc.roundedRect(16, 32, wLeft, 155, 3, 3, 'FD');

doc.setFont('helvetica', 'bold');
doc.setFontSize(11);
doc.setTextColor(colors.navy[0], colors.navy[1], colors.navy[2]);
doc.text('Protocolo Paso a Paso para la Avanzada de Campo', 24, 44);

doc.setFont('helvetica', 'normal');
doc.setFontSize(8.5);
doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
const protoText = [
  'Paso 1: Programación en Plataforma (48 horas antes)',
  '• El Coordinador Territorial registra en /admin/agenda-territorial:',
  '  Tipo (Caminata, Puerta a puerta, Mitin), fecha, hora, sector y punto de reunión.',
  '',
  'Paso 2: Inyección de Discurso por Barrio',
  '• El sistema consulta los reportes ciudadanos más votados de esa parroquia.',
  '• Se redactan 3 puntos clave de discurso (ej. Red de agua en Baeza Colonial,',
  '  electrificación de fincas en Borja, impulso termal en Papallacta).',
  '',
  'Paso 3: Verificación de Insumos Logísticos',
  '• Checklist obligatorio: 1 megáfono cargado, 150 banderas, 300 volantes QR,',
  '  refrigerio para 20 brigadistas y distintivos reflectivos de seguridad vial.',
  '',
  'Paso 4: Cierre y Retroalimentación Inmediata',
  '• Al concluir la actividad, el responsable cambia el estado a COMPLETADA y',
  '  registra la asistencia real y nuevos líderes comunitarios contactados.'
];
doc.text(protoText, 24, 53);

// Columna Derecha: Tarjeta de Enfoque de Discurso
doc.setFillColor(colors.slate[0], colors.slate[1], colors.slate[2]);
doc.roundedRect(16 + wLeft + 12, 32, wRight, 155, 3, 3, 'F');

doc.setFont('helvetica', 'bold');
doc.setFontSize(11);
doc.setTextColor(colors.goldLight[0], colors.goldLight[1], colors.goldLight[2]);
doc.text('Cómo Conectar el Discurso de Tarima con la Gente', 26 + wLeft + 12, 44);

const speechCards = [
  { p: 'BAEZA', top: 'Agua potable & alcantarillado', msg: '"No más cortes en la red matriz ni parches en Baeza Colonial; modernización integral de captación."' },
  { p: 'SAN FRANCISCO DE BORJA', top: 'Vialidad lechera & luminarias', msg: '"Mantenimiento continuo con maquinaria propia de caminos a fincas para que la leche no se pierda."' },
  { p: 'PAPALLACTA', top: 'Turismo sostenible & ferias', msg: '"Exoneración de trabas municipales a hostales locales y promoción de la ruta termal internacional."' },
  { p: 'SUMACO', top: 'Transporte comunitario & salud', msg: '"Brigadas médicas móviles permanentes y conectividad vial garantizada con la cabecera cantonal."' }
];

speechCards.forEach((sc, i) => {
  const yBox = 54 + (i * 32);
  doc.setFillColor(colors.navy[0], colors.navy[1], colors.navy[2]);
  doc.roundedRect(24 + wLeft + 12, yBox, wRight - 16, 28, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(colors.gold[0], colors.gold[1], colors.gold[2]);
  doc.text(`${sc.p} • Prioridad: ${sc.top}`, 28 + wLeft + 12, yBox + 7);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.text(doc.splitTextToSize(sc.msg, wRight - 24), 28 + wLeft + 12, yBox + 15);
});

// ====================================================================
// SLIDE 5: CAPACITACIÓN MÓDULO 3 - PADRÓN ELECTORAL & DÍA D
// ====================================================================
doc.addPage();
renderSlideHeader('Módulo 3: Padrón Electoral y Chequeo Día D (Voto Seguro)');

autoTable(doc, {
  startY: 32,
  head: [['ROL EN DÍA D', 'RESPONSABLE', 'HERRAMIENTA DIGITAL', 'FUNCIÓN OPERATIVA PRINCIPAL']],
  body: [
    ['Coordinador Cantonal', 'Director Electoral General', 'War Room Central (/admin/war-room)', 'Monitorea la curva de participación y ordena refuerzos a recintos atrasados'],
    ['Jefe de Recinto (6)', 'Líder Parroquial Designado', 'Padrón Electoral (/admin/padron-electoral)', 'Supervisa a los delegados de mesa y coordina la flota de transporte rural'],
    ['Delegado de Mesa (20)', 'Militante Acreditado en JRV', 'Checklist Móvil Día D (1 clic)', 'Marca en tiempo real cada simpatizante que sufraga en su respectiva JRV'],
    ['Chofer / Movilizador', 'Propietario de Camioneta/Auto', 'Ruta de Recogida asignada', 'Recoge a electores empadronados que requieren transporte en fincas alejadas']
  ],
  theme: 'grid',
  headStyles: { fillColor: colors.navy, textColor: colors.goldLight, fontStyle: 'bold', fontSize: 8.5 },
  bodyStyles: { fontSize: 8.5, textColor: colors.textDark },
  columnStyles: {
    0: { fontStyle: 'bold', cellWidth: 45 },
    1: { cellWidth: 50 },
    2: { fontStyle: 'bold', cellWidth: 65 },
    3: { cellWidth: 'auto' }
  }
});

const finalY5 = (doc as any).lastAutoTable.finalY || 100;

// Panel de "Operación Remolque"
doc.setFillColor(colors.rose[0], colors.rose[1], colors.rose[2]);
doc.roundedRect(16, finalY5 + 8, pageWidth - 32, 70, 3, 3, 'F');

doc.setFont('helvetica', 'bold');
doc.setFontSize(12);
doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
doc.text('PROTOCOLO CRÍTICO: "OPERACIÓN REMOLQUE" (A PARTIR DE LAS 13:00 HORAS)', 24, finalY5 + 20);

doc.setFont('helvetica', 'normal');
doc.setFontSize(9);
const remolqueText = [
  '• A las 13:00 horas, el Coordinador de Recinto filtra en la plataforma: "Estado: Pendientes por Votar".',
  '• El sistema muestra únicamente la lista de simpatizantes seguros que aún NO han asistido a las urnas.',
  '• Se activa inmediatamente el equipo de llamada telefónica (botón directo de WhatsApp en la pantalla).',
  '• Para electores que viven en sectores distantes (Salahonda en Sumaco, Papallacta alta, Oyacachi), se despacha',
  '  la camioneta o taxi asignado en el campo "Requiere Movilización" con dirección exacta de recogida.',
  '• Objetivo: Que ningún voto seguro se quede en casa por falta de transporte o por descuido.'
];
doc.text(remolqueText, 24, finalY5 + 30);

// ====================================================================
// SLIDE 6: CRONOGRAMA HORA POR HORA DEL DÍA D
// ====================================================================
doc.addPage();
renderSlideHeader('Protocolo de Batalla Electoral: Cronograma Hora por Hora');

const hours = [
  { h: '06:30', tit: 'Instalación de Mesas', desc: 'Los 20 delegados se presentan en las JRVs con su credencial CNE. Verifican apertura de urnas vacías y firman acta de instalación.' },
  { h: '07:00', tit: 'Apertura de Sufragio', desc: 'Comienza la votación ciudadana. Los delegados abren la web móvil en su celular y confirman conexión al sistema central.' },
  { h: '10:00', tit: 'Primer Corte de Votación', desc: 'Primer reporte de afluencia. Se calcula el ritmo de votación en Baeza y Borja comparado con la proyección de la calculadora.' },
  { h: '13:00', tit: 'Activación del Remolque', desc: 'Se revisa la lista de simpatizantes pendientes. Se activan las unidades de transporte asignadas para ir por los votos seguros.' },
  { h: '16:00', tit: 'Última Hora de Urnas', desc: 'Presión final en los alrededores del recinto para que los últimos electores indecisos ingresen antes del toque de timbre.' },
  { h: '17:00', tit: 'Cierre y Escrutinio', desc: 'Cierre formal de votación. El delegado no abandona la mesa bajo ninguna circunstancia durante el conteo voto por voto.' },
  { h: '18:30', tit: 'Transmisión Fotográfica', desc: 'Firma y foto nítida del Acta Oficial de Alcalde. Se sube de inmediato a /admin/control-electoral para totalización instantánea.' }
];

hours.forEach((item, idx) => {
  const y = 32 + (idx * 22);
  doc.setFillColor(idx === 3 || idx === 6 ? colors.gold[0] : colors.slate[0], idx === 3 || idx === 6 ? colors.gold[1] : colors.slate[1], idx === 3 || idx === 6 ? colors.gold[2] : colors.slate[2]);
  doc.roundedRect(16, y, 22, 18, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.text(item.h, 27, y + 11.5, { align: 'center' });

  doc.setFillColor(colors.cardBg[0], colors.cardBg[1], colors.cardBg[2]);
  doc.setDrawColor(colors.cardBorder[0], colors.cardBorder[1], colors.cardBorder[2]);
  doc.roundedRect(42, y, pageWidth - 58, 18, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(colors.navy[0], colors.navy[1], colors.navy[2]);
  doc.text(item.tit, 46, y + 6.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
  doc.text(item.desc, 46, y + 13.5);
});

// ====================================================================
// SLIDE 7: SOPORTE TÉCNICO & PLAN DE CONTINGENCIA
// ====================================================================
doc.addPage();
renderSlideHeader('Soporte Técnico, Niveles de Servicio (SLA) & Contingencia');

autoTable(doc, {
  startY: 32,
  head: [['COMPONENTE TÉCNICO', 'GARANTÍA DE SERVICIO', 'PROTOCOLO DE CONTINGENCIA ANTE FALLOS']],
  body: [
    ['Servidor VPS Dedicado', '99.9% Uptime garantizado en hardware Contabo 24 GB RAM / 8 vCPUs', '3 Snapshots completos de restauración instantánea ante fallos de configuración'],
    ['Conectividad Móvil Rural', 'Service Worker PWA activo: la interfaz funciona aunque se pierda señal 4G temporalmente', 'Almacenamiento en caché local del teléfono; los datos se sincronizan al volver la red'],
    ['Seguridad de Datos', 'Aislamiento estricto multitenant con encriptación SSL TLS 1.3 Let\'s Encrypt', 'Respaldos automáticos diarios de la base de datos MariaDB fuera del servidor'],
    ['Mesa de Ayuda WhatsApp', 'Línea directa prioritaria 24/7 de SOLINTEEC para el comando de campaña', 'Atención en menos de 5 minutos ante cualquier duda de digitación o acceso']
  ],
  theme: 'grid',
  headStyles: { fillColor: colors.navy, textColor: colors.goldLight, fontStyle: 'bold', fontSize: 8.5 },
  bodyStyles: { fontSize: 8.5, textColor: colors.textDark },
  columnStyles: {
    0: { fontStyle: 'bold', cellWidth: 55 },
    1: { cellWidth: 85 },
    2: { cellWidth: 'auto' }
  }
});

const finalY7 = (doc as any).lastAutoTable.finalY || 110;

// Caja de contacto de soporte
doc.setFillColor(colors.slate[0], colors.slate[1], colors.slate[2]);
doc.roundedRect(16, finalY7 + 10, pageWidth - 32, 55, 3, 3, 'F');

doc.setFont('helvetica', 'bold');
doc.setFontSize(11);
doc.setTextColor(colors.goldLight[0], colors.goldLight[1], colors.goldLight[2]);
doc.text('Centro de Operaciones & Soporte de Infraestructura SOLINTEEC DEVTECH S.A.S.', 24, finalY7 + 22);

doc.setFont('helvetica', 'normal');
doc.setFontSize(8.5);
doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
const sopText = [
  '• Director de Soporte Técnico GovTech: Ing. Asignado SOLINTEEC',
  '• Monitoreo de Recursos en Tiempo Real: Supervisión de carga de CPU, RAM y conexiones de base de datos MariaDB.',
  '• Canales de Atención Inmediata: Canal privado de WhatsApp y acceso remoto vía SSH de guardia durante todo el Día D.',
  '• Política de Cero Pérdida: Todas las actas fotográficas se respaldan con checksum criptográfico para blindaje legal.'
];
doc.text(sopText, 24, finalY7 + 32);

// ====================================================================
// SLIDE 8: TRANSICIÓN A LA ALCALDÍA (G-CRM MUNICIPAL)
// ====================================================================
doc.addPage();
renderSlideHeader('Transición a la Alcaldía: El Legado Tecnológico para Quijos');

// 2 Grandes Bloques: Hoy en Campaña vs Mañana en el GAD
const bW = (pageWidth - 32 - 12) / 2;

// Hoy
doc.setFillColor(colors.cardBg[0], colors.cardBg[1], colors.cardBg[2]);
doc.setDrawColor(colors.goldLight[0], colors.goldLight[1], colors.goldLight[2]);
doc.roundedRect(16, 32, bW, 140, 3, 3, 'FD');

doc.setFont('helvetica', 'bold');
doc.setFontSize(12);
doc.setTextColor(colors.navy[0], colors.navy[1], colors.navy[2]);
doc.text('FASE 1: EN CAMPAÑA ELECTORAL', 24, 44);

doc.setFont('helvetica', 'normal');
doc.setFontSize(8.5);
doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
const f1Text = [
  '• Plataforma de Escucha Ciudadana y Quejas por Barrio.',
  '• Discurso de tarima sustentado en datos reales.',
  '• Padrón de simpatizantes y movilización de votantes.',
  '• Conteo rápido que previene fraudes en las 20 JRVs.',
  '• Imagen de candidatura moderna, ordenada y profesional.'
];
doc.text(f1Text, 24, 56);

// Mañana
doc.setFillColor(colors.cardBg[0], colors.cardBg[1], colors.cardBg[2]);
doc.setDrawColor(colors.emerald[0], colors.emerald[1], colors.emerald[2]);
doc.roundedRect(16 + bW + 12, 32, bW, 140, 3, 3, 'FD');

doc.setFont('helvetica', 'bold');
doc.setFontSize(12);
doc.setTextColor(colors.emerald[0], colors.emerald[1], colors.emerald[2]);
doc.text('FASE 2: EN EL GAD MUNICIPAL DE QUIJOS', 26 + bW + 12, 44);

doc.setFont('helvetica', 'normal');
doc.setFontSize(8.5);
doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
const f2Text = [
  '• Sistema Oficial de Atención y Tickets Ciudadanos (G-CRM).',
  '• Seguimiento de Obras Públicas "Antes vs Después".',
  '• Gestión de competencias viales y blindaje ante la CGE.',
  '• Ventanilla digital para las 6 parroquias del cantón.',
  '• Modernización y transparencia administrativa de nivel internacional.'
];
doc.text(f2Text, 26 + bW + 12, 56);

// Guardar archivo PDF en docs/
const outputPath = path.join(process.cwd(), 'docs/SOLINTEEC_Manual_Capacitacion_Exposicion_Campana_Quijos.pdf');
const pdfBytes = doc.output('arraybuffer');
fs.writeFileSync(outputPath, Buffer.from(pdfBytes));
console.log(`PDF de Capacitación generado exitosamente en: ${outputPath}`);

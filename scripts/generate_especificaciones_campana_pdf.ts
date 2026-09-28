import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as fs from 'fs';
import * as path from 'path';

// Cargar logo oficial de SOLINTEEC DEVTECH S.A.S.
const logoWhitePath = path.join(process.cwd(), 'docs/assets/solinteec/solinteec-logo-white.png');

const logoWhiteBase64 = fs.existsSync(logoWhitePath) 
  ? `data:image/png;base64,${fs.readFileSync(logoWhitePath).toString('base64')}`
  : null;

// Relación de aspecto estricta del logo (1024 x 849 px -> ratio = 1.2061)
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

// Encabezado estándar de diapositivas con logo sin distorsión
function renderSlideHeader(
  title: string, 
  category: string = 'ESPECIFICACIONES TÉCNICAS & ARQUITECTURA DE SOFTWARE'
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
  doc.text('SOLINTEEC DEVTECH S.A.S. • División de Ingeniería de Software & GovTech', 16, pageHeight - 5.5);
  doc.text('Especificación Técnica: Modo Campaña & Transición GAD Municipal Dual', pageWidth - 16, pageHeight - 5.5, { align: 'right' });
}

// ====================================================================
// SLIDE 1: PORTADA ENTERPRISE (LOGO PERFECTAMENTE CIRCULAR)
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

// Badge superior de arquitectura
doc.setFillColor(colors.slate[0], colors.slate[1], colors.slate[2]);
doc.roundedRect(28, 56, 185, 8, 2, 2, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(7.5);
doc.setTextColor(colors.goldLight[0], colors.goldLight[1], colors.goldLight[2]);
doc.text('DOCUMENTO TÉCNICO OFICIAL • ARQUITECTURA & ESPECIFICACIONES DE SOFTWARE', 32, 61.5);

// Título Principal
doc.setFont('helvetica', 'bold');
doc.setFontSize(22);
doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
doc.text('ESPECIFICACIONES TÉCNICAS: MODO CAMPAÑA &', 28, 76);
doc.text('INTELIGENCIA TERRITORIAL DUAL', 28, 86);

// Subtítulo descriptivo
doc.setFont('helvetica', 'normal');
doc.setFontSize(10.5);
doc.setTextColor(colors.gold[0], colors.gold[1], colors.gold[2]);
doc.text('Automatización en 1 Clic: Switch de Transición entre Campaña Electoral y Gestión Municipal GAD', 28, 97);
doc.text('Módulos de War Room, Generación de Fichas de Tarima, Códigos QR y Captura de Simpatizantes', 28, 103);

// Tarjeta con 3 Pilares Fundamentales
doc.setFillColor(colors.slate[0], colors.slate[1], colors.slate[2]);
doc.roundedRect(28, 114, pageWidth - 56, 46, 3, 3, 'F');

const pillars = [
  {
    title: '1. Arquitectura de Estado Dual',
    desc: 'Un switch central en Configuración que activa los módulos electorales o revierte el sistema a modo 100% institucional GAD sin tocar una sola línea de código.'
  },
  {
    title: '2. War Room & Ficha de Tarima',
    desc: 'Motor analítico que sintetiza en 1 página imprimible los 3 dolores del sector, testimonios con nombre y frases quirúrgicas para el discurso del candidato.'
  },
  {
    title: '3. QR Dinámico & Base de Votantes',
    desc: 'Generador vectorial de códigos QR por parroquia y brigada, articulado a la captura de WhatsApp del vecino para el seguimiento directo de la candidatura.'
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
doc.text('SOLINTEEC DEVTECH S.A.S. • División de Ingeniería de Software & GovTech', 28, 178);

doc.setFont('helvetica', 'normal');
doc.setFontSize(8);
doc.setTextColor(colors.gold[0], colors.gold[1], colors.gold[2]);
doc.text('Dossier de Ingeniería para el Equipo de Campaña, Candidatura y Dirección de Tecnología Municipal', 28, 184);

// ====================================================================
// SLIDE 2: ARQUITECTURA DEL ESTADO DUAL (EL SWITCH EN 1 CLIC)
// ====================================================================
doc.addPage();
renderSlideHeader('Arquitectura de Estado Dual: Modo Campaña vs. Modo Institucional GAD');

// Columna Izquierda: Modo Campaña Política (Activo)
doc.setFillColor(254, 252, 232); // Amarillo suave
doc.roundedRect(16, 30, 126, 160, 3, 3, 'F');
doc.setDrawColor(245, 158, 11);
doc.setLineWidth(0.8);
doc.roundedRect(16, 30, 126, 160, 3, 3, 'D');

// Cabecera Columna Izquierda
doc.setFillColor(217, 119, 6);
doc.roundedRect(16, 30, 126, 10, 3, 3, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(8.5);
doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
doc.text('[ESTADO A: ACTIVO] MODO CAMPAÑA POLÍTICA', 20, 37);

const campaignFeatures = [
  {
    title: '1. Desbloqueo del Panel War Room (/admin/war-room):',
    desc: 'Habilita la consola táctica de inteligencia territorial con selector por parroquia, mapa de puntos críticos y generación de fichas ejecutivas para discursos de tarima.'
  },
  {
    title: '2. Generador de Códigos QR para Brigadas (/admin/qr-codes):',
    desc: 'Permite generar y descargar códigos QR vectoriales en alta resolución por parroquia y brigadista, listos para imprenta, volantes y afiches A4 descargables.'
  },
  {
    title: '3. Formulario Ciudadano con Captura de WhatsApp:',
    desc: 'El formulario público adapta su mensaje a "Plan Cantonal de Obras" y prioriza la captura del número celular/WhatsApp del vecino para construir la base electoral.'
  },
  {
    title: '4. Identidad Personalizada del Candidato:',
    desc: 'Inyección visual de los colores, nombre del candidato, eslogan de campaña y número de lista política en el portal público y paneles administrativos.'
  }
];

let cY = 46;
campaignFeatures.forEach((f) => {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(colors.goldLight[0], colors.goldLight[1], colors.goldLight[2]);
  doc.text(f.title, 20, cY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
  const splitF = doc.splitTextToSize(f.desc, 118);
  doc.text(splitF, 20, cY + 3.8);
  cY += 26.5;
});

// Caja inferior Estado A
doc.setFillColor(colors.slate[0], colors.slate[1], colors.slate[2]);
doc.roundedRect(20, 154, 118, 30, 2, 2, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(7.8);
doc.setTextColor(colors.gold[0], colors.gold[1], colors.gold[2]);
doc.text('OBJETIVO EN FASE ELECTORAL:', 24, 161);

doc.setFont('helvetica', 'normal');
doc.setFontSize(7);
doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
const alertA = doc.splitTextToSize(
  'Convertir cada visita comunitaria en votos seguros mediante datos reales, levantando el mayor archivo de necesidades ciudadanas de Quijos financiado 100% con presupuesto de campaña.',
  110
);
doc.text(alertA, 24, 166.5);

// Columna Derecha: Modo Institucional GAD (Desactivado)
doc.setFillColor(240, 253, 244); // Verde suave
doc.roundedRect(148, 30, 133, 160, 3, 3, 'F');
doc.setDrawColor(34, 197, 94);
doc.setLineWidth(0.8);
doc.roundedRect(148, 30, 133, 160, 3, 3, 'D');

// Cabecera Columna Derecha
doc.setFillColor(colors.emerald[0], colors.emerald[1], colors.emerald[2]);
doc.roundedRect(148, 30, 133, 10, 3, 3, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(8.5);
doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
doc.text('[ESTADO B: DESACTIVADO] MODO INSTITUCIONAL GAD MUNICIPAL', 152, 37);

const institutionalFeatures = [
  {
    title: '1. Desactivación Inmediata de Módulos Políticos:',
    desc: 'Con solo desmarcar el switch, los endpoints /admin/war-room y /admin/qr-codes se bloquean y redirigen automáticamente al panel principal. Cero vestigios políticos.'
  },
  {
    title: '2. Restauración de la Identidad Formal del GAD:',
    desc: 'El portal público se muestra con la tipografía y membrete oficial del Gobierno Municipal (ej. GAD Municipal del Cantón Quijos • Portal de Atención Ciudadana).'
  },
  {
    title: '3. Flujo Operativo hacia Direcciones Departamentales:',
    desc: 'Los reportes se procesan directamente como órdenes de trabajo hacia Obras Públicas, Agua Potable y Alcantarillado, Planificación y Seguridad Ciudadana.'
  },
  {
    title: '4. Transición Contractual Legal SERCOP:',
    desc: 'La plataforma queda 100% lista para ser contratada bajo el PAC municipal mediante Ínfima Cuantía (hasta $10.000 USD) o Menor Cuantía ($25.000 - $32.000 USD).'
  }
];

let iY = 46;
institutionalFeatures.forEach((f) => {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(colors.emerald[0], colors.emerald[1], colors.emerald[2]);
  doc.text(f.title, 152, iY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
  const splitI = doc.splitTextToSize(f.desc, 125);
  doc.text(splitI, 152, iY + 3.8);
  iY += 26.5;
});

// Caja inferior Estado B
doc.setFillColor(colors.navy[0], colors.navy[1], colors.navy[2]);
doc.roundedRect(152, 154, 125, 30, 2, 2, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(7.8);
doc.setTextColor(colors.gold[0], colors.gold[1], colors.gold[2]);
doc.text('OBJETIVO EN FASE MUNICIPAL (DÍA D + 1):', 156, 161);

doc.setFont('helvetica', 'normal');
doc.setFontSize(7);
doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
const alertB = doc.splitTextToSize(
  'Iniciar el mandato desde el día 1 con una plataforma municipal operando, sin pérdida de tiempo, con la ciudadanía ya familiarizada y con blindaje normativo ante Contraloría y SERCOP.',
  117
);
doc.text(alertB, 156, 166.5);

// ====================================================================
// SLIDE 3: ESPECIFICACIÓN DEL WAR ROOM & FICHA DE TARIMA
// ====================================================================
doc.addPage();
renderSlideHeader('Módulo War Room: Inteligencia Territorial & Ficha de Tarima en 1 Clic');

// 3 Tarjetas de Especificación del War Room
const warRoomCards = [
  {
    step: 'COMPONENTE 1: FILTRO PARROQUIAL',
    title: 'Selector Territorial Reactivo',
    badge: '6 PARROQUIAS DE QUIJOS',
    color: colors.techBlue,
    desc: 'Selector horizontal interactivo con todas las parroquias (Baeza, San Francisco de Borja, Papallacta, Cuyuja, Cosanga, Sumaco) y vista consolidada cantonal. Al seleccionar una parroquia, todo el motor recalcula métricas y discursos en milisegundos.',
    bullets: [
      '• Filtrado sin recarga de página (React Client Component).',
      '• Agrupación instantánea de reportes y porcentajes.',
      '• Identificación de barrios con mayor volumen de alertas.'
    ]
  },
  {
    step: 'COMPONENTE 2: FICHA DE TARIMA',
    title: 'Generador de Guión para Discurso',
    badge: 'DOCUMENTO IMPRIMIBLE A4',
    color: colors.gold,
    desc: 'Algoritmo que redacta un guión ejecutivo para el candidato antes de subir a la tarima: apertura con el problema número 1 del sector, cita textual con nombre y barrio de los vecinos reportantes, y compromiso técnico de solución municipal.',
    bullets: [
      '• Formateado para imprimir con 1 clic (window.print).',
      '• Estilos @media print que generan una ficha limpia de 1 hoja.',
      '• Destruye discursos genéricos de candidatos rivales.'
    ]
  },
  {
    step: 'COMPONENTE 3: DIRECTORIO ELECTORAL',
    title: 'Base Viva de Votantes & Simpatizantes',
    badge: 'FIDELIZACIÓN VECINAL',
    color: colors.emerald,
    desc: 'Panel con los ciudadanos que han levantado quejas en la parroquia, mostrando su nombre, barrio, necesidad reportada y un botón de enlace directo a WhatsApp (wa.me/593...) para que el equipo de campaña les comparta propuestas de gobierno.',
    bullets: [
      '• Contacto individualizado por WhatsApp en 1 toque.',
      '• Mensajes preconfigurados con el nombre del vecino.',
      '• Construcción de la red de defensores del voto el Día D.'
    ]
  }
];

warRoomCards.forEach((card, idx) => {
  const cX = 16 + idx * 89;
  doc.setFillColor(colors.cardBg[0], colors.cardBg[1], colors.cardBg[2]);
  doc.roundedRect(cX, 30, 85, 84, 3, 3, 'F');
  doc.setDrawColor(colors.cardBorder[0], colors.cardBorder[1], colors.cardBorder[2]);
  doc.roundedRect(cX, 30, 85, 84, 3, 3, 'D');

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
  doc.setFontSize(7.1);
  doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
  const splitDesc = doc.splitTextToSize(card.desc, 77);
  doc.text(splitDesc, cX + 4, 58);

  // Recuadro inferior con especificaciones técnicas
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(cX + 4, 91, 77, 20, 1.5, 1.5, 'F');
  card.bullets.forEach((b, bIdx) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.4);
    doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
    doc.text(b, cX + 6, 96 + bIdx * 4.5);
  });
});

// Sección Inferior: El Ejemplo Real de Ficha de Tarima
doc.setFillColor(colors.slate[0], colors.slate[1], colors.slate[2]);
doc.roundedRect(16, 120, pageWidth - 32, 70, 3, 3, 'F');

doc.setFont('helvetica', 'bold');
doc.setFontSize(9.5);
doc.setTextColor(colors.gold[0], colors.gold[1], colors.gold[2]);
doc.text('ESTRUCTURA DEL DISCURSO AUTOMATIZADO GENERADO POR EL SISTEMA:', 22, 128);

const speechSections = [
  {
    num: '1',
    title: 'Apertura de Impacto',
    quote: '"Vecinos de San Francisco de Borja: No vengo a ofrecer castillos en el aire; nuestro mapa territorial revela que el 62% de sus reclamos son por el colapso del alcantarillado en la Calle Central."'
  },
  {
    num: '2',
    title: 'Cita Textual de Vecinos',
    quote: '"Como nos reportó el vecino Carlos del Barrio Central con fotografías exactas, no es justo que lleven semanas soportando malos olores sin una sola cuadrilla municipal."'
  },
  {
    num: '3',
    title: 'Solución Técnica Inmediata',
    quote: '"Al asumir la Alcaldía, esta misma plataforma será el portal oficial de Obras Públicas. La maquinaria se despachará según este mapa de necesidades reales, no por compadrazgos."'
  }
];

speechSections.forEach((s, idx) => {
  const sX = 22 + idx * 86;
  doc.setFillColor(colors.navy[0], colors.navy[1], colors.navy[2]);
  doc.roundedRect(sX, 134, 80, 50, 2, 2, 'F');
  doc.setDrawColor(colors.gold[0], colors.gold[1], colors.gold[2]);
  doc.roundedRect(sX, 134, 80, 50, 2, 2, 'D');

  doc.setFillColor(colors.gold[0], colors.gold[1], colors.gold[2]);
  doc.circle(sX + 8, 142, 4.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(colors.navy[0], colors.navy[1], colors.navy[2]);
  doc.text(s.num, sX + 7, 144.8);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.text(s.title, sX + 16, 143);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(colors.cardBorder[0], colors.cardBorder[1], colors.cardBorder[2]);
  const splitQuote = doc.splitTextToSize(s.quote, 72);
  doc.text(splitQuote, sX + 4, 152);
});

// ====================================================================
// SLIDE 4: GENERADOR DE CÓDIGOS QR & CAPTURA RÁPIDA DE BRIGADA
// ====================================================================
doc.addPage();
renderSlideHeader('Generador Dinámico de Códigos QR & Captura Rápida de Campo');

// Columna Izquierda: Los 3 Tipos de Código QR
doc.setFillColor(colors.cardBg[0], colors.cardBg[1], colors.cardBg[2]);
doc.roundedRect(16, 30, 126, 160, 3, 3, 'F');
doc.setDrawColor(colors.cardBorder[0], colors.cardBorder[1], colors.cardBorder[2]);
doc.roundedRect(16, 30, 126, 160, 3, 3, 'D');

doc.setFillColor(colors.navy[0], colors.navy[1], colors.navy[2]);
doc.roundedRect(16, 30, 126, 10, 3, 3, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(8.5);
doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
doc.text('MODALIDADES DEL GENERADOR QR VECTORIAL', 20, 37);

const qrTypes = [
  {
    title: '1. QR por Parroquia Específica (Inyección URL ?parish=...):',
    desc: 'Genera códigos específicos para Borja, Baeza, Papallacta, etc. Al escanearlo, el ciudadano abre el formulario con su parroquia ya preseleccionada, reduciendo la fricción y errores de captura a cero.'
  },
  {
    title: '2. QR General Cantonal:',
    desc: 'Código QR maestro para colocar en vallas publicitarias, afiches de gran formato, microperforados de la caravana vehicular y campañas virales en TikTok y Facebook.'
  },
  {
    title: '3. QR por Brigada de Territorio (?brigade=...):',
    desc: 'Asigna un código QR único a cada grupo de voluntarios o líderes barriales para medir en el War Room qué equipo está levantando más necesidades en las calles.'
  }
];

let qrY = 46;
qrTypes.forEach((t) => {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(colors.techBlue[0], colors.techBlue[1], colors.techBlue[2]);
  doc.text(t.title, 20, qrY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.1);
  doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
  const splitT = doc.splitTextToSize(t.desc, 118);
  doc.text(splitT, 20, qrY + 3.8);
  qrY += 26.5;
});

// Caja inferior de Especificaciones QR
doc.setFillColor(colors.slate[0], colors.slate[1], colors.slate[2]);
doc.roundedRect(20, 130, 118, 54, 2, 2, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(7.8);
doc.setTextColor(colors.gold[0], colors.gold[1], colors.gold[2]);
doc.text('ESPECIFICACIONES DE SALIDA PARA IMPRENTA:', 24, 136.5);

const qrSpecs = [
  '• Motor: QRCode Library v1.5 con renderizado Canvas / DataURL.',
  '• Corrección de Errores: Nivel H (High - 30% recuperación por daño físico).',
  '• Resolución: 600 x 600 px nativo, apto para gigantografías y serigrafía.',
  '• Colores: Contraste optimizado (#0B132B sobre blanco puro).',
  '• Descarga: Archivo PNG directo o impresión en afiche A4 en 1 clic.'
];

qrSpecs.forEach((s, sIdx) => {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.7);
  doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.text(s, 24, 142 + sIdx * 5);
});

// Columna Derecha: El Afiche Imprimible A4 de Campaña
doc.setFillColor(colors.cardBg[0], colors.cardBg[1], colors.cardBg[2]);
doc.roundedRect(148, 30, 133, 160, 3, 3, 'F');
doc.setDrawColor(colors.cardBorder[0], colors.cardBorder[1], colors.cardBorder[2]);
doc.roundedRect(148, 30, 133, 160, 3, 3, 'D');

doc.setFillColor(colors.gold[0], colors.gold[1], colors.gold[2]);
doc.roundedRect(148, 30, 133, 10, 3, 3, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(8.5);
doc.setTextColor(colors.navy[0], colors.navy[1], colors.navy[2]);
doc.text('PLANTILLA DE AFICHE IMPRIMIBLE A4 INCORPORADA', 152, 37);

// Tarjeta que simula el afiche A4
doc.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
doc.roundedRect(154, 45, 121, 139, 2, 2, 'F');
doc.setDrawColor(colors.gold[0], colors.gold[1], colors.gold[2]);
doc.setLineWidth(0.8);
doc.roundedRect(154, 45, 121, 139, 2, 2, 'D');

doc.setFont('helvetica', 'bold');
doc.setFontSize(7.5);
doc.setTextColor(colors.gold[0], colors.gold[1], colors.gold[2]);
doc.text('LISTA DE CAMPAÑA • CANTÓN QUIJOS', 214.5, 53, { align: 'center' });

doc.setFontSize(12);
doc.setTextColor(colors.navy[0], colors.navy[1], colors.navy[2]);
doc.text('EL CANDIDATO A LA ALCALDÍA', 214.5, 60, { align: 'center' });

doc.setFont('helvetica', 'italic');
doc.setFontSize(8);
doc.setTextColor(colors.emerald[0], colors.emerald[1], colors.emerald[2]);
doc.text('"El Quijos que Soñamos"', 214.5, 66, { align: 'center' });

// Caja central de llamado a la acción
doc.setFillColor(248, 250, 252);
doc.roundedRect(160, 70, 109, 18, 1.5, 1.5, 'F');
doc.setDrawColor(colors.cardBorder[0], colors.cardBorder[1], colors.cardBorder[2]);
doc.roundedRect(160, 70, 109, 18, 1.5, 1.5, 'D');

doc.setFont('helvetica', 'bold');
doc.setFontSize(7.8);
doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
doc.text('¿QUÉ NECESITA TU BARRIO EN ESTA PARROQUIA?', 214.5, 76, { align: 'center' });

doc.setFont('helvetica', 'normal');
doc.setFontSize(6.8);
doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
doc.text('Escanea este código QR, toma una fotografía y construyamos juntos el Plan.', 214.5, 82, { align: 'center' });

// Mock de Código QR central
doc.setFillColor(colors.navy[0], colors.navy[1], colors.navy[2]);
doc.roundedRect(192.5, 92, 44, 44, 2, 2, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(8);
doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
doc.text('CÓDIGO QR', 214.5, 112, { align: 'center' });
doc.setFontSize(6.5);
doc.text('ALTA RESOLUCIÓN', 214.5, 118, { align: 'center' });

doc.setFont('helvetica', 'bold');
doc.setFontSize(7.2);
doc.setTextColor(colors.navy[0], colors.navy[1], colors.navy[2]);
doc.text('1. Abre la cámara • 2. Apunta al código • 3. Sube tu reporte en 30 seg', 214.5, 144, { align: 'center' });

doc.setFont('helvetica', 'normal');
doc.setFontSize(6.5);
doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
doc.text('https://plataforma.quijos.gob.ec/quijos?parish=Borja', 214.5, 150, { align: 'center' });

doc.setFontSize(6);
doc.text('Plataforma Tecnológica de Escucha Barrial SOLINTEEC', 214.5, 178, { align: 'center' });

// ====================================================================
// SLIDE 5: ESPECIFICACIONES TÉCNICAS DE SOFTWARE & HOJA DE RUTA
// ====================================================================
doc.addPage();
renderSlideHeader('Especificaciones Técnicas del Stack & Hoja de Ruta de Transición');

// Tabla de Especificaciones de Software
autoTable(doc, {
  startY: 30,
  margin: { left: 16, right: 16 },
  head: [['CAPA TÉCNICA', 'TECNOLOGÍA IMPLEMENTADA', 'ESPECIFICACIÓN / FUNCIONALIDAD']],
  body: [
    ['Frontend / UX', 'Next.js 16 (App Router), React 19, Tailwind CSS v4', 'Server Components, diseño responsive, soporte Dark/Light mode, Server Actions reactivas.'],
    ['Base de Datos', 'MariaDB / MySQL con Prisma ORM 5.22', 'Campos de Tenant: campaignMode (Boolean), candidateName, campaignSlogan, campaignListNumber.'],
    ['PWA & Offline', 'Serwist PWA Service Worker v9.5', 'Soporte para instalación en celulares de brigadistas y caché local para recorridos en territorio.'],
    ['Códigos QR', 'QRCode Library v1.5 (Node & Client)', 'Generación vectorial Canvas/PNG 600px, nivel de corrección H, inyección de URL con ?parish=...'],
    ['Seguridad & Logs', 'Auditoría Centralizada (/storage/logs/)', 'Registro de activación/desactivación del switch de campaña, sesiones con cookies HttpOnly seguras.'],
    ['Reportabilidad', 'jsPDF 4.2, jsPDF-AutoTable, ExcelJS 4.4', 'Exportación de Fichas de Tarima, Dossier Foliado (.pdf) y Matriz Ejecutiva (.xlsx) en vivo.']
  ],
  theme: 'grid',
  headStyles: {
    fillColor: [11, 19, 43],
    textColor: [245, 158, 11],
    fontStyle: 'bold',
    fontSize: 8,
    halign: 'left'
  },
  bodyStyles: {
    fontSize: 7.2,
    textColor: [15, 23, 42]
  },
  columnStyles: {
    0: { cellWidth: 38, fontStyle: 'bold' },
    1: { cellWidth: 70 },
    2: { cellWidth: 'auto' }
  }
});

// Sección de Conclusión y Transición Contractual
doc.setFillColor(colors.navy[0], colors.navy[1], colors.navy[2]);
doc.roundedRect(16, 126, pageWidth - 32, 64, 3, 3, 'F');

doc.setFont('helvetica', 'bold');
doc.setFontSize(9.5);
doc.setTextColor(colors.gold[0], colors.gold[1], colors.gold[2]);
doc.text('HOJA DE RUTA CONTRACTUAL PARA LA REUNIÓN DE CIERRE:', 24, 135);

const legalSteps = [
  '1. Contrato Privado de Servicios de Campaña (Hoy): Despliegue inmediato en 72 horas por $2.800 USD (o $950/mes). Cláusula de confidencialidad y propiedad 100% de la base de datos de votantes.',
  '2. Día D + 1 (Alcalde Electo): Con solo apagar el switch, el sistema se convierte en el portal municipal oficial en plataforma.quijos.gob.ec sin curvas de aprendizaje.',
  '3. Contratación Municipal SERCOP (Posesión): Adjudicación institucional bajo el PAC municipal: vía Ínfima Cuantía (hasta $10.000 USD directos) o Menor Cuantía ($25.000 a $32.000 USD) para Geocercas Viales y ERP.'
];

legalSteps.forEach((st, idx) => {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.6);
  doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
  const splitSt = doc.splitTextToSize(st, pageWidth - 48);
  doc.text(splitSt, 24, 144 + idx * 11);
});

// Firma y contacto institucional
doc.setFont('helvetica', 'bold');
doc.setFontSize(8.5);
doc.setTextColor(colors.gold[0], colors.gold[1], colors.gold[2]);
doc.text('SOLINTEEC DEVTECH S.A.S. — Consultoría Gubernamental, Datos y Modernización de Ciudades', 24, 180);

doc.setFont('helvetica', 'normal');
doc.setFontSize(7.5);
doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
doc.text('Contacto Directo de Consultoría: projects@solinteec.com • pquishpe@solinteec.com • https://solinteec.com', 24, 185);

// Guardar archivo PDF en docs y public/downloads
const outputDocsPath = path.join(process.cwd(), 'docs/SOLINTEEC_Especificaciones_Tecnicas_Modo_Campana.pdf');
const outputPublicDir = path.join(process.cwd(), 'public/downloads');
if (!fs.existsSync(outputPublicDir)) {
  fs.mkdirSync(outputPublicDir, { recursive: true });
}
const outputPublicPath = path.join(outputPublicDir, 'SOLINTEEC_Especificaciones_Tecnicas_Modo_Campana.pdf');

const pdfBytes = doc.output('arraybuffer');
fs.writeFileSync(outputDocsPath, Buffer.from(pdfBytes));
fs.writeFileSync(outputPublicPath, Buffer.from(pdfBytes));

console.log(`✅ PDF de Especificaciones Técnicas generado exitosamente:`);
console.log(`- ${outputDocsPath} (${(fs.statSync(outputDocsPath).size / 1024).toFixed(1)} KB)`);
console.log(`- ${outputPublicPath} (${(fs.statSync(outputPublicPath).size / 1024).toFixed(1)} KB)`);

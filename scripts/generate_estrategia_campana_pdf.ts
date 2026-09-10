import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as fs from 'fs';
import * as path from 'path';

// Cargar logos oficiales de SOLINTEEC DEVTECH S.A.S.
const logoWhitePath = path.join(process.cwd(), 'docs/assets/solinteec/solinteec-logo-white.png');

const logoWhiteBase64 = fs.existsSync(logoWhitePath) 
  ? `data:image/png;base64,${fs.readFileSync(logoWhitePath).toString('base64')}`
  : null;

// Relación de aspecto real del logo (1024 x 849 píxeles -> ratio = 1.2061)
const LOGO_ASPECT_RATIO = 1024 / 849;

// Paleta Corporativa SOLINTEEC DEVTECH (Acento político y de gobierno)
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
  category: string = 'ESTRATEGIA POLÍTICA DIGITAL & INTELIGENCIA TERRITORIAL'
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
  doc.text('SOLINTEEC DEVTECH S.A.S. • Consultoría Estratégica & Tecnología Electoral', 16, pageHeight - 5.5);
  doc.text('Inteligencia Territorial de Campaña & Transición hacia la Gestión Municipal', pageWidth - 16, pageHeight - 5.5, { align: 'right' });
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

// Badge superior de campaña
doc.setFillColor(colors.slate[0], colors.slate[1], colors.slate[2]);
doc.roundedRect(28, 56, 175, 8, 2, 2, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(7.5);
doc.setTextColor(colors.goldLight[0], colors.goldLight[1], colors.goldLight[2]);
doc.text('ESTRATEGIA POLÍTICA DE PRECISIÓN • ELECCIONES SECCIONALES ECUADOR', 32, 61.5);

// Título Principal
doc.setFont('helvetica', 'bold');
doc.setFontSize(22);
doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
doc.text('INTELIGENCIA TERRITORIAL DE CAMPAÑA &', 28, 76);
doc.text('PLATAFORMA DE ESCUCHA CIUDADANA', 28, 86);

// Subtítulo descriptivo
doc.setFont('helvetica', 'normal');
doc.setFontSize(10.5);
doc.setTextColor(colors.gold[0], colors.gold[1], colors.gold[2]);
doc.text('Levantamiento de Información Real por Parroquia y Barrio, Discurso Hiperlocalizado,', 28, 97);
doc.text('Mapeo de Necesidades Comunitarias y Hoja de Ruta de Transición hacia la Alcaldía', 28, 103);

// Tarjeta con 3 Pilares Fundamentales
doc.setFillColor(colors.slate[0], colors.slate[1], colors.slate[2]);
doc.roundedRect(28, 114, pageWidth - 56, 46, 3, 3, 'F');

const pillars = [
  {
    title: '1. Diagnóstico Real en Territorio',
    desc: 'Los ciudadanos reportan con foto y geolocalización las necesidades de su barrio (Baeza, Borja, Papallacta, Cuyuja, Cosanga, Sumaco). Cero promesas vacías en tarima.'
  },
  {
    title: '2. Discurso de Tarima Quirúrgico',
    desc: 'El candidato llega al recorrido conociendo la radiografía exacta del sector: porcentaje de quejas por agua, alcantarillado, vías o alumbrado antes que sus adversarios.'
  },
  {
    title: '3. Transición Directa a la Alcaldía',
    desc: 'Al ganar las elecciones, el candidato institucionaliza la plataforma como el portal oficial del GAD Municipal (plataforma.quijos.gob.ec), activando el G-CRM y el ERP.'
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
doc.text('SOLINTEEC DEVTECH S.A.S. • División de Consultoría y Estrategia Digital', 28, 178);

doc.setFont('helvetica', 'normal');
doc.setFontSize(8);
doc.setTextColor(colors.gold[0], colors.gold[1], colors.gold[2]);
doc.text('Documento Exclusivo para el Candidato a la Alcaldía y su Equipo de Estrategia de Campaña', 28, 184);

// ====================================================================
// SLIDE 2: CAMPAÑA TRADICIONAL VS. POLÍTICA BASADA EN DATOS
// ====================================================================
doc.addPage();
renderSlideHeader('La Ventaja Competitiva: Campaña Tradicional vs. Política Basada en Datos');

// Columna Izquierda: El Desgaste de la Campaña Tradicional
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
doc.text('[EL ERROR HABITUAL] La Campaña Tradicional a Ciegas', 20, 37);

const traditionalPoints = [
  {
    title: '1. Discursos Genéricos e Improvisados:',
    desc: 'El candidato llega a Borja o Papallacta con frases cliché ("vamos a apoyar a la juventud y al campo"). El votante siente que no conoce su realidad y desconecta su atención.'
  },
  {
    title: '2. Desconexión con el Dolor Real del Barrio:',
    desc: 'La comitiva promete canchas deportivas en un barrio donde la verdadera urgencia no resuelta es el agua turbia o el colapso del alcantarillado, generando rechazo vecinal.'
  },
  {
    title: '3. Gasto Desenfrenado sin Retorno Electoral:',
    desc: 'Grandes inversiones en tarimas, sonido, camisetas y gigantografías que no dejan base de datos, no generan confianza y se olvidan al día siguiente de la concentración.'
  },
  {
    title: '4. Percepción de "Más de lo Mismo":',
    desc: 'La ciudadanía ve a otro político que pide el voto y promete lo de siempre, sin demostrar capacidad técnica ni herramientas modernas para resolver sus problemas.'
  }
];

let tY = 46;
traditionalPoints.forEach((p) => {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(colors.rose[0], colors.rose[1], colors.rose[2]);
  doc.text(p.title, 20, tY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.3);
  doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
  const splitTrad = doc.splitTextToSize(p.desc, 118);
  doc.text(splitTrad, 20, tY + 4);
  tY += 27.5;
});

// Caja inferior de alerta en campaña tradicional
doc.setFillColor(254, 226, 226);
doc.roundedRect(19, 156, 120, 28, 2, 2, 'F');
doc.setDrawColor(239, 68, 68);
doc.setLineWidth(0.6);
doc.roundedRect(19, 156, 120, 28, 2, 2, 'D');
doc.setFont('helvetica', 'bold');
doc.setFontSize(8);
doc.setTextColor(colors.rose[0], colors.rose[1], colors.rose[2]);
doc.text('EL RIESGO CRÍTICO EN URNAS:', 23, 163);

doc.setFont('helvetica', 'normal');
doc.setFontSize(7.2);
doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
const alertTrad = doc.splitTextToSize(
  '"Gastar miles de dólares en tarimas y perifoneo sin saber qué le duele a cada barrio es regalarle la elección al contrincante. El elector castiga la demagogia y premia la preparación técnica."',
  112
);
doc.text(alertTrad, 23, 168.5);

// Columna Derecha: La Estrategia Inteligente SOLINTEEC
doc.setFillColor(240, 253, 244);
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
doc.text('[LA VENTAJA] Estrategia Territorial Basada en Datos (SOLINTEEC)', 152, 37);

const modernPoints = [
  {
    title: '1. Precisión Quirúrgica en Cada Visita:',
    desc: 'En el vehículo, antes de bajar al Barrio San Francisco de Borja, el candidato revisa su tablet: sabe que el 65% de quejas son de alcantarillado y qué vecinos han reportado.'
  },
  {
    title: '2. Mensaje que Genera Impacto Emocional Inmediato:',
    desc: '"Vecinos de San Francisco: no vengo a adivinar; sé exactamente que la alcantarilla de la calle principal colapsó hace 3 semanas y que el parque carece de luz. Lo tengo registrado en nuestro mapa."'
  },
  {
    title: '3. El Efecto Psicológico del "Alcalde en Funciones":',
    desc: 'La gente percibe que este candidato ya está trabajando y resolviendo antes de asumir el cargo. Proyecta solvencia, preparación técnica y liderazgo sobre sus competidores.'
  },
  {
    title: '4. Big Data Comunitario y Red de Votantes:',
    desc: 'Cada reporte cívico levanta una coordenada, un barrio y un problema. Se construye una base viva de líderes barriales que se convierten en los defensores del voto el día D.'
  }
];

let mY = 46;
modernPoints.forEach((p) => {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(colors.emerald[0], colors.emerald[1], colors.emerald[2]);
  doc.text(p.title, 152, mY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.3);
  doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
  const splitMod = doc.splitTextToSize(p.desc, 125);
  doc.text(splitMod, 152, mY + 4);
  mY += 27.5;
});

// Caja inferior de impacto electoral
doc.setFillColor(colors.navy[0], colors.navy[1], colors.navy[2]);
doc.roundedRect(151, 156, 127, 28, 2, 2, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(8);
doc.setTextColor(colors.gold[0], colors.gold[1], colors.gold[2]);
doc.text('EL PRINCIPIO CLAVE DE LA CAMPAÑA MODERNA:', 155, 163);

doc.setFont('helvetica', 'normal');
doc.setFontSize(7.2);
doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
const alertCampaign = doc.splitTextToSize(
  '"El candidato que adivina pierde credibilidad. El candidato que demuestra con datos reales que conoce la calle, el bache y la necesidad de cada familia, gana la confianza y el voto popular en las urnas."',
  119
);
doc.text(alertCampaign, 155, 168.5);

// ====================================================================
// SLIDE 3: OPERACIÓN EN TERRITORIO: CÓMO SE USA EN CAMPAÑA
// ====================================================================
doc.addPage();
renderSlideHeader('Operación en Territorio: 3 Tácticas de Activación de Campaña');

// 3 Mecánicas Operativas
const tactics = [
  {
    step: 'TÁCTICA 1: BRIGADAS PUERTA A PUERTA',
    title: 'Voluntarios con la App en el Celular',
    badge: 'ACTIVACIÓN EN BARRIOS',
    color: colors.techBlue,
    desc: 'Los brigadistas del candidato recorren Borja, Papallacta o Cosanga. No tocan la puerta a pedir el voto: tocan a escuchar: "Buenas tardes vecina, venimos de parte de la candidatura a levantar el reporte del problema de su calle para el Plan de Obras Prioritarias". Toman la foto en vivo y la vecina ve su problema subido al mapa cantonal.',
    bullets: [
      '• Canal: App PWA móvil en el celular del brigadista.',
      '• Tiempo: 45 seg por levantamiento con foto y GPS.',
      '• Efecto: El votante se siente respetado y escuchado.'
    ]
  },
  {
    step: 'TÁCTICA 2: CÓDIGOS QR EN MATERIAL',
    title: 'Participación Masiva Descentralizada',
    badge: 'VIRALIDAD EN REDES & VALLAS',
    color: colors.gold,
    desc: 'En volantes, microperforados de autos, afiches y publicaciones de TikTok/Facebook se coloca un QR directo: "¿Qué necesita tu barrio? Repórtalo aquí y construyamos el Plan Cantonal juntos". La ciudadanía interactúa libremente y la plataforma se convierte en el tema de conversación comunitaria.',
    bullets: [
      '• Canal: Microperforados, volantes, vallas y redes.',
      '• Impacto: Conexión masiva con el electorado joven.',
      '• Efecto: Descentralización del levantamiento cantonal.'
    ]
  },
  {
    step: 'TÁCTICA 3: WAR ROOM DEL CANDIDATO',
    title: 'Ficha Ejecutiva para la Tarima',
    badge: 'DISCURSO EN TIEMPO REAL',
    color: colors.emerald,
    desc: 'El Cuarto de Guerra (War Room) de la campaña monitorea en pantalla gigante el mapa del cantón con sus puntos de calor. Antes de que el candidato suba a tarima en cualquier caserío o parroquia, el equipo le entrega una ficha con las 3 necesidades top de ese sector para pulverizar el debate político.',
    bullets: [
      '• Canal: Panel en vivo en la tablet del candidato.',
      '• Entrega: Ficha ejecutiva de 1 pág antes de tarima.',
      '• Efecto: Discurso demoledor contra la improvisación.'
    ]
  }
];

tactics.forEach((card, idx) => {
  const cX = 16 + idx * 89;
  doc.setFillColor(colors.cardBg[0], colors.cardBg[1], colors.cardBg[2]);
  doc.roundedRect(cX, 30, 85, 78, 3, 3, 'F');
  doc.setDrawColor(colors.cardBorder[0], colors.cardBorder[1], colors.cardBorder[2]);
  doc.roundedRect(cX, 30, 85, 78, 3, 3, 'D');

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
  doc.setFontSize(7.2);
  doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
  const splitDesc = doc.splitTextToSize(card.desc, 77);
  doc.text(splitDesc, cX + 4, 58);

  // Recuadro inferior con especificaciones
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(cX + 4, 86, 77, 19, 1.5, 1.5, 'F');
  card.bullets.forEach((b, bIdx) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
    doc.text(b, cX + 6, 91 + bIdx * 4.5);
  });
});

// Sección Inferior: El Ciclo de Fidelización del Votante
doc.setFillColor(colors.slate[0], colors.slate[1], colors.slate[2]);
doc.roundedRect(16, 114, pageWidth - 32, 76, 3, 3, 'F');

doc.setFont('helvetica', 'bold');
doc.setFontSize(9.5);
doc.setTextColor(colors.gold[0], colors.gold[1], colors.gold[2]);
doc.text('EL CICLO ELECTORAL: DE LA ESCUCHA CIUDADANA AL VOTO CONSCIENTE', 22, 122);

const cycleSteps = [
  {
    num: '1',
    title: 'Reporte Vecinal',
    detail: 'Ciudadano reporta en 1 minuto con foto de su calle o parque.'
  },
  {
    num: '2',
    title: 'Mapeo Territorial',
    detail: 'El sistema geolocaliza el problema en la parroquia y barrio correspondiente.'
  },
  {
    num: '3',
    title: 'Discurso de Compromiso',
    detail: 'El candidato visita el barrio y asume el compromiso público de solución técnica.'
  },
  {
    num: '4',
    title: 'Fidelización & Victoria',
    detail: 'El vecino se convierte en multiplicador cívico de la campaña hasta el día de la votación.'
  }
];

cycleSteps.forEach((s, idx) => {
  const fX = 22 + idx * 64;
  doc.setFillColor(colors.navy[0], colors.navy[1], colors.navy[2]);
  doc.roundedRect(fX, 128, 58, 56, 2, 2, 'F');
  doc.setDrawColor(colors.gold[0], colors.gold[1], colors.gold[2]);
  doc.roundedRect(fX, 128, 58, 56, 2, 2, 'D');

  doc.setFillColor(colors.gold[0], colors.gold[1], colors.gold[2]);
  doc.circle(fX + 8, 136, 4.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(colors.navy[0], colors.navy[1], colors.navy[2]);
  doc.text(s.num, fX + 7, 138.8);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
  const splitCycleTitle = doc.splitTextToSize(s.title, 42);
  doc.text(splitCycleTitle, fX + 15, 137);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(colors.cardBorder[0], colors.cardBorder[1], colors.cardBorder[2]);
  const splitCycleDesc = doc.splitTextToSize(s.detail, 51);
  doc.text(splitCycleDesc, fX + 4, 150);
});

// ====================================================================
// SLIDE 4: ANÁLISIS PRESUPUESTARIO REAL DE CAMPAÑA & MODELOS DE INVERSIÓN
// ====================================================================
doc.addPage();
renderSlideHeader('Análisis Presupuestario Real de Campaña (Quijos / Napo) & Pricing');

// Columna Izquierda: La Realidad Financiera de la Campaña en Quijos
doc.setFillColor(colors.cardBg[0], colors.cardBg[1], colors.cardBg[2]);
doc.roundedRect(16, 30, 126, 160, 3, 3, 'F');
doc.setDrawColor(colors.cardBorder[0], colors.cardBorder[1], colors.cardBorder[2]);
doc.roundedRect(16, 30, 126, 160, 3, 3, 'D');

doc.setFillColor(colors.navy[0], colors.navy[1], colors.navy[2]);
doc.roundedRect(16, 30, 126, 10, 3, 3, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(8.5);
doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
doc.text('DATOS REALES DEL ENTORNO ELECTORAL (CNE & CAMPAÑA)', 20, 37);

const campaignData = [
  {
    title: 'Padrón Electoral Cantón Quijos (~6.000 electores):',
    desc: 'Electores registrados en Baeza (cabecera), Borja, Papallacta, Cuyuja, Cosanga y Sumaco. En cantones pequeños, cada voto se disputa puerta a puerta.'
  },
  {
    title: 'Base Legal CNE (Art. 209 Código de la Democracia):',
    desc: 'La norma fija $0,40 USD/elector y un piso legal base de $5.000 USD para cantones menores a 15.000 empadronados, más el 30% de incremento amazónico (~$6.500 USD reportables ante CNE).'
  },
  {
    title: 'Presupuesto Operativo Real en Territorio ($15.000 - $30.000 USD):',
    desc: 'Considerando logística de movilización continua por las 6 parroquias, mítines, alimentación de brigadistas, tarimas, sonido y material cívico durante los 3 meses de campaña.'
  },
  {
    title: 'Asignación Óptima a Tecnología & Datos (10% a 12%):',
    desc: 'Destinar $2.800 USD (o $950/mes) representa apenas el 10% del esfuerzo de campaña, permitiendo al candidato tener una herramienta de nivel presidencial a costo local.'
  }
];

let cY = 45;
campaignData.forEach((d) => {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(colors.techBlue[0], colors.techBlue[1], colors.techBlue[2]);
  doc.text(d.title, 20, cY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.1);
  doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
  const splitC = doc.splitTextToSize(d.desc, 118);
  doc.text(splitC, 20, cY + 3.8);
  cY += 24.5;
});

// Caja inferior con desglose presupuestario realista
doc.setFillColor(colors.slate[0], colors.slate[1], colors.slate[2]);
doc.roundedRect(20, 144, 118, 42, 2, 2, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(7.8);
doc.setTextColor(colors.gold[0], colors.gold[1], colors.gold[2]);
doc.text('DISTRIBUCIÓN RECOMENDADA DEL PRESUPUESTO ($20.000 - $30.000):', 24, 150.5);

const budgetBreakdown = [
  '• Movilización, Combustible & Caravanas (6 parroquias): 35% ($7.000 - $10.500)',
  '• Tarimas, Sonido & Eventos Masivos: 25% ($5.000 - $7.500)',
  '• Brigadistas, Alimentación & Logística Vecinal: 15% ($3.000 - $4.500)',
  '• Material Físico (Banderas, Camisetas, Afiches): 15% ($3.000 - $4.500)',
  '• Tecnología & Datos SOLINTEEC (Cerebro Electoral): 10% ($2.800 USD)'
];

budgetBreakdown.forEach((b, bIdx) => {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.text(b, 24, 156.5 + bIdx * 4.8);
});

// Columna Derecha: Los 2 Modelos de Precios Calibrados
doc.setFillColor(colors.cardBg[0], colors.cardBg[1], colors.cardBg[2]);
doc.roundedRect(148, 30, 133, 160, 3, 3, 'F');
doc.setDrawColor(colors.cardBorder[0], colors.cardBorder[1], colors.cardBorder[2]);
doc.roundedRect(148, 30, 133, 160, 3, 3, 'D');

doc.setFillColor(colors.emerald[0], colors.emerald[1], colors.emerald[2]);
doc.roundedRect(148, 30, 133, 10, 3, 3, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(8.5);
doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
doc.text('PROPUESTA ECONÓMICA DE CAMPAÑA SOLINTEEC', 152, 37);

// Opción 1: Paquete Integral de Campaña
doc.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
doc.roundedRect(152, 45, 125, 66, 2, 2, 'F');
doc.setDrawColor(colors.emerald[0], colors.emerald[1], colors.emerald[2]);
doc.setLineWidth(0.6);
doc.roundedRect(152, 45, 125, 66, 2, 2, 'D');

doc.setFont('helvetica', 'bold');
doc.setFontSize(8.5);
doc.setTextColor(colors.navy[0], colors.navy[1], colors.navy[2]);
doc.text('OPCIÓN 1: PAQUETE ÚNICO DE CAMPAÑA ELECTORAL', 156, 52);
doc.setFontSize(13);
doc.setTextColor(colors.emerald[0], colors.emerald[1], colors.emerald[2]);
doc.text('$ 2.800,00 USD (o 2 cuotas de $1.400)', 156, 59);

doc.setFont('helvetica', 'normal');
doc.setFontSize(7.2);
doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
const opt1Desc = doc.splitTextToSize(
  '• Plataforma Ciudadana activa con imagen, colores y propuesta del candidato.\n' +
  '• Mapeo de las 6 parroquias con sus barrios oficiales de Quijos precargados.\n' +
  '• Panel móvil exclusivo para el Candidato y Jefe de Campaña en tiempo real.\n' +
  '• Servidor en la nube de alta disponibilidad y soporte técnico 24/7 hasta el Día D.\n' +
  '• Generación de reportes ejecutivos para el discurso antes de cada mitin territorial.',
  117
);
doc.text(opt1Desc, 156, 65);

// Opción 2: Modelo Mensual de Acompañamiento
doc.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
doc.roundedRect(152, 116, 125, 68, 2, 2, 'F');
doc.setDrawColor(colors.gold[0], colors.gold[1], colors.gold[2]);
doc.setLineWidth(0.6);
doc.roundedRect(152, 116, 125, 68, 2, 2, 'D');

doc.setFont('helvetica', 'bold');
doc.setFontSize(8.5);
doc.setTextColor(colors.navy[0], colors.navy[1], colors.navy[2]);
doc.text('OPCIÓN 2: RETAINER / MENSUALIDAD DE CAMPAÑA', 156, 123);
doc.setFontSize(13);
doc.setTextColor(colors.gold[0], colors.gold[1], colors.gold[2]);
doc.text('$ 950,00 USD / mes (Plan 3 meses = $2.850)', 156, 130);

doc.setFont('helvetica', 'normal');
doc.setFontSize(7.2);
doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
const opt2Desc = doc.splitTextToSize(
  '• Pago mensualizado que no descapitaliza el flujo de caja del candidato.\n' +
  '• Todos los beneficios tecnológicos de la Opción 1 incluidos.\n' +
  '• Asesoría semanal de datos: entregamos el dossier de prioridades barriales cada lunes para planificar la agenda de visitas de la semana.\n' +
  '• Ajustes y personalización de módulos según el avance de la contienda política.',
  117
);
doc.text(opt2Desc, 156, 136);

// ====================================================================
// SLIDE 5: EL DÍA DESPUÉS DE GANAR (LA TRANSICIÓN AL GAD MUNICIPAL)
// ====================================================================
doc.addPage();
renderSlideHeader('El Día Después de Ganar: De la Campaña a la Alcaldía Oficial');

// 3 Tarjetas del Retorno de Inversión Definitivo
const transitionCards = [
  {
    phase: 'FASE 1: EN CAMPAÑA (HOY)',
    title: 'Financiamiento Privado de Campaña',
    badge: 'INVERSIÓN: $2.800 A $3.500 USD',
    color: colors.gold,
    desc: '• Se financia con fondos de campaña privada sin trámites burocráticos ni SERCOP.\n• Genera la base cívica, identifica líderes y diferencia al candidato en Quijos.\n• Asegura votos en cada barrio y conduce a la victoria electoral en las urnas.',
    outcomes: [
      'Entregables Inmediatos de Campaña:',
      '• App PWA y dominio de campaña activo.',
      '• Mapeo barrial en las 6 parroquias de Quijos.',
      '• Fichas ejecutivas para cada recorrido.'
    ]
  },
  {
    phase: 'FASE 2: ALCALDE ELECTO (DÍA D + 1)',
    title: 'Transición Inmediata sin Curva',
    badge: 'CERO GASTO IMPROVISADO',
    color: colors.techBlue,
    desc: '• El nuevo Alcalde asume funciones con la radiografía más completa del cantón.\n• La ciudadanía ya conoce, usa y confía en la plataforma.\n• La herramienta pasa a ser institucionalizada en plataforma.quijos.gob.ec.',
    outcomes: [
      'Impacto en los Primeros 100 Días:',
      '• Plan de obras priorizado con datos reales.',
      '• Demostración de liderazgo tecnológico.',
      '• Validación ciudadana antes de contratar.'
    ]
  },
  {
    phase: 'FASE 3: GAD MUNICIPAL (SERCOP)',
    title: 'El Gran Contrato Municipal',
    badge: 'CONTRATO: $9.800 A $32.000 USD',
    color: colors.emerald,
    desc: '• Una vez posesionado, el GAD contrata la ampliación institucional bajo el PAC.\n• Módulos de Geocercas Viales, Obras Públicas, Agua y Blindaje Contraloría.\n• Financiado 100% por el presupuesto oficial municipal.',
    outcomes: [
      'Vías de Contratación Legal SERCOP:',
      '• Ínfima Cuantía (hasta $10.000 USD en 72h).',
      '• Menor Cuantía ($25.000 - $32.000 USD).',
      '• Plena conformidad COOTAD & LOSNCP.'
    ]
  }
];

transitionCards.forEach((act, idx) => {
  const aX = 16 + idx * 89;
  doc.setFillColor(colors.cardBg[0], colors.cardBg[1], colors.cardBg[2]);
  doc.roundedRect(aX, 30, 85, 96, 3, 3, 'F');
  doc.setDrawColor(colors.cardBorder[0], colors.cardBorder[1], colors.cardBorder[2]);
  doc.roundedRect(aX, 30, 85, 96, 3, 3, 'D');

  doc.setFillColor(act.color[0], act.color[1], act.color[2]);
  doc.roundedRect(aX, 30, 85, 9.5, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.8);
  doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.text(act.phase, aX + 4, 36.8);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(colors.navy[0], colors.navy[1], colors.navy[2]);
  doc.text(act.title, aX + 4, 46.5);

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
  doc.setFontSize(7.2);
  doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
  const splitActDesc = doc.splitTextToSize(act.desc, 77);
  doc.text(splitActDesc, aX + 4, 60);

  // Recuadro inferior de resultados
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(aX + 4, 88, 77, 34, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(act.color[0], act.color[1], act.color[2]);
  doc.text(act.outcomes[0], aX + 6, 94);

  for (let oIdx = 1; oIdx < act.outcomes.length; oIdx++) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
    doc.text(act.outcomes[oIdx], aX + 6, 94 + oIdx * 5.5);
  }
});

// Sección de Conclusión para el Candidato
doc.setFillColor(colors.navy[0], colors.navy[1], colors.navy[2]);
doc.roundedRect(16, 132, pageWidth - 32, 58, 3, 3, 'F');

doc.setFont('helvetica', 'bold');
doc.setFontSize(10);
doc.setTextColor(colors.gold[0], colors.gold[1], colors.gold[2]);
doc.text('EL MENSAJE DEFINITIVO PARA EL EQUIPO DE CAMPAÑA:', 24, 141);

const roadmap = [
  '1. Inversión Mínima de Alto Retorno: Con $2.800 USD la campaña adquiere un cerebro de inteligencia territorial que ningún otro candidato tiene.',
  '2. Validación en la Calle: Cada reporte levantado en Borja, Baeza o Papallacta es un votante escuchado y fidelizado con nombre, apellido y teléfono.',
  '3. De Candidato a Alcalde: Al triunfar, la plataforma se institucionaliza como el sistema oficial del Municipio de Quijos sin pérdidas de tiempo.'
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
doc.text('SOLINTEEC DEVTECH S.A.S. — Tecnología, Datos y Estrategia para Gobiernos Ganadores', 24, 178);
doc.setFont('helvetica', 'normal');
doc.setFontSize(7.8);
doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
doc.text('Contacto Directo de Consultoría: projects@solinteec.com • pquishpe@solinteec.com • https://solinteec.com', 24, 183.5);

// Guardar archivo PDF
const outputDocsPath = path.join(process.cwd(), 'docs/SOLINTEEC_Estrategia_Tecnologica_Campana_Politica.pdf');
const outputPublicDir = path.join(process.cwd(), 'public/downloads');
if (!fs.existsSync(outputPublicDir)) {
  fs.mkdirSync(outputPublicDir, { recursive: true });
}
const outputPublicPath = path.join(outputPublicDir, 'SOLINTEEC_Estrategia_Tecnologica_Campana_Politica.pdf');

const pdfBytes = doc.output('arraybuffer');
fs.writeFileSync(outputDocsPath, Buffer.from(pdfBytes));
fs.writeFileSync(outputPublicPath, Buffer.from(pdfBytes));

console.log(`✅ PDF de Campaña generado exitosamente:`);
console.log(`- ${outputDocsPath} (${(fs.statSync(outputDocsPath).size / 1024).toFixed(1)} KB)`);
console.log(`- ${outputPublicPath} (${(fs.statSync(outputPublicPath).size / 1024).toFixed(1)} KB)`);

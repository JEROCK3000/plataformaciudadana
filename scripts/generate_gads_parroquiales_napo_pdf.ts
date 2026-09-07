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
const colors = {
  navy: [11, 19, 43],           // #0B132B Azul Noche Institucional
  slate: [28, 37, 65],          // #1C2541 Azul Pizarra
  techBlue: [58, 80, 107],      // #3A506B Azul Técnico
  gold: [197, 155, 39],         // #C59B27 Oro Solinteec
  goldLight: [245, 158, 11],    // #F59E0B Ámbar Dorado
  emerald: [5, 150, 105],       // #059669 Verde Éxito
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

// Función auxiliar para encabezado estándar de diapositivas
function renderSlideHeader(
  title: string, 
  category: string = 'ARQUITECTURA TERRITORIAL & MODELO DE LICENCIAMIENTO'
) {
  // Barra superior institucional
  doc.setFillColor(colors.navy[0], colors.navy[1], colors.navy[2]);
  doc.rect(0, 0, pageWidth, 24, 'F');

  // Línea dorada divisoria
  doc.setFillColor(colors.gold[0], colors.gold[1], colors.gold[2]);
  doc.rect(0, 24, pageWidth, 1.5, 'F');

  // Categoría en barra superior
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(colors.gold[0], colors.gold[1], colors.gold[2]);
  doc.text(category.toUpperCase(), 16, 10);

  // Título de la diapositiva
  doc.setFontSize(13);
  doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.text(title, 16, 18);

  // Logo Solinteec en esquina superior derecha
  if (logoWhiteBase64) {
    doc.addImage(logoWhiteBase64, 'PNG', pageWidth - 46, 5, 32, 14);
  }

  // Pie de página institucional
  doc.setFillColor(colors.cardBorder[0], colors.cardBorder[1], colors.cardBorder[2]);
  doc.rect(16, pageHeight - 12, pageWidth - 32, 0.4, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
  doc.text('SOLINTEEC DEVTECH S.A.S. • Dirección GovTech & Modernización Institucional', 16, pageHeight - 6);
  doc.text('Confidencial & Exclusivo • Caso Provincia de Napo', pageWidth - 16, pageHeight - 6, { align: 'right' });
}

// ==========================================
// SLIDE 1: PORTADA EJECUTIVA ENTERPRISE
// ==========================================
doc.setFillColor(colors.navy[0], colors.navy[1], colors.navy[2]);
doc.rect(0, 0, pageWidth, pageHeight, 'F');

// Patrón de acento dorado
doc.setFillColor(colors.gold[0], colors.gold[1], colors.gold[2]);
doc.rect(0, 0, 10, pageHeight, 'F');
doc.rect(pageWidth - 10, 0, 10, pageHeight, 'F');
doc.rect(10, pageHeight - 6, pageWidth - 20, 6, 'F');

// Logo Solinteec blanco de alto contraste
if (logoWhiteBase64) {
  doc.addImage(logoWhiteBase64, 'PNG', 28, 24, 60, 26);
}

// Badge de Marco Normativo
doc.setFillColor(colors.slate[0], colors.slate[1], colors.slate[2]);
doc.roundedRect(28, 62, 125, 8, 2, 2, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(8);
doc.setTextColor(colors.goldLight[0], colors.goldLight[1], colors.goldLight[2]);
doc.text('ESTRATEGIA GOVTECH • MARCO NORMATIVO COOTAD Y SERCOP', 32, 67.5);

// Título Principal
doc.setFont('helvetica', 'bold');
doc.setFontSize(23);
doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
doc.text('MODELO DE DESPLIEGUE CANTONAL Y', 28, 83);
doc.text('LICENCIAMIENTO MODULAR PARROQUIAL', 28, 93);

// Subtítulo en Dorado
doc.setFontSize(11);
doc.setTextColor(colors.gold[0], colors.gold[1], colors.gold[2]);
doc.text('Soberanía Institucional Cantonal, Articulación Multinivel y Relevamiento de la Provincia de Napo', 28, 104);

// Tarjeta con Pilares Clave
doc.setFillColor(colors.slate[0], colors.slate[1], colors.slate[2]);
doc.roundedRect(28, 114, pageWidth - 56, 44, 3, 3, 'F');

const pillars = [
  {
    title: '1. Instancia Soberana Cantonal',
    desc: 'Un solo dominio oficial (.gob.ec) por Municipio. Cero subdominios caóticos y cero cruce de datos entre cantones.'
  },
  {
    title: '2. Licencia Modular por GAD Parroquial',
    desc: 'Módulo independiente (Add-On). Cada Junta Parroquial contrata su panel propio bajo sus competencias exclusivas (COOTAD 65).'
  },
  {
    title: '3. Cadena de Confianza y Derivación',
    desc: 'Botón de articulación en 1 clic. Traspaso digital de competencias entre la Parroquia y las Direcciones Municipales.'
  }
];

const colWidth = (pageWidth - 72) / 3;
pillars.forEach((p, idx) => {
  const colX = 34 + idx * (colWidth + 5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(colors.gold[0], colors.gold[1], colors.gold[2]);
  doc.text(p.title, colX, 124);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
  const splitText = doc.splitTextToSize(p.desc, colWidth - 4);
  doc.text(splitText, colX, 131);
});

// Pie de portada
doc.setFont('helvetica', 'bold');
doc.setFontSize(10);
doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
doc.text('SOLINTEEC DEVTECH S.A.S. • Dirección GovTech & Modernización Institucional', 28, 178);

doc.setFont('helvetica', 'normal');
doc.setFontSize(8.5);
doc.setTextColor(colors.gold[0], colors.gold[1], colors.gold[2]);
doc.text('Contacto Directo: projects@solinteec.com • pquishpe@solinteec.com • https://solinteec.com', 28, 184);

// ==========================================
// SLIDE 2: DIAGNÓSTICO ESTRATÉGICO INSTITUCIONAL
// ==========================================
doc.addPage();
renderSlideHeader('El Dilema de los Subdominios vs. La Soberanía Cantonal Oficial (.gob.ec)');

// Columna Izquierda: El Error de la Aproximación Tradicional
doc.setFillColor(254, 242, 242); // Fondo suave alerta
doc.roundedRect(16, 34, 128, 155, 3, 3, 'F');
doc.setDrawColor(239, 68, 68);
doc.setLineWidth(0.8);
doc.roundedRect(16, 34, 128, 155, 3, 3, 'D');

// Cabecera Columna Izquierda
doc.setFillColor(239, 68, 68);
doc.roundedRect(16, 34, 128, 12, 3, 3, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(9.5);
doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
doc.text('[PROBLEMA] El Enfoque Tradicional Multi-Tenant o Subdominios Caoticos', 20, 42);

const badPoints = [
  {
    title: '1. Conflicto Juridico y de Auditoria (Contraloria)',
    desc: 'Cada GAD Cantonal tiene RUC y presupuesto propio. Mezclar varios cantones en un mismo SaaS general o compartir base de datos visible genera glosas por auditoria y violacion de custodia.'
  },
  {
    title: '2. Perdida de Identidad Institucional (.gob.ec)',
    desc: 'Un Municipio como Quijos exige que el portal viva en su dominio oficial acreditado (ej: plataforma.quijos.gob.ec). Ningun Alcalde acepta un dominio generico o comercial compartido.'
  },
  {
    title: '3. Friccion de Red por Subdominios de Parroquias',
    desc: 'Crear subdominios de tercer nivel (papallacta.quijos.gob.ec) satura la administracion de DNS municipal, rompe certificados SSL y confunde al ciudadano del sector rural.'
  },
  {
    title: '4. Resistencia Politica Cantonal',
    desc: 'Los Alcaldes no invierten presupuesto municipal en plataformas donde figuren cantones vecinos con los que compiten por recursos y visibilidad publica.'
  }
];

let currY = 54;
badPoints.forEach((bp) => {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(185, 28, 28);
  doc.text(bp.title, 22, currY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.2);
  doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
  const splitD = doc.splitTextToSize(bp.desc, 116);
  doc.text(splitD, 22, currY + 5);
  currY += 24;
});

// Columna Derecha: La Solución Enterprise SOLINTEEC
doc.setFillColor(240, 253, 244); // Fondo suave éxito
doc.roundedRect(152, 34, 128, 155, 3, 3, 'F');
doc.setDrawColor(colors.emerald[0], colors.emerald[1], colors.emerald[2]);
doc.setLineWidth(0.8);
doc.roundedRect(152, 34, 128, 155, 3, 3, 'D');

// Cabecera Columna Derecha
doc.setFillColor(colors.emerald[0], colors.emerald[1], colors.emerald[2]);
doc.roundedRect(152, 34, 128, 12, 3, 3, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(9.5);
doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
doc.text('[SOLUCION] Instancia Cantonal Soberana + Licencia Parroquial', 156, 42);

const goodPoints = [
  {
    title: '1. Despliegue Soberano en Dominio Oficial',
    desc: 'Instalacion dedicada en el subdominio institucional del Municipio (ej. plataforma.quijos.gob.ec). Plena conformidad con estandares MINTEL y seguridad de la informacion.'
  },
  {
    title: '2. Cobertura Territorial Cantonal Total',
    desc: 'El formulario y mapa abarcan todas las parroquias del canton para atencion ciudadana. Los reportes rurales entran directamente a las Direcciones Municipales.'
  },
  {
    title: '3. Activacion Modular de GADs Parroquiales',
    desc: 'El acceso institucional de la Junta Parroquial no es gratuito ni automatico. Se comercializa como un Add-On de Licencia Institucional financiado por el GAD Parroquial.'
  },
  {
    title: '4. Modelo Co-Branding y Cadena de Confianza',
    desc: 'Si la parroquia tiene licencia, el ciudadano ve el escudo de su Junta Parroquial y del Municipio. La Junta tiene panel propio y soberania sobre sus competencias.'
  }
];

currY = 54;
goodPoints.forEach((gp) => {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(colors.emerald[0], colors.emerald[1], colors.emerald[2]);
  doc.text(gp.title, 158, currY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.2);
  doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
  const splitD = doc.splitTextToSize(gp.desc, 116);
  doc.text(splitD, 158, currY + 5);
  currY += 24;
});

// ==========================================
// SLIDE 3: ARQUITECTURA TÉCNICA Y FLUJO OPERATIVO
// ==========================================
doc.addPage();
renderSlideHeader('Arquitectura de Licenciamiento: Parroquia sin Licencia vs. Parroquia con Licencia');

const flowCards = [
  {
    x: 16,
    width: 82,
    badge: 'ESTADO BASE INCLUIDO',
    badgeBg: colors.slate,
    title: 'A. Parroquia sin Licencia Parroquial',
    subtitle: 'Atencion Centralizada en el GAD Municipal',
    items: [
      'El ciudadano reporta en plataforma.quijos.gob.ec seleccionando su parroquia rural.',
      'El ticket ingresa directo a la direccion municipal encargada (Obras Publicas, Agua Potable).',
      'La Junta Parroquial NO tiene usuario ni panel administrativo en el sistema.',
      'El Municipio asume toda la respuesta operativa y comunicacion con el vecino.'
    ]
  },
  {
    x: 104,
    width: 88,
    badge: 'LICENCIA ACTIVADA (ADD-ON)',
    badgeBg: colors.gold,
    title: 'B. Parroquia con Licencia GAD',
    subtitle: 'Gestion Descentralizada y Co-Branding',
    items: [
      'El GAD Parroquial adquiere su licencia anual mediante contrato agil de Infima Cuantia.',
      'Se activa el rol GAD_PARROQUIAL_ADMIN para Presidente y Vocales de la Junta.',
      'Soberania en Competencias (COOTAD 65): Gestionan canchas, parques y vialidad vecinal.',
      'Co-Branding Oficial: Portal muestra el escudo de la parroquia articulado al Municipio.'
    ]
  },
  {
    x: 198,
    width: 83,
    badge: 'ARTICULACION COOTAD',
    badgeBg: colors.emerald,
    title: 'C. Boton Derivacion en 1 Clic',
    subtitle: 'Cadena de Confianza Canton-Parroquia',
    items: [
      'Si el reporte es competencia municipal (alcantarillado matriz, tuberia principal de agua):',
      'El operador parroquial presiona: [Derivar a Direccion Municipal - GAD Cantonal].',
      'El ticket viaja al instante al director municipal sin oficios burocraticos en papel.',
      'Trazabilidad Bipartita: Alcalde y Presidente Parroquial auditan el avance en tiempo real.'
    ]
  }
];

flowCards.forEach((c) => {
  doc.setFillColor(colors.cardBg[0], colors.cardBg[1], colors.cardBg[2]);
  doc.roundedRect(c.x, 34, c.width, 155, 3, 3, 'F');
  doc.setDrawColor(colors.cardBorder[0], colors.cardBorder[1], colors.cardBorder[2]);
  doc.setLineWidth(0.5);
  doc.roundedRect(c.x, 34, c.width, 155, 3, 3, 'D');

  // Badge superior
  doc.setFillColor(c.badgeBg[0], c.badgeBg[1], c.badgeBg[2]);
  doc.roundedRect(c.x + 5, 40, c.width - 10, 7, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.text(c.badge, c.x + c.width / 2, 45, { align: 'center' });

  // Título
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(colors.navy[0], colors.navy[1], colors.navy[2]);
  doc.text(c.title, c.x + 6, 56);

  // Subtítulo
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
  doc.text(c.subtitle, c.x + 6, 62);

  // Línea divisoria
  doc.setFillColor(colors.cardBorder[0], colors.cardBorder[1], colors.cardBorder[2]);
  doc.rect(c.x + 6, 66, c.width - 12, 0.4, 'F');

  // Items
  let itemY = 74;
  c.items.forEach((it, idx) => {
    doc.setFillColor(colors.gold[0], colors.gold[1], colors.gold[2]);
    doc.circle(c.x + 8, itemY - 1, 1.2, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.2);
    doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
    const splitText = doc.splitTextToSize(it, c.width - 16);
    doc.text(splitText, c.x + 12, itemY);
    itemY += splitText.length * 4.5 + 4.5;
  });
});

// ==========================================
// SLIDE 4: CENSO TERRITORIAL PROVINCIA DE NAPO
// ==========================================
doc.addPage();
renderSlideHeader('Censo Territorial Oficial: 5 Cantones y 20 GADs Parroquiales Rurales de Napo');

// Tabla Oficial de Gobiernos Locales
autoTable(doc, {
  startY: 32,
  margin: { left: 16, right: 16 },
  head: [[
    'CANTÓN', 
    'CABECERA CANTONAL', 
    'PARROQUIAS RURALES (GADS PARROQUIALES CONSTITUIDOS)', 
    'TOTAL GADS', 
    'TIPO DE LICENCIA'
  ]],
  body: [
    [
      'Quijos',
      'Baeza (Urbana)',
      '• Cosanga\n• Cuyuja\n• Papallacta\n• San Francisco de Borja (Borja)\n• Sumaco',
      '5',
      '1 Cantonal (Municipio)\n5 Licencias Parroquiales'
    ],
    [
      'Tena\n(Capital)',
      'Tena (Urbana)',
      '• Ahuano\n• Chontapunta\n• Muyuna\n• Pano\n• Puerto Misahuallí\n• Puerto Napo\n• Tálag',
      '7',
      '1 Cantonal (Municipio)\n7 Licencias Parroquiales'
    ],
    [
      'Archidona',
      'Archidona (Urbana)',
      '• Cotundo\n• Hatun Sumaku\n• San Pablo de Ushpayaku',
      '3',
      '1 Cantonal (Municipio)\n3 Licencias Parroquiales'
    ],
    [
      'El Chaco',
      'El Chaco (Urbana)',
      '• Gonzalo Díaz de Pineda (El Bombón)\n• Linares\n• Oyacachi\n• Santa Rosa\n• Sardinas',
      '5',
      '1 Cantonal (Municipio)\n5 Licencias Parroquiales'
    ],
    [
      'Carlos Julio\nArosemena Tola',
      'Arosemena Tola\n(Urbana)',
      'NO POSEE PARROQUIAS RURALES.\nOrganizado por comunidades y recintos (Flor del Bosque, Santa Mónica, Pumayacu, etc.) bajo atención municipal directa.',
      '0',
      '1 Cantonal (Municipio)\n(Gestión por Comunidades)'
    ]
  ],
  theme: 'grid',
  headStyles: {
    fillColor: [colors.navy[0], colors.navy[1], colors.navy[2]],
    textColor: [colors.white[0], colors.white[1], colors.white[2]],
    fontSize: 8.5,
    fontStyle: 'bold',
    halign: 'center',
    valign: 'middle'
  },
  bodyStyles: {
    fontSize: 8,
    textColor: [colors.textDark[0], colors.textDark[1], colors.textDark[2]],
    valign: 'middle',
    cellPadding: 2.8
  },
  columnStyles: {
    0: { cellWidth: 32, fontStyle: 'bold', halign: 'center' },
    1: { cellWidth: 38, halign: 'center' },
    2: { cellWidth: 125 },
    3: { cellWidth: 24, halign: 'center', fontStyle: 'bold', textColor: [197, 155, 39] },
    4: { cellWidth: 46, halign: 'center', fontSize: 7.5 }
  },
  alternateRowStyles: {
    fillColor: [248, 250, 252]
  }
});

// Cajas de Métricas en el pie de la diapositiva
const finalTableY = (doc as any).lastAutoTable.finalY || 140;
const statBoxes = [
  { label: 'CANTONES EN NAPO', value: '5 Cantones', desc: 'Instancias cantonales independientes' },
  { label: 'GADS PARROQUIALES RURALES', value: '20 Juntas', desc: 'Con RUC, presupuesto y autoridades' },
  { label: 'MERCADO POTENCIAL NAPO', value: '25 Contratos', desc: '5 Municipios + 20 GADs Parroquiales' },
  { label: 'ORGANIZACIÓN COMUNITARIA', value: '1 Régimen Especial', desc: 'Arosemena Tola (Gestión por recintos)' }
];

const statWidth = (pageWidth - 47) / 4;
statBoxes.forEach((sb, idx) => {
  const sbX = 16 + idx * (statWidth + 5);
  doc.setFillColor(colors.slate[0], colors.slate[1], colors.slate[2]);
  doc.roundedRect(sbX, finalTableY + 4, statWidth, 22, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(colors.goldLight[0], colors.goldLight[1], colors.goldLight[2]);
  doc.text(sb.label, sbX + 4, finalTableY + 9.5);

  doc.setFontSize(11);
  doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.text(sb.value, sbX + 4, finalTableY + 16.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(203, 213, 225);
  doc.text(sb.desc, sbX + 4, finalTableY + 21.5);
});

// ==========================================
// SLIDE 5: ESTRATEGIA COMERCIAL Y CONTRATACIÓN SERCOP
// ==========================================
doc.addPage();
renderSlideHeader('Estrategia Comercial y Contratación Pública Ágil (SERCOP)');

const commercialPillars = [
  {
    x: 16,
    width: 82,
    badge: 'CONTRATO PRINCIPAL (MATRIZ)',
    badgeBg: colors.navy,
    title: '1. Venta al GAD Municipal',
    subtitle: 'El Alcalde y Directores Cantonal',
    items: [
      'Objeto: Plataforma Ciudadana Cantonal + CRM Direcciones Municipales + Mapeo Total.',
      'Mecanismo SERCOP: Catalogo Electronico, Menor Cuantia o Consultoria institucional.',
      'Propuesta de Valor: Control de gestion territorial cantonal, auditoria en tiempo real de directores y ordenanzas de participacion.',
      'Presupuesto: Inversion centralizada aprobada en el POA del Municipio.'
    ]
  },
  {
    x: 104,
    width: 88,
    badge: 'VENTA CRUZADA ÁGIL (48-72h)',
    badgeBg: colors.emerald,
    title: '2. Licencia a Juntas Parroquiales',
    subtitle: 'Contratacion Directa por Infima Cuantia',
    items: [
      'Objeto: Licencia Anual del Modulo de Gestion Parroquial + Co-Branding + Articulacion.',
      'Mecanismo SERCOP: Infima Cuantia Directa (montos menores al coeficiente legal, sin concurso publico engorroso).',
      'Propuesta de Valor: El Presidente Parroquial visibiliza su gestion, atiende a su comunidad rural y exige atencion al Municipio con datos tecnicos.',
      'Financiamiento: Presupuesto corriente del GAD Parroquial.'
    ]
  },
  {
    x: 198,
    width: 83,
    badge: 'ESCALA PROVINCIAL',
    badgeBg: colors.gold,
    title: '3. Alianza CONAGOPARE Napo',
    subtitle: 'Convenio Marco Interinstitucional',
    items: [
      'Objeto: Homologacion y estandarizacion tecnologica de los 20 GADs parroquiales de Napo.',
      'Alianza Estrategica: Convenio con la Asociacion Provincial de Juntas Parroquiales de Napo.',
      'Propuesta de Valor: Descuentos por volumen para paquetes de 5 a 20 parroquias.',
      'Impacto Regional: SOLINTEEC se posiciona como el socio tecnologico exclusivo del territorio amazonico.'
    ]
  }
];

commercialPillars.forEach((cp) => {
  doc.setFillColor(colors.cardBg[0], colors.cardBg[1], colors.cardBg[2]);
  doc.roundedRect(cp.x, 34, cp.width, 155, 3, 3, 'F');
  doc.setDrawColor(colors.cardBorder[0], colors.cardBorder[1], colors.cardBorder[2]);
  doc.setLineWidth(0.5);
  doc.roundedRect(cp.x, 34, cp.width, 155, 3, 3, 'D');

  // Badge
  doc.setFillColor(cp.badgeBg[0], cp.badgeBg[1], cp.badgeBg[2]);
  doc.roundedRect(cp.x + 5, 40, cp.width - 10, 7, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.text(cp.badge, cp.x + cp.width / 2, 45, { align: 'center' });

  // Título
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(colors.navy[0], colors.navy[1], colors.navy[2]);
  doc.text(cp.title, cp.x + 6, 56);

  // Subtítulo
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
  doc.text(cp.subtitle, cp.x + 6, 62);

  // Línea
  doc.setFillColor(colors.cardBorder[0], colors.cardBorder[1], colors.cardBorder[2]);
  doc.rect(cp.x + 6, 66, cp.width - 12, 0.4, 'F');

  // Items
  let itY = 74;
  cp.items.forEach((it) => {
    doc.setFillColor(colors.gold[0], colors.gold[1], colors.gold[2]);
    doc.circle(cp.x + 8, itY - 1, 1.2, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.2);
    doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
    const splitText = doc.splitTextToSize(it, cp.width - 16);
    doc.text(splitText, cp.x + 12, itY);
    itY += splitText.length * 4.5 + 4.5;
  });
});

// ==========================================
// SLIDE 6: MODELO DE DATOS Y FICHA CORPORATIVA
// ==========================================
doc.addPage();
renderSlideHeader('Modelo de Datos Técnico (MariaDB/Prisma) y Respaldo Corporativo');

// Columna Izquierda: Esquema de Base de Datos Limpio
doc.setFillColor(colors.slate[0], colors.slate[1], colors.slate[2]);
doc.roundedRect(16, 34, 138, 155, 3, 3, 'F');

doc.setFont('helvetica', 'bold');
doc.setFontSize(10);
doc.setTextColor(colors.gold[0], colors.gold[1], colors.gold[2]);
doc.text('ESQUEMA DE DATOS Y LICENCIAMIENTO (PRISMA / MARIADB)', 22, 44);

doc.setFont('courier', 'normal');
doc.setFontSize(7.5);
doc.setTextColor(226, 232, 240);

const codeLines = [
  '// Modelo de Parroquia con Activación de Licencia',
  'model Parish {',
  '  id             String    @id @default(uuid())',
  '  cantonId       String',
  '  name           String    // Ej: Papallacta, Cuyuja',
  '  isRural        Boolean   @default(true)',
  '',
  '  // Control de Licenciamiento Modular',
  '  isLicensed     Boolean   @default(false)',
  '  licenseKey     String?   // Hash de activacion',
  '  licenseExpires DateTime?',
  '',
  '  // Perfil Institucional de la Junta Parroquial',
  '  ruc            String?   // RUC del GAD Parroquial',
  '  presidentName  String?   // Presidente/a de la Junta',
  '  officialEmail  String?   // Correo oficial',
  '  logoUrl        String?   // Escudo oficial parroquial',
  '',
  '  // Relaciones Operativas',
  '  users          User[]    // Operadores parroquiales',
  '  reports        Report[]  // Reportes en territorio',
  '}',
  '',
  '// Jurisdicción y Trazabilidad de Derivación',
  'enum TicketJurisdiction {',
  '  MUNICIPAL_DIRECT       // Ingreso directo a Municipio',
  '  PARISH_LOCAL           // Resuelto por Junta Parroquial',
  '  DERIVED_TO_MUNICIPAL   // Derivado con 1-Clic a Direccion',
  '}'
];

let codeY = 52;
codeLines.forEach((cl) => {
  doc.text(cl, 22, codeY);
  codeY += 4.2;
});

// Columna Derecha: Tarjeta Corporativa SOLINTEEC DEVTECH S.A.S.
doc.setFillColor(colors.cardBg[0], colors.cardBg[1], colors.cardBg[2]);
doc.roundedRect(162, 34, 119, 155, 3, 3, 'F');
doc.setDrawColor(colors.gold[0], colors.gold[1], colors.gold[2]);
doc.setLineWidth(0.8);
doc.roundedRect(162, 34, 119, 155, 3, 3, 'D');

// Logo Color
if (logoColorBase64) {
  doc.addImage(logoColorBase64, 'PNG', 194, 42, 55, 24);
}

doc.setFont('helvetica', 'bold');
doc.setFontSize(12);
doc.setTextColor(colors.navy[0], colors.navy[1], colors.navy[2]);
doc.text('SOLINTEEC DEVTECH S.A.S.', 221.5, 74, { align: 'center' });

doc.setFont('helvetica', 'bold');
doc.setFontSize(8.5);
doc.setTextColor(colors.gold[0], colors.gold[1], colors.gold[2]);
doc.text('DIRECCIÓN GOVTECH & MODERNIZACIÓN INSTITUCIONAL', 221.5, 80, { align: 'center' });

doc.setFillColor(colors.cardBorder[0], colors.cardBorder[1], colors.cardBorder[2]);
doc.rect(170, 84, 103, 0.4, 'F');

// Ficha de Contacto
const contactDetails = [
  { label: 'RUC de la Empresa', value: '1793214532001 (Ecuador)' },
  { label: 'Sector de Negocio', value: 'Gobierno Digital, GovTech & SaaS Local' },
  { label: 'Correos de Proyectos', value: 'projects@solinteec.com\npquishpe@solinteec.com' },
  { label: 'Plataforma Web Demo', value: 'https://plataforma.solinteec.com' },
  { label: 'Portal Corporativo', value: 'https://solinteec.com' },
  { label: 'Modelo de Entrega', value: 'Nube Soberana / On-Premise Certificado' }
];

let cY = 93;
contactDetails.forEach((cd) => {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(colors.navy[0], colors.navy[1], colors.navy[2]);
  doc.text(cd.label, 172, cY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
  const splitV = doc.splitTextToSize(cd.value, 98);
  doc.text(splitV, 172, cY + 4.2);
  cY += splitV.length * 4.2 + 4.5;
});

// Sello de Confidencialidad
doc.setFillColor(colors.slate[0], colors.slate[1], colors.slate[2]);
doc.roundedRect(170, 166, 103, 14, 2, 2, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(7.5);
doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
doc.text('(c) 2026 SOLINTEEC DEVTECH S.A.S.', 221.5, 172, { align: 'center' });
doc.setFont('helvetica', 'normal');
doc.setFontSize(6.8);
doc.setTextColor(colors.goldLight[0], colors.goldLight[1], colors.goldLight[2]);
doc.text('DOCUMENTO ESTRATEGICO Y COMERCIAL ENTERPRISE', 221.5, 176.5, { align: 'center' });

// ==========================================
// GUARDAR ARCHIVO PDF
// ==========================================
const outputDir = path.join(process.cwd(), 'public/downloads');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const outputPath = path.join(outputDir, 'SOLINTEEC_Estrategia_GADs_Parroquiales_Napo.pdf');
const docsPath = path.join(process.cwd(), 'docs/SOLINTEEC_Estrategia_GADs_Parroquiales_Napo.pdf');

const pdfBytes = doc.output('arraybuffer');
fs.writeFileSync(outputPath, Buffer.from(pdfBytes));
fs.writeFileSync(docsPath, Buffer.from(pdfBytes));

console.log('PDF generado exitosamente en:');
console.log(' - ' + outputPath);
console.log(' - ' + docsPath);

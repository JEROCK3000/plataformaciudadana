'use client';

import React, { useState } from 'react';

export type ParishReportCount = {
  parish: string;
  total: number;
  resolved: number;
  pending: number;
  inProgress: number;
};

type Props = {
  data: ParishReportCount[];
};

const ID_TO_NAME: Record<string, string> = {
  papallacta: 'Papallacta',
  cuyuja:     'Cuyuja',
  baeza:      'Baeza',
  borja:      'San Francisco de Borja',
  sumaco:     'Sumaco',
  cosanga:    'Cosanga',
};

// Colores originales de la simbología
const PARISH_COLORS: Record<string, string> = {
  papallacta: '#FFF983',
  cuyuja:     '#FA9B8F',
  baeza:      '#00933C',
  borja:      '#FBB040',
  sumaco:     '#F07DBC',
  cosanga:    '#F18E65',
};

// Centros visuales para el punto titilante de cada parroquia
const PULSE_CENTERS: Record<string, [number, number]> = {
  papallacta: [155, 310],
  cuyuja:     [335, 315],
  baeza:      [475, 310],
  borja:      [605, 310],
  sumaco:     [810, 315],
  cosanga:    [510, 478],
};

type Tooltip = {
  x: number;
  y: number;
  parish: string;
  stat: ParishReportCount | undefined;
};

export default function QuijosMap({ data }: Props) {
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);
  const [active, setActive] = useState<string | null>(null);

  const dataMap = Object.fromEntries(data.map(d => [d.parish, d]));

  const handleMouseMove = (e: React.MouseEvent<SVGPathElement>, id: string) => {
    const rect = (e.currentTarget.closest('svg') as SVGSVGElement).getBoundingClientRect();
    setTooltip({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top - 12,
      parish: ID_TO_NAME[id] ?? id,
      stat: dataMap[ID_TO_NAME[id]],
    });
  };

  const parishPath = (id: string, d: string) => {
    const isActive = active === id;
    const fill = PARISH_COLORS[id] ?? '#e5e7eb';
    return (
      <path
        key={id}
        id={id}
        d={d}
        fill={fill}
        stroke={isActive ? '#111' : '#333'}
        strokeWidth={isActive ? 2.5 : 1.2}
        strokeLinejoin="round"
        strokeLinecap="round"
        style={{
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          filter: isActive ? 'brightness(1.18) drop-shadow(0 0 8px rgba(0,0,0,0.35))' : undefined,
        }}
        onMouseMove={e => handleMouseMove(e, id)}
        onMouseLeave={() => { setTooltip(null); setActive(null); }}
        onMouseEnter={() => setActive(id)}
      />
    );
  };

  // Punto titilante para parroquias con reportes
  const pulsingDot = (id: string) => {
    const name = ID_TO_NAME[id];
    const stat = dataMap[name];
    if (!stat || stat.total === 0) return null;
    const [cx, cy] = PULSE_CENTERS[id];
    return (
      <g key={`pulse-${id}`} transform={`translate(${cx},${cy})`} pointerEvents="none">
        {/* Primera onda expansiva */}
        <circle r="6" fill="#dc2626" opacity="0">
          <animate attributeName="r"       values="6;26"   dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.75;0" dur="2s" repeatCount="indefinite" />
        </circle>
        {/* Segunda onda (desfasada) */}
        <circle r="6" fill="#dc2626" opacity="0">
          <animate attributeName="r"       values="6;26"   dur="2s" begin="0.7s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;0"  dur="2s" begin="0.7s" repeatCount="indefinite" />
        </circle>
        {/* Punto sólido interior */}
        <circle r="6" fill="#dc2626" />
        <circle r="3" fill="white" />
        <circle r="1.5" fill="#dc2626" />
      </g>
    );
  };

  return (
    <div className="relative w-full select-none">
      <svg
        viewBox="0 0 1150 620"
        className="w-full h-auto"
        preserveAspectRatio="xMidYMid meet"
        style={{ background: 'white', borderRadius: '0.5rem' }}
      >
        <rect width="1150" height="620" fill="white" />

        {/* Vías referenciales */}
        <path d="M 0 250 Q 150 200, 470 280 Q 600 250, 800 150" fill="none" stroke="#bbb" strokeWidth="1"/>
        <path d="M 470 280 Q 400 400, 450 600" fill="none" stroke="#bbb" strokeWidth="1"/>

        {/* ── PARROQUIAS con colores de la simbología ── */}
        {parishPath('papallacta', 'M 285 50 L 270 30 L 250 20 L 220 15 L 180 25 L 150 40 L 130 60 L 110 80 L 90 110 L 70 140 L 60 160 L 70 190 L 55 220 L 50 260 L 65 300 L 90 330 L 120 350 L 160 370 L 190 380 L 210 375 L 220 350 L 230 320 L 235 280 L 245 240 L 260 200 L 275 160 L 285 120 L 280 80 L 285 50 Z')}
        {parishPath('cuyuja',     'M 285 50 L 300 70 L 320 90 L 350 120 L 380 145 L 410 165 L 440 185 L 415 220 L 395 250 L 380 285 L 365 315 L 350 345 L 330 365 L 300 380 L 270 390 L 240 385 L 210 375 L 220 350 L 230 320 L 235 280 L 245 240 L 260 200 L 275 160 L 285 120 L 280 80 L 285 50 Z')}
        {parishPath('baeza',      'M 440 185 L 455 180 L 475 185 L 495 190 L 515 200 L 535 210 L 545 230 L 550 260 L 560 290 L 570 320 L 580 350 L 540 365 L 500 375 L 460 375 L 420 370 L 380 360 L 350 345 L 365 315 L 380 285 L 395 250 L 415 220 L 440 185 Z')}
        {parishPath('borja',      'M 535 210 L 555 205 L 575 200 L 595 195 L 620 205 L 645 220 L 640 245 L 645 275 L 655 305 L 665 335 L 640 345 L 610 355 L 580 350 L 570 320 L 560 290 L 550 260 L 545 230 L 535 210 Z')}
        {parishPath('sumaco',     'M 645 220 L 670 215 L 700 215 L 740 210 L 780 225 L 820 240 L 860 260 L 900 275 L 940 290 L 970 310 L 980 330 L 960 345 L 930 355 L 890 365 L 850 380 L 815 385 L 790 370 L 760 355 L 730 350 L 700 345 L 665 335 L 655 305 L 645 275 L 640 245 L 645 220 Z')}
        {parishPath('cosanga',    'M 210 375 L 240 385 L 270 390 L 300 380 L 330 365 L 350 345 L 380 360 L 420 370 L 460 375 L 500 375 L 540 365 L 580 350 L 610 355 L 640 345 L 665 335 L 700 345 L 730 350 L 760 355 L 790 370 L 815 385 L 790 420 L 760 460 L 720 490 L 680 510 L 640 520 L 590 535 L 540 555 L 490 565 L 440 560 L 390 540 L 340 510 L 290 480 L 250 450 L 220 410 L 210 375 Z')}

        {/* ── PUNTOS TITILANTES — encima de parroquias, debajo de etiquetas ── */}
        {Object.keys(ID_TO_NAME).map(id => pulsingDot(id))}

        {/* Etiquetas parroquias */}
        <text x="160" y="200" fontFamily="Arial" fontSize="13" fontWeight="bold" textAnchor="middle" pointerEvents="none">PAPALLACTA</text>
        <text x="320" y="220" fontFamily="Arial" fontSize="13" fontWeight="bold" textAnchor="middle" pointerEvents="none">CUYUJA</text>
        <text x="470" y="270" fontFamily="Arial" fontSize="13" fontWeight="bold" textAnchor="middle" fill="white" pointerEvents="none">BAEZA</text>
        <text x="608" y="248" fontFamily="Arial" fontSize="11" fontWeight="bold" textAnchor="middle" pointerEvents="none">SAN FRANCISCO</text>
        <text x="608" y="261" fontFamily="Arial" fontSize="11" fontWeight="bold" textAnchor="middle" pointerEvents="none">DE BORJA</text>
        <text x="760" y="290" fontFamily="Arial" fontSize="13" fontWeight="bold" textAnchor="middle" pointerEvents="none">SUMACO</text>
        <text x="500" y="440" fontFamily="Arial" fontSize="13" fontWeight="bold" textAnchor="middle" pointerEvents="none">COSANGA</text>

        {/* Marcadores de cabecera */}
        <g transform="translate(160,220)" pointerEvents="none"><circle r="6" fill="white" stroke="black" strokeWidth="1.5"/><circle r="2" fill="black"/></g>
        <g transform="translate(320,240)" pointerEvents="none"><circle r="6" fill="white" stroke="black" strokeWidth="1.5"/><circle r="2" fill="black"/></g>
        <g transform="translate(470,285)" pointerEvents="none"><circle r="8" fill="white" stroke="black" strokeWidth="1.5"/><circle r="4" fill="none" stroke="black" strokeWidth="1"/><circle r="2" fill="black"/></g>
        <g transform="translate(590,278)" pointerEvents="none"><circle r="6" fill="white" stroke="black" strokeWidth="1.5"/><circle r="2" fill="black"/></g>
        <g transform="translate(760,305)" pointerEvents="none"><circle r="6" fill="white" stroke="black" strokeWidth="1.5"/><circle r="2" fill="black"/></g>
        <g transform="translate(500,458)" pointerEvents="none"><circle r="6" fill="white" stroke="black" strokeWidth="1.5"/><circle r="2" fill="black"/></g>

        {/* Etiquetas externas */}
        <text x="12"  y="22"  fontFamily="Arial" fontSize="11" fontWeight="bold" fill="#444" pointerEvents="none">CANTON QUITO</text>
        <text x="390" y="42"  fontFamily="Arial" fontSize="11" fontWeight="bold" fill="#444" pointerEvents="none">CANTON EL CHACO</text>
        <text x="800" y="165" fontFamily="Arial" fontSize="11" fontWeight="bold" fill="#444" pointerEvents="none">A LAGO AGRIO</text>
        <text x="1060" y="350" fontFamily="Arial" fontSize="11" fontWeight="bold" fill="#444" textAnchor="middle" pointerEvents="none">CANTON</text>
        <text x="1060" y="364" fontFamily="Arial" fontSize="11" fontWeight="bold" fill="#444" textAnchor="middle" pointerEvents="none">LORETO</text>
        <text x="12"  y="530" fontFamily="Arial" fontSize="11" fontWeight="bold" fill="#444" pointerEvents="none">CANTON ARCHIDONA</text>
        <text x="430" y="612" fontFamily="Arial" fontSize="11" fontWeight="bold" fill="#444" textAnchor="middle" pointerEvents="none">CANTON ARCHIDONA</text>

        {/* Título */}
        <text x="850" y="42" fontFamily="Arial" fontSize="22" fontWeight="bold" textAnchor="middle" pointerEvents="none">CANTON QUIJOS</text>

        {/* Rosa de los vientos */}
        <g transform="translate(770,105)" pointerEvents="none">
          <circle r="20" fill="none" stroke="black" strokeWidth="1"/>
          <circle r="14" fill="none" stroke="black" strokeWidth="0.5"/>
          <path d="M0,-25 L5,-12 L0,-15 L-5,-12 Z" fill="black"/>
          <text x="0" y="-30" fontFamily="Arial" fontSize="14" fontWeight="bold" textAnchor="middle">N</text>
          <path d="M0,-20 L0,20 M-20,0 L20,0" stroke="black" strokeWidth="1"/>
        </g>

        {/* Simbología */}
        <g transform="translate(960,20)" pointerEvents="none">
          <rect width="170" height="215" fill="white" stroke="black" strokeWidth="1.5"/>
          <text x="85" y="20" fontFamily="Arial" fontSize="11" fontWeight="bold" textAnchor="middle">SIMBOLOGIA</text>
          <line x1="10" y1="28" x2="160" y2="28" stroke="black" strokeWidth="1"/>
          <g transform="translate(10,45)" fontFamily="Arial" fontSize="10">
            <text y="5">Cabecera Cantonal</text>
            <g transform="translate(140,2)"><circle r="5" fill="white" stroke="black" strokeWidth="1"/><circle r="1" fill="black"/></g>
            <text y="25">Parroquias</text>
            <g transform="translate(140,22)"><circle r="4" fill="white" stroke="black" strokeWidth="1"/><circle r="1.5" fill="black"/></g>
            <text y="50">PAPALLACTA</text><rect x="130" y="42" width="20" height="10" fill="#FFF983" stroke="black" strokeWidth="0.5"/>
            <text y="70">CUYUJA</text>    <rect x="130" y="62" width="20" height="10" fill="#FA9B8F" stroke="black" strokeWidth="0.5"/>
            <text y="90">BAEZA</text>     <rect x="130" y="82" width="20" height="10" fill="#00933C" stroke="black" strokeWidth="0.5"/>
            <text y="110">BORJA</text>    <rect x="130" y="102" width="20" height="10" fill="#FBB040" stroke="black" strokeWidth="0.5"/>
            <text y="130">SUMACO</text>   <rect x="130" y="122" width="20" height="10" fill="#F07DBC" stroke="black" strokeWidth="0.5"/>
            <text y="155">COSANGA</text>  <rect x="130" y="147" width="20" height="10" fill="#F18E65" stroke="black" strokeWidth="0.5"/>
          </g>
        </g>
      </svg>

      {/* Tooltip flotante */}
      {tooltip && (
        <div
          className="absolute z-50 pointer-events-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg px-3 py-2 text-sm"
          style={{ left: tooltip.x + 14, top: tooltip.y - 70 }}
        >
          <p className="font-bold text-gray-800 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-1 mb-1">
            {tooltip.parish}
          </p>
          {tooltip.stat ? (
            <>
              <p className="text-2xl font-extrabold text-emerald-600">
                {tooltip.stat.total} <span className="text-xs font-normal text-gray-500">reportes</span>
              </p>
              <div className="mt-1 space-y-0.5 text-xs text-gray-600 dark:text-gray-300">
                <div>🟢 Resueltos: <strong>{tooltip.stat.resolved}</strong></div>
                <div>🔵 En proceso: <strong>{tooltip.stat.inProgress}</strong></div>
                <div>🟣 Pendientes: <strong>{tooltip.stat.pending}</strong></div>
              </div>
            </>
          ) : (
            <p className="text-gray-400 text-xs">Sin reportes registrados</p>
          )}
        </div>
      )}

      {/* Leyenda */}
      <div className="absolute bottom-3 right-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 shadow text-xs space-y-1.5">
        <p className="font-semibold text-gray-600 dark:text-gray-300">Actividad</p>
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600" />
          </span>
          <span className="text-gray-600 dark:text-gray-400">Con reportes</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600 flex-shrink-0" />
          <span className="text-gray-600 dark:text-gray-400">Sin reportes</span>
        </div>
      </div>
    </div>
  );
}

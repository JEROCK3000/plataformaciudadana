'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  type ChartOptions,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

// Registro de componentes oficiales de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export type ParishStat = {
  parish: string;
  total: number;
  RECEIVED: number;
  IN_REVIEW: number;
  IN_PROGRESS: number;
  RESOLVED: number;
  REJECTED: number;
};

export type CategoryStat = {
  category: string;
  count: number;
};

export type UrgencyStat = {
  urgency: string;
  count: number;
};

const STATUS_CONFIG: Record<string, { label: string; color: string; hover: string }> = {
  RECEIVED: { label: 'Recibido', color: '#6366f1', hover: '#4f46e5' },
  IN_REVIEW: { label: 'En revisión', color: '#f59e0b', hover: '#d97706' },
  IN_PROGRESS: { label: 'En proceso', color: '#3b82f6', hover: '#2563eb' },
  RESOLVED: { label: 'Resuelto', color: '#10b981', hover: '#059669' },
  REJECTED: { label: 'Rechazado', color: '#ef4444', hover: '#dc2626' },
};

const CATEGORY_PALETTE = [
  '#10b981', // emerald
  '#6366f1', // indigo
  '#f59e0b', // amber
  '#3b82f6', // blue
  '#ec4899', // pink
  '#8b5cf6', // purple
  '#06b6d4', // cyan
];

const CATEGORY_LABELS: Record<string, string> = {
  INFRASTRUCTURE: 'Infraestructura',
  SECURITY: 'Seguridad',
  WATER: 'Agua Potable',
  SERVICES: 'Servicios Básicos',
  ENVIRONMENT: 'Medio Ambiente',
  EDUCATION: 'Educación',
  OTHER: 'Otros Sectores',
};

const URGENCY_CONFIG: Record<string, { label: string; color: string; border: string }> = {
  HIGH: { label: 'Alta', color: '#f43f5e', border: '#e11d48' },
  MEDIUM: { label: 'Media', color: '#f59e0b', border: '#d97706' },
  LOW: { label: 'Baja', color: '#10b981', border: '#059669' },
};

function shortParish(name: string): string {
  const map: Record<string, string> = {
    'San Francisco de Borja': 'S.F. Borja',
  };
  return map[name] ?? name;
}

// Opciones compartidas de tooltip ultra profesional con estilo Dark Glass
const commonTooltipOptions = {
  backgroundColor: 'rgba(15, 23, 42, 0.94)',
  titleColor: '#f8fafc',
  bodyColor: '#e2e8f0',
  borderColor: 'rgba(51, 65, 85, 0.7)',
  borderWidth: 1,
  padding: 12,
  cornerRadius: 10,
  boxPadding: 6,
  titleFont: { size: 13, weight: 600 as const, family: 'inherit' },
  bodyFont: { size: 12, family: 'inherit' },
  usePointStyle: true,
};

// 1. Gráfica de Barras por Parroquia (Elegante y Suavizada)
export function ParishBarChart({ data }: { data: ParishStat[] }) {
  const labels = data.map(d => shortParish(d.parish));
  const totals = data.map(d => d.total);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Total Reportes',
        data: totals,
        backgroundColor: 'rgba(16, 185, 129, 0.85)',
        hoverBackgroundColor: '#059669',
        borderRadius: 8,
        borderSkipped: false,
        maxBarThickness: 44,
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        ...commonTooltipOptions,
        callbacks: {
          label: (context) => ` ${context.parsed.y} reportes ciudadanos`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: '#94a3b8',
          font: { size: 11, weight: 500 },
        },
        border: { display: false },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(148, 163, 184, 0.12)',
        },
        ticks: {
          stepSize: 1,
          color: '#94a3b8',
          font: { size: 11 },
        },
        border: { dash: [4, 4], display: false },
      },
    },
  };

  return (
    <div className="w-full h-[290px] relative">
      <Bar data={chartData} options={options} />
    </div>
  );
}

// 2. Gráfica de Barras Apiladas por Estados (Colores curados y esquinas suaves)
export function ParishStackedChart({ data }: { data: ParishStat[] }) {
  const labels = data.map(d => shortParish(d.parish));

  const statusKeys = ['IN_PROGRESS', 'IN_REVIEW', 'RECEIVED', 'REJECTED', 'RESOLVED'] as const;

  const datasets = statusKeys.map((statusKey) => ({
    label: STATUS_CONFIG[statusKey]?.label || statusKey,
    data: data.map(d => d[statusKey] || 0),
    backgroundColor: STATUS_CONFIG[statusKey]?.color || '#94a3b8',
    hoverBackgroundColor: STATUS_CONFIG[statusKey]?.hover || '#64748b',
    borderRadius: 6,
    stack: 'states',
    maxBarThickness: 44,
  }));

  const chartData = { labels, datasets };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#94a3b8',
          boxWidth: 12,
          boxHeight: 12,
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 16,
          font: { size: 11, weight: 500 },
        },
      },
      tooltip: {
        ...commonTooltipOptions,
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: { display: false },
        ticks: {
          color: '#94a3b8',
          font: { size: 11, weight: 500 },
        },
        border: { display: false },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        grid: {
          color: 'rgba(148, 163, 184, 0.12)',
        },
        ticks: {
          stepSize: 1,
          color: '#94a3b8',
          font: { size: 11 },
        },
        border: { dash: [4, 4], display: false },
      },
    },
  };

  return (
    <div className="w-full h-[290px] relative">
      <Bar data={chartData} options={options} />
    </div>
  );
}

// 3. Gráfica Tipo Donut para Categorías (Curvas perfectas y leyenda limpia)
export function CategoryPieChart({ data }: { data: CategoryStat[] }) {
  const total = data.reduce((sum, d) => sum + d.count, 0);
  const labels = data.map(d => CATEGORY_LABELS[d.category] ?? d.category);
  const counts = data.map(d => d.count);
  const backgroundColors = data.map((_, i) => CATEGORY_PALETTE[i % CATEGORY_PALETTE.length]);

  const chartData = {
    labels,
    datasets: [
      {
        data: counts,
        backgroundColor: backgroundColors,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        hoverBorderColor: '#ffffff',
        hoverOffset: 6,
        borderRadius: 5,
        spacing: 3,
      },
    ],
  };

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: { display: false },
      tooltip: {
        ...commonTooltipOptions,
        callbacks: {
          label: (context) => {
            const count = Number(context.raw) || 0;
            const pct = total > 0 ? ((count / total) * 100).toFixed(0) : '0';
            return ` ${context.label}: ${count} reportes (${pct}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full h-[210px] flex items-center justify-center">
        <Doughnut data={chartData} options={options} />
        {/* Metrica central en el donut */}
        <div className="absolute flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-extrabold text-gray-900 dark:text-white leading-none">
            {total}
          </span>
          <span className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold mt-1">
            Total
          </span>
        </div>
      </div>

      {/* Leyenda estructurada en badges limpios (evita solapamientos) */}
      <div className="w-full grid grid-cols-2 gap-2 mt-4">
        {data.map((item, idx) => {
          const label = CATEGORY_LABELS[item.category] ?? item.category;
          const color = CATEGORY_PALETTE[idx % CATEGORY_PALETTE.length];
          const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
          return (
            <div
              key={item.category}
              className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-700/40 border border-gray-100 dark:border-gray-600/40 text-xs"
            >
              <div className="flex items-center gap-1.5 truncate">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                <span className="truncate text-gray-700 dark:text-gray-200 font-medium">{label}</span>
              </div>
              <div className="flex items-center gap-1 pl-1">
                <span className="font-bold text-gray-900 dark:text-white">{item.count}</span>
                <span className="text-[10px] text-gray-400">({pct}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 4. Gráfica Tipo Donut para Urgencia (Curvas perfectas y acentos limpios)
export function UrgencyPieChart({ data }: { data: UrgencyStat[] }) {
  const total = data.reduce((sum, d) => sum + d.count, 0);
  const labels = data.map(d => URGENCY_CONFIG[d.urgency]?.label ?? d.urgency);
  const counts = data.map(d => d.count);
  const backgroundColors = data.map(d => URGENCY_CONFIG[d.urgency]?.color ?? '#94a3b8');

  const chartData = {
    labels,
    datasets: [
      {
        data: counts,
        backgroundColor: backgroundColors,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        hoverBorderColor: '#ffffff',
        hoverOffset: 6,
        borderRadius: 5,
        spacing: 3,
      },
    ],
  };

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: { display: false },
      tooltip: {
        ...commonTooltipOptions,
        callbacks: {
          label: (context) => {
            const count = Number(context.raw) || 0;
            const pct = total > 0 ? ((count / total) * 100).toFixed(0) : '0';
            return ` Urgencia ${context.label}: ${count} (${pct}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full h-[210px] flex items-center justify-center">
        <Doughnut data={chartData} options={options} />
        {/* Metrica central en el donut */}
        <div className="absolute flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-extrabold text-gray-900 dark:text-white leading-none">
            {total}
          </span>
          <span className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold mt-1">
            Urgencias
          </span>
        </div>
      </div>

      {/* Leyenda de badges limpios */}
      <div className="w-full flex flex-col gap-2 mt-4">
        {data.map((item) => {
          const config = URGENCY_CONFIG[item.urgency] ?? { label: item.urgency, color: '#94a3b8' };
          const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
          return (
            <div
              key={item.urgency}
              className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-700/40 border border-gray-100 dark:border-gray-600/40 text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: config.color }} />
                <span className="text-gray-700 dark:text-gray-200 font-medium">Urgencia {config.label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-gray-900 dark:text-white">{item.count} reportes</span>
                <span className="text-[11px] font-semibold text-gray-400 bg-gray-200 dark:bg-gray-600 px-1.5 py-0.5 rounded">
                  {pct}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

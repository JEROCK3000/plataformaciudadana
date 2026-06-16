import React from 'react';
import { prisma } from '@/lib/db/prisma';
import { ArrowLeft, BarChart3, MapPin, TrendingUp, CheckCircle2, Clock, AlertCircle, XCircle, FileText, Map } from 'lucide-react';
import Link from 'next/link';
import {
  ParishBarChart,
  ParishStackedChart,
  CategoryPieChart,
  UrgencyPieChart,
  type ParishStat,
  type CategoryStat,
  type UrgencyStat,
} from '@/components/ui/StatsCharts';
import MapaQuijos from '@/components/ui/MapaQuijos';

const PARISHES = ['Baeza', 'Cosanga', 'Cuyuja', 'Papallacta', 'San Francisco de Borja', 'Sumaco'];

const STATUS_LABELS: Record<string, string> = {
  RECEIVED: 'Recibidos',
  IN_REVIEW: 'En revisión',
  IN_PROGRESS: 'En proceso',
  RESOLVED: 'Resueltos',
  REJECTED: 'Rechazados',
};

const CATEGORY_LABELS: Record<string, string> = {
  INFRASTRUCTURE: 'Infraestructura',
  SECURITY: 'Seguridad',
  WATER: 'Agua',
  SERVICES: 'Servicios',
  ENVIRONMENT: 'Medio Ambiente',
  EDUCATION: 'Educación',
  OTHER: 'Otro',
};

const URGENCY_LABELS: Record<string, string> = {
  HIGH: 'Alta',
  MEDIUM: 'Media',
  LOW: 'Baja',
};

const URGENCY_COLORS: Record<string, string> = {
  HIGH: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  MEDIUM: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  LOW: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
};

export default async function StatsPage() {
  const [reports, byParishRaw, byCategoryRaw, byUrgencyRaw, byStatusRaw] = await Promise.all([
    prisma.report.count(),
    prisma.report.groupBy({ by: ['parish', 'status'], _count: { id: true } }),
    prisma.report.groupBy({ by: ['category'], _count: { id: true } }),
    prisma.report.groupBy({ by: ['urgency'], _count: { id: true } }),
    prisma.report.groupBy({ by: ['status'], _count: { id: true } }),
  ]);

  const statusTotals = Object.fromEntries(
    byStatusRaw.map(r => [r.status, r._count.id])
  ) as Record<string, number>;

  const pending = (statusTotals['RECEIVED'] ?? 0) + (statusTotals['IN_REVIEW'] ?? 0);
  const inProgress = statusTotals['IN_PROGRESS'] ?? 0;
  const resolved = statusTotals['RESOLVED'] ?? 0;
  const rejected = statusTotals['REJECTED'] ?? 0;

  // Build per-parish stats
  const parishStats: ParishStat[] = PARISHES.map(parish => {
    const rows = byParishRaw.filter(r => r.parish === parish);
    const stat: ParishStat = {
      parish,
      total: rows.reduce((s, r) => s + r._count.id, 0),
      RECEIVED: 0, IN_REVIEW: 0, IN_PROGRESS: 0, RESOLVED: 0, REJECTED: 0,
    };
    for (const r of rows) {
      stat[r.status as keyof ParishStat] = r._count.id as never;
    }
    return stat;
  }).sort((a, b) => b.total - a.total);

  // Category pie data
  const categoryData: CategoryStat[] = byCategoryRaw
    .map(r => ({ category: r.category, count: r._count.id }))
    .sort((a, b) => b.count - a.count);

  // Urgency pie data
  const urgencyData: UrgencyStat[] = byUrgencyRaw
    .map(r => ({ urgency: r.urgency, count: r._count.id }))
    .sort((a, b) => b.count - a.count);

  // Per-parish top category
  const parishTopCategory = await Promise.all(
    PARISHES.map(async parish => {
      const rows = await prisma.report.groupBy({
        by: ['category'],
        where: { parish },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 1,
      });
      return { parish, topCategory: rows[0]?.category ?? null };
    })
  );
  const topCategoryMap = Object.fromEntries(parishTopCategory.map(r => [r.parish, r.topCategory]));

  // Map data
  const mapData = parishStats.map(s => ({
    parish: s.parish,
    total: s.total,
    resolved: s.RESOLVED,
    pending: s.RECEIVED + s.IN_REVIEW,
    inProgress: s.IN_PROGRESS,
  }));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans pb-12">
      {/* Header */}
      <header className="bg-gray-900 dark:bg-black text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 py-4">
            <Link href="/admin" className="p-2 hover:bg-gray-800 rounded-full transition-colors" title="Volver al panel">
              <ArrowLeft size={20} />
            </Link>
            <BarChart3 size={24} className="text-emerald-400" />
            <div className="flex-1">
              <h1 className="text-xl font-bold">KPIs y Estadísticas</h1>
              <p className="text-xs text-gray-400">Distribución de reportes ciudadanos por parroquia</p>
            </div>
            <a
              href="/mapa-prototipo.html"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 rounded-lg text-sm font-bold shadow transition-colors"
            >
              <Map size={16} /> Ver Mapa Prototipo
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* KPI Cards globales */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Resumen General</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <KpiCard icon={<FileText size={20} />} label="Total Reportes" value={reports} color="bg-gray-800 text-white dark:bg-gray-700" />
            <KpiCard icon={<AlertCircle size={20} />} label="Pendientes" value={pending} color="bg-indigo-600 text-white" />
            <KpiCard icon={<Clock size={20} />} label="En Proceso" value={inProgress} color="bg-blue-600 text-white" />
            <KpiCard icon={<CheckCircle2 size={20} />} label="Resueltos" value={resolved} color="bg-emerald-600 text-white" />
            <KpiCard icon={<XCircle size={20} />} label="Rechazados" value={rejected} color="bg-red-600 text-white" />
          </div>
        </section>

        {/* Mapa del cantón Quijos */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white flex items-center gap-2 mb-1">
            <Map size={16} className="text-emerald-500" /> Mapa del Cantón Quijos — Reportes por Parroquia
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Pasa el cursor sobre cada parroquia para ver el detalle. El color indica la intensidad de reportes.
          </p>
          <MapaQuijos data={mapData} />
        </section>

        {/* Gráficas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Barra: total por parroquia */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-base font-semibold text-gray-800 dark:text-white flex items-center gap-2 mb-4">
              <MapPin size={16} className="text-emerald-500" /> Reportes por Parroquia
            </h3>
            <ParishBarChart data={parishStats} />
          </div>

          {/* Barra apilada: estados por parroquia */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-base font-semibold text-gray-800 dark:text-white flex items-center gap-2 mb-4">
              <TrendingUp size={16} className="text-blue-500" /> Estados por Parroquia
            </h3>
            <ParishStackedChart data={parishStats} />
          </div>

          {/* Pie: por categoría */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-4">Distribución por Categoría</h3>
            {categoryData.length > 0
              ? <CategoryPieChart data={categoryData} />
              : <EmptyChart />}
          </div>

          {/* Pie: por urgencia */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-4">Distribución por Urgencia</h3>
            {urgencyData.length > 0
              ? <UrgencyPieChart data={urgencyData} />
              : <EmptyChart />}
          </div>
        </div>

        {/* Tabla detallada por parroquia */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-base font-semibold text-gray-800 dark:text-white flex items-center gap-2">
              <MapPin size={16} className="text-emerald-500" /> Detalle por Parroquia
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-900 dark:text-gray-300">
                <tr>
                  <th className="px-6 py-3">Parroquia</th>
                  <th className="px-6 py-3 text-center">Total</th>
                  {Object.entries(STATUS_LABELS).map(([k, v]) => (
                    <th key={k} className="px-4 py-3 text-center">{v}</th>
                  ))}
                  <th className="px-6 py-3">Categoría principal</th>
                  <th className="px-6 py-3 text-center">Urgencia más alta</th>
                </tr>
              </thead>
              <tbody>
                {parishStats.map(stat => {
                  const topCat = topCategoryMap[stat.parish];
                  return (
                    <tr key={stat.parish} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750">
                      <td className="px-6 py-4 font-semibold text-gray-800 dark:text-gray-200">
                        {stat.parish}
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-gray-900 dark:text-white">
                        {stat.total}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <StatBadge value={stat.RECEIVED} color="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300" />
                      </td>
                      <td className="px-4 py-4 text-center">
                        <StatBadge value={stat.IN_REVIEW} color="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300" />
                      </td>
                      <td className="px-4 py-4 text-center">
                        <StatBadge value={stat.IN_PROGRESS} color="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" />
                      </td>
                      <td className="px-4 py-4 text-center">
                        <StatBadge value={stat.RESOLVED} color="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" />
                      </td>
                      <td className="px-4 py-4 text-center">
                        <StatBadge value={stat.REJECTED} color="bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" />
                      </td>
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                        {topCat ? CATEGORY_LABELS[topCat] ?? topCat : <span className="text-gray-400">—</span>}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <TopUrgencyCell parish={stat.parish} urgencyLabels={URGENCY_LABELS} urgencyColors={URGENCY_COLORS} />
                      </td>
                    </tr>
                  );
                })}
                {parishStats.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-6 py-10 text-center text-gray-400">No hay datos de reportes aún.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Leyenda de estados */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Leyenda de Estados</h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <span key={k} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: STATUS_DOT_COLORS[k] }} />
                {v}
              </span>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}

const STATUS_DOT_COLORS: Record<string, string> = {
  RECEIVED: '#6366f1',
  IN_REVIEW: '#f59e0b',
  IN_PROGRESS: '#3b82f6',
  RESOLVED: '#10b981',
  REJECTED: '#ef4444',
};

function KpiCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <div className={`rounded-xl p-5 flex flex-col gap-2 shadow-sm ${color}`}>
      <div className="opacity-80">{icon}</div>
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-xs font-medium opacity-80 uppercase tracking-wide">{label}</div>
    </div>
  );
}

function StatBadge({ value, color }: { value: number; color: string }) {
  if (value === 0) return <span className="text-gray-300 dark:text-gray-600">—</span>;
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}>
      {value}
    </span>
  );
}

async function TopUrgencyCell({
  parish,
  urgencyLabels,
  urgencyColors,
}: {
  parish: string;
  urgencyLabels: Record<string, string>;
  urgencyColors: Record<string, string>;
}) {
  const rows = await prisma.report.groupBy({
    by: ['urgency'],
    where: { parish },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 1,
  });
  const top = rows[0];
  if (!top) return <span className="text-gray-400">—</span>;
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${urgencyColors[top.urgency] ?? ''}`}>
      {urgencyLabels[top.urgency] ?? top.urgency}
    </span>
  );
}

function EmptyChart() {
  return (
    <div className="h-48 flex items-center justify-center text-gray-400 dark:text-gray-600 text-sm">
      Sin datos suficientes para mostrar
    </div>
  );
}

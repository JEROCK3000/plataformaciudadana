import React from 'react';
import { prisma } from '@/lib/db/prisma';
import ReportForm from '@/components/forms/ReportForm';
import ReportCard from '@/components/ui/ReportCard';
import { BarChart3, List, Search } from 'lucide-react';

export default async function PublicPortal() {
  // Obtener todos los reportes (Single-Tenant)
  const reports = await prisma.report.findMany({
    orderBy: { createdAt: 'desc' }
  });

  const parroquias = ["Baeza", "Cosanga", "Cuyuja", "Papallacta", "San Francisco de Borja", "Sumaco"];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
      <header className="bg-emerald-800 dark:bg-emerald-950 text-white sticky top-0 z-10 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="bg-white dark:bg-gray-800 p-2 rounded-lg text-emerald-800 dark:text-emerald-400 shadow-sm">
                <BarChart3 size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold leading-tight">Plataforma Ciudadana</h1>
                <p className="text-xs text-emerald-200 font-medium tracking-wide uppercase">Participación Eficiente y Activa</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Formulario a la izquierda (Más ancho) */}
          <div className="lg:col-span-5">
            <ReportForm parroquias={parroquias} />
          </div>

          {/* Listado a la derecha */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium">
                <List size={20} />
                <h2 className="text-lg">Tablero Público de Reportes</h2>
              </div>
            </div>

            {reports.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 text-center py-16 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="w-20 h-20 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400 dark:text-gray-500">
                  <Search size={32} />
                </div>
                <h3 className="text-xl font-medium text-gray-800 dark:text-white">No hay reportes aún</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto">
                  Sé el primer ciudadano en reportar una necesidad.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reports.map((report) => (
                  <ReportCard key={report.id} report={report} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

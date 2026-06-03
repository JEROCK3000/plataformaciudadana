import React from 'react';
import { prisma } from '@/lib/db/prisma';
import { Shield, Settings, Users, LogOut } from 'lucide-react';
import Link from 'next/link';
import { logoutAction } from '@/lib/actions/auth';

export default async function AdminDashboard() {
  const reports = await prisma.report.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <header className="bg-gray-900 dark:bg-black text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <Shield size={24} className="text-emerald-400" />
              <h1 className="text-xl font-bold">Panel de Administración</h1>
            </div>
            <div className="flex items-center gap-4 text-sm font-medium">
              <button disabled className="flex items-center gap-2 text-gray-400 dark:text-gray-500 cursor-not-allowed transition-colors" title="Módulo en desarrollo">
                <Settings size={18} /> Configuración
              </button>
              <button disabled className="flex items-center gap-2 text-gray-400 dark:text-gray-500 cursor-not-allowed transition-colors" title="Módulo en desarrollo">
                <Users size={18} /> Usuarios
              </button>
              <form action={logoutAction}>
                <button type="submit" className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors ml-4 border-l border-gray-700 pl-4">
                  <LogOut size={18} /> Salir
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Reportes Ciudadanos Recientes</h2>
            <a href="/admin/ai-analysis" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium shadow transition-colors">
              Lluvia de Ideas IA ✨
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-900 dark:text-gray-300">
                <tr>
                  <th scope="col" className="px-6 py-3">Fecha</th>
                  <th scope="col" className="px-6 py-3">Reporte</th>
                  <th scope="col" className="px-6 py-3">Urgencia</th>
                  <th scope="col" className="px-6 py-3">Estado</th>
                  <th scope="col" className="px-6 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center">No hay reportes en el sistema</td>
                  </tr>
                ) : (
                  reports.map(report => (
                    <tr key={report.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">{new Date(report.createdAt).toLocaleDateString('es-EC')}</td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-800 dark:text-gray-200">{report.title}</div>
                        <div className="text-xs">{report.parish} - {report.neighborhood}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-700">{report.urgency}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">{report.status}</span>
                      </td>
                      <td className="px-6 py-4">
                        <Link href={`/admin/report/${report.id}`} className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium">Ver / Gestionar</Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

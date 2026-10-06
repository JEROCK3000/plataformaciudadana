import React from 'react';
import { prisma } from '@/lib/db/prisma';
import { Shield, Settings, Users, LogOut, Globe, BarChart3, Building2, FolderDown, Target, QrCode, Vote } from 'lucide-react';
import Link from 'next/link';
import { logoutAction } from '@/lib/actions/auth';
import { requireTenantAdmin } from '@/lib/auth/session';
import ReportsAdminTable from '@/components/admin/ReportsAdminTable';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const { session, tenantId } = await requireTenantAdmin();

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
  });

  const reports = await prisma.report.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <header className="bg-gray-900 dark:bg-black text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <Shield size={24} className="text-emerald-400" />
              <div>
                <h1 className="text-xl font-bold leading-tight">Panel de Administración</h1>
                <p className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                  <Building2 size={12} /> {tenant?.name || 'GAD Municipal'} (Cantón {tenant?.canton || ''})
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm font-medium">
              <Link 
                href={tenant ? `/${tenant.slug}` : "/"} 
                className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors border-r border-gray-700 pr-3 mr-1" 
                title="Volver al Portal Ciudadano de este cantón"
              >
                <Globe size={18} /> Portal
              </Link>

              {/* MÓDULOS DE INTELIGENCIA ELECTORAL / MODO CAMPAÑA */}
              <Link 
                href="/admin/control-electoral" 
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors font-bold text-xs shadow-sm ${
                  tenant?.campaignMode 
                    ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/40' 
                    : 'text-red-400 hover:text-red-300 hover:bg-gray-800'
                }`}
                title="Control Electoral Día D & Conteo Rápido de Actas"
              >
                <Vote size={16} className="text-red-400" /> Día D
              </Link>
              <Link 
                href="/admin/war-room" 
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors font-bold text-xs shadow-sm ${
                  tenant?.campaignMode 
                    ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40' 
                    : 'text-amber-400 hover:text-amber-300 hover:bg-gray-800'
                }`}
                title="Centro de Inteligencia de Campaña & Discurso"
              >
                <Target size={16} className="text-amber-400" /> War Room
              </Link>
              <Link 
                href="/admin/qr-codes" 
                className="flex items-center gap-1.5 text-amber-400/90 hover:text-amber-300 transition-colors font-medium text-xs px-2 py-1 rounded-lg hover:bg-gray-800"
                title="Generador de Códigos QR para Brigadas"
              >
                <QrCode size={16} /> Códigos QR
              </Link>

              <Link href="/admin/stats" className="flex items-center gap-2 hover:text-emerald-400 transition-colors">
                <BarChart3 size={18} /> Estadísticas
              </Link>
              <Link href="/admin/descargas" className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors font-semibold">
                <FolderDown size={18} /> Descargas
              </Link>
              <Link href="/admin/settings" className="flex items-center gap-2 hover:text-emerald-400 transition-colors">
                <Settings size={18} /> Configuración
              </Link>
              <Link href="/admin/users" className="flex items-center gap-2 hover:text-emerald-400 transition-colors">
                <Users size={18} /> Usuarios
              </Link>
              <form action={logoutAction}>
                <button type="submit" className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors ml-2 border-l border-gray-700 pl-3">
                  <LogOut size={18} /> Salir
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* BANNER DINÁMICO SI MODO CAMPAÑA ESTÁ ACTIVO */}
        {tenant?.campaignMode ? (
          <div className="mb-6 bg-gradient-to-r from-amber-950/70 via-orange-950/40 to-slate-900 border-2 border-amber-500/50 rounded-2xl p-5 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-2xl bg-amber-500 text-slate-950 font-black flex items-center justify-center shadow-lg shadow-amber-500/30">
                <Target size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-black tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950">
                    Modo Campaña Activo
                  </span>
                  <span className="text-xs text-amber-200/90 font-bold">
                    {tenant.candidateName ? `Candidato(a): ${tenant.candidateName}` : 'Candidatura a la Alcaldía'} {tenant.campaignListNumber ? `• ${tenant.campaignListNumber}` : ''}
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-black text-white mt-1">
                  {tenant.campaignSlogan ? `"${tenant.campaignSlogan}"` : 'Inteligencia Territorial & Escucha Ciudadana'}
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  El sistema está operando como cerebro electoral para el levantamiento de necesidades por parroquia y barrio.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-start sm:self-center">
              <Link 
                href="/admin/control-electoral" 
                className="px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                <Vote size={15} /> Control Electoral
              </Link>
              <Link 
                href="/admin/war-room" 
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                <Target size={15} /> Abrir War Room
              </Link>
              <Link 
                href="/admin/qr-codes" 
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-all flex items-center gap-1.5"
              >
                <QrCode size={15} /> Códigos QR
              </Link>
            </div>
          </div>
        ) : (
          <div className="mb-6 bg-slate-900/90 border border-amber-500/30 rounded-2xl p-4 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center border border-amber-500/30 shrink-0">
                <Target size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-amber-500/30">
                    Módulo de Campaña Electoral
                  </span>
                  <span className="text-xs text-slate-400 font-medium">Modo Institucional Actual</span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Puedes activar el <strong>Modo Campaña Política</strong> en Configuración para personalizar el portal ciudadano, o acceder directamente al <strong>War Room</strong> y al <strong>Generador de Códigos QR</strong>.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link 
                href="/admin/war-room" 
                className="px-3.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
              >
                <Target size={14} /> War Room
              </Link>
              <Link 
                href="/admin/settings" 
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs rounded-xl border border-slate-700 transition-all"
              >
                Ajustes
              </Link>
            </div>
          </div>
        )}

        <ReportsAdminTable
          initialReports={reports}
          parishes={(tenant?.parishes as string[]) || []}
          tenantSlug={tenant?.slug || ''}
          cantonName={tenant?.canton || ''}
        />
      </main>
    </div>
  );
}

import React from 'react';
import { prisma } from '@/lib/db/prisma';
import { Shield, Settings, Users, LogOut, Globe, BarChart3, Building2, FolderDown, Target, Vote, QrCode, Calculator, Calendar } from 'lucide-react';
import Link from 'next/link';
import { logoutAction } from '@/lib/actions/auth';
import { requireTenantAdmin } from '@/lib/auth/session';
import ReportsAdminTable from '@/components/admin/ReportsAdminTable';
import AdminHeaderTacticalMenu from '@/components/admin/AdminHeaderTacticalMenu';

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
      <header className="bg-gray-900 dark:bg-black text-white shadow-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap lg:flex-nowrap justify-between items-center py-3 gap-2">
            
            {/* IDENTIDAD / BRANDING (Compacto y elegante) */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                <Shield size={20} />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-black leading-tight tracking-tight">Panel de Administración</h1>
                <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <Building2 size={11} /> {tenant?.name || 'GAD Municipal'} • Cantón {tenant?.canton || 'Quijos'}
                </p>
              </div>
            </div>

            {/* MENÚ SUPERIOR EN 1 SOLA LÍNEA UNIFICADA */}
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-semibold shrink-0">
              
              {/* Enlace al Portal Ciudadano */}
              <Link 
                href={tenant ? `/${tenant.slug}` : "/"} 
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition-colors" 
                title="Ver Portal Ciudadano público"
              >
                <Globe size={15} />
                <span className="hidden sm:inline">Portal</span>
              </Link>

              <span className="w-px h-4 bg-gray-800" />

              {/* CÁPSULA TÁCTICA ELECTORAL DE 1 SOLA LÍNEA (MODO CAMPAÑA) */}
              {tenant?.campaignMode && (
                <AdminHeaderTacticalMenu 
                  candidateName={tenant.candidateName} 
                  campaignListNumber={tenant.campaignListNumber} 
                />
              )}

              {/* Estadísticas */}
              <Link 
                href="/admin/stats" 
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:text-emerald-400 hover:bg-gray-800/80 transition-colors text-gray-300"
                title="Métricas y Estadísticas Cantonales"
              >
                <BarChart3 size={15} className="text-emerald-400" />
                <span className="hidden xl:inline">Estadísticas</span>
              </Link>

              {/* Descargas Oficiales */}
              <Link 
                href="/admin/descargas" 
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors font-bold"
                title="Descarga de PDFs y Excel Oficial"
              >
                <FolderDown size={15} />
                <span className="hidden md:inline">Descargas</span>
              </Link>

              {/* Configuración */}
              <Link 
                href="/admin/settings" 
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:text-emerald-400 hover:bg-gray-800/80 transition-colors text-gray-300"
                title="Ajustes de Plataforma y Campaña"
              >
                <Settings size={15} />
                <span className="hidden lg:inline">Ajustes</span>
              </Link>

              {/* Usuarios */}
              <Link 
                href="/admin/users" 
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:text-emerald-400 hover:bg-gray-800/80 transition-colors text-gray-300"
                title="Gestión de Usuarios y Roles"
              >
                <Users size={15} />
                <span className="hidden xl:inline">Usuarios</span>
              </Link>

              <span className="w-px h-4 bg-gray-800" />

              {/* Botón Salir */}
              <form action={logoutAction} className="inline-flex">
                <button 
                  type="submit" 
                  className="flex items-center gap-1 px-2 py-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Cerrar sesión"
                >
                  <LogOut size={15} />
                  <span className="hidden sm:inline">Salir</span>
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

            <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
              <Link 
                href="/admin/calculadora-victoria" 
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                title="Simulador de Umbral de Victoria"
              >
                <Calculator size={14} /> Umbral Victoria
              </Link>
              <Link 
                href="/admin/agenda-territorial" 
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                title="Agenda de Caminatas y Mitines"
              >
                <Calendar size={14} /> Agenda Territorio
              </Link>
              <Link 
                href="/admin/padron-electoral" 
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                title="Padrón y Chequeo Día D"
              >
                <Users size={14} /> Padrón / Voto
              </Link>
              <Link 
                href="/admin/control-electoral" 
                className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                <Vote size={14} /> Día D (20 JRVs)
              </Link>
              <Link 
                href="/admin/war-room" 
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-xl border border-amber-500/30 transition-all flex items-center gap-1.5"
              >
                <Target size={14} /> War Room
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

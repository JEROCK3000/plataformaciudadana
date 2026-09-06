import React from 'react';
import { requireAuth } from '@/lib/auth/session';
import { ShieldAlert, Building2, Users, FileCode2, LogOut, ArrowRight, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { logoutAction } from '@/lib/actions/auth';

export const dynamic = 'force-dynamic';

export default async function SuperadminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAuth(['SUPERADMIN']);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="bg-black/60 backdrop-blur border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3.5">
            <div className="flex items-center gap-3">
              <div className="bg-purple-600 p-2 rounded-lg text-white shadow-md shadow-purple-900/30">
                <ShieldAlert size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-bold text-white tracking-wide">Plataforma Ciudadana SaaS</h1>
                  <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    SUPERADMIN
                  </span>
                </div>
                <p className="text-xs text-gray-400">Panel Global de Orquestación y Gobernanza Multi-Tenant</p>
              </div>
            </div>

            <nav className="flex items-center gap-1 sm:gap-2 text-sm font-medium">
              <Link
                href="/superadmin"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white transition-colors"
              >
                <LayoutDashboard size={16} /> <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <Link
                href="/superadmin/tenants"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white transition-colors"
              >
                <Building2 size={16} /> <span>Municipios</span>
              </Link>
              <Link
                href="/superadmin/users"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white transition-colors"
              >
                <Users size={16} /> <span className="hidden sm:inline">Usuarios</span>
              </Link>
              <Link
                href="/superadmin/logs"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white transition-colors"
              >
                <FileCode2 size={16} /> <span className="hidden sm:inline">Logs</span>
              </Link>
              <Link
                href="/admin"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/30 transition-colors ml-2"
                title="Entrar al panel de administración del tenant"
              >
                <span>Ver Admin GAD</span> <ArrowRight size={14} />
              </Link>
              <form action={logoutAction} className="ml-2 pl-2 border-l border-gray-800">
                <button
                  type="submit"
                  className="p-1.5 rounded-lg text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-colors"
                  title="Cerrar Sesión Superadmin"
                >
                  <LogOut size={18} />
                </button>
              </form>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-4 text-center text-xs text-gray-500">
        Superadmin Central • Plataforma Ciudadana SaaS • Sesión: {session.email}
      </footer>
    </div>
  );
}

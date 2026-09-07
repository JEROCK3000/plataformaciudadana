import React from 'react';
import { prisma } from '@/lib/db/prisma';
import { Shield, Settings, Users, LogOut, Globe, BarChart3, Building2 } from 'lucide-react';
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
            <div className="flex items-center gap-4 text-sm font-medium">
              <Link 
                href={tenant ? `/${tenant.slug}` : "/"} 
                className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors border-r border-gray-700 pr-4 mr-2" 
                title="Volver al Portal Ciudadano de este cantón"
              >
                <Globe size={18} /> Portal Ciudadano
              </Link>
              <Link href="/admin/stats" className="flex items-center gap-2 hover:text-emerald-400 transition-colors">
                <BarChart3 size={18} /> Estadísticas
              </Link>
              <Link href="/admin/settings" className="flex items-center gap-2 hover:text-emerald-400 transition-colors">
                <Settings size={18} /> Configuración
              </Link>
              <Link href="/admin/users" className="flex items-center gap-2 hover:text-emerald-400 transition-colors">
                <Users size={18} /> Usuarios
              </Link>
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

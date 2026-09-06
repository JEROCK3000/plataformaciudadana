import React from 'react';
import { prisma } from '@/lib/db/prisma';
import { Plus, Building2, ExternalLink, Power, MapPin } from 'lucide-react';
import Link from 'next/link';
import { toggleTenantStatus } from '@/lib/actions/tenants';

export const dynamic = 'force-dynamic';

export default async function SuperadminTenantsPage() {
  const tenants = await prisma.tenant.findMany({
    include: {
      _count: {
        select: { reports: true, users: true },
      },
    },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="space-y-6">
      {/* Header del listado con botón + Nuevo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Building2 className="text-purple-400" size={24} /> Gestión de Municipios (Tenants)
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Aprovisionamiento y administración de los Gobiernos Autónomos Descentralizados suscritos.
          </p>
        </div>
        <Link
          href="/superadmin/tenants/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-950/40 transition-all self-start sm:self-auto"
        >
          <Plus size={16} /> + Nuevo Municipio
        </Link>
      </div>

      {/* Tabla de listado */}
      <div className="bg-gray-800/80 rounded-2xl border border-gray-700/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="text-xs text-gray-400 uppercase bg-gray-900/50">
              <tr>
                <th className="px-6 py-3.5">Nombre Institucional</th>
                <th className="px-6 py-3.5">Cantón / Provincia</th>
                <th className="px-6 py-3.5">Slug URL</th>
                <th className="px-6 py-3.5">Plan</th>
                <th className="px-6 py-3.5 text-center">Parroquias</th>
                <th className="px-6 py-3.5 text-center">Reportes</th>
                <th className="px-6 py-3.5 text-center">Estado</th>
                <th className="px-6 py-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/40">
              {tenants.map((tenant) => {
                const parishes = (tenant.parishes as string[]) || [];
                return (
                  <tr key={tenant.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white">{tenant.name}</div>
                      <div className="text-xs text-gray-400">{tenant._count.users} administradores asignados</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-gray-200">
                        <MapPin size={14} className="text-emerald-400" /> Cantón {tenant.canton}
                      </div>
                      <div className="text-xs text-gray-400">{tenant.province}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-purple-300">
                      /{tenant.slug}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-700 text-gray-300 border border-gray-600">
                        {tenant.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2 py-0.5 rounded bg-gray-700/60 text-xs font-semibold" title={parishes.join(', ')}>
                        {parishes.length}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-white">
                      {tenant._count.reports}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          tenant.isActive
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-red-950 text-red-400 border border-red-800'
                        }`}
                      >
                        {tenant.isActive ? 'Activo' : 'Suspendido'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link
                        href={`/${tenant.slug}`}
                        target="_blank"
                        className="text-xs px-2.5 py-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-200 transition-colors inline-flex items-center gap-1"
                        title="Ver portal ciudadano"
                      >
                        Portal <ExternalLink size={12} />
                      </Link>

                      <form
                        action={async () => {
                          'use server';
                          await toggleTenantStatus(tenant.id);
                        }}
                        className="inline-block"
                      >
                        <button
                          type="submit"
                          className={`text-xs px-2.5 py-1 rounded transition-colors inline-flex items-center gap-1 ${
                            tenant.isActive
                              ? 'bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800'
                              : 'bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-800'
                          }`}
                          title={tenant.isActive ? 'Suspender este tenant' : 'Activar este tenant'}
                        >
                          <Power size={12} /> {tenant.isActive ? 'Suspender' : 'Activar'}
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

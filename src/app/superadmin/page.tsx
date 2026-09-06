import React from 'react';
import { prisma } from '@/lib/db/prisma';
import { Building2, Users, FileText, CheckCircle, Clock, AlertTriangle, Plus, ExternalLink, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function SuperadminDashboard() {
  const [tenantsCount, activeTenantsCount, usersCount, reportsCount, resolvedCount, pendingCount, tenants] = await Promise.all([
    prisma.tenant.count(),
    prisma.tenant.count({ where: { isActive: true } }),
    prisma.user.count(),
    prisma.report.count(),
    prisma.report.count({ where: { status: 'RESOLVED' } }),
    prisma.report.count({ where: { status: { in: ['RECEIVED', 'IN_REVIEW'] } } }),
    prisma.tenant.findMany({
      include: {
        _count: {
          select: { reports: true, users: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return (
    <div className="space-y-8">
      {/* Top Welcome & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-800/60 p-6 rounded-2xl border border-gray-700/60">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Centro de Control SaaS Global</h2>
          <p className="text-sm text-gray-400 mt-1">Supervisión en tiempo real de todos los GADs Municipales suscritos.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/superadmin/tenants"
            className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-950/50 transition-all hover:scale-105"
          >
            <Plus size={16} /> Aprovisionar Municipio
          </Link>
        </div>
      </div>

      {/* KPI Global Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800/80 p-5 rounded-2xl border border-gray-700/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-purple-400">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Municipios (Tenants)</span>
            <Building2 size={20} />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-white">{activeTenantsCount}</div>
            <div className="text-xs text-gray-400 mt-1">{tenantsCount} registrados en total</div>
          </div>
        </div>

        <div className="bg-gray-800/80 p-5 rounded-2xl border border-gray-700/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-blue-400">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Reportes Nacionales</span>
            <FileText size={20} />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-white">{reportsCount}</div>
            <div className="text-xs text-emerald-400 mt-1">{resolvedCount} resueltos con éxito</div>
          </div>
        </div>

        <div className="bg-gray-800/80 p-5 rounded-2xl border border-gray-700/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Reportes Pendientes</span>
            <Clock size={20} />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-white">{pendingCount}</div>
            <div className="text-xs text-gray-400 mt-1">Requieren atención municipal</div>
          </div>
        </div>

        <div className="bg-gray-800/80 p-5 rounded-2xl border border-gray-700/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Usuarios Totales</span>
            <Users size={20} />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-white">{usersCount}</div>
            <div className="text-xs text-gray-400 mt-1">Superadmins y Admins GAD</div>
          </div>
        </div>
      </div>

      {/* Tenants Table */}
      <div className="bg-gray-800/80 rounded-2xl border border-gray-700/60 overflow-hidden">
        <div className="p-6 border-b border-gray-700/60 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-white">Municipios Operativos en la Red</h3>
            <p className="text-xs text-gray-400">Estado de suscripción y actividad de cada cantón</p>
          </div>
          <Link
            href="/superadmin/tenants"
            className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
          >
            Ver todos los municipios <ArrowRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="text-xs text-gray-400 uppercase bg-gray-900/50">
              <tr>
                <th className="px-6 py-3.5">Municipio / Cantón</th>
                <th className="px-6 py-3.5">Slug</th>
                <th className="px-6 py-3.5">Plan</th>
                <th className="px-6 py-3.5 text-center">Reportes</th>
                <th className="px-6 py-3.5 text-center">Usuarios</th>
                <th className="px-6 py-3.5 text-center">Estado</th>
                <th className="px-6 py-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/40">
              {tenants.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-gray-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-white">{tenant.name}</div>
                    <div className="text-xs text-gray-400">Cantón {tenant.canton}, {tenant.province}</div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-purple-300">
                    /{tenant.slug}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-700 text-gray-300 border border-gray-600">
                      {tenant.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-white">
                    {tenant._count.reports}
                  </td>
                  <td className="px-6 py-4 text-center text-gray-300">
                    {tenant._count.users}
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

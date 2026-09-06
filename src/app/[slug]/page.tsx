import React from 'react';
import { prisma } from '@/lib/db/prisma';
import { notFound } from 'next/navigation';
import ReportForm from '@/components/forms/ReportForm';
import ReportCard from '@/components/ui/ReportCard';
import { Building2, List, Search, MapPin, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function TenantPublicPortal({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    include: {
      reports: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!tenant || !tenant.isActive) {
    notFound();
  }

  const parroquias = (tenant.parishes as string[]) || [tenant.canton];
  const reports = tenant.reports;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
      <header className="bg-emerald-800 dark:bg-emerald-950 text-white sticky top-0 z-10 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <Link href="/" className="p-2 hover:bg-emerald-700/50 rounded-lg text-emerald-200 hover:text-white transition-colors" title="Ver todos los municipios">
                <ArrowLeft size={20} />
              </Link>
              <div className="bg-white dark:bg-gray-800 p-2 rounded-lg text-emerald-800 dark:text-emerald-400 shadow-sm">
                <Building2 size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold leading-tight">{tenant.name}</h1>
                <p className="text-xs text-emerald-200 font-medium tracking-wide uppercase flex items-center gap-1">
                  <MapPin size={12} /> Cantón {tenant.canton}, {tenant.province} • Portal de Participación
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Link
                href="/login"
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-700/60 hover:bg-emerald-700 text-white transition-colors"
              >
                Acceso Funcionarios
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Formulario a la izquierda */}
          <div className="lg:col-span-5">
            <ReportForm 
              parroquias={parroquias} 
              tenantSlug={tenant.slug} 
              tenantName={tenant.name} 
            />
          </div>

          {/* Listado a la derecha */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium">
                <List size={20} />
                <h2 className="text-lg">Reportes Ciudadanos de {tenant.canton} ({reports.length})</h2>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 rounded-full">
                SaaS Activo
              </span>
            </div>

            {reports.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 text-center py-16 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="w-20 h-20 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400 dark:text-gray-500">
                  <Search size={32} />
                </div>
                <h3 className="text-xl font-medium text-gray-800 dark:text-white">No hay reportes en {tenant.canton} aún</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto text-sm">
                  Sé el primer ciudadano de {tenant.canton} en registrar una necesidad barrial.
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

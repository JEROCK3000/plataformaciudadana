import React from 'react';
import { prisma } from '@/lib/db/prisma';
import { notFound } from 'next/navigation';
import ReportForm from '@/components/forms/ReportForm';
import ReportCard from '@/components/ui/ReportCard';
import TicketTracker from '@/components/ui/TicketTracker';
import { Building2, List, Search, MapPin, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function TenantPublicPortal({ 
  params,
  searchParams,
}: { 
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ parish?: string; brigade?: string }>;
}) {
  const { slug } = await params;
  const query = searchParams ? await searchParams : {};
  const initialParish = query?.parish;

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
      <header className={tenant.campaignMode 
        ? "bg-slate-950 text-white sticky top-0 z-10 shadow-md border-b border-amber-500/40" 
        : "bg-emerald-800 dark:bg-emerald-950 text-white sticky top-0 z-10 shadow-md"
      }>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <Link href="/" className="p-2 hover:bg-white/10 rounded-lg text-emerald-200 hover:text-white transition-colors" title="Ver todos los municipios">
                <ArrowLeft size={20} />
              </Link>
              {tenant.campaignMode && tenant.candidatePhotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={tenant.candidatePhotoUrl} 
                  alt={tenant.candidateName || 'Candidato'} 
                  className="w-12 h-12 rounded-full object-cover border-2 border-amber-400 shrink-0 shadow-md shadow-amber-500/20" 
                />
              ) : !tenant.campaignMode && tenant.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={tenant.logoUrl} 
                  alt={tenant.name} 
                  className="w-12 h-12 object-contain bg-white dark:bg-gray-800 p-1 rounded-lg shrink-0 shadow-sm" 
                />
              ) : (
                <div className={tenant.campaignMode 
                  ? "bg-amber-500 text-slate-950 p-2 rounded-xl shadow-md font-black shrink-0" 
                  : "bg-white dark:bg-gray-800 p-2 rounded-lg text-emerald-800 dark:text-emerald-400 shadow-sm shrink-0"
                }>
                  <Building2 size={24} />
                </div>
              )}
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold leading-tight">
                    {tenant.campaignMode && tenant.candidateName ? tenant.candidateName : tenant.name}
                  </h1>
                  {tenant.campaignMode && (
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      {tenant.campaignListNumber || 'Campaña Ciudadana'}
                    </span>
                  )}
                  {tenant.campaignMode && tenant.partyLogoUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={tenant.partyLogoUrl} 
                      alt="Logo Lista" 
                      className="h-6 w-auto max-w-[80px] object-contain rounded bg-slate-950/70 p-0.5 border border-amber-500/30" 
                    />
                  )}
                </div>
                <p className="text-xs text-emerald-200/90 font-medium tracking-wide uppercase flex items-center gap-1 mt-0.5">
                  <MapPin size={12} className={tenant.campaignMode ? "text-amber-400" : ""} /> 
                  Cantón {tenant.canton}, {tenant.province} • {tenant.campaignMode && tenant.campaignSlogan ? `"${tenant.campaignSlogan}"` : 'Portal de Participación'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Link
                href="/login"
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  tenant.campaignMode 
                    ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40' 
                    : 'bg-emerald-700/60 hover:bg-emerald-700 text-white'
                }`}
              >
                Acceso Sistema
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
              initialParish={initialParish}
              campaignMode={tenant.campaignMode}
              candidateName={tenant.candidateName}
              campaignSlogan={tenant.campaignSlogan}
            />
          </div>

          {/* Listado y Tracker a la derecha */}
          <div className="lg:col-span-7 space-y-6">
            <TicketTracker tenantSlug={tenant.slug} cantonName={tenant.canton} />

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

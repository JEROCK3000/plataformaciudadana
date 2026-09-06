import React from 'react';
import { prisma } from '@/lib/db/prisma';
import { Building2, ArrowRight, Shield, BarChart3, CheckCircle2, MapPin } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const tenants = await prisma.tenant.findMany({
    where: { isActive: true },
    include: {
      _count: {
        select: { reports: true },
      },
    },
    orderBy: { name: 'asc' },
  });

  const totalReports = await prisma.report.count();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans flex flex-col">
      {/* Header */}
      <header className="bg-emerald-900 dark:bg-black text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-600 p-2 rounded-lg text-white shadow">
                <Shield size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">Plataforma Ciudadana SaaS</h1>
                <p className="text-xs text-emerald-300 font-medium uppercase tracking-wider">Red de Gobiernos Autónomos Descentralizados</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white transition-colors shadow-sm"
              >
                Panel de Funcionarios
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="inline-block px-3 py-1 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-full uppercase tracking-wider">
            Arquitectura SaaS Multitenant Activa
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Gestión Territorial y Participación Ciudadana con IA
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
            Cada GAD Municipal cuenta con su propio portal independiente, análisis normativo del COOTAD y canalización directa de necesidades barriales.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-emerald-500" /> Aislamiento de datos</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-emerald-500" /> Inteligencia Artificial SERCOP / COOTAD</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-emerald-500" /> Total reportes en red: {totalReports}</span>
          </div>
        </div>

        {/* Directory of Cantons / Tenants */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Municipios Conectados</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Selecciona un cantón para acceder a su portal ciudadano independiente</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tenants.map((tenant) => {
              const parishes = (tenant.parishes as string[]) || [];
              return (
                <div
                  key={tenant.id}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-700 transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <Building2 size={24} />
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                        Plan {tenant.plan}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {tenant.name}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                        <MapPin size={14} className="text-emerald-500" /> Cantón {tenant.canton}, Provincia de {tenant.province}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 space-y-1">
                      <div className="flex justify-between">
                        <span>Parroquias registradas:</span>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">{parishes.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Reportes ciudadanos:</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">{tenant._count.reports}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <Link
                      href={`/${tenant.slug}`}
                      className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow transition-all group-hover:translate-x-1"
                    >
                      Ingresar al Portal de {tenant.canton} <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 py-6 text-center text-xs text-gray-500 dark:text-gray-400">
        Plataforma Ciudadana SaaS Multi-Tenant • Desarrollado por SOLINTEEC DEVS & TECH © 2026
      </footer>
    </div>
  );
}

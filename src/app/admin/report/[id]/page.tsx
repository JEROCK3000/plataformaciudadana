import React from 'react';
import { prisma } from '@/lib/db/prisma';
import { notFound } from 'next/navigation';
import { MapPin, User, ArrowLeft, Clock, Info, CheckCircle, Shield, Globe, Tag, Building2 } from 'lucide-react';
import Link from 'next/link';
import SingleReportAI from '@/components/ui/SingleReportAI';
import ReactMarkdown from 'react-markdown';
import { requireTenantAdmin } from '@/lib/auth/session';
import TechnicalResolutionForm from '@/components/admin/TechnicalResolutionForm';
import { DEPARTMENT_LABELS } from '@/lib/reports/excel';

export const dynamic = 'force-dynamic';

const STATUS_LABELS: Record<string, string> = {
  RECEIVED:    'Recibido',
  IN_REVIEW:   'En revisión',
  IN_PROGRESS: 'En proceso',
  RESOLVED:    'Resuelto',
  REJECTED:    'Rechazado',
};

const STATUS_STYLES: Record<string, string> = {
  RECEIVED:    'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  IN_REVIEW:   'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  IN_PROGRESS: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  RESOLVED:    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  REJECTED:    'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

export default async function AdminSingleReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { session, tenantId } = await requireTenantAdmin();

  const report = await prisma.report.findUnique({
    where: { id },
    include: {
      tenant: true,
      comments: {
        where: { status: 'APPROVED' },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!report) {
    notFound();
  }

  // Aislamiento: Si no es superadmin, solo puede ver reportes de su tenant
  if (session.role !== 'SUPERADMIN' && report.tenantId !== tenantId) {
    notFound();
  }

  const categoryLabels: Record<string, string> = {
    INFRASTRUCTURE: 'Infraestructura',
    SECURITY: 'Seguridad',
    WATER: 'Agua y Saneamiento',
    SERVICES: 'Servicios Públicos',
    ENVIRONMENT: 'Medio Ambiente',
    EDUCATION: 'Educación',
    OTHER: 'Otros'
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans pb-12">
      <header className="bg-gray-900 dark:bg-black text-white shadow-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="p-2 hover:bg-gray-800 rounded-full transition-colors" title="Volver al panel">
                <ArrowLeft size={20} />
              </Link>
              <Shield size={24} className="text-emerald-400" />
              <div>
                <h1 className="text-xl font-bold">Gestión de Reporte</h1>
                <p className="text-xs text-gray-400">
                  {report.tenant?.name} • Ticket: <span className="text-emerald-400 font-mono font-bold">{report.ticketCode || 'SIN-TICKET'}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <Link
                href={report.tenant ? `/${report.tenant.slug}` : "/"}
                className="flex items-center gap-2 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
                title="Volver al Portal Público de este cantón"
              >
                <Globe size={18} /> Portal Ciudadano
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Módulo de Gestión y Cierre Técnico */}
        <TechnicalResolutionForm
          reportId={report.id}
          currentStatus={report.status}
          currentDepartment={report.department}
          currentNotes={report.resolutionNotes}
          currentPhotos={(report.resolutionPhotos as string[]) || []}
          originalPhotos={(report.photos as string[]) || []}
        />

        {/* Cabecera del Reporte */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {report.ticketCode && (
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-300 dark:border-purple-800 flex items-center gap-1">
                  <Tag size={12} /> {report.ticketCode}
                </span>
              )}
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300">
                {categoryLabels[report.category] || report.category}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 flex items-center gap-1">
                <Building2 size={12} /> {DEPARTMENT_LABELS[report.department] || report.department}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[report.status] ?? 'bg-gray-100 text-gray-700'}`}>
                {STATUS_LABELS[report.status] ?? report.status}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">{report.title}</h2>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6 pb-6 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>{new Date(report.createdAt).toLocaleDateString('es-EC')}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-emerald-500" />
                <span>{report.neighborhood}, {report.parish}</span>
              </div>
            </div>

            <div className="prose dark:prose-invert max-w-none mb-8">
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
                <Info size={18} className="text-gray-400" /> Descripción del Problema
              </h3>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{report.description}</p>
            </div>

            {report.photos && (report.photos as string[]).length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                  Evidencia Fotográfica Inicial (Ciudadana)
                </h3>
                <div className={`grid gap-4 ${(report.photos as string[]).length === 1 ? 'grid-cols-1' : (report.photos as string[]).length === 2 ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3'}`}>
                  {(report.photos as string[]).map((photo, idx) => (
                    <img key={idx} src={photo} alt={`${report.title} - Foto ${idx + 1}`} className="rounded-xl object-cover bg-gray-100 dark:bg-gray-900 w-full h-48 md:h-64 shadow-sm border border-gray-200 dark:border-gray-700" />
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <User size={18} />
                <span className="font-medium">{report.citizenName || "Ciudadano Anónimo"}</span>
                {report.citizenContact && <span className="text-sm ml-2 text-gray-400">({report.citizenContact})</span>}
              </div>
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <CheckCircle size={18} />
                <span className="font-bold">{report.votes} apoyos vecinales</span>
              </div>
            </div>
          </div>
        </div>

        {/* Panel de Inteligencia Artificial para Administradores */}
        <SingleReportAI reportId={report.id} />
        
        {report.aiAnalysis && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mt-4">
             <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">Análisis IA Actual:</h3>
             <div className="prose prose-sm dark:prose-invert max-w-none">
               <ReactMarkdown>{report.aiAnalysis}</ReactMarkdown>
             </div>
          </div>
        )}

      </main>
    </div>
  );
}

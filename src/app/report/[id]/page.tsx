import React from 'react';
import { prisma } from '@/lib/db/prisma';
import { notFound } from 'next/navigation';
import { MapPin, User, ArrowLeft, Clock, Info, CheckCircle, BrainCircuit, Tag, Building2, CheckCircle2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import CommentsSection from '@/components/ui/CommentsSection';
import SupportButton from '@/components/ui/SupportButton';
import { DEPARTMENT_LABELS } from '@/lib/reports/excel';

export const dynamic = 'force-dynamic';

export default async function SingleReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

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

  const categoryLabels: Record<string, string> = {
    INFRASTRUCTURE: 'Infraestructura',
    SECURITY: 'Seguridad',
    WATER: 'Agua y Saneamiento',
    SERVICES: 'Servicios Públicos',
    ENVIRONMENT: 'Medio Ambiente',
    EDUCATION: 'Educación',
    OTHER: 'Otros',
  };

  const statusLabels: Record<string, string> = {
    RECEIVED:    'Recibido',
    IN_REVIEW:   'En revisión',
    IN_PROGRESS: 'En proceso',
    RESOLVED:    'Resuelto',
    REJECTED:    'Rechazado',
  };

  const urgencyLabels: Record<string, string> = {
    HIGH:   'Urgencia Alta',
    MEDIUM: 'Urgencia Media',
    LOW:    'Urgencia Baja',
  };

  const resolutionPhotos = (report.resolutionPhotos as string[]) || [];
  const originalPhotos = (report.photos as string[]) || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans pb-12">
      <header className="bg-emerald-800 dark:bg-emerald-950 text-white shadow-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Link
                href={report.tenant ? `/${report.tenant.slug}` : "/"}
                className="p-2 hover:bg-emerald-700 dark:hover:bg-emerald-900 rounded-full transition-colors"
                title={`Volver al portal de ${report.tenant?.canton || 'inicio'}`}
              >
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="text-xl font-bold">Detalle del Reporte Ciudadano</h1>
                {report.tenant && (
                  <p className="text-xs text-emerald-200">{report.tenant.name} • Cantón {report.tenant.canton}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
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
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                report.status === 'RESOLVED'    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300' :
                report.status === 'REJECTED'    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                report.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                report.status === 'IN_REVIEW'   ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300'}`}>
                {statusLabels[report.status] ?? report.status}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                report.urgency === 'HIGH'   ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                report.urgency === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                {urgencyLabels[report.urgency] ?? report.urgency}
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
                <Info size={18} className="text-gray-400" /> Descripción de la Necesidad
              </h3>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{report.description}</p>
            </div>

            {originalPhotos.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                  Evidencia Fotográfica Inicial
                </h3>
                <div className={`grid gap-4 ${originalPhotos.length === 1 ? 'grid-cols-1' : originalPhotos.length === 2 ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3'}`}>
                  {originalPhotos.map((photo, idx) => (
                    <img key={idx} src={photo} alt={`${report.title} - Foto ${idx + 1}`} className="rounded-xl object-cover bg-gray-100 dark:bg-gray-900 w-full h-48 md:h-64 shadow-sm border border-gray-200 dark:border-gray-700" />
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <User size={18} />
                <span className="font-medium text-sm">Registrado por: {report.citizenName || "Ciudadano Anónimo"}</span>
              </div>
              <SupportButton reportId={report.id} initialVotes={report.votes} />
            </div>
          </div>
        </div>

        {/* Sección de Solución Municipal y Comparativa Antes vs Después */}
        {(report.status === 'RESOLVED' || report.resolutionNotes || resolutionPhotos.length > 0) && (
          <div className="bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 p-6 md:p-8 space-y-5">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 size={24} className="text-emerald-600" />
              <div>
                <h3 className="text-xl font-bold">Respuesta y Cierre Municipal</h3>
                {report.resolvedAt && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">
                    Intervención concluida el {new Date(report.resolvedAt).toLocaleDateString('es-EC')}
                  </p>
                )}
              </div>
            </div>

            {report.resolutionNotes && (
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900 text-sm text-gray-700 dark:text-gray-200">
                <p className="font-semibold text-xs text-emerald-700 dark:text-emerald-300 mb-1">Nota Oficial de la Dirección Municipal:</p>
                <p className="whitespace-pre-wrap">{report.resolutionNotes}</p>
              </div>
            )}

            {/* Comparativa Visual Antes vs Después */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-500" /> Evidencia Fotográfica: Antes vs. Después
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Problema Inicial (Antes)</span>
                  {originalPhotos.length > 0 ? (
                    <img src={originalPhotos[0]} alt="Antes" className="rounded-xl object-cover w-full h-48 border border-gray-300 dark:border-gray-700" />
                  ) : (
                    <div className="h-48 rounded-xl bg-gray-100 dark:bg-gray-800 border border-dashed flex items-center justify-center text-xs text-gray-400">
                      Sin fotografía inicial
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Solución Ejecutada (Después)</span>
                  {resolutionPhotos.length > 0 ? (
                    <img src={resolutionPhotos[0]} alt="Después" className="rounded-xl object-cover w-full h-48 border-2 border-emerald-500 shadow-sm" />
                  ) : (
                    <div className="h-48 rounded-xl bg-emerald-100/40 dark:bg-emerald-900/20 border border-dashed border-emerald-300 flex items-center justify-center text-xs text-emerald-600">
                      Intervención finalizada sin foto
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Análisis de la IA (Solo lectura para ciudadanos) */}
        {report.aiAnalysis && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-purple-100 dark:border-purple-900 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BrainCircuit size={20} /> Análisis de Viabilidad Jurídica (Emitido por IA)
              </h3>
            </div>
            <div className="p-6 md:p-8 prose prose-sm prose-emerald dark:prose-invert max-w-none">
              <ReactMarkdown>{report.aiAnalysis}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* Sección de Comentarios Moderados */}
        <CommentsSection reportId={report.id} initialComments={report.comments} />

      </main>
    </div>
  );
}

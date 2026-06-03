import React from 'react';
import { prisma } from '@/lib/db/prisma';
import { notFound } from 'next/navigation';
import { MapPin, User, ArrowLeft, Clock, Info, CheckCircle, BrainCircuit } from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import CommentsSection from '@/components/ui/CommentsSection';

export default async function SingleReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const report = await prisma.report.findUnique({
    where: { id },
    include: {
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
    OTHER: 'Otros'
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans pb-12">
      <header className="bg-emerald-800 dark:bg-emerald-950 text-white shadow-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 py-4">
            <Link href="/" className="p-2 hover:bg-emerald-700 dark:hover:bg-emerald-900 rounded-full transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl font-bold">Detalle del Reporte Ciudadano</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Cabecera del Reporte */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300">
                {categoryLabels[report.category] || report.category}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                {report.status}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold 
                ${report.urgency === 'HIGH' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' : 
                  report.urgency === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' : 
                  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                Urgencia: {report.urgency}
              </span>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{report.title}</h2>
            
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
                  Evidencia Fotográfica
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
              </div>
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <CheckCircle size={18} />
                <span className="font-bold">{report.votes} apoyos vecinales</span>
              </div>
            </div>
          </div>
        </div>

        {/* Análisis de la IA (Solo lectura para ciudadanos) */}
        {report.aiAnalysis && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-purple-100 dark:border-purple-900 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BrainCircuit size={20} /> Análisis de Viabilidad (Emitido por IA)
              </h3>
            </div>
            <div className="p-6 md:p-8 prose prose-sm prose-emerald dark:prose-invert max-w-none">
              <ReactMarkdown>{report.aiAnalysis}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* Comentarios */}
        <CommentsSection reportId={report.id} initialComments={report.comments} />

      </main>
    </div>
  );
}

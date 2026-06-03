import React from 'react';
import { prisma } from '@/lib/db/prisma';
import { notFound } from 'next/navigation';
import { MapPin, User, ArrowLeft, Clock, Info, CheckCircle, Shield, Globe } from 'lucide-react';
import Link from 'next/link';
import SingleReportAI from '@/components/ui/SingleReportAI';
import ReactMarkdown from 'react-markdown';

export default async function AdminSingleReportPage({ params }: { params: Promise<{ id: string }> }) {
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
      <header className="bg-gray-900 dark:bg-black text-white shadow-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="p-2 hover:bg-gray-800 rounded-full transition-colors" title="Volver al panel">
                <ArrowLeft size={20} />
              </Link>
              <Shield size={24} className="text-emerald-400" />
              <h1 className="text-xl font-bold">Gestión de Reporte</h1>
            </div>
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-2 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors" title="Volver al Portal Público">
                <Globe size={18} /> Portal
              </Link>
            </div>
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

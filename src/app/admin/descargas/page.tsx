import React from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  FolderDown, 
  FileText, 
  FileSpreadsheet, 
  Map, 
  Shield, 
  Download, 
  ExternalLink, 
  Building2, 
  Sparkles, 
  Layers, 
  Scale, 
  CheckCircle2,
  Target 
} from 'lucide-react';
import { requireTenantAdmin } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

export default async function DescargasPage() {
  const { tenantId } = await requireTenantAdmin();

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
  });

  const documents = [
    {
      id: 'estrategia-campana-politica',
      title: 'Estrategia de Campaña Política & Inteligencia Territorial',
      category: 'Inteligencia Electoral & Transición al GAD',
      badge: 'Estrategia de Victoria',
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      icon: <Target className="text-amber-600 dark:text-amber-400" size={26} />,
      format: 'PDF Enterprise',
      size: '3.5 MB',
      description: 'Levantamiento de información ciudadana real en las 6 parroquias de Quijos, discurso hiperlocalizado para tarima, costos reales según CNE Art. 209 ($2.800 USD o $950/mes) y hoja de ruta para la transición directa hacia la Alcaldía Oficial.',
      url: '/api/reports/export/campana-pdf',
      directFile: 'SOLINTEEC_Estrategia_Tecnologica_Campana_Politica.pdf',
    },
    {
      id: 'propuesta-crm-erp',
      title: 'Propuesta de Modernización Municipal, G-CRM & G-ERP',
      category: 'Arquitectura Institucional & Procesos',
      badge: 'Presentación Oficial',
      badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
      icon: <Layers className="text-indigo-600 dark:text-indigo-400" size={26} />,
      format: 'PDF Enterprise',
      size: '7.1 MB',
      description: 'Documento integral de articulación con Direcciones Municipales (Obras Públicas, Agua, Seguridad, Planificación), diagramas de conexión, arquitectura de gobernanza de datos y hoja de ruta.',
      url: '/api/reports/export/proposal-pdf',
      directFile: 'SOLINTEEC_Propuesta_G-CRM_G-ERP_Municipal.pdf',
    },
    {
      id: 'estrategia-gads-napo',
      title: 'Arquitectura Territorial & GADs Parroquiales de Napo',
      category: 'Estrategia Territorial & SERCOP',
      badge: 'Dictamen de Licenciamiento',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      icon: <Building2 className="text-emerald-600 dark:text-emerald-400" size={26} />,
      format: 'PDF Enterprise',
      size: '7.0 MB',
      description: 'Justificación jurídica y técnica de por qué NO usar subdominios compartidos, defensa del dominio cantonal (.gob.ec), relevamiento de los 5 cantones y 21 GADs parroquiales de Napo y modelo de federación.',
      url: '/api/reports/export/napo-pdf',
      directFile: 'SOLINTEEC_Estrategia_GADs_Parroquiales_Napo.pdf',
    },
    {
      id: 'competencias-viales-cge',
      title: 'Gestión de Competencias Viales & Blindaje ante Contraloría',
      category: 'Derecho Administrativo & Fiscalización',
      badge: 'Dictamen Jurídico CGE',
      badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800',
      icon: <Scale className="text-rose-600 dark:text-rose-400" size={26} />,
      format: 'PDF Enterprise',
      size: '3.5 MB',
      description: 'Análisis estricto del COOTAD (Arts. 54, 55 y 275), geocercas inteligentes de exclusión vial (E45 MTOP vs. vías cantonales), protocolo de derivación formal y prevención de glosas para Alcaldía y Directores.',
      url: '/api/reports/export/competencias-pdf',
      directFile: 'SOLINTEEC_Gestion_Competencias_Viales_Blindaje_CGE.pdf',
    },
    {
      id: 'reporte-excel-oficial',
      title: 'Matriz Ejecutiva de Reportes Ciudadanos (.xlsx)',
      category: 'Métricas & Business Intelligence',
      badge: 'Auditoría Oficial Excel',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      icon: <FileSpreadsheet className="text-emerald-600 dark:text-emerald-400" size={26} />,
      format: 'Excel (.xlsx)',
      size: 'Dinámico en vivo',
      description: 'Exportación consolidada de todos los tickets ciudadanos con códigos de seguimiento (ej. QUI-2026-XXXX), estado de atención, dirección departamental asignada, parroquia, barrio y tiempos de resolución.',
      url: '/api/reports/export/excel',
      directFile: 'Reportes_Ciudadanos_Oficial.xlsx',
    },
    {
      id: 'informe-pdf-ciudadano',
      title: 'Informe Técnico Foliado de Casos Ciudadanos',
      category: 'Reportes Operativos',
      badge: 'Resolución Antes/Después',
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      icon: <FileText className="text-amber-600 dark:text-amber-400" size={26} />,
      format: 'PDF Oficial',
      size: 'Dinámico en vivo',
      description: 'Dossier institucional foliado con fotografías de las necesidades ciudadanas, georreferenciación y justificación técnica de resolución para rendición de cuentas del GAD.',
      url: '/api/reports/export/pdf',
      directFile: 'Informe_Gestion_Ciudadana.pdf',
    },
    {
      id: 'mapa-prototipo-interactivo',
      title: 'Prototipo Interactivo de Mapa Geoespacial',
      category: 'Visualización Territorial',
      badge: 'Herramienta en Vivo',
      badgeColor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/60 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
      icon: <Map className="text-yellow-600 dark:text-yellow-500" size={26} />,
      format: 'HTML5 Standalone',
      size: 'Interactivo',
      description: 'Entorno de demostración a pantalla completa con polígonos vectoriales de las 6 parroquias del Cantón Quijos, intensidad de calor y simulación de alertas de incidencias.',
      url: '/mapa-prototipo.html',
      directFile: 'mapa-prototipo.html',
      targetBlank: true,
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans pb-16">
      {/* Header */}
      <header className="bg-gray-900 dark:bg-black text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 py-4">
            <Link href="/admin" className="p-2 hover:bg-gray-800 rounded-full transition-colors" title="Volver al panel principal">
              <ArrowLeft size={20} />
            </Link>
            <FolderDown size={24} className="text-emerald-400" />
            <div className="flex-1">
              <h1 className="text-xl font-bold">Centro de Documentación & Descargas</h1>
              <p className="text-xs text-gray-400">
                Material ejecutivo, dictámenes técnicos y reportes oficiales para la sesión de {tenant?.name || 'GAD Municipal'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-700 text-emerald-300 font-medium">
                <Sparkles size={13} /> SOLINTEEC GovTech
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Banner de Presentación */}
        <div className="bg-gradient-to-r from-navy via-slate-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-gray-800 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold mb-3">
              <CheckCircle2 size={14} /> Material Oficial Preparado para la Sesión
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
              Dossier Ejecutivo & Dictámenes Técnicos SOLINTEEC
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed">
              Todos los archivos generados con formato enterprise, marco legal bajo el COOTAD, branding oficial de <strong>SOLINTEEC DEVTECH S.A.S.</strong> y métricas en vivo listas para proyectar, presentar y compartir con las autoridades municipales.
            </p>
          </div>
        </div>

        {/* Grilla de Documentos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <div 
              key={doc.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col justify-between hover:shadow-md hover:border-emerald-500/50 transition-all group"
            >
              <div>
                {/* Cabecera de la tarjeta */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/60 border border-gray-100 dark:border-gray-600/50 group-hover:scale-105 transition-transform">
                    {doc.icon}
                  </div>
                  <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${doc.badgeColor}`}>
                    {doc.badge}
                  </span>
                </div>

                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  {doc.category}
                </p>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2 leading-snug">
                  {doc.title}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  {doc.description}
                </p>
              </div>

              {/* Pie de tarjeta con metadatos y botón */}
              <div className="pt-4 border-t border-gray-100 dark:border-gray-700/70">
                <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 mb-3">
                  <span className="font-semibold">{doc.format}</span>
                  <span>{doc.size}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <a
                    href={doc.url}
                    download={!doc.targetBlank}
                    target={doc.targetBlank ? "_blank" : undefined}
                    rel={doc.targetBlank ? "noopener noreferrer" : undefined}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
                  >
                    {doc.targetBlank ? (
                      <>
                        <ExternalLink size={14} /> Abrir en Pantalla Completa
                      </>
                    ) : (
                      <>
                        <Download size={14} /> Descargar Archivo
                      </>
                    )}
                  </a>

                  {!doc.targetBlank && (
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors"
                      title="Previsualizar en pestaña nueva"
                    >
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Resumen de Acceso Rápido por Enlace */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Shield size={18} className="text-emerald-500" /> Enlaces Directos para Compartir en la Presentación
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Puedes copiar y pegar estos enlaces directos en el chat de la reunión o compartirlos con las autoridades para su descarga inmediata:
          </p>

          <div className="space-y-2.5 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 gap-2">
              <div>
                <span className="font-bold text-gray-800 dark:text-gray-200">1. Propuesta G-CRM & G-ERP Municipal (PDF):</span>
                <span className="block text-gray-500 dark:text-gray-400 text-[11px]">Integración con direcciones, arquitectura de sistemas y flujos.</span>
              </div>
              <code className="text-[11px] bg-white dark:bg-gray-800 px-2 py-1 rounded border border-gray-200 dark:border-gray-600 text-emerald-600 dark:text-emerald-400 select-all">
                https://plataforma.solinteec.com/api/reports/export/proposal-pdf
              </code>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 gap-2">
              <div>
                <span className="font-bold text-gray-800 dark:text-gray-200">2. Estrategia Territorial GADs Napo (PDF):</span>
                <span className="block text-gray-500 dark:text-gray-400 text-[11px]">Justificación de dominios (.gob.ec), SERCOP y modelo de licenciamiento parroquial.</span>
              </div>
              <code className="text-[11px] bg-white dark:bg-gray-800 px-2 py-1 rounded border border-gray-200 dark:border-gray-600 text-emerald-600 dark:text-emerald-400 select-all">
                https://plataforma.solinteec.com/api/reports/export/napo-pdf
              </code>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 gap-2">
              <div>
                <span className="font-bold text-gray-800 dark:text-gray-200">3. Dictamen de Competencias Viales & Blindaje CGE (PDF):</span>
                <span className="block text-gray-500 dark:text-gray-400 text-[11px]">COOTAD Arts. 54, 55 y 275, geocercas inteligentes y prevención de glosas.</span>
              </div>
              <code className="text-[11px] bg-white dark:bg-gray-800 px-2 py-1 rounded border border-gray-200 dark:border-gray-600 text-emerald-600 dark:text-emerald-400 select-all">
                https://plataforma.solinteec.com/api/reports/export/competencias-pdf
              </code>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 gap-2">
              <div>
                <span className="font-bold text-gray-800 dark:text-gray-200">4. Reporte Oficial Consolidado en Excel (.xlsx):</span>
                <span className="block text-gray-500 dark:text-gray-400 text-[11px]">Matriz de auditoría con tickets ciudadanos de Quijos en tiempo real.</span>
              </div>
              <code className="text-[11px] bg-white dark:bg-gray-800 px-2 py-1 rounded border border-gray-200 dark:border-gray-600 text-emerald-600 dark:text-emerald-400 select-all">
                https://plataforma.solinteec.com/api/reports/export/excel
              </code>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 gap-2">
              <div>
                <span className="font-bold text-gray-800 dark:text-gray-200">5. Mapa Territorial Interactivo (Prototipo Fullscreen):</span>
                <span className="block text-gray-500 dark:text-gray-400 text-[11px]">Mapa vectorizado del Cantón Quijos con visualización de calor y datos.</span>
              </div>
              <code className="text-[11px] bg-white dark:bg-gray-800 px-2 py-1 rounded border border-gray-200 dark:border-gray-600 text-emerald-600 dark:text-emerald-400 select-all">
                https://plataforma.solinteec.com/mapa-prototipo.html
              </code>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}

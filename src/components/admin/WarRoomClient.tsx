'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Target, 
  Printer, 
  Download,
  MapPin, 
  Users, 
  AlertTriangle, 
  MessageSquare, 
  Sparkles, 
  Building2, 
  Phone, 
  ExternalLink, 
  FileText,
  CheckCircle2,
  TrendingUp,
  Clock,
  Layers,
  ChevronRight,
  Vote
} from 'lucide-react';

interface ReportItem {
  id: string;
  title: string;
  description: string;
  category: string;
  urgency: string;
  parish: string;
  neighborhood: string;
  citizenName: string | null;
  citizenContact: string | null;
  status: string;
  createdAt: string | Date;
}

interface WarRoomProps {
  tenant: {
    id: string;
    name: string;
    canton: string;
    province: string;
    slug: string;
    parishes: string[];
    candidateName?: string | null;
    campaignSlogan?: string | null;
    campaignListNumber?: string | null;
    campaignMode?: boolean;
    candidatePhotoUrl?: string | null;
    partyLogoUrl?: string | null;
    citizenTermSingularM?: string | null;
    citizenTermSingularF?: string | null;
    citizenTermPlural?: string | null;
  };
  reports: ReportItem[];
}

const CATEGORY_NAMES: Record<string, string> = {
  INFRASTRUCTURE: 'Infraestructura & Vialidad',
  WATER: 'Agua Potable & Alcantarillado',
  SECURITY: 'Seguridad Ciudadana',
  SERVICES: 'Alumbrado & Servicios Públicos',
  ENVIRONMENT: 'Medio Ambiente & Limpieza',
  EDUCATION: 'Educación & Espacios Públicos',
  OTHER: 'Otras Necesidades',
};

export default function WarRoomClient({ tenant, reports }: WarRoomProps) {
  const termSingularM = tenant.citizenTermSingularM || 'Ciudadano';
  const termSingularF = tenant.citizenTermSingularF || 'Ciudadana';
  const termPlural = tenant.citizenTermPlural || 'Ciudadanos';

  const parishes = ['TODAS', ...(tenant.parishes || [])];
  const [selectedParish, setSelectedParish] = useState<string>('TODAS');
  const [showSpeechCard, setShowSpeechCard] = useState<boolean>(true);

  // Filtrar reportes por parroquia
  const filteredReports = useMemo(() => {
    if (selectedParish === 'TODAS') return reports;
    return reports.filter(r => r.parish.toLowerCase() === selectedParish.toLowerCase());
  }, [selectedParish, reports]);

  // Métricas de la parroquia seleccionada
  const stats = useMemo(() => {
    const total = filteredReports.length;

    // Desglose por categoría
    const catCounts: Record<string, number> = {};
    const neighborhoodCounts: Record<string, number> = {};

    filteredReports.forEach(r => {
      catCounts[r.category] = (catCounts[r.category] || 0) + 1;
      const nb = r.neighborhood?.trim() || 'Sector General';
      neighborhoodCounts[nb] = (neighborhoodCounts[nb] || 0) + 1;
    });

    const topCategories = Object.entries(catCounts)
      .map(([cat, count]) => ({
        category: cat,
        name: CATEGORY_NAMES[cat] || cat,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    const topNeighborhoods = Object.entries(neighborhoodCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);

    const highUrgency = filteredReports.filter(r => r.urgency === 'HIGH').length;

    // Reportes con contacto directo
    const contacts = filteredReports.filter(r => r.citizenName && r.citizenContact);

    return {
      total,
      topCategories,
      topNeighborhoods,
      highUrgency,
      contactsCount: contacts.length,
      primaryNeed: topCategories[0]?.name || 'Por definir',
      primaryNeedPct: topCategories[0]?.percentage || 0,
    };
  }, [filteredReports]);

  // Ciudadanos con contacto para la parroquia
  const citizensWithContact = useMemo(() => {
    return filteredReports.filter(r => r.citizenName || r.citizenContact);
  }, [filteredReports]);

  const candidateDisplayName = tenant.candidateName || 'El Candidato';
  const sloganDisplayName = tenant.campaignSlogan || 'El Quijos que Soñamos';
  const listDisplayName = tenant.campaignListNumber || 'Lista de Campaña';

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans pb-16">
      
      {/* Header estilo Cuarto de Guerra */}
      <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-40 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link href="/admin" className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white" title="Volver al panel principal">
                <ArrowLeft size={20} />
              </Link>
              {tenant.candidatePhotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={tenant.candidatePhotoUrl} 
                  alt="Candidato" 
                  className="w-11 h-11 rounded-full object-cover border-2 border-amber-400 shrink-0 shadow-md shadow-amber-500/20" 
                />
              ) : (
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shrink-0">
                  <Target size={24} />
                </div>
              )}
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
                    WAR ROOM <span className="text-amber-400 font-bold hidden xs:inline">• Inteligencia Territorial</span>
                  </h1>
                  
                  {/* Badge LIVE / TIEMPO REAL Titilante de Alto Impacto */}
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 text-[10px] font-black uppercase tracking-wider shadow-[0_0_12px_rgba(239,68,68,0.25)] select-none">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    <span>LIVE • TIEMPO REAL</span>
                  </span>

                  {tenant.partyLogoUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={tenant.partyLogoUrl} 
                      alt="Logo Lista" 
                      className="h-6 w-auto max-w-[60px] object-contain rounded bg-slate-900 p-0.5 border border-slate-700" 
                    />
                  )}
                </div>
                <p className="text-xs text-slate-400 flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5">
                  <span>Candidatura: <strong className="text-slate-200">{candidateDisplayName}</strong></span>
                  <span className="hidden sm:inline">•</span>
                  <span>{listDisplayName}</span>
                  <span className="hidden sm:inline">•</span>
                  <span className="text-amber-300 italic">"{sloganDisplayName}"</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
              <Link 
                href="/admin/control-electoral" 
                className="flex-1 sm:flex-none justify-center px-3.5 py-2 rounded-xl bg-red-600/90 hover:bg-red-500 text-white text-xs font-bold shadow-md shadow-red-500/20 transition-all flex items-center gap-1.5"
                title="Conteo Rápido y Control de Actas Día D"
              >
                <Vote size={14} />
                <span>Control Electoral</span>
              </Link>
              <Link 
                href="/admin/qr-codes" 
                className="flex-1 sm:flex-none justify-center px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5"
              >
                Códigos QR
              </Link>
              <a
                href={`/api/reports/export/tarima-pdf?parish=${encodeURIComponent(selectedParish)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none justify-center px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5"
                title="Generar y descargar documento PDF oficial para el mitin"
              >
                <Download size={15} />
                <span>Ficha Tarima (PDF)</span>
              </a>
              <button
                onClick={() => window.print()}
                className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors hidden sm:flex items-center gap-1"
                title="Imprimir pantalla actual"
              >
                <Printer size={15} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Banner Informativo si Modo Campaña está desactivado en la Configuración General */}
        {tenant.campaignMode === false && (
          <div className="print:hidden bg-amber-500/10 border border-amber-500/40 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-amber-200 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="p-1 rounded-md bg-amber-500 text-slate-950 font-bold text-xs">Aviso</span>
              <span><strong>Modo Campaña actualmente Desactivado en Ajustes:</strong> El portal ciudadano público está operando en formato institucional. Puedes activarlo con 1 clic para habilitar el cintillo del candidato y la captura de WhatsApp.</span>
            </div>
            <Link 
              href="/admin/settings" 
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg shrink-0 transition-colors"
            >
              Activar en Configuración
            </Link>
          </div>
        )}

        {/* Selector de Parroquias (Pills Horizontales) */}
        <div className="print:hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <MapPin size={14} className="text-amber-400" /> Selecciona la Parroquia para el Discurso:
            </span>
            <span className="text-xs text-slate-400">
              Cantón {tenant.canton}, Napo
            </span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {parishes.map((p) => {
              const isSelected = selectedParish === p;
              return (
                <button
                  key={p}
                  onClick={() => setSelectedParish(p)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all whitespace-nowrap flex items-center gap-2 ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 ring-2 ring-amber-400'
                      : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60'
                  }`}
                >
                  <MapPin size={13} className={isSelected ? 'text-slate-950' : 'text-slate-400'} />
                  {p === 'TODAS' ? 'Todo el Cantón (Consolidado)' : p}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tarjetas de Métricas Rápidas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 print:hidden">
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Reportes Registrados</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-white">{stats.total}</span>
              <span className="text-xs text-amber-400 font-semibold">en {selectedParish}</span>
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Problema Principal</span>
            <div className="mt-1">
              <span className="text-lg font-bold text-amber-300 block truncate" title={stats.primaryNeed}>
                {stats.primaryNeed}
              </span>
              <span className="text-xs text-slate-400">
                {stats.primaryNeedPct}% de quejas en la zona
              </span>
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Urgencias Críticas</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-rose-400">{stats.highUrgency}</span>
              <span className="text-xs text-rose-300/80 font-medium">atención inmediata</span>
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">{termPlural} con Contacto</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-emerald-400">{stats.contactsCount}</span>
              <span className="text-xs text-emerald-300/80 font-medium">listos para WhatsApp</span>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* SECCIÓN ESPECIAL: FICHA EJECUTIVA DE TARIMA PARA EL CANDIDATO */}
        {/* Esta sección está formateada para verse en pantalla y para IMPRIMIR en 1 hoja A4 */}
        {/* ============================================================ */}
        <div className="bg-slate-950 border-2 border-amber-500/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden print:border-none print:shadow-none print:p-0 print:m-0 print:bg-white print:text-black">
          
          {/* Encabezado Ficha de Tarima */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 print:border-black/20 gap-4">
            <div className="flex items-center gap-4">
              {tenant.candidatePhotoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={tenant.candidatePhotoUrl} 
                  alt="Candidato" 
                  className="w-16 h-16 rounded-full object-cover border-2 border-amber-400 print:border-black shrink-0 shadow-md" 
                />
              )}
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-extrabold uppercase tracking-wider print:bg-gray-100 print:text-black">
                    <Target size={13} /> Ficha Oficial de Visita Territorial & Tarima
                  </span>
                  {tenant.partyLogoUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={tenant.partyLogoUrl} 
                      alt="Logo Lista" 
                      className="h-6 w-auto max-w-[70px] object-contain rounded bg-white p-0.5 border border-slate-300 print:border-black" 
                    />
                  )}
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white print:text-black leading-tight">
                  {selectedParish === 'TODAS' ? `Cantón ${tenant.canton}` : `Parroquia ${selectedParish}`}
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 print:text-gray-700 mt-0.5">
                  Dossier de Inteligencia para <strong>{candidateDisplayName}</strong> • {listDisplayName} • Cantón {tenant.canton}
                </p>
              </div>
            </div>

            <div className="text-right flex flex-col items-start sm:items-end">
              <span className="text-xs text-slate-400 print:text-gray-500">Fecha de actualización:</span>
              <span className="text-sm font-bold text-amber-400 print:text-black">
                {new Date().toLocaleDateString('es-EC', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
              <span className="text-[11px] text-emerald-400 font-semibold mt-0.5 print:text-gray-700">
                {stats.total} reportes ciudadanos auditados
              </span>
              <div className="mt-2.5 print:hidden">
                <a
                  href={`/api/reports/export/tarima-pdf?parish=${encodeURIComponent(selectedParish)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md hover:shadow-amber-500/20"
                >
                  <Download size={13} /> Exportar Dossier PDF (A4)
                </a>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6 print:grid-cols-3">
            
            {/* Columna 1: El Diagnóstico Real */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 print:text-black flex items-center gap-1.5">
                <Layers size={15} /> 1. El Dolor Real del Sector
              </h3>

              <div className="bg-slate-900/80 print:bg-gray-50 p-4 rounded-2xl border border-slate-800 print:border-gray-300 space-y-3">
                <span className="text-xs font-bold text-slate-300 print:text-black block">
                  Ranking de Prioridades Ciudadanas:
                </span>
                {stats.topCategories.length > 0 ? (
                  stats.topCategories.slice(0, 4).map((c, i) => (
                    <div key={c.category} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-200 print:text-black">
                          {i + 1}. {c.name}
                        </span>
                        <span className="font-bold text-amber-400 print:text-black">{c.percentage}% ({c.count})</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 print:bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-500 print:bg-black rounded-full" 
                          style={{ width: `${c.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">Sin reportes registrados aún en esta parroquia.</p>
                )}
              </div>

              <div className="bg-slate-900/80 print:bg-gray-50 p-4 rounded-2xl border border-slate-800 print:border-gray-300">
                <span className="text-xs font-bold text-slate-300 print:text-black block mb-2">
                  Barrios con Mayor Alerta:
                </span>
                <div className="space-y-1.5">
                  {stats.topNeighborhoods.map((nb, i) => (
                    <div key={nb.name} className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 print:text-black">📍 {nb.name}</span>
                      <span className="font-mono text-xs text-amber-400 print:text-black font-bold">{nb.count} casos</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Columna 2: Guión Quirúrgico para el Candidato */}
            <div className="space-y-4 lg:col-span-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 print:text-black flex items-center gap-1.5">
                <Sparkles size={15} /> 2. Argumentario Quirúrgico para la Tarima (Qué Decir)
              </h3>

              <div className="bg-amber-950/20 print:bg-amber-50/50 p-5 rounded-2xl border border-amber-500/40 print:border-amber-300 space-y-4">
                
                <div>
                  <span className="text-xs font-extrabold uppercase text-amber-400 print:text-amber-900 block mb-1">
                    Apertura de Impacto (Conexión Inmediata):
                  </span>
                  <p className="text-xs sm:text-sm text-slate-200 print:text-gray-900 italic leading-relaxed bg-slate-900/70 print:bg-white p-3.5 rounded-xl border border-slate-800 print:border-gray-200">
                    "{termPlural} de {selectedParish === 'TODAS' ? tenant.canton : selectedParish}: Yo no vengo a esta tarima a adivinar ni a ofrecerles castillos en el aire. Con nuestro equipo tenemos georreferenciado cada rincón del cantón. Sabemos con precisión que aquí el dolor número uno es <strong>{stats.primaryNeed.toLowerCase()}</strong>, que representa más del <strong>{stats.primaryNeedPct}%</strong> de los clamores no atendidos por la actual administración."
                  </p>
                </div>

                <div>
                  <span className="text-xs font-extrabold uppercase text-amber-400 print:text-amber-900 block mb-1">
                    Mención de Testimonios Reales (Efecto Demoledor):
                  </span>
                  <p className="text-xs sm:text-sm text-slate-200 print:text-gray-900 italic leading-relaxed bg-slate-900/70 print:bg-white p-3.5 rounded-xl border border-slate-800 print:border-gray-200">
                    {citizensWithContact.length > 0 ? (
                      <>
                        "Aquí están los reportes que los propios {termPlural.toLowerCase()} han levantado con fotografías. Como nos comunicó {termSingularM.toLowerCase()} <strong>{citizensWithContact[0]?.citizenName || 'de la comunidad'}</strong> en el sector de <strong>{citizensWithContact[0]?.neighborhood}</strong> sobre {citizensWithContact[0]?.title.toLowerCase()}. No es justo que hayan tenido que esperar meses sin una respuesta formal de sus autoridades."
                      </>
                    ) : (
                      <>
                        "Los {termPlural.toLowerCase()} de {selectedParish === 'TODAS' ? 'nuestros barrios' : selectedParish} nos han compartido sus fotografías del abandono de las vías y la falta de agua potable. Basta de funcionarios de escritorio que no pisan el lodo de nuestras comunidades."
                      </>
                    )}
                  </p>
                </div>

                <div>
                  <span className="text-xs font-extrabold uppercase text-emerald-400 print:text-emerald-900 block mb-1">
                    Compromiso Técnico & Solución Inmediata:
                  </span>
                  <p className="text-xs sm:text-sm text-slate-200 print:text-gray-900 italic leading-relaxed bg-slate-900/70 print:bg-white p-3.5 rounded-xl border border-slate-800 print:border-gray-200">
                    "Desde el primer día de nuestra Alcaldía, no vamos a improvisar. Esta misma plataforma ciudadana donde ustedes han reportado será institucionalizada en el GAD Municipal. El presupuesto y la maquinaria de Obras Públicas se despacharán con base a este mapa de urgencias reales, no por compadrazgos políticos."
                  </p>
                </div>

              </div>

            </div>

          </div>

          {/* Pie de Ficha de Tarima */}
          <div className="mt-6 pt-4 border-t border-slate-800 print:border-gray-300 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 print:text-gray-600 gap-2">
            <span>SOLINTEEC DEVTECH S.A.S. • Cerebro de Inteligencia Electoral & Transición al GAD Municipal</span>
            <span>Uso Exclusivo de la Candidatura a la Alcaldía del Cantón {tenant.canton}</span>
          </div>

        </div>

        {/* Directorio de Votantes & Simpatizantes (Base de Datos Viva) */}
        <div className="bg-slate-850 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 print:hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Users size={20} className="text-amber-400" /> Directorio de {termPlural} & Contactos ({filteredReports.length})
              </h3>
              <p className="text-xs text-slate-400">
                Base de datos de {termPlural.toLowerCase()} que han registrado problemas en {selectedParish}. Listos para contacto y fidelización cívica.
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 self-start sm:self-center">
              {stats.contactsCount} {termPlural.toLowerCase()} con WhatsApp
            </span>
          </div>

          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0 scrollbar-thin">
            <table className="min-w-[640px] w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 font-bold border-b border-slate-700">
                <tr>
                  <th className="py-3 px-4">{termSingularM}</th>
                  <th className="py-3 px-4">Parroquia / Barrio</th>
                  <th className="py-3 px-4">Necesidad Reportada</th>
                  <th className="py-3 px-4">Urgencia</th>
                  <th className="py-3 px-4 text-right">Acción de Campaña</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredReports.slice(0, 15).map((r) => {
                  const cleanPhone = r.citizenContact ? r.citizenContact.replace(/\D/g, '') : null;
                  const waUrl = cleanPhone 
                    ? `https://wa.me/593${cleanPhone.startsWith('0') ? cleanPhone.slice(1) : cleanPhone}?text=${encodeURIComponent(
                        `Hola ${r.citizenName || termSingularM.toLowerCase()}, te saludamos de parte del equipo de ${candidateDisplayName}. Vimos tu reporte sobre "${r.title}" en el sector ${r.neighborhood}. El candidato está al tanto y queremos compartirte nuestra propuesta para resolverlo.`
                      )}`
                    : null;

                  return (
                    <tr key={r.id} className="hover:bg-slate-800/60 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-bold text-white block">{r.citizenName || `${termSingularM} Territorial`}</span>
                        {r.citizenContact && (
                          <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                            <Phone size={11} className="text-emerald-400" /> {r.citizenContact}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-slate-300 font-medium block">{r.parish}</span>
                        <span className="text-[11px] text-slate-500">{r.neighborhood}</span>
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <span className="text-slate-200 font-medium block truncate" title={r.title}>{r.title}</span>
                        <span className="text-[11px] text-amber-400/90 block">{CATEGORY_NAMES[r.category] || r.category}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          r.urgency === 'HIGH' ? 'bg-rose-500/20 text-rose-300' :
                          r.urgency === 'MEDIUM' ? 'bg-amber-500/20 text-amber-300' :
                          'bg-emerald-500/20 text-emerald-300'
                        }`}>
                          {r.urgency}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {waUrl ? (
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-sm transition-all"
                          >
                            <MessageSquare size={13} /> WhatsApp
                          </a>
                        ) : (
                          <span className="text-slate-500 text-[11px] italic">Sin teléfono</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </main>

    </div>
  );
}

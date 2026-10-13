'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Building2,
  MapPin,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  RotateCcw,
  Sparkles,
  Users,
  Shield,
  Layers,
  ArrowRight,
  PlusCircle,
  Ticket,
  ChevronRight,
  Compass,
  FileCheck2,
  Home,
  MessageSquare,
  ThumbsUp,
  ExternalLink,
  Flame,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import ReportForm from '@/components/forms/ReportForm';
import TicketTracker from '@/components/ui/TicketTracker';
import SupportButton from '@/components/ui/SupportButton';

interface ReportItem {
  id: string;
  ticketCode: string | null;
  title: string;
  description: string;
  category: string;
  department: string;
  urgency: string;
  status: string;
  parish: string;
  neighborhood: string;
  citizenName: string | null;
  photos?: any;
  resolutionPhotos?: any;
  resolutionNotes?: string | null;
  resolvedAt?: Date | string | null;
  moderationStatus?: string;
  duplicateCount?: number;
  supportCount?: number;
  votes: number;
  createdAt: Date | string;
}

interface CitizenPortalProps {
  tenant: {
    id: string;
    name: string;
    canton: string;
    province: string;
    slug: string;
    parishes: string[];
    campaignMode: boolean;
    candidateName: string | null;
    campaignSlogan: string | null;
    campaignListNumber: string | null;
    candidatePhotoUrl: string | null;
    partyLogoUrl: string | null;
    logoUrl: string | null;
    citizenTermSingularM: string | null;
    citizenTermSingularF: string | null;
  };
  reports: ReportItem[];
  initialParish?: string;
}

const CATEGORY_CHIPS = [
  { id: 'ALL', label: 'Todas las Categorías' },
  { id: 'INFRASTRUCTURE', label: 'Vialidad y Obras' },
  { id: 'WATER', label: 'Agua Potable' },
  { id: 'SERVICES', label: 'Servicios Públicos' },
  { id: 'SECURITY', label: 'Seguridad' },
  { id: 'ENVIRONMENT', label: 'Ambiente' },
];

export default function CitizenPortalView({
  tenant,
  reports,
  initialParish,
}: CitizenPortalProps) {
  const [activeTab, setActiveTab] = useState<'form' | 'feed' | 'map' | 'tracker'>(
    initialParish ? 'form' : 'feed'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [filterParish, setFilterParish] = useState(initialParish || 'ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'RESOLVED' | 'PENDING'>('ALL');

  // Cálculos estadísticos para el Hero
  const stats = useMemo(() => {
    const totalReports = reports.length;
    const resolved = reports.filter(
      (r) => r.status === 'RESOLVED' || r.status === 'RESUELTO'
    ).length;
    const totalNeighbours = reports.reduce((acc, r) => acc + (r.supportCount || 1), 0);

    return {
      totalReports,
      resolved,
      inProgress: totalReports - resolved,
      totalNeighbours,
    };
  }, [reports]);

  // Filtrado de reportes para el muro comunitario
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      // Excluir reportes fusionados para no mostrar duplicados
      if (r.moderationStatus === 'MERGED') return false;

      const matchesSearch =
        searchQuery === '' ||
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.neighborhood.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.ticketCode && r.ticketCode.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesParish = filterParish === 'ALL' || r.parish === filterParish;
      const matchesCategory = filterCategory === 'ALL' || r.category === filterCategory;

      let matchesStatus = true;
      if (filterStatus === 'RESOLVED') {
        matchesStatus = r.status === 'RESOLVED' || r.status === 'RESUELTO';
      } else if (filterStatus === 'PENDING') {
        matchesStatus = r.status !== 'RESOLVED' && r.status !== 'RESUELTO';
      }

      return matchesSearch && matchesParish && matchesCategory && matchesStatus;
    });
  }, [reports, searchQuery, filterParish, filterCategory, filterStatus]);

  const parsePhotos = (raw: any): string[] => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [raw];
    } catch {
      return [raw];
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 font-sans transition-colors">
      
      {/* 1. HEADER INSTITUCIONAL / CAMPAÑA */}
      <header
        className={
          tenant.campaignMode
            ? 'bg-slate-950 text-white sticky top-0 z-30 border-b border-amber-500/30 shadow-lg'
            : 'bg-emerald-900 dark:bg-gray-900 text-white sticky top-0 z-30 border-b border-emerald-800 dark:border-gray-800 shadow-md'
        }
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3.5">
            {/* Branding Izquierdo */}
            <div className="flex items-center gap-3">
              {tenant.campaignMode && tenant.candidatePhotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={tenant.candidatePhotoUrl}
                  alt={tenant.candidateName || 'Candidato'}
                  className="w-11 h-11 rounded-full object-cover border-2 border-amber-400 shrink-0 shadow-md shadow-amber-500/20"
                />
              ) : !tenant.campaignMode && tenant.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={tenant.logoUrl}
                  alt={tenant.name}
                  className="w-11 h-11 object-contain bg-white dark:bg-gray-800 p-1 rounded-xl shrink-0 shadow-sm"
                />
              ) : (
                <div
                  className={
                    tenant.campaignMode
                      ? 'bg-amber-500 text-slate-950 p-2.5 rounded-xl font-black shadow-md'
                      : 'bg-emerald-500 text-white p-2.5 rounded-xl shadow-md'
                  }
                >
                  <Building2 size={22} />
                </div>
              )}

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-base sm:text-lg font-black tracking-tight leading-tight">
                    {tenant.campaignMode && tenant.candidateName ? tenant.candidateName : tenant.name}
                  </h1>
                  {tenant.campaignMode && tenant.campaignListNumber && (
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      {tenant.campaignListNumber}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-emerald-200/90 dark:text-gray-400 flex items-center gap-1 mt-0.5 font-medium">
                  <MapPin size={11} className={tenant.campaignMode ? 'text-amber-400' : 'text-emerald-300'} />
                  Cantón {tenant.canton}, {tenant.province} •{' '}
                  <span className="opacity-90">
                    {tenant.campaignMode && tenant.campaignSlogan
                      ? `"${tenant.campaignSlogan}"`
                      : 'Portal de Participación Ciudadana'}
                  </span>
                </p>
              </div>
            </div>

            {/* Accesos de Navegación y Login */}
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all border border-white/15"
              >
                Acceso Técnico
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* 2. HERO PRINCIPAL DE BIENVENIDA */}
      <section
        className={
          tenant.campaignMode
            ? 'bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-gray-800'
            : 'bg-gradient-to-b from-emerald-900 via-emerald-850 to-emerald-950 text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-emerald-800'
        }
      >
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 border border-white/20 text-emerald-200 backdrop-blur-xs">
            <Sparkles size={14} className="text-amber-300" />
            Participación Directa y Transparencia en {tenant.canton}
          </span>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            {tenant.campaignMode
              ? 'Construyamos el Plan Cantonal con tus Necesidades Reales'
              : 'Tu voz transforma los barrios de nuestro cantón'}
          </h2>

          <p className="text-sm sm:text-base text-gray-200 max-w-2xl mx-auto leading-relaxed">
            Reporta baches, fugas de agua, alumbrado o seguridad. Si varios vecinos reportan el mismo problema,
            el sistema los agrupa para darle máxima prioridad técnica ante las cuadrillas de obras.
          </p>

          {/* Tarjetas Métricas de Impacto Comunitario */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 max-w-3xl mx-auto">
            <div className="bg-white/10 dark:bg-gray-900/60 backdrop-blur-md rounded-2xl p-3.5 border border-white/15 text-left">
              <div className="text-xs text-gray-300 font-semibold flex items-center gap-1.5">
                <FileCheck2 size={14} className="text-emerald-300" /> Total Reportes
              </div>
              <div className="text-2xl font-black mt-1">{stats.totalReports}</div>
            </div>

            <div className="bg-white/10 dark:bg-gray-900/60 backdrop-blur-md rounded-2xl p-3.5 border border-white/15 text-left">
              <div className="text-xs text-emerald-300 font-semibold flex items-center gap-1.5">
                <CheckCircle2 size={14} /> Solucionados
              </div>
              <div className="text-2xl font-black text-emerald-300 mt-1">{stats.resolved}</div>
            </div>

            <div className="bg-white/10 dark:bg-gray-900/60 backdrop-blur-md rounded-2xl p-3.5 border border-white/15 text-left">
              <div className="text-xs text-amber-300 font-semibold flex items-center gap-1.5">
                <Clock size={14} /> En Atención
              </div>
              <div className="text-2xl font-black text-amber-300 mt-1">{stats.inProgress}</div>
            </div>

            <div className="bg-white/10 dark:bg-gray-900/60 backdrop-blur-md rounded-2xl p-3.5 border border-white/15 text-left">
              <div className="text-xs text-purple-300 font-semibold flex items-center gap-1.5">
                <Users size={14} /> Vecinos Apoyando
              </div>
              <div className="text-2xl font-black text-purple-300 mt-1">{stats.totalNeighbours}</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. BARRA DE NAVEGACIÓN CIUDADANA POR PESTAÑAS (SEGMENTED TABS) */}
      <div className="sticky top-[69px] z-20 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav aria-label="Secciones del portal" className="flex items-center justify-center sm:justify-start gap-2 py-2.5 overflow-x-auto no-scrollbar">
            
            <button
              onClick={() => setActiveTab('feed')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
                activeTab === 'feed'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Compass size={16} />
              <span>Muro Comunitario ({filteredReports.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('form')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
                activeTab === 'form'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <PlusCircle size={16} />
              <span>Reportar Necesidad</span>
            </button>

            <button
              onClick={() => setActiveTab('tracker')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
                activeTab === 'tracker'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Ticket size={16} />
              <span>Consultar mi Ticket</span>
            </button>

            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
                activeTab === 'map'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <MapPin size={16} />
              <span>Mapa Territorial</span>
            </button>
          </nav>
        </div>
      </div>

      {/* 4. CONTENIDO PRINCIPAL SEGÚN PESTAÑA ACTIVA */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* PESTAÑA 1: MURO COMUNITARIO DE REPORTES */}
        {activeTab === 'feed' && (
          <div className="space-y-6">
            
            {/* Barra de Filtros y Búsqueda */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 sm:p-5 shadow-xs border border-gray-200 dark:border-gray-800 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                {/* Buscador */}
                <div className="md:col-span-5 relative">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por barrio, calle, problema o código..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                {/* Filtro Parroquia */}
                <div className="md:col-span-3">
                  <select
                    value={filterParish}
                    onChange={(e) => setFilterParish(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="ALL">Todas las Parroquias ({tenant.canton})</option>
                    {tenant.parishes.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filtro Estado */}
                <div className="md:col-span-4 flex items-center gap-1.5">
                  <button
                    onClick={() => setFilterStatus('ALL')}
                    className={`flex-1 py-2 px-2 text-xs font-semibold rounded-lg transition-colors ${
                      filterStatus === 'ALL'
                        ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setFilterStatus('RESOLVED')}
                    className={`flex-1 py-2 px-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1 ${
                      filterStatus === 'RESOLVED'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <CheckCircle2 size={12} /> Solucionados
                  </button>
                  <button
                    onClick={() => setFilterStatus('PENDING')}
                    className={`flex-1 py-2 px-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1 ${
                      filterStatus === 'PENDING'
                        ? 'bg-amber-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <Clock size={12} /> En Proceso
                  </button>
                </div>
              </div>

              {/* Chips de Categorías Rápidas */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
                {CATEGORY_CHIPS.map((chip) => (
                  <button
                    key={chip.id}
                    onClick={() => setFilterCategory(chip.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-colors ${
                      filterCategory === chip.id
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-700'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Listado de Tarjetas de Reporte */}
            {filteredReports.length === 0 ? (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-12 text-center max-w-lg mx-auto space-y-4">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 text-gray-400 rounded-full flex items-center justify-center mx-auto">
                  <Search size={28} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  No se encontraron reportes con estos filtros
                </h3>
                <p className="text-xs text-gray-500">
                  Prueba cambiando la parroquia o la categoría, o sé el primero en reportar una necesidad en tu sector.
                </p>
                <button
                  onClick={() => setActiveTab('form')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all"
                >
                  <PlusCircle size={15} /> Crear Nuevo Reporte
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredReports.map((report) => {
                  const photos = parsePhotos(report.photos);
                  const resolutionPhotos = parsePhotos(report.resolutionPhotos);
                  const isResolved = report.status === 'RESOLVED' || report.status === 'RESUELTO';

                  return (
                    <article
                      key={report.id}
                      className="bg-white dark:bg-gray-900 rounded-2xl shadow-xs border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col hover:shadow-md transition-all group"
                    >
                      {/* Cabecera de la Tarjeta */}
                      <div className="p-4 pb-2">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                            {report.ticketCode || 'TICKET'}
                          </span>

                          {isResolved ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                              <CheckCircle2 size={12} /> Solucionado
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                              <Clock size={12} /> En Proceso
                            </span>
                          )}
                        </div>

                        <h3 className="font-bold text-gray-900 dark:text-white text-base line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          <Link href={`/report/${report.id}`}>{report.title}</Link>
                        </h3>

                        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mt-1">
                          <MapPin size={13} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span className="font-semibold text-gray-700 dark:text-gray-300">{report.parish}</span>
                          <span>•</span>
                          <span className="truncate">{report.neighborhood}</span>
                        </div>
                      </div>

                      {/* Imagen o Comparación "Antes vs Después" */}
                      {isResolved && resolutionPhotos.length > 0 ? (
                        <div className="px-4 py-2">
                          <div className="relative rounded-xl overflow-hidden border border-emerald-200 dark:border-emerald-800 shadow-xs">
                            <span className="absolute top-2 left-2 z-10 text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white px-2 py-0.5 rounded-md shadow">
                              Evidencia de Solución
                            </span>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={resolutionPhotos[0]}
                              alt="Evidencia de Solución"
                              className="w-full h-44 object-cover hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        </div>
                      ) : photos.length > 0 ? (
                        <div className="px-4 py-2">
                          <div className="rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={photos[0]}
                              alt={report.title}
                              className="w-full h-44 object-cover hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        </div>
                      ) : null}

                      {/* Descripción */}
                      <div className="px-4 py-2 flex-1">
                        <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed">
                          {report.description}
                        </p>

                        {/* Badge de Duplicados / Apoyo Vecinal Agrupado */}
                        {report.duplicateCount && report.duplicateCount > 0 ? (
                          <div className="mt-3 p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 flex items-center gap-2">
                            <Flame size={15} className="text-purple-600 shrink-0 animate-pulse" />
                            <span className="text-[11px] font-bold text-purple-900 dark:text-purple-200">
                              Alta Prioridad: Respaldado por {report.supportCount || (report.duplicateCount + 1)} vecinos de este barrio
                            </span>
                          </div>
                        ) : null}
                      </div>

                      {/* Pie de Tarjeta con Botón de Apoyo */}
                      <div className="p-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs mt-auto">
                        <span className="text-gray-400">
                          {new Date(report.createdAt).toLocaleDateString('es-EC', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>

                        <div className="flex items-center gap-2">
                          <SupportButton reportId={report.id} initialVotes={report.votes} />

                          <Link
                            href={`/report/${report.id}`}
                            className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                            title="Ver detalle del reporte"
                          >
                            <ExternalLink size={14} />
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* PESTAÑA 2: FORMULARIO PASO A PASO PARA REPORTAR */}
        {activeTab === 'form' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <span className="inline-block px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-full text-xs font-bold uppercase tracking-wider">
                Participación Directa
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
                {tenant.campaignMode ? 'Registra tu Propuesta o Necesidad' : 'Reportar una Incidencia en tu Barrio'}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Tu reporte se asigna automáticamente a la parroquia correspondiente y se transmite a las brigadas de inspección.
              </p>
            </div>

            <ReportForm
              parroquias={tenant.parishes}
              tenantSlug={tenant.slug}
              tenantName={tenant.name}
              initialParish={filterParish !== 'ALL' ? filterParish : initialParish}
              campaignMode={tenant.campaignMode}
              candidateName={tenant.candidateName}
              campaignSlogan={tenant.campaignSlogan}
              citizenTermSingularM={tenant.citizenTermSingularM}
              citizenTermSingularF={tenant.citizenTermSingularF}
            />
          </div>
        )}

        {/* PESTAÑA 3: RASTREADOR DE TICKET */}
        {activeTab === 'tracker' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 rounded-full text-xs font-bold uppercase tracking-wider">
                Trazabilidad y Transparencia
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
                Rastreo Oficial de Tu Reporte
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Consulta en qué estado se encuentra tu reporte, qué dirección municipal lo atiende y la fotografía de solución entregada.
              </p>
            </div>

            <TicketTracker tenantSlug={tenant.slug} cantonName={tenant.canton} />
          </div>
        )}

        {/* PESTAÑA 4: MAPA TERRITORIAL POR PARROQUIAS */}
        {activeTab === 'map' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <div className="text-center space-y-2">
              <span className="inline-block px-3 py-1 bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 rounded-full text-xs font-bold uppercase tracking-wider">
                Diagnóstico Geoespacial
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
                Distribución Territorial de Necesidades en {tenant.canton}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Mapeo dinámico de casos comunitarios por parroquia y nivel de atención de obras.
              </p>
            </div>

            {/* Grid de Tarjetas de Parroquias */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tenant.parishes.map((parishName) => {
                const parishReports = reports.filter((r) => r.parish === parishName && r.moderationStatus !== 'MERGED');
                const solvedCount = parishReports.filter((r) => r.status === 'RESOLVED' || r.status === 'RESUELTO').length;
                const inProgressCount = parishReports.length - solvedCount;

                return (
                  <div
                    key={parishName}
                    onClick={() => {
                      setFilterParish(parishName);
                      setActiveTab('feed');
                    }}
                    className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-xs hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-md cursor-pointer transition-all group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                        <MapPin size={20} />
                      </div>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Ver casos <ChevronRight size={14} />
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                      Parroquia {parishName}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {parishReports.length} reporte{parishReports.length !== 1 ? 's' : ''} registrado{parishReports.length !== 1 ? 's' : ''}
                    </p>

                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-400 block text-[10px]">Solucionados</span>
                        <strong className="text-emerald-600 dark:text-emerald-400 font-black">{solvedCount}</strong>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px]">En Atención</span>
                        <strong className="text-amber-600 dark:text-amber-400 font-black">{inProgressCount}</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Enlace al Prototipo Interactivo de Pantalla Completa */}
            <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="text-lg font-bold">¿Deseas explorar el Visor Cartográfico Vectorial?</h4>
                <p className="text-xs text-emerald-100 max-w-xl">
                  Accede a la visualización geoespacial interactiva de Quijos con intensidades de calor por parroquia y filtro de caminos vecinales.
                </p>
              </div>
              <a
                href="/mapa-prototipo.html"
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 bg-white text-emerald-900 hover:bg-emerald-50 rounded-xl text-xs font-bold shadow-md transition-all shrink-0 flex items-center gap-2"
              >
                <span>Abrir Visor Geoespacial</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

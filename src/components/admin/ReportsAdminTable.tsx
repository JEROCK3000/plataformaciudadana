'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Filter, 
  FileSpreadsheet, 
  FileText, 
  RotateCcw, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  Eye, 
  Plus, 
  Building, 
  ShieldAlert, 
  Droplet, 
  HardHat, 
  Sparkles,
  ChevronRight,
  UserCheck
} from 'lucide-react';

interface ReportItem {
  id: string;
  ticketCode: string | null;
  title: string;
  description: string;
  category: any;
  department: any;
  status: any;
  urgency: any;
  parish: string;
  neighborhood: string;
  citizenName: string | null;
  citizenContact: string | null;
  photos: any;
  resolutionPhotos: any;
  resolutionNotes: string | null;
  resolvedAt: Date | string | null;
  createdAt: Date | string;
}

interface ReportsAdminTableProps {
  initialReports: ReportItem[];
  parishes: string[];
  tenantSlug: string;
  cantonName: string;
}

const DEPARTMENT_LABELS: Record<string, { label: string; icon: any; color: string }> = {
  OBRAS_PUBLICAS: { label: 'Obras Públicas', icon: HardHat, color: 'text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800' },
  AGUA_SANEAMIENTO: { label: 'Agua y Saneamiento', icon: Droplet, color: 'text-cyan-700 bg-cyan-50 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800' },
  SERVICIOS_PUBLICOS: { label: 'Servicios Públicos', icon: Sparkles, color: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' },
  SEGURIDAD_CIUDADANA: { label: 'Seguridad Ciudadana', icon: ShieldAlert, color: 'text-rose-700 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800' },
  PLANIFICACION_AMBIENTE: { label: 'Planificación y Ambiente', icon: Building, color: 'text-indigo-700 bg-indigo-50 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800' },
  OTRO: { label: 'Otros Departamentos', icon: Building, color: 'text-gray-700 bg-gray-50 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700' },
  OTROS: { label: 'Otros Departamentos', icon: Building, color: 'text-gray-700 bg-gray-50 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700' },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  RECEIVED: { label: 'Pendiente', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300', icon: Clock },
  PENDIENTE: { label: 'Pendiente', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300', icon: Clock },
  IN_REVIEW: { label: 'En Revisión', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300', icon: Eye },
  EN_REVISION: { label: 'En Revisión', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300', icon: Eye },
  IN_PROGRESS: { label: 'En Proceso', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-300', icon: RotateCcw },
  EN_PROCESO: { label: 'En Proceso', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-300', icon: RotateCcw },
  RESOLVED: { label: 'Resuelto', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300', icon: CheckCircle2 },
  RESUELTO: { label: 'Resuelto', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300', icon: CheckCircle2 },
  REJECTED: { label: 'Rechazado', color: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border-red-300', icon: XCircle },
  RECHAZADO: { label: 'Rechazado', color: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border-red-300', icon: XCircle },
};

const URGENCY_CONFIG: Record<string, { label: string; color: string }> = {
  HIGH: { label: 'Alta', color: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 font-semibold' },
  ALTA: { label: 'Alta', color: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 font-semibold' },
  CRITICA: { label: 'Crítica', color: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold' },
  MEDIUM: { label: 'Media', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300' },
  MEDIA: { label: 'Media', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300' },
  LOW: { label: 'Baja', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
  BAJA: { label: 'Baja', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
};

export default function ReportsAdminTable({
  initialReports,
  parishes,
  tenantSlug,
  cantonName,
}: ReportsAdminTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedParish, setSelectedParish] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedUrgency, setSelectedUrgency] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  // Filtrado reactivo en memoria
  const filteredReports = useMemo(() => {
    return initialReports.filter((report) => {
      const matchesSearch =
        searchTerm === '' ||
        (report.ticketCode && report.ticketCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (report.citizenName && report.citizenName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        report.neighborhood.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (report.citizenContact && report.citizenContact.includes(searchTerm));

      const matchesParish = selectedParish === '' || report.parish === selectedParish;
      const matchesDepartment = selectedDepartment === '' || report.department === selectedDepartment;
      const matchesStatus = selectedStatus === '' || report.status === selectedStatus;
      const matchesUrgency = selectedUrgency === '' || report.urgency === selectedUrgency;

      return matchesSearch && matchesParish && matchesDepartment && matchesStatus && matchesUrgency;
    });
  }, [initialReports, searchTerm, selectedParish, selectedDepartment, selectedStatus, selectedUrgency]);

  // Contadores para métricas rápidas
  const counts = useMemo(() => {
    return {
      total: filteredReports.length,
      pendientes: filteredReports.filter((r) => r.status === 'PENDIENTE' || r.status === 'RECEIVED').length,
      enProceso: filteredReports.filter((r) => r.status === 'EN_PROCESO' || r.status === 'IN_PROGRESS' || r.status === 'EN_REVISION' || r.status === 'IN_REVIEW').length,
      resueltos: filteredReports.filter((r) => r.status === 'RESUELTO' || r.status === 'RESOLVED').length,
    };
  }, [filteredReports]);

  const hasActiveFilters = searchTerm !== '' || selectedParish !== '' || selectedDepartment !== '' || selectedStatus !== '' || selectedUrgency !== '';

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedParish('');
    setSelectedDepartment('');
    setSelectedStatus('');
    setSelectedUrgency('');
  };

  // Construir parámetros para exportación
  const getExportParams = () => {
    const params = new URLSearchParams();
    if (selectedParish) params.set('parish', selectedParish);
    if (selectedDepartment) params.set('department', selectedDepartment);
    if (selectedStatus) params.set('status', selectedStatus);
    return params.toString();
  };

  const handleExport = (type: 'excel' | 'pdf') => {
    setIsExporting(true);
    const queryString = getExportParams();
    const url = `/api/reports/export/${type}${queryString ? `?${queryString}` : ''}`;
    
    // Iniciar descarga en ventana / enlace
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', '');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setIsExporting(false);
    }, 1500);
  };

  const parsePhotos = (photoData: string | null): string[] => {
    if (!photoData) return [];
    try {
      const parsed = JSON.parse(photoData);
      return Array.isArray(parsed) ? parsed : [photoData];
    } catch {
      return [photoData];
    }
  };

  return (
    <div className="space-y-6">
      {/* Barra de Estadísticas y Acción Nuevo Reporte */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Total Mostrados</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{counts.total}</p>
          <span className="text-[11px] text-gray-500">de {initialReports.length} registros</span>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-amber-200 dark:border-amber-900/50 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">Pendientes</p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{counts.pendientes}</p>
          <span className="text-[11px] text-amber-600/70">Requieren asignación</span>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/50 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">En Proceso</p>
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">{counts.enProceso}</p>
          <span className="text-[11px] text-indigo-600/70">Cuadrillas activas</span>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/50 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Resueltos</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{counts.resueltos}</p>
          <span className="text-[11px] text-emerald-600/70">Con acta y fotos</span>
        </div>

        <div className="col-span-2 sm:col-span-4 lg:col-span-1 flex items-stretch">
          <Link
            href={`/${tenantSlug}`}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl p-4 shadow-sm flex flex-col justify-center items-center gap-1 font-medium transition-colors text-center"
            title="Crear un nuevo reporte de incidencia"
          >
            <Plus size={22} className="stroke-[2.5]" />
            <span className="text-sm font-bold">+ Nuevo Reporte</span>
            <span className="text-[10px] opacity-80">Registrar ciudadan@</span>
          </Link>
        </div>
      </div>

      {/* Caja Principal con Filtros y Exportaciones */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Barra superior de herramientas */}
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Filter size={18} className="text-emerald-600 dark:text-emerald-400" />
                Gestión Operativa de Incidencias
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Filtra por dirección técnica, parroquia o estado y exporta informes ejecutivos en tiempo real.
              </p>
            </div>

            {/* Botones de Exportación */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleExport('excel')}
                disabled={isExporting}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 dark:text-emerald-300 dark:border-emerald-800 text-xs font-semibold transition-all shadow-sm active:scale-95 disabled:opacity-50"
                title="Exportar archivo Excel oficial .xlsx con fórmulas y estilos"
              >
                <FileSpreadsheet size={16} />
                Exportar Excel (.xlsx)
              </button>

              <button
                type="button"
                onClick={() => handleExport('pdf')}
                disabled={isExporting}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 dark:text-rose-300 dark:border-rose-800 text-xs font-semibold transition-all shadow-sm active:scale-95 disabled:opacity-50"
                title="Generar informe oficial en PDF para alcaldía y directores"
              >
                <FileText size={16} />
                Exportar PDF Oficial
              </button>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 text-xs font-medium transition-colors"
                  title="Restablecer todos los filtros"
                >
                  <RotateCcw size={14} />
                  Limpiar
                </button>
              )}
            </div>
          </div>

          {/* Fila de Controles de Filtro */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
            {/* Buscador de texto */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar ticket, título, barrio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Filtro Dirección Municipal */}
            <div>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full py-2 px-3 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Todas las Direcciones</option>
                <option value="OBRAS_PUBLICAS">Obras Públicas</option>
                <option value="AGUA_SANEAMIENTO">Agua y Saneamiento</option>
                <option value="SERVICIOS_PUBLICOS">Servicios Públicos</option>
                <option value="SEGURIDAD_CIUDADANA">Seguridad Ciudadana</option>
                <option value="PLANIFICACION_AMBIENTE">Planificación / Ambiente</option>
                <option value="OTROS">Otros Departamentos</option>
              </select>
            </div>

            {/* Filtro Parroquia */}
            <div>
              <select
                value={selectedParish}
                onChange={(e) => setSelectedParish(e.target.value)}
                className="w-full py-2 px-3 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Todas las Parroquias</option>
                {parishes.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Filtro Estado */}
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full py-2 px-3 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Todos los Estados</option>
                <option value="PENDIENTE">Pendientes</option>
                <option value="EN_REVISION">En Revisión</option>
                <option value="EN_PROCESO">En Proceso</option>
                <option value="RESUELTO">Resueltos</option>
                <option value="RECHAZADO">Rechazados</option>
              </select>
            </div>

            {/* Filtro Urgencia */}
            <div>
              <select
                value={selectedUrgency}
                onChange={(e) => setSelectedUrgency(e.target.value)}
                className="w-full py-2 px-3 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Todas las Urgencias</option>
                <option value="CRITICA">Crítica</option>
                <option value="ALTA">Alta</option>
                <option value="MEDIA">Media</option>
                <option value="BAJA">Baja</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabla de Resultados */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600 dark:text-gray-300">
            <thead className="text-[11px] uppercase bg-gray-100 dark:bg-gray-900/80 text-gray-700 dark:text-gray-400 font-semibold tracking-wider">
              <tr>
                <th scope="col" className="px-5 py-3.5">Ticket / Fecha</th>
                <th scope="col" className="px-5 py-3.5">Dirección Asignada</th>
                <th scope="col" className="px-5 py-3.5">Incidencia / Sector</th>
                <th scope="col" className="px-5 py-3.5">Ciudadano</th>
                <th scope="col" className="px-5 py-3.5 text-center">Urgencia</th>
                <th scope="col" className="px-5 py-3.5 text-center">Estado</th>
                <th scope="col" className="px-5 py-3.5 text-center">Evidencia</th>
                <th scope="col" className="px-5 py-3.5 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700/60">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    <div className="max-w-sm mx-auto space-y-2">
                      <p className="text-sm font-semibold">No se encontraron incidencias</p>
                      <p className="text-xs">
                        {hasActiveFilters
                          ? 'No hay registros que coincidan con los filtros seleccionados. Prueba limpiando los criterios.'
                          : 'Aún no hay reportes registrados para este municipio.'}
                      </p>
                      {hasActiveFilters && (
                        <button
                          type="button"
                          onClick={resetFilters}
                          className="mt-3 px-3 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium"
                        >
                          Limpiar Filtros
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => {
                  const deptMeta = DEPARTMENT_LABELS[report.department] || DEPARTMENT_LABELS.OTROS;
                  const statusMeta = STATUS_CONFIG[report.status] || STATUS_CONFIG.PENDIENTE;
                  const urgencyMeta = URGENCY_CONFIG[report.urgency] || URGENCY_CONFIG.MEDIA;
                  const photos = parsePhotos(report.photos);
                  const resolutionPhotos = parsePhotos(report.resolutionPhotos);
                  const StatusIcon = statusMeta.icon;
                  const DeptIcon = deptMeta.icon;

                  return (
                    <tr
                      key={report.id}
                      className="bg-white dark:bg-gray-800 hover:bg-emerald-50/40 dark:hover:bg-gray-750 transition-colors"
                    >
                      {/* Ticket / Fecha */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 text-[11px] inline-block">
                          {report.ticketCode || 'S/N'}
                        </div>
                        <div className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                          {new Date(report.createdAt).toLocaleDateString('es-EC', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                      </td>

                      {/* Dirección Asignada */}
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border ${deptMeta.color}`}>
                          <DeptIcon size={12} />
                          {deptMeta.label}
                        </span>
                        <div className="text-[10px] text-gray-400 mt-1 capitalize">{report.category}</div>
                      </td>

                      {/* Incidencia / Sector */}
                      <td className="px-5 py-4 max-w-xs">
                        <div className="font-semibold text-gray-900 dark:text-white line-clamp-1 text-xs">
                          {report.title}
                        </div>
                        <div className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                          <span className="font-medium text-gray-700 dark:text-gray-300">{report.parish}</span>
                          <span>•</span>
                          <span className="truncate">{report.neighborhood}</span>
                        </div>
                      </td>

                      {/* Ciudadano */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-800 dark:text-gray-200 flex items-center gap-1">
                          <UserCheck size={12} className="text-gray-400" />
                          {report.citizenName}
                        </div>
                        {report.citizenContact && (
                          <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                            {report.citizenContact}
                          </div>
                        )}
                      </td>

                      {/* Urgencia */}
                      <td className="px-5 py-4 text-center whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wide ${urgencyMeta.color}`}>
                          {urgencyMeta.label}
                        </span>
                      </td>

                      {/* Estado */}
                      <td className="px-5 py-4 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusMeta.color}`}>
                          <StatusIcon size={12} />
                          {statusMeta.label}
                        </span>
                      </td>

                      {/* Evidencia Fotográfica */}
                      <td className="px-5 py-4 text-center whitespace-nowrap">
                        {resolutionPhotos.length > 0 ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-700">
                            <CheckCircle2 size={11} />
                            Resuelto
                          </span>
                        ) : photos.length > 0 ? (
                          <span className="text-[10px] text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                            {photos.length} foto{photos.length > 1 ? 's' : ''}
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-400 italic">Sin foto</span>
                        )}
                      </td>

                      {/* Acción Gestionar */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <Link
                          href={`/admin/report/${report.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-sm transition-colors"
                        >
                          Gestionar
                          <ChevronRight size={14} />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
